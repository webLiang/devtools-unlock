# DevTools Unlock

> 中文 · [English](./README.md)

在页面脚本运行前注入，抵消 [disable-devtool](https://github.com/theajack/disable-devtool) 等反调试逻辑，恢复 DevTools，避免打开后被清空、强制刷新或跳转。

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
│   └── pack.sh
├── releases/           ← 带版本号的商店 / GitHub zip
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
