# disable-devtool demo site (Vite + React + TS)

> English · [中文](./README.zh-CN.md)

Local site to verify **DevTools Unlock** against [disable-devtool](https://github.com/theajack/disable-devtool).

## Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` (Vite default).

## Three load styles

| Page | Method | Notes |
|------|--------|--------|
| `/` | **npm** `import DisableDevtool from 'disable-devtool'` | Main demo: React status panel + event log |
| `/script-auto.html` | **script** + `disable-devtool-auto` | Official docs 1.2 CDN auto-init |
| `/script-manual.html` | **script** + `DisableDevtool({...})` | Official docs 3.4; alerts detector type |

## Compare with Unlock on / off

1. Load `../extension/` from `chrome://extensions/`
2. **Extension off** → refresh demo → open DevTools  
   - Expect punishment (blank / redirect / close, depending on defaults)
3. **Enable unlock for this site** in the popup → page reloads → open DevTools  
   - Expect `[devtools-unlock]` logs; npm page “Unlock injected” = **Yes**

## Config

See `src/devtools/disableDevtoolSetup.ts`:

- `interval: 200` (matches many real sites)
- `ondevtoolopen` logs and calls `next()` for the official penalty chain

## Build

```bash
npm run build
```

Technical background: [force-debug-blocked-sites.md](../docs/force-debug-blocked-sites.md).
