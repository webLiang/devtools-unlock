# AMO source zip

> English · [中文](./SOURCE.zh-CN.md)

Pack a **source** archive for [AMO source code submission](https://extensionworkshop.com/documentation/publish/source-code-submission/). The add-on zip is minified; Mozilla needs this source to rebuild it.

```bash
pnpm pack:firefox:sources
```

Output: `releases/devtools-unlock_v{version}.firefox-sources.zip`

- No `node_modules`, `dist`, `releases`, `.git`, or `analysis/`
- Includes `SOURCE.md` at the zip root folder (`devtools-unlock/SOURCE.md`) with rebuild steps

Reviewer steps (also in `SOURCE.md`):

```bash
pnpm install
pnpm build:firefox
# compare dist/firefox/ with the uploaded *.firefox.zip
```

Upload **two** files on AMO:

1. Add-on: `pnpm build:firefox:zip` → `*.firefox.zip`
2. Source: `pnpm pack:firefox:sources` → `*.firefox-sources.zip`
