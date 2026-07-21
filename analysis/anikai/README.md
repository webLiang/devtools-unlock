# anikai.watch / MegaPlay notes

> English · [中文](./README.zh-CN.md)

Page example: `https://anikai.watch/one-piece-episode-1164-in-english-subbed/`

## Structure

- Top frame: `anikai.watch` (theme scripts; no DisableDevtool observed)
- Player iframe: `https://megaplay.buzz/stream/s-2/...`
- Inside the iframe: `client.js`, `e1-player.min.js`, `jw_player.js`, `app.main.js`, etc.

## Findings

1. `client.js` / `e1-player.min.js` use their own `function.toString()` as a decrypt key; rewriting toString prints `Error: the code has been tampered!` and aborts.
2. End of `e1-player.min.js` calls `devtoolsDetector`: on DevTools open it writes state, runs a penalty API, then navigates/reloads after ~100ms — video dies.
3. Whitelisting only `anikai.watch` does **not** match cross-origin `megaplay.buzz`, so unlock never enters the player frame.

## Mitigations in this repo

1. On enable, `executeScript({ allFrames: true })` + scrape `iframe[src]` into `hostGroups`.
2. `unlock.js` takes over global `devtoolsDetector` (block `launch` / never forward `isOpen=true`) and recognizes obfuscated 100ms penalty `setTimeout` (`qjOP` / `BB6R`).
