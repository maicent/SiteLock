# AGENTS.md

## Project

SiteLock is a Chrome extension (Manifest V3) that blocks specified websites until the user enters a password.

## Key facts

- No build step, package manager, tests, or CI. All files are plain JS/HTML/CSS loaded directly by Chrome.
- Entry points / wiring:
  - `manifest.json` registers `background.js` as service worker, `popup.html` as action popup, and `content_script.js` for all URLs.
  - `background.js` uses `chrome.webNavigation.onBeforeNavigate`/`onHistoryStateUpdated` to redirect blocked main-frame requests to `blocked.html?target=<url>`.
  - `content_script.js` handles SPA `pushState`/`replaceState`/`popstate`/`hashchange` and redirects blocked SPA routes.
  - `blocked.js` validates against `sitePassword` in `chrome.storage.local`, then adds the hostname to `unlockedSites` before navigating to the target.
  - `popup.js` manages `blockedSites`, `unlockedSites`, and `sitePassword`.

## Common gotchas

- `webNavigation` listeners only see real navigation events. SPA in-page routing is covered by `content_script.js`; do not remove it.
- Unlock state is stored in `unlockedSites` (local storage, not session), so it persists until the user clicks "清除本次解锁状态" or clears storage.
- Default password is `123456`. Password is stored in plain text in `chrome.storage.local`.
- `blocked.html` must remain in `web_accessible_resources` or redirects to it will fail.
- After editing files, reload the extension from `chrome://extensions/`; there is no hot reload.

## How to verify

1. Go to `chrome://extensions/`, enable Developer mode.
2. Click "Load unpacked" and select this repo folder.
3. Open the extension popup, add a domain (e.g. `example.com`), and ensure it appears in the blocked list.
4. Visit the domain; you should see the lock page.
5. Enter the password; you should reach the site.
6. Re-open the popup; the domain should appear under "本次已解锁的网站".
7. Click "清除本次解锁状态" and reload the tab; the lock page should reappear.

## Style notes

- Keep everything in plain ES5-ish JS to avoid issues in the extension's isolated contexts. Avoid relying on `fetch`, modules, or modern DOM APIs without checking compatibility.
