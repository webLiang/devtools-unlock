# DevTools Unlock

> 中文 · [English](./README.md)

一款 Chrome 扩展：在故意屏蔽调试的站点上，把 DevTools 恢复成可正常使用的状态。

在页面业务脚本运行**之前**注入，抵消 [disable-devtool](https://github.com/theajack/disable-devtool) 等反调试逻辑（以及同类自研检测），避免一开 DevTools 就被清空页面、强制刷新或跳走。

## 为什么会有这个项目

不少网站会在前端挂「反调试」库，用来拦住随手打开的开发者工具。常见方案之一是 [disable-devtool](https://github.com/theajack/disable-devtool)：一旦检测到 DevTools，就可能清空 DOM、强制 `reload`、跳到无效地址，或把标签页卡死。流媒体 / 播放器类站点往往更狠——检测写在**跨域 iframe** 里，父页面看起来正常，播放器却已经挂了。

对开发者来说很别扭：想研究页面怎么拼出来的、网络请求怎么走、播放器链路或嵌入方式如何实现，结果连 Elements / Network / Sources 都不好用。控制台片段、油猴脚本、临时断点一类手工招数又脆，整页刷新后检测逻辑往往抢先执行。

本仓库正是从这类场景里长出来的——例如 [anikai.watch](https://anikai.watch/)（播放器帧自带检测；样本与笔记见 `analysis/anikai/`）——最终做成一个按站点开关的小工具：

- 尽早挂钩已知检测 / 惩罚路径（`document_start`、MAIN world）
- **按 hostname 可选开启**（默认全关；并覆盖本页已发现的 iframe 主机）
- 研究用样本、控制台 / Tampermonkey 兜底方案放在扩展包外，不进商店 zip

**适用场景：** 正当的前端研究、学习与调试。扩展不会给你浏览器里本来就没有的额外资源权限。

## 目录结构

```
devtools-unlock/
├── extension/          ← 上架 Chrome 网上应用店：只打包此目录
│   ├── manifest.json
│   ├── background.js
│   ├── unlock.js
│   ├── popup.html / popup.js
│   ├── icons/
│   └── _locales/       ← 商店与 popup 多语言（en、zh_CN）
├── docs/
│   └── force-debug-blocked-sites.md  ← 技术文档（英 + 中）
├── analysis/           ← 样本 bundle 与笔记（不进商店包）
├── alternatives/       ← 控制台脚本 / Tampermonkey 替代方案
├── scripts/
│   ├── pack.sh
│   └── github-release.mjs
├── releases/           ← 带版本号的 zip 与 Release Notes
├── STORE.md            ← 上架步骤
└── PRIVACY.md          ← 隐私政策
```

## 本地调试

1. 打开 `chrome://extensions/` → 开启「开发者模式」
2. 「加载已解压的扩展程序」→ 选择 **`extension/`** 文件夹（不是仓库根目录）
3. 打开目标站点，在 popup 中开启解锁（页面会刷新）
4. Console 应出现：`[devtools-unlock] injected — DevTools should work normally`

### 按站点行为

- 默认：全部站点**关闭**
- 开关只作用于**当前 hostname**
- 开启时会一并解锁本页已发现的 **iframe hostname**（如跨域视频播放器）
- 开启或关闭都会**刷新**当前 http(s) 页面

## 打包上架

```bash
pnpm zip
# 或: ./scripts/pack.sh
```

在 `releases/` 生成仅含 `extension/` 的 `devtools-unlock_v{version}.zip`。详见 [STORE.zh-CN.md](./STORE.zh-CN.md) / [STORE.md](./STORE.md)。

## GitHub Release

先把 `package.json` 与 `extension/manifest.json` 升到同一版本，然后：

```bash
pnpm release:github:dry    # 打包并预览 Release Notes
pnpm release:github:full   # zip → commit → tag → gh release → push
```

Cursor 命令：`/github-release`（见 `.cursor/commands/github-release.md`）。

## 非扩展目录

| 路径 | 内容 | 是否进 zip |
|------|------|:----------:|
| `extension/` | MV3 扩展本体 | 是 |
| `docs/` | 技术文档 | 否 |
| `analysis/` | 原始/反混淆 JS | 否 |
| `alternatives/` | 控制台版、Userscript | 否 |

## 文档

- [如何强制调试一个不让调试的网站](./docs/force-debug-blocked-sites.zh-CN.md) ([English](./docs/force-debug-blocked-sites.md))
- [隐私政策](./PRIVACY.zh-CN.md) ([English](./PRIVACY.md))
