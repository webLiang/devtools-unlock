# DevTools Unlock Open

> English · [中文](./README.zh-CN.md)

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/devtools-unlock/cehphgjpnlhlonahcldfbomncionnhdo)
[![GitHub](https://img.shields.io/badge/GitHub-webLiang%2Fdevtools--unlock-181717?logo=github)](https://github.com/webLiang/devtools-unlock)

**Install from Chrome Web Store:**  
https://chromewebstore.google.com/detail/devtools-unlock/cehphgjpnlhlonahcldfbomncionnhdo

<p align="center">
  <strong>Building a Chrome extension?</strong>
  Start from
  <a href="https://github.com/webLiang/chrome-extension-boilerplate-ai"><strong>chrome-extension-boilerplate-ai</strong></a>
  — Vite 8 · MV3 · typical prod build ~100–300ms.
  <a href="https://github.com/webLiang/chrome-extension-boilerplate-ai#intro">Docs</a>
  ·
  <a href="https://github.com/webLiang/chrome-extension-boilerplate-ai"><img alt="GitHub stars" src="https://img.shields.io/github/stars/webLiang/chrome-extension-boilerplate-ai?style=flat" /></a>
</p>

A Chrome / Firefox extension that restores normal DevTools on sites that deliberately block inspection.

It injects **before** page scripts run and neutralizes anti-debug logic such as [disable-devtool](https://github.com/theajack/disable-devtool) (and similar custom detectors), so opening DevTools no longer blanks the page, force-reloads, or redirects you away.

## Why this project exists

Many sites ship front-end “anti-debug” libraries to discourage casual inspection. A common choice is [disable-devtool](https://github.com/theajack/disable-devtool): once DevTools opens, the page may wipe the DOM, reload, jump to a dead URL, or freeze the tab. Streaming and player sites often go further—detectors live inside **cross-origin iframes**, so the parent page looks fine while the player silently dies.

That is painful when you are a developer trying to **understand how a page works**: network calls, player pipelines, bundling, or embedding patterns. Manual workarounds (console snippets, userscripts, one-off breakpoints) break easily and do not survive a full reload before the detector wins.

This repo started from that exact friction—sites such as [anikai.watch](https://anikai.watch/) (player frames with their own detectors; notes under `analysis/anikai/`)—and grew into a small, per-host unlock tool:

- Patch known detection / punishment paths early (`document_start`, MAIN world)
- Opt-in **per hostname** (default off; also covers iframe hosts found on the tab)
- Keep research samples and console/Tampermonkey fallbacks outside the store package

**Intended use:** legitimate front-end research, learning, and debugging. It does not grant access beyond what the browser already loads for you.

## Install

| Channel | Link |
|---------|------|
| Chrome Web Store | [DevTools Unlock Open](https://chromewebstore.google.com/detail/devtools-unlock/cehphgjpnlhlonahcldfbomncionnhdo) |
| Unpacked Chrome | `pnpm build` → load **`dist/chrome`** — see [Local load](#local-load) |
| Firefox 128+ | `pnpm build:firefox` — see [Firefox](#firefox) |
| Source | [github.com/webLiang/devtools-unlock](https://github.com/webLiang/devtools-unlock) |

After install: open the target site → enable unlock in the toolbar popup → the page reloads → DevTools should work normally.

## Layout

```
devtools-unlock/
├── src/pages/          ← background, popup, unlock IIFE, embedWatch
├── public/             ← _locales + icons (copied into dist)
├── manifest.js         ← MV3 source (version from package.json)
├── dist/chrome/        ← Chrome unpacked package
├── dist/firefox/       ← Firefox unpacked package
├── docs/
│   ├── firefox/        ← Firefox / AMO notes
│   ├── force-debug-blocked-sites.md
│   └── chrome-web-store/
├── analysis/           ← sample bundles / notes (not in store zip)
├── alternatives/       ← console / Tampermonkey fallbacks
├── demo-site-vite/     ← local disable-devtool victim page
├── scripts/            ← pack.sh, github-release, IIFE build, AMO source zip
├── releases/           ← versioned zip + release notes
├── SOURCE.md           ← AMO reviewer rebuild steps
├── STORE.md            ← publishing checklist
└── PRIVACY.md          ← privacy policy
```

## Local load

### Chrome

1. `pnpm install` then `pnpm build` (dev: `pnpm dev`)
2. Open `chrome://extensions/` → enable **Developer mode**
3. **Load unpacked** → select the **`dist/chrome`** folder (not the repo root)
4. Open a target site, enable unlock in the popup (page reloads)
5. Console should show: `[devtools-unlock] injected — DevTools should work normally`

### Firefox

1. `pnpm build:firefox` (dev: `pnpm dev:firefox`)
2. Open `about:debugging#/runtime/this-firefox`
3. **Load Temporary Add-on…** → select `dist/firefox/manifest.json`
4. Temporary add-ons disappear when Firefox closes. Persistent install: AMO zip from `pnpm build:firefox:zip` (Gecko id `devtools-unlock@webliang`, Firefox **128+**).

Details: [docs/firefox/README.md](./docs/firefox/README.md).

### Per-site behavior

- Default: all sites **off**
- Toggle applies to the **current hostname** only
- Enabling also unlocks **iframe hosts** found on that tab (e.g. cross-origin video players)
- Enabling or disabling **reloads** the current http(s) page

## Pack for the Web Store

```bash
pnpm build:all            # Chrome → dist/chrome, Firefox → dist/firefox
pnpm build:zip            # Chrome → releases/devtools-unlock_v{version}.zip
pnpm build:firefox:zip    # Firefox → releases/devtools-unlock_v{version}.firefox.zip
pnpm pack:firefox:sources # AMO source zip (no node_modules) → *.firefox-sources.zip
```

Store zips contain the **contents of `dist/chrome` or `dist/firefox`** (manifest at zip root). AMO also needs the source archive: [SOURCE.md](./SOURCE.md) / [docs/firefox/SOURCE.md](./docs/firefox/SOURCE.md). See [STORE.md](./STORE.md). Optional CRX (local `dist.pem`, not committed): `pnpm build:crx`.

Published listing:  
https://chromewebstore.google.com/detail/devtools-unlock/cehphgjpnlhlonahcldfbomncionnhdo

## GitHub Release

Bump `package.json` `version` (copied into `dist/chrome/manifest.json` / `dist/firefox/manifest.json` at build), then:

```bash
pnpm release:github:dry    # pack Chrome + Firefox zips + preview notes
pnpm release:github:full   # zip → commit → tag → gh release → push
```

Cursor command: `/github-release` (see `.cursor/commands/github-release.md`).

## Non-extension folders

| Path | Contents | In zip |
|------|----------|:------:|
| `dist/chrome` / `dist/firefox` | MV3 extension (per browser) | store zip |
| `src/` + build configs | Add-on source | AMO `*.firefox-sources.zip` (no `node_modules`) |
| `docs/` | Technical docs | no (except firefox notes in source zip) |
| `analysis/` | Raw / deobfuscated JS | no |
| `alternatives/` | Console / userscript | no |
| `demo-site-vite/` | Local demo site | no |

## Docs

- [How to force-debug a site that blocks DevTools](./docs/force-debug-blocked-sites.md) ([中文](./docs/force-debug-blocked-sites.zh-CN.md))
- [Firefox add-on](./docs/firefox/README.md) ([中文](./docs/firefox/README.zh-CN.md))
- [AMO source zip](./docs/firefox/SOURCE.md) ([中文](./docs/firefox/SOURCE.zh-CN.md))
- [Privacy Policy](./PRIVACY.md) ([中文](./PRIVACY.zh-CN.md))
- [Chrome Web Store publishing](./STORE.md) ([中文](./STORE.zh-CN.md))

---

## More Chrome extensions

Other open-source tools from the same author:

| Extension | Description |
|-----------|-------------|
| [Pornhub Video Downloader](https://github.com/webLiang/Pornhub-Video-Downloader-Plugin-v3) | Multi-resolution video download for Pornhub, Xvideos, and other supported sites. |
| [Header Modify](https://github.com/webLiang/header-modify-extention) | Rewrite request headers for the current site, including iframes. |
