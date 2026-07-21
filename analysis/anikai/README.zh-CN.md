# anikai.watch / MegaPlay 排查笔记

> 中文 · [English](./README.md)

页面示例：`https://anikai.watch/one-piece-episode-1164-in-english-subbed/`

## 结构

- 顶层：`anikai.watch`（主题脚本，未见 DisableDevtool）
- 播放器 iframe：`https://megaplay.buzz/stream/s-2/...`
- 在 iframe 内：`client.js`、`e1-player.min.js`、`jw_player.js`、`app.main.js` 等

## 关键结论

1. `client.js` / `e1-player.min.js` 用自身 `function.toString()` 作解密密钥；篡改 toString 会打出 `Error: the code has been tampered!` 并中止。
2. `e1-player.min.js` 末尾有 `devtoolsDetector`：检测到 DevTools 后写状态、调用惩罚 API，并在约 100ms 后跳转/重载，导致视频不可播。
3. 仅把 `anikai.watch` 加入白名单时，跨域 iframe `megaplay.buzz` **不会**匹配 `registerContentScripts`，解锁脚本进不去播放器帧。

## 本仓库对策

1. 开启主站时用 `executeScript({ allFrames: true })` + scrape `iframe[src]`，把嵌入域写入 `hostGroups`。
2. `unlock.js` 接管全局 `devtoolsDetector`（拦截 `launch` / 不转发 `isOpen=true`），并识别 e1 混淆后的 100ms 惩罚 `setTimeout`（`qjOP`/`BB6R`）。
