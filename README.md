# DevTools Unlock

> English · [中文](./README.zh-CN.md)

A Chrome extension that restores normal DevTools on sites that deliberately block inspection.

Injects **before** page scripts run to neutralize anti-debug logic such as [disable-devtool](https://github.com/theajack/disable-devtool) (and similar custom detectors), so opening DevTools no longer blanks the page, force-reloads, or redirects you away.

## Why this project exists

Many sites ship front-end “anti-debug” libraries to discourage casual inspection. A common choice is [disable-devtool](https://github.com/theajack/disable-devtool): once DevTools opens, the page may wipe the DOM, reload, jump to a dead URL, or freeze the tab. Streaming and player sites often go further—detectors live inside **cross-origin iframes**, so the parent page looks fine while the player silently dies.

That is painful when you are a developer trying to **understand how a page works**: network calls, player pipelines, bundling, or embedding patterns. Manual workarounds (console snippets, userscripts, one-off breakpoints) break easily and do not survive a full reload before the detector wins.

This repo started from that exact friction—sites such as [anikai.watch](https://anikai.watch/) (player frames with their own detectors; notes under `analysis/anikai/`)—and grew into a small, per-host unlock tool:

- Patch known detection / punishment paths early (`document_start`, MAIN world)
- Opt-in **per hostname** (default off; also covers iframe hosts found on the tab)
- Keep research samples and console/Tampermonkey fallbacks outside the store package

**Intended use:** legitimate front-end research, learning, and debugging. It does not grant access beyond what the browser already loads for you.

## Layout

```
devtools-unlock/
├── extension/          ← Chrome Web Store package (zip this folder only)
│   ├── manifest.json
│   ├── background.js
│   ├── unlock.js
│   ├── popup.html / popup.js
│   ├── icons/
│   └── _locales/       ← store + popup strings (en, zh_CN)
├── docs/
│   └── force-debug-blocked-sites.md  ← technical guide (EN + zh-CN)
├── analysis/           ← sample bundles / notes (not in store zip)
├── alternatives/       ← console / Tampermonkey fallbacks
├── scripts/
│   ├── pack.sh
│   └── github-release.mjs
├── releases/           ← versioned zip + release notes
├── STORE.md            ← publishing checklist
└── PRIVACY.md          ← privacy policy
```

## Local load

1. Open `chrome://extensions/` → enable **Developer mode**
2. **Load unpacked** → select the **`extension/`** folder (not the repo root)
3. Open a target site, enable unlock in the popup (page reloads)
4. Console should show: `[devtools-unlock] injected — DevTools should work normally`

### Per-site behavior

- Default: all sites **off**
- Toggle applies to the **current hostname** only
- Enabling also unlocks **iframe hosts** found on that tab (e.g. cross-origin video players)
- Enabling or disabling **reloads** the current http(s) page

## Pack for the Web Store

```bash
pnpm zip
# or: ./scripts/pack.sh
```

Creates `releases/devtools-unlock_v{version}.zip` from `extension/` only. See [STORE.md](./STORE.md).

## GitHub Release

Bump `package.json` and `extension/manifest.json` to the same version, then:

```bash
pnpm release:github:dry    # pack + preview notes
pnpm release:github:full   # zip → commit → tag → gh release → push
```

Cursor command: `/github-release` (see `.cursor/commands/github-release.md`).

## Non-extension folders

| Path | Contents | In zip |
|------|----------|:------:|
| `extension/` | MV3 extension | yes |
| `docs/` | Technical docs | no |
| `analysis/` | Raw / deobfuscated JS | no |
| `alternatives/` | Console / userscript | no |

## Docs

- [How to force-debug a site that blocks DevTools](./docs/force-debug-blocked-sites.md) ([中文](./docs/force-debug-blocked-sites.zh-CN.md))
- [Privacy Policy](./PRIVACY.md) ([中文](./PRIVACY.zh-CN.md))
