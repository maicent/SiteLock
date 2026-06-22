const BLOCKED_KEY = 'blockedSites';
const UNLOCKED_KEY = 'unlockedSites';
const STYLE_KEY = 'lockPageStyle';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get([BLOCKED_KEY], (res) => {
    if (!res[BLOCKED_KEY]) {
      chrome.storage.local.set({ [BLOCKED_KEY]: [] });
    }
  });
});

function normalize(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function isBlocked(hostname, list) {
  const h = hostname.replace(/^www\./, '').toLowerCase();
  return list.some((site) => {
    const s = site.replace(/^www\./, '').toLowerCase();
    return s === h || h.endsWith('.' + s);
  });
}

function shouldBlock(url, list, unlocked) {
  const hostname = normalize(url);
  if (!hostname) return false;
  return isBlocked(hostname, list) && !unlocked.includes(hostname);
}

function blockTab(tabId, url, style) {
  style = style || 'default';
  const blockedUrl = chrome.runtime.getURL(
    'blocked.html?style=' + encodeURIComponent(style) + '&target=' + encodeURIComponent(url)
  );
  chrome.tabs.update(tabId, { url: blockedUrl });
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;
  console.log('[SiteLock] onBeforeNavigate:', details.url);

  chrome.storage.local.get([BLOCKED_KEY, UNLOCKED_KEY, STYLE_KEY], (res) => {
    const list = res[BLOCKED_KEY] || [];
    const unlocked = res[UNLOCKED_KEY] || [];
    console.log('[SiteLock] list:', list, 'unlocked:', unlocked);
    if (shouldBlock(details.url, list, unlocked)) {
      console.log('[SiteLock] blocking:', details.url);
      blockTab(details.tabId, details.url, res[STYLE_KEY]);
    }
  });
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId !== 0) return;
  console.log('[SiteLock] onHistoryStateUpdated:', details.url);

  chrome.storage.local.get([BLOCKED_KEY, UNLOCKED_KEY, STYLE_KEY], (res) => {
    const list = res[BLOCKED_KEY] || [];
    const unlocked = res[UNLOCKED_KEY] || [];
    if (shouldBlock(details.url, list, unlocked)) {
      console.log('[SiteLock] blocking history update:', details.url);
      blockTab(details.tabId, details.url, res[STYLE_KEY]);
    }
  });
});

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId !== 0) return;
  console.log('[SiteLock] onCommitted:', details.url);
});
