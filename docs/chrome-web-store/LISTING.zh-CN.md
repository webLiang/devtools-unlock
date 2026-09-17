# Chrome 网上应用店 Listing 文案（中文）

> 每个代码块可直接粘贴到 [开发者信息中心](https://chrome.google.com/webstore/devconsole) → **商店信息** 对应字段。  
> Manifest 短描述：`_locales/zh_CN/messages.json` → `extDescription`（与下方「简短说明」保持一致）。

**开源仓库（务必突出）：** [https://github.com/webLiang/devtools-unlock](https://github.com/webLiang/devtools-unlock)

---

## 1) 名称

```
DevTools Unlock Open
```

---

## 2) 简短说明（≤132 字符）

英文主语言短描述（商店主语言常用英文）：

```
Open-source unlock for sites that block DevTools (e.g. disable-devtool): stop reloads, wipes, and detection.
```

中文 locale 短描述：

```
开源扩展：解锁被反调试锁定的网站（如 disable-devtool），拦截强制刷新、清空页面与 DevTools 检测。
```

---

## 3) 详细说明（中文 locale 可直接粘贴）

```
DevTools Unlock Open 是一款完全开源、免费的 Chrome 扩展，用于在故意屏蔽调试的网站上，把开发者工具恢复为可正常使用的状态。

★ 开源项目（可审计、可贡献）
本扩展完全开源，欢迎阅读每一行源码、核对权限、提 Issue 与贡献代码：
https://github.com/webLiang/devtools-unlock

• 社区开源项目，扩展内无付费墙
• 无代码混淆、无远程加载可执行逻辑、无广告、无追踪 SDK
• Chrome 网上应用店安装包与公开仓库 `pnpm build` 产物 dist/chrome 一致，可对照审计
• 版本与更新说明：https://github.com/webLiang/devtools-unlock/releases

★ 单一用途
本扩展只做一件事：在你明确启用的站点上，于 document_start（MAIN world）注入解锁脚本，抵消常见的反 DevTools 检测（如 disable-devtool 及同类自研脚本），避免强制刷新、清空页面、恶意跳转等惩罚，从而正常使用 Elements / Network / Sources 进行调试。

★ 适用人群
• 需要在含反调试脚本的站点上调试的前端开发者
• 需要保留 DevTools 可用性的安全研究与学习场景（仅针对你已能打开的页面）

★ 使用方法
1. 安装后默认全部站点关闭，不影响其它网站。
2. 打开目标网站，点击工具栏图标，开启「启用当前网站解锁」。
3. 页面会自动刷新一次；本页已发现的跨域 iframe 主机可一并解锁（适合内嵌播放器等场景）。
4. 打开 DevTools 后，页面应保持可用，而不再白屏或无限刷新。

★ 权限说明（为何需要）
• storage — 仅在本地保存按 hostname 的白名单（不上传）
• scripting — 仅为已启用站点在 document_start 注册 unlock.js
• tabs — 供弹窗读取当前标签页信息并在开关后刷新页面
• 主机权限（<all_urls>）— 用户可能在任意 http(s) 站点临时开启；必须在页面业务脚本之前注入才能生效。Chrome 网上应用店等页面已排除注入。

★ 隐私
不收集个人数据、浏览历史或页面内容，不向任何服务器发送数据。设置仅保存在本机 chrome.storage.local。
隐私政策：https://github.com/webLiang/devtools-unlock/blob/master/PRIVACY.md
中文隐私政策：https://github.com/webLiang/devtools-unlock/blob/master/PRIVACY.zh-CN.md

★ 不适用
不用于绕过付费墙、DRM、登录限制或任何违法用途。本工具仅恢复正当调试研究所需的 DevTools 可用性。

★ 源码与支持
开源仓库：https://github.com/webLiang/devtools-unlock
问题反馈：https://github.com/webLiang/devtools-unlock/issues
GitHub Pages（可选主页 / 所有权验证）：https://webliang.github.io/devtools-unlock/
```

---

## 4) 分类

```
Developer Tools
```

（界面若显示中文：开发者工具）

---

## 5) 语言

```
中文（简体）
```

主语言建议同时维护 English（见 `LISTING.en.md`）。

---

## 6) 官方网址（推荐填仓库，突出开源）

```
https://github.com/webLiang/devtools-unlock
```

若 Dashboard 要求用 HTML 文件验证所有权，官方网址可暂填 Pages，**详细说明里仍须保留仓库链接**：

```
https://webliang.github.io/devtools-unlock/
```

---

## 7) 主页网址

```
https://github.com/webLiang/devtools-unlock
```

---

## 8) 支持网址

```
https://github.com/webLiang/devtools-unlock/issues
```

---

## 9) 隐私政策 URL

英文（商店表单常用）：

```
https://github.com/webLiang/devtools-unlock/blob/master/PRIVACY.md
```

中文版（可选，可写进详细说明）：

```
https://github.com/webLiang/devtools-unlock/blob/master/PRIVACY.zh-CN.md
```

---

## 10) 宣传视频（可选）

无短视频可留空。有的话填 YouTube 链接（弹窗开关 → Console 注入日志 → 打开 DevTools）。

---

## 11) 图片上传

| 字段 | 文件 |
|------|------|
| 商店图标 | `images/icon-128.png` |
| 小宣传图 | `images/promo-small-440x280.png` |
| Marquee | `images/promo-marquee-1400x560.png` |
| 截图（最多 5） | `images/screenshot-01` … `05` |

推荐截图顺序：01 弹窗开关 → 02 前后对比 → 03 Console 注入 → 04 步骤与隐私 → 05 iframe 主机。

---

## 12) 公开范围 / 分发

- 公开范围：公开（或 Unlisted 软启动）
- 地区：全部地区（或按需限制）

---

## 已上架地址（参考）

```
https://chromewebstore.google.com/detail/devtools-unlock/cehphgjpnlhlonahcldfbomncionnhdo
```
