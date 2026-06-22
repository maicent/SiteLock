const params = new URLSearchParams(location.search);
const target = params.get('target') || '';
const style = params.get('style') || 'default';
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

function bindUnlock() {
  document.getElementById('unlock').addEventListener('click', unlock);
  const pwd = document.getElementById('pwd');
  pwd.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') unlock();
  });
  if (style !== 'default') {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const form = document.getElementById('unlockForm');
        if (form) {
          form.style.display = form.style.display === 'none' ? 'block' : 'none';
          if (form.style.display !== 'none') pwd.focus();
        }
      }
    });
  }
}

function renderDefault(page) {
  page.className = 'box';
  page.innerHTML =
    '<div class="inner">' +
      '<h1>网站已被锁定</h1>' +
      '<p>请输入密码后继续访问</p>' +
      '<input type="password" id="pwd" placeholder="密码" autofocus>' +
      '<button id="unlock" class="unlock">解锁</button>' +
      '<div id="msg"></div>' +
    '</div>';
}

function renderNetwork(page) {
  page.className = 'network';
  page.innerHTML =
    '<div class="inner">' +
      '<h1>无法访问此网站</h1>' +
      '<div class="err">' +
        '<p>无法显示此网页，因为无法建立安全连接。</p>' +
        '<p>ERR_SSL_PROTOCOL_ERROR</p>' +
      '</div>' +
      '<button id="reload">重新加载</button>' +
      '<div id="unlockForm" class="unlock-form" style="display:none;">' +
        '<input type="password" id="pwd" placeholder="密码">' +
        '<button id="unlock" class="unlock">解锁</button>' +
        '<div id="msg"></div>' +
      '</div>' +
    '</div>';
  document.getElementById('reload').addEventListener('click', () => location.reload());
}

function renderMaintenance(page) {
  page.className = 'maintenance';
  page.innerHTML =
    '<div class="inner">' +
      '<h1>网站维护中</h1>' +
      '<p>系统正在升级维护，请稍后访问。</p>' +
      '<div id="unlockForm" class="unlock-form" style="display:none;">' +
        '<input type="password" id="pwd" placeholder="密码">' +
        '<button id="unlock" class="unlock">解锁</button>' +
        '<div id="msg"></div>' +
      '</div>' +
    '</div>';
}

function render() {
  const page = document.getElementById('page');
  if (style === 'network') {
    renderNetwork(page);
  } else if (style === 'maintenance') {
    renderMaintenance(page);
  } else {
    renderDefault(page);
  }
  bindUnlock();
}

render();
