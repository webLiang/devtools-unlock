# DevTools Unlock — agent map

Product: restore DevTools on user-enabled sites (MAIN-world `unlock.js` at `document_start`).

Human docs: [README.md](README.md) · [docs/firefox/README.md](docs/firefox/README.md). Cursor: `.cursorrules` · `.cursor/rules/`.

## Hard constraints

- Single package at repo root (do not add Turborepo / extra `packages/*`). `demo-site-vite/` is a **separate** npm app for local verification.
- Vite 8: `build.rolldownOptions`, not `rollupOptions`.
- Do not enable `inlineVitePreloadScript`.
- Manifest source is `manifest.js` (build writes `dist/chrome/manifest.json` or `dist/firefox/manifest.json`). Version comes from `package.json`.
- Unpacked roots are **`dist/chrome`** and **`dist/firefox`** (not `extension/`).
- i18n: `public/_locales/**/messages.json`. Comments and `console.*`: **English**.
- Commits: Conventional Commits. Husky runs commitlint.
- **MAIN-world unlock is a standalone IIFE.** Never add `src/pages/content/unlock/index.ts` to Vite `rolldownOptions.input`. Never use top-level `import` / `import()` in unlock or embedWatch. `scripts/build-iife.mjs` emits `unlock.js` and `embedWatch.js` into the current browser outDir.

## Commands

| Command | What it does |
|---------|----------------|
| `pnpm install` | Install (pnpm 11, Node from `.nvmrc`) |
| `pnpm dev` | Chrome HRR → `dist/chrome` |
| `pnpm dev:firefox` | Firefox HRR → `dist/firefox` |
| `pnpm build` | `tsc --noEmit` + Chrome production → `dist/chrome` |
| `pnpm build:firefox` | Firefox production → `dist/firefox` |
| `pnpm build:all` | Chrome then Firefox (`run-s`; folders do not overwrite) |
| `pnpm build:zip` | Zip `dist/chrome` → `releases/` |
| `pnpm build:firefox:zip` | Zip `dist/firefox` → `releases/*.firefox.zip` |
| `pnpm pack:firefox:sources` | AMO source zip (no `node_modules`) → `releases/*.firefox-sources.zip` |
| `pnpm test` | Vitest |
| `pnpm test:dist` | Assert Chrome `dist/chrome` |
| `pnpm test:dist:firefox` | Assert Firefox `dist/firefox` |

Load unpacked from **`dist/chrome`** (Chrome) or **`dist/firefox`** (Firefox). After SW or unlock changes: Reload the extension, then hard-refresh the tab.

## Layout

```
src/pages/background/     MV3 SW / Firefox background.scripts (static import OK)
src/pages/popup/          React popup
src/pages/content/unlock/ MAIN-world IIFE (esbuild, not Vite split)
src/pages/content/embedWatch/ isolated IIFE (iframe host discovery)
src/shared/hosts.ts       pure hostname / whitelist helpers (unit-tested)
public/_locales public/icons
manifest.js               Chrome MV3 source
utils/                    Vite 8 plugins + Firefox manifest parser + HRR
```

## Firefox

`pnpm build:firefox` rewrites `background.service_worker` → `background.scripts`, sets `browser_specific_settings.gecko.id` = `devtools-unlock@webliang`, `strict_min_version` `128.0`. Do not emit empty `options_ui`. Docs: [docs/firefox/README.md](docs/firefox/README.md).
