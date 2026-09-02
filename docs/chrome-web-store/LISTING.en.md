# Chrome Web Store listing copy (English)

> Paste each fenced block into [Developer Dashboard](https://chrome.google.com/webstore/devconsole) → **Store listing**.  
> Manifest short description: `_locales/en/messages.json` → `extDescription` (keep in sync with Short description below).

**Open source (highlight in listing):** [https://github.com/webLiang/devtools-unlock](https://github.com/webLiang/devtools-unlock)

---

## 1) Item name

```
DevTools Unlock Open
```

---

## 2) Short description（≤132 characters）

```
Open-source unlock for sites that block DevTools (e.g. disable-devtool): stop reloads, wipes, and detection.
```

Character count: **108** (within limit).

---

## 3) Detailed description

```
DevTools Unlock Open is a FREE, fully OPEN-SOURCE Chrome extension that restores DevTools on websites that intentionally block debugging.

★ OPEN SOURCE (audit & contribute)
This project is open source on GitHub. You can read every line of code, verify permissions, report issues, and contribute:
https://github.com/webLiang/devtools-unlock

• MIT/ISC-style community project — no paywall inside the extension
• No code obfuscation, no remote code loading, no ads, no tracking SDKs
• The package you install from the Chrome Web Store matches the public repository (extension/ folder)
• Releases & changelog: https://github.com/webLiang/devtools-unlock/releases

★ SINGLE PURPOSE
This extension does one thing only: on sites YOU explicitly enable, it injects an unlock script at document_start (MAIN world) to neutralize common anti-DevTools detectors (for example disable-devtool and similar custom scripts). That stops typical punishments such as forced reloads, blanking the page, or hostile redirects — so you can open Elements / Network / Sources normally.

★ WHO IT IS FOR
• Front-end developers inspecting pages that ship anti-debug scripts
• Security researchers and learners who need DevTools available on pages they can already load

★ HOW TO USE
1. After install, unlock is OFF for every site by default (other sites stay untouched).
2. Open the target website, click the toolbar icon, and enable “Enable unlock for this site”.
3. The page reloads once. Cross-origin iframe hosts found on that tab can be unlocked together (useful for embedded players).
4. Open DevTools — the page should stay usable instead of wiping or looping reload.

★ PERMISSIONS (why we ask)
• storage — save your local per-hostname whitelist (never uploaded)
• scripting — register unlock.js at document_start for enabled hosts only
• tabs — read the current tab URL / title needed for the popup toggle and reload
• host access (<all_urls>) — you may enable unlock on any http(s) site; injection must run BEFORE page scripts. Chrome Web Store and similar pages are excluded.

★ PRIVACY
No personal data, browsing history, or page content is collected or sent to any server. Settings stay in chrome.storage.local on your device only.
Privacy policy: https://github.com/webLiang/devtools-unlock/blob/master/PRIVACY.md

★ NOT FOR
Not a paywall / DRM / login-wall bypass. Not for stealing credentials or scraping private content. Intended only for legitimate debugging and security research.

★ SOURCE, ISSUES & SUPPORT
Open-source repository: https://github.com/webLiang/devtools-unlock
Report bugs / ask questions: https://github.com/webLiang/devtools-unlock/issues
GitHub Pages (optional homepage / ownership verification): https://webliang.github.io/devtools-unlock/
```

---

## 4) Category

```
Developer Tools
```

---

## 5) Language

Primary language:

```
English
```

Also publish Chinese (Simplified) store locale using `LISTING.zh-CN.md`.

---

## 6) Official URL（推荐填仓库，突出开源）

```
https://github.com/webLiang/devtools-unlock
```

If Dashboard requires HTML ownership verification, temporarily use GitHub Pages, and **keep the repo link in the Detailed description**:

```
https://webliang.github.io/devtools-unlock/
```

---

## 7) Homepage URL

```
https://github.com/webLiang/devtools-unlock
```

---

## 8) Support URL

```
https://github.com/webLiang/devtools-unlock/issues
```

---

## 9) Privacy policy URL

```
https://github.com/webLiang/devtools-unlock/blob/master/PRIVACY.md
```

---

## 10) Promo video（optional）

Leave empty unless you publish a short YouTube demo (popup toggle → console inject log → DevTools open).

---

## 11) Images to upload

| Field | File |
|-------|------|
| Store icon | `images/icon-128.png` |
| Small promo tile | `images/promo-small-440x280.png` |
| Marquee promo tile | `images/promo-marquee-1400x560.png` |
| Screenshots (1–5) | `images/screenshot-01` … `screenshot-05` |

Recommended screenshot order: 01 popup toggle → 02 before/after → 03 console injected → 04 how it works + privacy → 05 iframe hosts.

---

## 12) Visibility / distribution

- Visibility: Public（or Unlisted for soft launch）
- Regions: All regions（or restrict as needed）

---

## Published listing（reference）

```
https://chromewebstore.google.com/detail/devtools-unlock/cehphgjpnlhlonahcldfbomncionnhdo
```
