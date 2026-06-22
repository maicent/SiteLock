const BLOCKED_KEY = 'blockedSites';
const UNLOCKED_KEY = 'unlockedSites';
const PASSWORD_KEY = 'sitePassword';

function render(list) {
  const ul = document.getElementById('list');
  ul.innerHTML = '';
  list.forEach((site) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${escapeHtml(site)}</span><button data-site="${escapeHtml(site)}">删除</button>`;
    ul.appendChild(li);
  });
  ul.querySelectorAll('button[data-site]').forEach((btn) => {
    btn.addEventListener('click', () => remove(btn.dataset.site));
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function load() {
  chrome.storage.local.get([BLOCKED_KEY], (res) => {
    render(res[BLOCKED_KEY] || []);
  });
}

function add() {
  const input = document.getElementById('site');
  let site = input.value.trim();
  if (!site) return;
  site = site.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  chrome.storage.local.get([BLOCKED_KEY], (res) => {
    const list = res[BLOCKED_KEY] || [];
    if (!list.includes(site)) {
      list.push(site);
      chrome.storage.local.set({ [BLOCKED_KEY]: list }, () => render(list));
    }
    input.value = '';
  });
}

function remove(site) {
  chrome.storage.local.get([BLOCKED_KEY], (res) => {
    const list = (res[BLOCKED_KEY] || []).filter((s) => s !== site);
    chrome.storage.local.set({ [BLOCKED_KEY]: list }, () => render(list));
  });
}

function savePwd() {
  const pwd = document.getElementById('pwd').value;
  if (!pwd) return;
  chrome.storage.local.set({ [PASSWORD_KEY]: pwd }, () => {
    document.getElementById('pwd').value = '';
    alert('密码已保存');
  });
}

function clearUnlock() {
  chrome.storage.local.set({ [UNLOCKED_KEY]: [] }, () => {
    alert('已清除解锁状态');
  });
}

function showDebug() {
  chrome.storage.local.get([BLOCKED_KEY, UNLOCKED_KEY], (res) => {
    const blocked = res[BLOCKED_KEY] || [];
    const unlocked = res[UNLOCKED_KEY] || [];
    alert(`阻断列表：${JSON.stringify(blocked)}\n已解锁：${JSON.stringify(unlocked)}`);
  });
}

document.getElementById('add').addEventListener('click', add);
document.getElementById('savePwd').addEventListener('click', savePwd);
document.getElementById('clearUnlock').addEventListener('click', clearUnlock);
document.getElementById('site').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') add();
});
load();

// ponytail: debug helper, remove when stable
setTimeout(showDebug, 100);
