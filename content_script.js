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

function isJustUnlocked(hostname) {
  try {
    return sessionStorage.getItem('sitelock_unlock_' + hostname) === '1';
  } catch {
    return false;
  }
}

function check() {
  const hostname = normalize(location.href);
  if (!hostname) return;
  if (isJustUnlocked(hostname)) return;

  chrome.storage.local.get(['blockedSites', 'unlockedSites'], (res) => {
    const list = res.blockedSites || [];
    const unlocked = res.unlockedSites || [];
    if (isBlocked(hostname, list) && !unlocked.includes(hostname)) {
      location.replace(
        chrome.runtime.getURL('blocked.html?target=' + encodeURIComponent(location.href))
      );
    }
  });
}

function patchHistory(method) {
  const original = history[method];
  history[method] = function (...args) {
    const result = original.apply(this, args);
    setTimeout(check, 0);
    return result;
  };
}

patchHistory('pushState');
patchHistory('replaceState');
window.addEventListener('popstate', check);
window.addEventListener('hashchange', check);
check();
