# How to force-debug a site that blocks DevTools

> English · [中文](./force-debug-blocked-sites.zh-CN.md)

This guide explains how anti-DevTools scripts (especially [disable-devtool](https://github.com/theajack/disable-devtool) and site-specific bundles) detect open DevTools, how to confirm fingerprints from live pages, and how **DevTools Unlock** counters those paths.

The full lecture-style notes (case study, matrix A–U, talk outline) live in the [Chinese version](./force-debug-blocked-sites.zh-CN.md). This English page summarizes the same architecture for open-source readers.

## 1. Symptoms

Typical punishment when DevTools opens:

- Blank page / `documentElement.innerHTML` wipe
- Forced `location.reload` / 404 redirect (often disable-devtool demo URLs)
- `history.back` / `window.close`
- Infinite freeze from integrity loops (e.g. `f3w5S8C`)
- Player iframe dies while the parent page looks fine (cross-origin embed detectors)

## 2. Recon from a live site

1. Open Network → filter JS → capture the main bundle (e.g. `scripts-*.js`).
2. Search for strings: `disable-devtool`, `ondevtoolopen`, `isDevToolOpened`, `devtoolsFormatters`, `Function('debugger')`, `sessionStorage` + `devtool`.
3. Keep samples under `analysis/` (not shipped in the Web Store zip).

See also [analysis/README.md](../analysis/README.md).

## 3. Why MAIN world + `document_start`

Isolated content scripts cannot patch page `window` APIs that anti-debug libraries use. Unlock registers with:

- `world: 'MAIN'`
- `runAt: 'document_start'`
- `allFrames: true` for whitelisted hostnames

so hooks run before business scripts.

## 4. What Unlock patches (high level)

| Area | Purpose |
|------|---------|
| Timer filters | Skip disable-devtool / detector polls |
| `Function('debugger')` | Neutralize timing probes |
| `console` / toString masks | Reduce Performance / FuncToString / DateToString signals **without** rewriting arbitrary page `function.toString()` (players may use source as decrypt keys) |
| Navigation / DOM guards | Block wipe + known redirect / reload / `history.back` |
| `devtoolsFormatters` | Strip Custom Formatter probe headers |
| `sessionStorage.devtool` | Clear and block sticky “already detected” flags |
| `devtoolsDetector` | Take over AEPKILL API used by some players (e.g. MegaPlay `e1-player`) |
| DisableDevtool API trap | Noop common global aliases |

## 5. Per-site unlock (current product behavior)

- Default: **no sites** unlocked.
- Popup toggles the **current hostname** only.
- On enable, the extension also collects iframe hostnames on that tab (including cross-origin video embeds) into `hostGroups`.
- Toggle always reloads the current http(s) page so hooks apply or clear.

Details: [README.md](../README.md), [PRIVACY.md](../PRIVACY.md).

## 6. Important limitation (player `toString` keys)

Libraries such as MegaPlay `client.js` / `e1-player` decrypt string tables using `someFn.toString()` as a key. Rewriting every function’s `toString` to `[native code]` breaks bootstrap (`tampered` / `qjOP` undefined). Unlock only disguises **hooked APIs**, not arbitrary page functions.

## 7. Demo & alternatives

- Local demo: [demo-site-vite/README.md](../demo-site-vite/README.md)
- Userscript / console injectors: [alternatives/README.md](../alternatives/README.md)

## 8. Disclaimer

This project restores DevTools for legitimate debugging and research. Do not use it to bypass paywalls, DRM, or other unlawful restrictions.
