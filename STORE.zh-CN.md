# Chrome 网上应用店上架指南

> 中文 · [English](./STORE.md)

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

### 名称

`DevTools Unlock`

### 简短说明（英文，≤132 字符）

`Unlock DevTools on sites that block debugging (e.g. disable-devtool): stop forced reloads, page wipes, and detection.`

### 详细说明

**用途（Single purpose）**

本扩展仅做一件事：在用户启用的站点上，于 `document_start` 注入解锁脚本，抵消页面内嵌的反 DevTools 检测（如 disable-devtool），使用户可以正常打开开发者工具进行调试，并阻止因此触发的恶意跳转、清空页面或无限刷新。

**适用场景**

- 前端开发者在含反调试脚本的站点上调试
- 安全研究、逆向分析需保留 DevTools 可用性

**使用方式**

1. 安装后默认全部站点关闭（不影响其它网站）
2. 在目标站点打开工具栏 popup，开启「当前网站解锁」；**开启或关闭后将自动刷新当前页**（会一并解锁本页跨域视频 iframe 的 hostname）
3. 仅对已开启站点及其当时收录的嵌入域注入解锁脚本；其它站点保持原样
4. 打开 DevTools 不应再导致页面崩溃或白屏

### 权限说明（审核常见问题）

| 权限 | 用途 |
|------|------|
| `storage` | 保存按站点 hostname 白名单，不上传 |
| `scripting` | 仅对白名单站点在 `document_start` 向 MAIN world 注册 `unlock.js` |
| `<all_urls>` | 用户可能在任意站点临时开启；需尽早注入才能生效 |

不会在 Chrome 网上应用店、Edge 附加组件页注入（见 `background.js` 的 `excludeMatches`）。

## 4. 隐私与合规

- 隐私政策：仓库内 [PRIVACY.zh-CN.md](./PRIVACY.zh-CN.md) / [PRIVACY.md](./PRIVACY.md)，可托管到 GitHub Pages 后把 URL 填进商店表单
- **不收集**个人数据、浏览历史或页面内容
- **不向第三方发送**任何数据
- 数据仅本地 `chrome.storage.local` 存 `hostGroups` / `enabledHosts`

## 5. 截图建议（1280×800 或 640×400）

1. 扩展 popup：显示当前 hostname，解锁已开启
2. 目标站点 Console：`[devtools-unlock] injected…` 日志
3. DevTools 打开后页面仍正常显示（对比未安装时的白屏/刷新）

## 6. 版本与更新

- 修改 `extension/manifest.json` 的 `version`（语义化版本）
- 同步更新 `_locales/*/messages.json` 若改了描述
- 重新 `pnpm zip` 上传新版本

## 7. 审核注意

- 说明扩展**不用于绕过付费墙、DRM 或违法用途**，仅恢复 DevTools 可用性
- 若被拒「权限过大」，可在详细说明中强调：反调试必须在业务脚本之前注入，故需 `<all_urls>` + MAIN world（Chrome 111+）
