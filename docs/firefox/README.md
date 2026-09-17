# Firefox add-on (MV3)

> English · [中文](./README.zh-CN.md)

DevTools Unlock is a Chrome Web Store extension that also ships a **Firefox 128+** Manifest V3 build. The injection model is the same as Chrome: per-host whitelist, `scripting.registerContentScripts` with `world: "MAIN"` and `runAt: "document_start"`.

Official references:

- [Manifest V3 updates in Firefox 128](https://blog.mozilla.org/addons/2024/07/10/manifest-v3-updates-landed-in-firefox-128/) — MAIN world for content scripts and `scripting.executeScript`
- [scripting.registerContentScripts()](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting/registerContentScripts)
- [scripting.executeScript()](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting/executeScript)

## Requirements

| Item | Value |
|------|--------|
| Firefox | **128** or newer (`strict_min_version`) |
| Gecko ID | `devtools-unlock@webliang` (stable; required for AMO / persistent installs) |
| Permissions | `storage`, `scripting`, `tabs`, host `<all_urls>` |

`<all_urls>` is required so enabling a site can inject into **cross-origin player iframes** whose hosts are not known at install time. Optional origin permissions cannot cover those frames before they exist. Same justification as the Chrome Web Store listing.

## Build and load (temporary)

1. `pnpm install`
2. `pnpm build:firefox` (or `pnpm dev:firefox` for watch)
3. Open `about:debugging#/runtime/this-firefox`
4. **Load Temporary Add-on…**
5. Select `dist/firefox/manifest.json`

Temporary add-ons **disappear when Firefox quits**. Persistent install is AMO or a signed zip with the Gecko ID above.

## What the Firefox build changes

`utils/manifest-parser` (when `__FIREFOX__=true`):

- `background.service_worker` → `background.scripts` + `type: "module"`
- Adds `browser_specific_settings.gecko` (id, min version, `data_collection_permissions: none`)
- Adds `content_security_policy.extension_pages`
- Does **not** emit `options_ui` (this product has no options page)
- Drops `minimum_chrome_version`

Runtime:

- `webextension-polyfill` in the background
- `injectImmediately` omitted on Firefox `executeScript` (MAIN-world early inject still uses `registerContentScripts` at `document_start`)
- `unlock.js` / `embedWatch.js` remain classic IIFE (no `import()`)

## AMO zip + source

```bash
pnpm build:firefox:zip       # add-on → releases/*.firefox.zip
pnpm pack:firefox:sources    # source (no node_modules) → releases/*.firefox-sources.zip
```

The add-on zip is the contents of `dist/firefox/` (not the git repo). AMO also requires the source archive because the add-on is a Vite/esbuild production bundle. Rebuild steps: [SOURCE.md](../../SOURCE.md). How to pack: [SOURCE.md](./SOURCE.md).

Listing draft: [LISTING.en.md](./LISTING.en.md). This repo does not auto-submit to AMO.

## Lint

```bash
pnpm build:firefox
pnpm lint:firefox
```
