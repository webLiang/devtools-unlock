# Chrome Web Store — 上架资源包

> 本目录为 **DevTools Unlock** 提交 Chrome 网上应用店所需的**完整素材**（文案 + 图标 + 介绍图）。  
> 上传步骤见仓库根目录 [STORE.zh-CN.md](../../STORE.zh-CN.md) / [STORE.md](../../STORE.md)。

## ★ 开源项目（商店文案必须突出）

| 项 | 内容 |
|----|------|
| 开源仓库 | https://github.com/webLiang/devtools-unlock |
| Issues | https://github.com/webLiang/devtools-unlock/issues |
| Releases | https://github.com/webLiang/devtools-unlock/releases |
| 商店页（已上架） | https://chromewebstore.google.com/detail/devtools-unlock/cehphgjpnlhlonahcldfbomncionnhdo |

简短说明、详细说明、官方网址、主页、支持链接、审核回复均应写明 **open source / 开源**，并附上仓库 URL。

## 按模块复制（Dashboard 字段对照）

| Dashboard 字段 | 英文粘贴 | 中文粘贴 |
|----------------|----------|----------|
| 名称 / Item name | [`LISTING.en.md`](./LISTING.en.md) §1 | [`LISTING.zh-CN.md`](./LISTING.zh-CN.md) §1 |
| 简短说明 / Short description | `LISTING.en.md` §2 | `LISTING.zh-CN.md` §2 |
| 详细说明 / Detailed description | `LISTING.en.md` §3（含 ★ OPEN SOURCE） | `LISTING.zh-CN.md` §3（含 ★ 开源项目） |
| 分类 | Developer Tools | 开发者工具 |
| 官方网址 / Official URL | GitHub 仓库（突出开源） | 同左 |
| 主页 / Homepage | GitHub 仓库 | 同左 |
| 支持网址 / Support | GitHub Issues | 同左 |
| 隐私政策 | `PRIVACY.md` URL | 可选 `PRIVACY.zh-CN.md` |
| 单一用途 / 权限 / 隐私问卷 | [`REVIEW_JUSTIFICATION.md`](./REVIEW_JUSTIFICATION.md) | 同文件内中英粘贴块 |

## 提交时常用 URL（复制）

| 字段 | URL |
|------|-----|
| **商店页面（已上架）** | https://chromewebstore.google.com/detail/devtools-unlock/cehphgjpnlhlonahcldfbomncionnhdo |
| 官方网址 / 主页（突出开源） | https://github.com/webLiang/devtools-unlock |
| 支持网址 | https://github.com/webLiang/devtools-unlock/issues |
| 隐私政策 | https://github.com/webLiang/devtools-unlock/blob/master/PRIVACY.md |
| 隐私政策（中文） | https://github.com/webLiang/devtools-unlock/blob/master/PRIVACY.zh-CN.md |
| 所有权验证（GitHub Pages） | https://webliang.github.io/devtools-unlock/ |

> 详细说明里须包含仓库链接（见 `LISTING.*.md` 的「OPEN SOURCE / 开源」段）。  
> 若 Dashboard 要求验证官方站所有权：官方网址暂填 Pages，验证通过后详细说明与支持链接仍指向 GitHub。

## 目录

```
docs/chrome-web-store/
├── README.md                 ← 本说明 + 提交清单
├── LISTING.en.md             ← 英文商店文案（按模块可直接粘贴）
├── LISTING.zh-CN.md          ← 中文商店文案（按模块可直接粘贴）
├── REVIEW_JUSTIFICATION.md   ← 审核 / 问卷粘贴稿（含开源声明）
└── images/
    ├── icon-128.png
    ├── promo-small-440x280.png
    ├── promo-marquee-1400x560.png
    ├── screenshot-01-popup-enabled.png
    ├── screenshot-02-before-after.png
    ├── screenshot-03-console-injected.png
    ├── screenshot-04-how-it-works.png
    └── screenshot-05-iframe-hosts.png
```

## 图片规格对照

| 资源 | 尺寸 | 必填 | 文件 |
|------|------|:----:|------|
| 扩展图标 | 128×128 | ✅ | `images/icon-128.png` |
| 小宣传图 | 440×280 | ✅ | `images/promo-small-440x280.png` |
| Marquee | 1400×560 | 推荐 | `images/promo-marquee-1400x560.png` |
| 截图 | 1280×800 | ✅≥1，最多 5 | `images/screenshot-0*.png` |

格式：PNG，直角、无透明边距（宣传图已扁平化为 RGB）。

## 提交前清单

### A. 包体

- [ ] `pnpm zip` → `releases/devtools-unlock_v{version}.zip`（仅 `extension/`）
- [ ] `package.json` 与 `extension/manifest.json` 版本一致
- [ ] 干净环境加载 zip 解压内容，开关与注入日志正常

### B. 商店 Listing（Dashboard → Store listing）

- [ ] 名称：`DevTools Unlock`
- [ ] 简短说明 ≤132 字符（含 **open-source / 开源**）
- [ ] 详细说明（含 **★ OPEN SOURCE / ★ 开源项目** + GitHub 链接）
- [ ] 官方网址 / 主页：`https://github.com/webLiang/devtools-unlock`
- [ ] 支持网址：`https://github.com/webLiang/devtools-unlock/issues`
- [ ] 分类：**Developer Tools**
- [ ] 语言：English + 中文（简体）
- [ ] 上传 icon / 小宣传图 / 截图 / Marquee
- [ ] 隐私政策 URL 已填

### C. 隐私与权限问卷

- [ ] 声明：**不收集**用户数据（或仅本地存储设置）
- [ ] 权限理由粘贴自 `REVIEW_JUSTIFICATION.md`
- [ ] 回复审核时可附开源仓库链接

### D. 合规自检（摘要）

- [ ] 单一用途：恢复 DevTools 可用性
- [ ] 文案突出开源 + 仓库 URL
- [ ] 不绕过付费墙 / DRM / 登录墙
- [ ] 无远程代码、无混淆、无广告
- [ ] 默认全站 OFF，按站点白名单注入

## 推荐上传顺序（截图）

1. `screenshot-01-popup-enabled.png` — 核心：按站开关  
2. `screenshot-02-before-after.png` — 价值：前后对比  
3. `screenshot-03-console-injected.png` — 技术可信度  
4. `screenshot-04-how-it-works.png` — 使用步骤 + 隐私  
5. `screenshot-05-iframe-hosts.png` — 跨域 iframe 能力  

当前 PNG 已按官方尺寸生成，一般无需重跑。
