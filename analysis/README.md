# Analysis samples (not in the Chrome Web Store zip)

> English · [中文](./README.zh-CN.md)

This folder is for reverse engineering and docs references. **Do not** include it in the `extension/` zip.

**Sample origin:** main bundles from [anikai.watch](https://anikai.watch/) (e.g. `scripts-*.js` on player pages). For live-site recon steps, see [../docs/force-debug-blocked-sites.md](../docs/force-debug-blocked-sites.md).

| File | Notes |
|------|--------|
| `scripts-CbWe9mAN.js` | Original obfuscated site bundle |
| `scripts-CbWe9mAN.deobfuscated.js` | String-deobfuscated full dump |
| `scripts-CbWe9mAN.anti-devtool.extract.js` | Readable anti-debug extract |
| `deobfuscated-webcrack/deobfuscated.js` | webcrack-formatted output |
| `client.js` | Player/business sample (`fn.toString()` decrypt keys) |
| `anikai/` | MegaPlay iframe notes + pulled player JS |

**Suggested order:** symptoms → source recon in the docs → `anti-devtool.extract.js` → search deobfuscated for `ondevtoolopen` / `ca` / `reload`.
