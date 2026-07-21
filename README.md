# DevTools Unlock

> English · [中文](./README.zh-CN.md)

Inject before page scripts run to neutralize anti-debug logic such as [disable-devtool](https://github.com/theajack/disable-devtool), restore DevTools, and stop blank pages, forced reloads, and redirects.

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
│   └── pack.sh
├── releases/           ← versioned zip for store / GitHub
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
