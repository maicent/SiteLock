const params = new URLSearchParams(location.search);
const target = params.get('target') || '';
const PASSWORD_KEY = 'sitePassword';
const UNLOCKED_KEY = 'unlockedSites';

function normalize(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function unlock() {
  const pwd = document.getElementById('pwd').value;
  chrome.storage.local.get([PASSWORD_KEY], (res) => {
    const correct = res[PASSWORD_KEY] || '123456';
    if (pwd !== correct) {
      document.getElementById('msg').textContent = '密码错误';
      return;
    }
    const hostname = normalize(target);
    if (hostname) {
      chrome.storage.local.get([UNLOCKED_KEY], (r) => {
        const list = r[UNLOCKED_KEY] || [];
        if (!list.includes(hostname)) {
          list.push(hostname);
          chrome.storage.local.set({ [UNLOCKED_KEY]: list }, () => {
            location.href = target;
          });
        } else {
          location.href = target;
        }
      });
    } else {
      location.href = target;
    }
  });
}

document.getElementById('unlock').addEventListener('click', unlock);
document.getElementById('pwd').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') unlock();
});
