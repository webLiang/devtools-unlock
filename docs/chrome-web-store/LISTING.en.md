# Chrome Web Store listing copy (English)

> Paste into [Developer Dashboard](https://chrome.google.com/webstore/devconsole) → Store listing.  
> Manifest short description already lives in `_locales/en/messages.json` (`extDescription`).

**Open source:** [https://github.com/webLiang/devtools-unlock](https://github.com/webLiang/devtools-unlock)

---

## Item name

```
DevTools Unlock
```

## Short description (≤132 characters)

```
Open-source unlock for sites that block DevTools (e.g. disable-devtool): stop reloads, wipes, and detection.
```

Character count: **108** (within limit).

## Detailed description

```
DevTools Unlock is an open-source Chrome extension that restores DevTools on websites that intentionally block debugging.

OPEN SOURCE
Fully open source on GitHub — read the code, audit permissions, file issues, and contribute:
https://github.com/webLiang/devtools-unlock
No obfuscation, no remote code, no ads. What you install matches the public repository.

SINGLE PURPOSE
This extension does one thing: on sites you enable, it injects an unlock script at document_start (MAIN world) to neutralize common anti-DevTools detectors (such as disable-devtool and similar custom scripts). That stops typical punishments like forced reloads, blanking the page, or hostile redirects so you can debug normally.

WHO IT IS FOR
• Front-end developers inspecting pages that ship anti-debug scripts
• Security researchers and learners who need Elements / Network / Sources available

HOW TO USE
1. After install, unlock is OFF for every site by default.
2. Open the target website, click the toolbar icon, and enable “Enable unlock for this site”.
3. The page reloads once. Cross-origin iframe hosts found on that tab can be unlocked together (useful for embedded players).
4. Open DevTools — the page should stay usable instead of wiping or looping reload.

PERMISSIONS
• storage — save your local per-hostname whitelist (never uploaded)
• scripting — register unlock.js at document_start for enabled hosts only
• tabs — read the current tab URL / title needed for the popup toggle and reload
• host access (<all_urls>) — you may enable unlock on any site; injection must run before page scripts. Chrome Web Store and similar pages are excluded.

PRIVACY
No personal data, browsing history, or page content is collected or sent to any server. Settings stay in chrome.storage.local on your device. See the Privacy Policy linked on this listing.

NOT FOR
Bypassing paywalls, DRM, account gates, or any unlawful use. This tool only restores DevTools availability for legitimate debugging and research.

SOURCE & SUPPORT
GitHub: https://github.com/webLiang/devtools-unlock
Issues: https://github.com/webLiang/devtools-unlock/issues
```

## Category

```
Developer Tools
```

## Language

Primary: English  
Also provide Chinese (Simplified) listing via locale (see `LISTING.zh-CN.md`).

## Official URL

Prefer GitHub repo (highlights open source). If you need ownership verification via HTML file, use the Pages site instead and still link the repo in the description.

```
https://github.com/webLiang/devtools-unlock
```

Ownership verification (GitHub Pages):

```
https://webliang.github.io/devtools-unlock/
```

## Support / Homepage

```
https://github.com/webLiang/devtools-unlock
```

Support URL (Issues):

```
https://github.com/webLiang/devtools-unlock/issues
```

## Privacy policy URL

```
https://github.com/webLiang/devtools-unlock/blob/master/PRIVACY.md
```

## Promo video (optional)

Leave empty unless you publish a short YouTube demo (popup toggle → console inject log → DevTools open).

## Images to upload

| Field | File |
|-------|------|
| Store icon | `images/icon-128.png` |
| Small promo tile | `images/promo-small-440x280.png` |
| Marquee promo tile | `images/promo-marquee-1400x560.png` |
| Screenshots (1–5) | `images/screenshot-01` … `screenshot-05` |

## Visibility / distribution

- Visibility: Public (or Unlisted for soft launch)
- Regions: All regions (or restrict as needed)
