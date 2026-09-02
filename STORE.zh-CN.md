# Chrome 网上应用店上架指南

> 中文 · [English](./STORE.md)

**已上架地址：**  
https://chromewebstore.google.com/detail/devtools-unlock/cehphgjpnlhlonahcldfbomncionnhdo

## 1. 打包

```bash
cd devtools-unlock
pnpm zip
# 或: ./scripts/pack.sh
```

产物：`releases/devtools-unlock_v{version}.zip`，**仅包含 `extension/` 目录内容**（不含 analysis、docs 等）。请保持 `package.json` 与 `extension/manifest.json` 版本一致。

如需一并提交、打 tag 并发布 [GitHub Release](https://github.com/webLiang/devtools-unlock/releases)：

```bash
pnpm release:github:dry    # 预览
pnpm release:github:full   # 正式发布（需 gh 已登录）
```

## 2. 上传

1. 登录 [Chrome 开发者信息中心](https://chrome.google.com/webstore/devconsole)
2. 新建 / 选择项目 → 上传 zip
3. 填写商店信息（见下文素材）

## 3. 商店 listing 建议文案

> **开源项目 — 简短说明 / 详细说明 / 官方网址 / 主页 / 支持链接均应突出：**  
> https://github.com/webLiang/devtools-unlock  
> 按字段完整粘贴：[`docs/chrome-web-store/LISTING.zh-CN.md`](./docs/chrome-web-store/LISTING.zh-CN.md)

### 名称

```
DevTools Unlock Open
```

### 简短说明（英文主语言，≤132 字符）

```
Open-source unlock for sites that block DevTools (e.g. disable-devtool): stop reloads, wipes, and detection.
```

中文 locale：

```
开源扩展：解锁被反调试锁定的网站（如 disable-devtool），拦截强制刷新、清空页面与 DevTools 检测。
```

### 官方网址 / 主页 / 支持

```
https://github.com/webLiang/devtools-unlock
```

```
https://github.com/webLiang/devtools-unlock/issues
```

### 详细说明

直接复制 [`LISTING.zh-CN.md`](./docs/chrome-web-store/LISTING.zh-CN.md) §3（以 **★ 开源项目** 开头，含仓库链接）。结构概要：

- ★ 开源项目 — 可审计、无混淆 / 远程代码 / 广告  
- ★ 单一用途 — 仅在用户启用站点恢复 DevTools  
- ★ 使用方法 / 权限 / 隐私 / 不适用  
- ★ 源码与支持 — GitHub + Issues  

### 权限说明（审核常见问题）

| 权限 | 用途 |
|------|------|
| `storage` | 保存按站点 hostname 白名单，不上传 |
| `scripting` | 仅对白名单站点在 `document_start` 向 MAIN world 注册 `unlock.js` |
| `tabs` | 弹窗读取当前标签并在开关后刷新 |
| `<all_urls>` | 用户可能在任意站点临时开启；需尽早注入才能生效 |

不会在 Chrome 网上应用店、Edge 附加组件页注入（见 `background.js` 的 `excludeMatches`）。  
问卷 / 审核粘贴：[`REVIEW_JUSTIFICATION.md`](./docs/chrome-web-store/REVIEW_JUSTIFICATION.md)。

## 4. 隐私与合规

- 隐私政策：仓库内 [PRIVACY.zh-CN.md](./PRIVACY.zh-CN.md) / [PRIVACY.md](./PRIVACY.md)，可托管到 GitHub Pages 后把 URL 填进商店表单
- **不收集**个人数据、浏览历史或页面内容
- **不向第三方发送**任何数据
- 数据仅本地 `chrome.storage.local` 存 `hostGroups` / `enabledHosts`

## 5. 完整上架素材（文案 + 介绍图）

已备齐可直接上传的资源包，见：

**[`docs/chrome-web-store/`](./docs/chrome-web-store/)**

| 内容 | 路径 |
|------|------|
| 提交清单 | [`docs/chrome-web-store/README.md`](./docs/chrome-web-store/README.md) |
| 英文粘贴文案 | [`LISTING.en.md`](./docs/chrome-web-store/LISTING.en.md) |
| 中文粘贴文案 | [`LISTING.zh-CN.md`](./docs/chrome-web-store/LISTING.zh-CN.md) |
| 审核说明 | [`REVIEW_JUSTIFICATION.md`](./docs/chrome-web-store/REVIEW_JUSTIFICATION.md) |
| 图标 / 宣传图 / 5 张截图 | [`docs/chrome-web-store/images/`](./docs/chrome-web-store/images/) |

尺寸：`icon 128`、`promo 440×280`、`marquee 1400×560`、截图 `1280×800`（均符合 CWS 要求）。

## 6. 版本与更新

- 修改 `extension/manifest.json` 的 `version`（语义化版本）
- 同步更新 `_locales/*/messages.json` 若改了描述
- 重新 `pnpm zip` 上传新版本

## 7. 审核注意

- 说明扩展**不用于绕过付费墙、DRM 或违法用途**，仅恢复 DevTools 可用性
- 若被拒「权限过大」，可在详细说明中强调：反调试必须在业务脚本之前注入，故需 `<all_urls>` + MAIN world（Chrome 111+）
- 完整审核话术见 [`docs/chrome-web-store/REVIEW_JUSTIFICATION.md`](./docs/chrome-web-store/REVIEW_JUSTIFICATION.md)
