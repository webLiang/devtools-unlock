# Source code for Firefox / AMO review

This archive is the **source** of DevTools Unlock Open. It does **not** include `node_modules` (or other install/build output). Reviewers install dependencies themselves.

The add-on zip uploaded to addons.mozilla.org (`devtools-unlock_v{version}.firefox.zip`) is a **production Vite + esbuild bundle** of this source. There is no obfuscation and no remote code.

## Reproduce the submitted add-on

| Item | Value |
|------|--------|
| Node.js | **24** (see `.nvmrc`) |
| pnpm | **11.13.1** (`packageManager` in `package.json`) |
| Firefox | **128+** (`strict_min_version`) |

```bash
pnpm install
pnpm build:firefox
```

Output directory: **`dist/firefox/`**

That folder is what `pnpm build:firefox:zip` packs (manifest at zip root). Compare it with the uploaded add-on package.

Production minify is on (`vite build` without `__DEV__`). Do not use `pnpm dev:firefox` to reproduce the store package.

## What the Firefox build does

`__FIREFOX__=true` (set by `pnpm build:firefox`):

- Writes `dist/firefox/` instead of `dist/chrome/`
- Converts `background.service_worker` → `background.scripts`
- Adds `browser_specific_settings.gecko` (`id`: `devtools-unlock@webliang`, `strict_min_version`: `128.0`)
- Bundles `unlock.js` / `embedWatch.js` as classic IIFE (no `import()`)

More: [docs/firefox/README.md](./docs/firefox/README.md), [README.md](./README.md).

## Not in this source zip

| Path | Why |
|------|-----|
| `node_modules/` | Reviewers run `pnpm install` |
| `dist/` | Rebuild with `pnpm build:firefox` |
| `releases/` | Output zips |
| `analysis/` | Third-party site samples for research; not part of the add-on build |
| `.git/` | Version control metadata |

The public git repo is https://github.com/webLiang/devtools-unlock
