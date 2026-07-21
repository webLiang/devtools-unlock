# 分析样本（不进 Chrome 商店包）

> 中文 · [English](./README.md)

本目录用于逆向与文档引用，**不要**打进 `extension/` 的 zip。

**样本来源**：[anikai.watch](https://anikai.watch/) 主 bundle（播放页等页面加载的 `scripts-*.js`）。如何从 live 站点定位并确认反调试指纹，见 [../docs/force-debug-blocked-sites.zh-CN.md](../docs/force-debug-blocked-sites.zh-CN.md)。

| 文件 | 说明 |
|------|------|
| `scripts-CbWe9mAN.js` | 站点原始混淆 bundle |
| `scripts-CbWe9mAN.deobfuscated.js` | 字符串反混淆完整版 |
| `scripts-CbWe9mAN.anti-devtool.extract.js` | 反调试逻辑可读摘要 |
| `deobfuscated-webcrack/deobfuscated.js` | webcrack 格式化输出 |
| `client.js` | 业务/播放器混淆样本（`fn.toString()` 密钥） |
| `anikai/` | MegaPlay iframe 笔记与拉取的播放器 JS |

**推荐阅读顺序**：现象 → 文档中的源码侦察 → `anti-devtool.extract.js` → deobfuscated 搜 `ondevtoolopen` / `ca` / `reload`。
