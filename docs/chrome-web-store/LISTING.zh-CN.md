# Chrome 网上应用店 Listing 文案（中文）

> 粘贴到 [开发者信息中心](https://chrome.google.com/webstore/devconsole) → 商店信息。  
> Manifest 短描述已在 `_locales/zh_CN/messages.json`（`extDescription`）。

---

## 名称

```
DevTools Unlock
```

## 简短说明（建议仍提交英文主 listing；中文 locale 可用下方）

英文主短描述（商店主语言常用英文，≤132）：

```
Unlock DevTools on sites that block debugging (e.g. disable-devtool): stop forced reloads, page wipes, and detection.
```

中文短描述（用于中文 locale，注意商店对短描述语言策略）：

```
解锁被反调试锁定的网站（如 disable-devtool）：拦截强制刷新、清空页面与 DevTools 检测。
```

## 详细说明（中文，可粘贴到中文 locale）

```
DevTools Unlock 用于在故意屏蔽调试的网站上，把 Chrome 开发者工具恢复为可正常使用的状态。

【单一用途】
本扩展只做一件事：在你启用的站点上，于 document_start（MAIN world）注入解锁脚本，抵消常见的反 DevTools 检测（如 disable-devtool 及同类自研脚本），避免强制刷新、清空页面、恶意跳转等惩罚，从而正常调试。

【适用人群】
• 需要在含反调试脚本的站点上调试的前端开发者
• 需要使用 Elements / Network / Sources 的安全研究与学习场景

【使用方法】
1. 安装后默认全部站点关闭，不影响其它网站。
2. 打开目标网站，点击工具栏图标，开启「启用当前网站解锁」。
3. 页面会自动刷新一次；本页已发现的跨域 iframe 主机可一并解锁（适合内嵌播放器等场景）。
4. 打开 DevTools 后，页面应保持可用，而不再白屏或无限刷新。

【权限说明】
• storage — 仅在本地保存按 hostname 的白名单（不上传）
• scripting — 仅为已启用站点在 document_start 注册 unlock.js
• tabs — 供 popup 读取当前标签页信息并刷新页面
• 主机权限（<all_urls>）— 用户可能在任意站点临时开启；必须在页面业务脚本之前注入才能生效。Chrome 网上应用店等页面已排除注入。

【隐私】
不收集个人数据、浏览历史或页面内容，不向任何服务器发送数据。设置仅保存在本机 chrome.storage.local。详见本 listing 中的隐私政策链接。

【不适用】
不用于绕过付费墙、DRM、登录限制或任何违法用途。本工具仅恢复正当调试研究所需的 DevTools 可用性。
```

## 分类

```
Developer Tools（开发者工具）
```

## 官方网站 / 支持网址（可选）

```
https://github.com/webLiang/devtools-unlock
```

## 隐私政策 URL

将仓库 `PRIVACY.zh-CN.md` / `PRIVACY.md` 托管为可公网访问的 URL 后填入，例如：

```
https://github.com/webLiang/devtools-unlock/blob/main/PRIVACY.md
```

## 图片上传

| 字段 | 文件 |
|------|------|
| 商店图标 | `images/icon-128.png` |
| 小宣传图 | `images/promo-small-440x280.png` |
| Marquee | `images/promo-marquee-1400x560.png` |
| 截图（最多 5） | `images/screenshot-01` … `05` |

推荐截图顺序：01 弹窗开关 → 02 前后对比 → 03 Console 注入 → 04 步骤与隐私 → 05 iframe 主机。
