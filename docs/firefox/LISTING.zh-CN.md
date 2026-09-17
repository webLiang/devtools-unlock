# Firefox AMO listing 草稿（中文）

不会自动提交。Gecko ID：`devtools-unlock@webliang`。

## 名称

```
DevTools Unlock Open
```

## 摘要（≤250 字符）

```
开源扩展：按站点解锁屏蔽 DevTools 的网页（如 disable-devtool）。需 Firefox 128+。
```

## 说明

**开源：** https://github.com/webLiang/devtools-unlock

在挂了反调试库（例如 disable-devtool）的站点上恢复 DevTools。**默认全关**，只对当前 hostname 生效；开启时会覆盖本页已发现的跨域 iframe 主机（播放器）。

在 `document_start`、页面 MAIN world 注入，避免检测逻辑抢先清空页面或强制刷新。

**不用于：** 绕过付费墙、DRM、登录或 Cloudflare 验证。

**权限：** `storage`（本地白名单）、`scripting`（注册解锁脚本）、`tabs`（当前站点与刷新）、`<all_urls>`（用户可对任意 http(s) 站点开启；iframe 主机在安装时未知）。

支持：https://github.com/webLiang/devtools-unlock/issues
