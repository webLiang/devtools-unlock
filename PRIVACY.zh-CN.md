# DevTools Unlock — 隐私政策

> 中文 · [English](./PRIVACY.md)

**最近更新：** 2026-07-21

## 摘要

DevTools Unlock **不会**收集、上传或向远程服务器传输任何个人数据或浏览内容。

## 本地存储的数据

扩展仅通过 `chrome.storage.local` 在你的设备上保存设置：

| 键 | 用途 | 默认值 |
|----|------|--------|
| `hostGroups` | 主站 hostname → 一并解锁的 hostname 列表（含跨域视频 iframe 等） | `{}` |
| `enabledHosts` | 由 `hostGroups` 展平的 hostname 列表（用于注册内容脚本） | `[]`（全部关闭） |

这些数据不会离开你的浏览器。解锁脚本只注入到列表中的 hostname。

## 扩展在网页上做什么

当某站点被启用时，扩展在 `document_start` 向页面 MAIN world 注入 `unlock.js`，用于：

- 修补被反 DevTools 库滥用的定时器与 DOM API
- 拦截已知反调试跳转 URL
- 阻止检测回调触发的根节点 HTML 清空

未在本地白名单中的站点不会被修改。扩展**不会**读取密码、表单、Cookie 或页面正文用于分析，也不会联网上报。

## 权限

- **storage** — 持久化按站点 hostname 白名单
- **scripting** — 为已启用站点在 document start 注册内容脚本
- **host access (`<all_urls>`)** — 用户可能在任意站点临时开启解锁，且必须在页面脚本之前注入

Chrome 网上应用店等类似页面会排除注入。

## 第三方

不包含第三方分析、广告或 SDK。

## 联系

隐私相关问题可通过项目仓库 issue 或 Chrome 网上应用店上的开发者信息联系。

## 变更

对本政策的实质性变更会更新上方「最近更新」日期，并在需要时同步商店 listing。
