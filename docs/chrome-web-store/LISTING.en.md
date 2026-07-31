# Chrome Web Store listing copy (English)

> Paste into [Developer Dashboard](https://chrome.google.com/webstore/devconsole) → Store listing.  
> Manifest short description already lives in `_locales/en/messages.json` (`extDescription`).

---

## Item name

```
DevTools Unlock
```

## Short description (≤132 characters)

```
Unlock DevTools on sites that block debugging (e.g. disable-devtool): stop forced reloads, page wipes, and detection.
```

Character count: **118** (within limit).

## Detailed description

```
DevTools Unlock restores Chrome DevTools on websites that intentionally block debugging.

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
```

## Category

```
Developer Tools
```

## Language

Primary: English  
Also provide Chinese (Simplified) listing via locale (see `LISTING.zh-CN.md`).

## Official URL (optional)

```
https://github.com/webLiang/devtools-unlock
```

## Support / Homepage (optional)

```
https://github.com/webLiang/devtools-unlock
```

## Privacy policy URL

Host `PRIVACY.md` publicly, then paste that URL here, for example:

```
https://github.com/webLiang/devtools-unlock/blob/main/PRIVACY.md
```

(Prefer a rendered Pages / docs URL if you have one.)

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
