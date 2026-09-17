# Chrome Web Store publishing guide

> English · [中文](./STORE.zh-CN.md)

**Published listing:**  
https://chromewebstore.google.com/detail/devtools-unlock/cehphgjpnlhlonahcldfbomncionnhdo

## 1. Pack

```bash
cd devtools-unlock
pnpm build:zip
# or: pnpm build && ./scripts/pack.sh
```

Output: `releases/devtools-unlock_v{version}.zip` containing **only the contents of `dist/chrome/`** (not analysis, docs, etc.). Version comes from `package.json` via `manifest.js`.

Firefox: `pnpm build:firefox:zip` → `releases/devtools-unlock_v{version}.firefox.zip`. See [docs/firefox/README.md](./docs/firefox/README.md).

Optional CRX for sideload (not used by CWS): generate `dist.pem` locally (`openssl genrsa -out dist.pem 2048`, never commit) then `pnpm build:crx`.

To also commit, tag, and publish a [GitHub Release](https://github.com/webLiang/devtools-unlock/releases):

```bash
pnpm release:github:dry    # preview
pnpm release:github:full   # publish (requires gh auth)
```

## 2. Upload

1. Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Create / select the item → upload the zip
3. Fill listing fields (see copy below)

## 3. Suggested listing copy

> **Open source — highlight in every listing field that supports a URL or description:**  
> https://github.com/webLiang/devtools-unlock  
> Full paste-ready modules: [`docs/chrome-web-store/LISTING.en.md`](./docs/chrome-web-store/LISTING.en.md)

### Name

```
DevTools Unlock Open
```

### Short description (English, ≤132 characters)

```
Open-source unlock for sites that block DevTools (e.g. disable-devtool): stop reloads, wipes, and detection.
```

### Official / Homepage / Support

```
https://github.com/webLiang/devtools-unlock
```

```
https://github.com/webLiang/devtools-unlock/issues
```

### Detailed description

Use the full block in [`LISTING.en.md`](./docs/chrome-web-store/LISTING.en.md) §3 (starts with **OPEN SOURCE** + GitHub link). Summary of sections:

- ★ OPEN SOURCE — repo, no obfuscation / remote code / ads  
- ★ SINGLE PURPOSE — unlock DevTools on user-enabled sites only  
- ★ HOW TO USE / PERMISSIONS / PRIVACY / NOT FOR  
- ★ SOURCE & SUPPORT — GitHub + Issues  

### Permissions (common review questions)

| Permission | Why |
|------------|-----|
| `storage` | Persist the per-site hostname whitelist locally (never uploaded) |
| `scripting` | Register `unlock.js` at `document_start` in MAIN world for whitelisted hosts |
| `tabs` | Popup needs active tab URL; reload after toggle |
| `<all_urls>` | Users may enable unlock on any site; injection must run before page scripts |

Chrome Web Store / Edge add-on pages are excluded (`excludeMatches` in the background script).  
Paste blocks: [`REVIEW_JUSTIFICATION.md`](./docs/chrome-web-store/REVIEW_JUSTIFICATION.md).

## 4. Privacy & compliance

- Privacy policy: [PRIVACY.md](./PRIVACY.md) (host a public URL for the store form if needed)
- **No** personal data, browsing history, or page content collection
- **No** third-party transmission
- Local `chrome.storage.local` only: `hostGroups` / `enabledHosts`

## 5. Full listing asset pack (copy + images)

Ready-to-upload package:

**[`docs/chrome-web-store/`](./docs/chrome-web-store/)**

| Item | Path |
|------|------|
| Checklist | [`docs/chrome-web-store/README.md`](./docs/chrome-web-store/README.md) |
| English paste copy | [`LISTING.en.md`](./docs/chrome-web-store/LISTING.en.md) |
| Chinese paste copy | [`LISTING.zh-CN.md`](./docs/chrome-web-store/LISTING.zh-CN.md) |
| Review justification | [`REVIEW_JUSTIFICATION.md`](./docs/chrome-web-store/REVIEW_JUSTIFICATION.md) |
| Icon / promo tiles / 5 screenshots | [`docs/chrome-web-store/images/`](./docs/chrome-web-store/images/) |

Sizes: `icon 128`, `promo 440×280`, `marquee 1400×560`, screenshots `1280×800` (CWS-compliant).

## 6. Versioning

- Bump `package.json` `version` (written into `dist/chrome/manifest.json` by `manifest.js`)
- Update `_locales/*/messages.json` if store copy changes
- Re-run `pnpm build:zip` and upload

## 7. Review notes

- State clearly the extension is **not** for bypassing paywalls, DRM, or unlawful use — only restoring DevTools
- If rejected for broad host access, explain that anti-debug must run before business scripts, so `<all_urls>` + MAIN world (Chrome 111+) is required
- Full reviewer Q&A: [`docs/chrome-web-store/REVIEW_JUSTIFICATION.md`](./docs/chrome-web-store/REVIEW_JUSTIFICATION.md)

## 8. Firefox / AMO (optional, not auto-submitted)

- Add-on: `pnpm build:firefox:zip`
- Source (no `node_modules`): `pnpm pack:firefox:sources` — see [`SOURCE.md`](./SOURCE.md)
- Gecko ID: `devtools-unlock@webliang` (do not change after first AMO listing)
- Minimum Firefox: 128
- Listing draft: [`docs/firefox/LISTING.en.md`](./docs/firefox/LISTING.en.md)
