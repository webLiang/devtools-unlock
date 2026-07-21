# Chrome Web Store publishing guide

> English · [中文](./STORE.zh-CN.md)

## 1. Pack

```bash
cd devtools-unlock
pnpm zip
# or: ./scripts/pack.sh
```

Output: `releases/devtools-unlock_v{version}.zip` containing **only** `extension/` (not analysis, docs, etc.). Keep `package.json` and `extension/manifest.json` versions in sync.

## 2. Upload

1. Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Create / select the item → upload the zip
3. Fill listing fields (see copy below)

## 3. Suggested listing copy

### Name

`DevTools Unlock`

### Short description (English, ≤132 characters)

`Unlock DevTools on sites that block debugging (e.g. disable-devtool): stop forced reloads, page wipes, and detection.`

### Detailed description

**Single purpose**

This extension does one thing: at `document_start` it injects an unlock script into pages you enable, neutralizing embedded anti-DevTools detection (such as disable-devtool) so you can open DevTools for debugging, and blocking the wipe / redirect / reload punishments those detectors trigger.

**Who it is for**

- Front-end developers debugging sites that ship anti-debug scripts
- Security / reverse-engineering work that needs DevTools available

**How to use**

1. After install, all sites are **off** by default (other sites stay untouched)
2. On the target site, open the toolbar popup and enable unlock for **this site**; the page **reloads** (iframe hosts on that tab are collected too)
3. Only enabled hostnames (and their collected embed hosts) receive the script
4. Opening DevTools should no longer blank or crash the page

### Permissions (common review questions)

| Permission | Why |
|------------|-----|
| `storage` | Persist the per-site hostname whitelist locally (never uploaded) |
| `scripting` | Register `unlock.js` at `document_start` in MAIN world for whitelisted hosts |
| `<all_urls>` | Users may enable unlock on any site; injection must run before page scripts |

Chrome Web Store / Edge add-on pages are excluded (`excludeMatches` in `background.js`).

## 4. Privacy & compliance

- Privacy policy: [PRIVACY.md](./PRIVACY.md) (host a public URL for the store form if needed)
- **No** personal data, browsing history, or page content collection
- **No** third-party transmission
- Local `chrome.storage.local` only: `hostGroups` / `enabledHosts`

## 5. Screenshot ideas (1280×800 or 640×400)

1. Popup showing the current hostname with unlock enabled
2. Target site Console with `[devtools-unlock] injected…`
3. Page still usable with DevTools open (vs wipe/reload without the extension)

## 6. Versioning

- Bump `extension/manifest.json` `version`
- Update `_locales/*/messages.json` if store copy changes
- Re-run `pnpm zip` and upload

## 7. Review notes

- State clearly the extension is **not** for bypassing paywalls, DRM, or unlawful use — only restoring DevTools
- If rejected for broad host access, explain that anti-debug must run before business scripts, so `<all_urls>` + MAIN world (Chrome 111+) is required
