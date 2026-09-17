# DevTools Unlock Open

> 中文 · [English](./README.md)

[![Chrome 网上应用店](https://img.shields.io/badge/Chrome%20Web%20Store-%E5%AE%89%E8%A3%85-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/devtools-unlock/cehphgjpnlhlonahcldfbomncionnhdo)
[![GitHub](https://img.shields.io/badge/GitHub-webLiang%2Fdevtools--unlock-181717?logo=github)](https://github.com/webLiang/devtools-unlock)

**Chrome 网上应用店安装：**  
https://chromewebstore.google.com/detail/devtools-unlock/cehphgjpnlhlonahcldfbomncionnhdo

<p align="center">
  <strong>要做 Chrome 扩展？</strong>
  从
  <a href="https://github.com/webLiang/chrome-extension-boilerplate-ai"><strong>chrome-extension-boilerplate-ai</strong></a>
  起步
  — Vite 8 · MV3 · 生产构建通常约 100–300ms。
  <a href="https://github.com/webLiang/chrome-extension-boilerplate-ai/blob/main/README.zh_CN.md#%E7%AE%80%E4%BB%8B">文档</a>
  ·
  <a href="https://github.com/webLiang/chrome-extension-boilerplate-ai"><img alt="GitHub stars" src="https://img.shields.io/github/stars/webLiang/chrome-extension-boilerplate-ai?style=flat" /></a>
</p>

一款 Chrome / Firefox 扩展：在故意屏蔽调试的站点上，把 DevTools 恢复成可正常使用的状态。

在页面业务脚本运行**之前**注入，抵消 [disable-devtool](https://github.com/theajack/disable-devtool) 等反调试逻辑（以及同类自研检测），避免一开 DevTools 就被清空页面、强制刷新或跳走。

## 为什么会有这个项目

不少网站会在前端挂「反调试」库，用来拦住随手打开的开发者工具。常见方案之一是 [disable-devtool](https://github.com/theajack/disable-devtool)：一旦检测到 DevTools，就可能清空 DOM、强制 `reload`、跳到无效地址，或把标签页卡死。流媒体 / 播放器类站点往往更狠——检测写在**跨域 iframe** 里，父页面看起来正常，播放器却已经挂了。

对开发者来说很别扭：想研究页面怎么拼出来的、网络请求怎么走、播放器链路或嵌入方式如何实现，结果连 Elements / Network / Sources 都不好用。控制台片段、油猴脚本、临时断点一类手工招数又脆，整页刷新后检测逻辑往往抢先执行。

本仓库正是从这类场景里长出来的——例如 [anikai.watch](https://anikai.watch/)（播放器帧自带检测；样本与笔记见 `analysis/anikai/`）——最终做成一个按站点开关的小工具：

- 尽早挂钩已知检测 / 惩罚路径（`document_start`、MAIN world）
- **按 hostname 可选开启**（默认全关；并覆盖本页已发现的 iframe 主机）
- 研究用样本、控制台 / Tampermonkey 兜底方案放在扩展包外，不进商店 zip

**适用场景：** 正当的前端研究、学习与调试。扩展不会给你浏览器里本来就没有的额外资源权限。

## 安装

| 渠道 | 链接 |
|------|------|
| Chrome 网上应用店 | [DevTools Unlock Open](https://chromewebstore.google.com/detail/devtools-unlock/cehphgjpnlhlonahcldfbomncionnhdo) |
| 本地加载 Chrome | `pnpm build` 后加载 **`dist/chrome`** — 见 [本地调试](#本地调试) |
| Firefox 128+ | `pnpm build:firefox` — 见下文 Firefox |
| 源码 | [github.com/webLiang/devtools-unlock](https://github.com/webLiang/devtools-unlock) |

安装后：打开目标站点 → 在工具栏 popup 开启解锁 → 页面刷新 → 即可正常使用 DevTools。

## 目录结构

```
devtools-unlock/
├── src/pages/          ← background、popup、unlock IIFE、embedWatch
├── public/             ← _locales + 图标（打进 dist）
├── manifest.js         ← MV3 源（version 来自 package.json）
├── dist/chrome/        ← Chrome 未打包扩展
├── dist/firefox/       ← Firefox 未打包扩展
├── docs/
│   ├── firefox/        ← Firefox / AMO 说明
│   ├── force-debug-blocked-sites.md
│   └── chrome-web-store/
├── analysis/           ← 样本 bundle 与笔记（不进商店包）
├── alternatives/       ← 控制台脚本 / Tampermonkey 替代方案
├── demo-site-vite/     ← 本地 disable-devtool 演示页
├── scripts/            ← pack.sh、github-release、IIFE 构建、AMO 源码包
├── releases/           ← 带版本号的 zip 与 Release Notes
├── SOURCE.md           ← AMO 审核员复现构建步骤
├── STORE.md            ← 上架步骤
└── PRIVACY.md          ← 隐私政策
```

## 本地调试

### Chrome

1. `pnpm install` 后 `pnpm build`（开发用 `pnpm dev`）
2. 打开 `chrome://extensions/` → 开启「开发者模式」
3. 「加载已解压的扩展程序」→ 选择 **`dist/chrome`** 文件夹（不是仓库根目录）
4. 打开目标站点，在 popup 中开启解锁（页面会刷新）
5. Console 应出现：`[devtools-unlock] injected — DevTools should work normally`

### Firefox

1. `pnpm build:firefox`（开发用 `pnpm dev:firefox`）
2. 打开 `about:debugging#/runtime/this-firefox`
3. **临时载入附加组件…** → 选择 `dist/firefox/manifest.json`
4. 临时附加组件在 Firefox 退出后消失。持久安装：`pnpm build:firefox:zip`（Gecko ID `devtools-unlock@webliang`，需 Firefox **128+**）。

详见 [docs/firefox/README.zh-CN.md](./docs/firefox/README.zh-CN.md)。

### 按站点行为

- 默认：全部站点**关闭**
- 开关只作用于**当前 hostname**
- 开启时会一并解锁本页已发现的 **iframe hostname**（如跨域视频播放器）
- 开启或关闭都会**刷新**当前 http(s) 页面

## 打包上架

```bash
pnpm build:all            # Chrome → dist/chrome，Firefox → dist/firefox
pnpm build:zip            # Chrome → releases/devtools-unlock_v{version}.zip
pnpm build:firefox:zip    # Firefox → releases/devtools-unlock_v{version}.firefox.zip
pnpm pack:firefox:sources # AMO 审核源码包（不含 node_modules）→ *.firefox-sources.zip
```

商店 zip **只含 `dist/chrome` 或 `dist/firefox` 目录内容**（manifest 在 zip 根）。AMO 还要源码包：见 [SOURCE.md](./SOURCE.md) / [docs/firefox/SOURCE.zh-CN.md](./docs/firefox/SOURCE.zh-CN.md)。详见 [STORE.zh-CN.md](./STORE.zh-CN.md)。可选 CRX（本地 `dist.pem`，不要提交）：`pnpm build:crx`。

已上架地址：  
https://chromewebstore.google.com/detail/devtools-unlock/cehphgjpnlhlonahcldfbomncionnhdo

## GitHub Release

先把 `package.json` 的 `version` 升上去（构建时写入 `dist/chrome/manifest.json` / `dist/firefox/manifest.json`），然后：

```bash
pnpm release:github:dry    # 打包并预览 Release Notes
pnpm release:github:full   # zip → commit → tag → gh release → push
```

Cursor 命令：`/github-release`（见 `.cursor/commands/github-release.md`）。

## 非扩展目录

| 路径 | 内容 | 是否进 zip |
|------|------|:----------:|
| `dist/chrome` / `dist/firefox` | MV3 扩展本体（按浏览器） | 商店 zip |
| `src/` + 构建配置 | 扩展源码 | AMO `*.firefox-sources.zip`（无 `node_modules`） |
| `docs/` | 技术文档 | 否（源码包会带 firefox 说明） |
| `analysis/` | 原始/反混淆 JS | 否 |
| `alternatives/` | 控制台版、Userscript | 否 |
| `demo-site-vite/` | 本地演示站点 | 否 |

## 文档

- [如何强制调试一个不让调试的网站](./docs/force-debug-blocked-sites.zh-CN.md) ([English](./docs/force-debug-blocked-sites.md))
- [Firefox 附加组件](./docs/firefox/README.zh-CN.md) ([English](./docs/firefox/README.md))
- [AMO 审核源码包](./docs/firefox/SOURCE.zh-CN.md) ([English](./docs/firefox/SOURCE.md))
- [隐私政策](./PRIVACY.zh-CN.md) ([English](./PRIVACY.md))
- [Chrome 网上应用店上架指南](./STORE.zh-CN.md) ([English](./STORE.md))

---

## 更多 Chrome 扩展

同一作者的其他开源扩展：

| 扩展 | 说明 |
|------|------|
| [Pornhub Video Downloader](https://github.com/webLiang/Pornhub-Video-Downloader-Plugin-v3) | Pornhub、Xvideos 等站点视频多分辨率下载。 |
| [Header Modify](https://github.com/webLiang/header-modify-extention) | 为当前站点改写请求头（含 iframe）。 |
