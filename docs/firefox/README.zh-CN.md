# Firefox 附加组件（MV3）

> 中文 · [English](./README.md)

DevTools Unlock 以 Chrome 网上应用店扩展为主，同时提供 **Firefox 128+** 的 Manifest V3 构建。注入模型与 Chrome 相同：按站点白名单、`scripting.registerContentScripts`、`world: "MAIN"`、`runAt: "document_start"`。

官方依据：

- [Firefox 128 的 MV3 更新](https://blog.mozilla.org/addons/2024/07/10/manifest-v3-updates-landed-in-firefox-128/)
- [scripting.registerContentScripts()](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting/registerContentScripts)
- [scripting.executeScript()](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting/executeScript)

## 要求

| 项 | 值 |
|----|-----|
| Firefox | **128** 及以上（`strict_min_version`） |
| Gecko ID | `devtools-unlock@webliang`（上架 AMO / 持久安装后不可改） |
| 权限 | `storage`、`scripting`、`tabs`、主机 `<all_urls>` |

`<all_urls>` 是为了在开启站点时立刻覆盖**安装时未知**的跨域播放器 iframe。optional origin 无法在 iframe 出现前注入。说明与 Chrome 商店审核材料一致。

## 构建与临时加载

1. `pnpm install`
2. `pnpm build:firefox`（开发可用 `pnpm dev:firefox`）
3. 打开 `about:debugging#/runtime/this-firefox`
4. **临时载入附加组件…**
5. 选择 `dist/firefox/manifest.json`

临时附加组件在 **Firefox 退出后消失**。持久安装走 AMO，或带上述 Gecko ID 的签名包。

## Firefox 构建改了什么

`__FIREFOX__=true` 时 `utils/manifest-parser`：

- `background.service_worker` → `background.scripts` + `type: "module"`
- 写入 `browser_specific_settings.gecko`（id、最低版本、`data_collection_permissions: none`）
- 写入 `content_security_policy.extension_pages`
- **不**写 `options_ui`（本产品没有选项页）
- 去掉 `minimum_chrome_version`

运行时：后台 `webextension-polyfill`；Firefox 上省略 `executeScript` 的 `injectImmediately`；`unlock.js` / `embedWatch.js` 仍是经典 IIFE。

## AMO zip 与审核源码

```bash
pnpm build:firefox:zip       # 附加组件 → releases/*.firefox.zip
pnpm pack:firefox:sources    # 源码（无 node_modules）→ releases/*.firefox-sources.zip
```

附加组件 zip 是 `dist/firefox/` 的内容（不是整个 git 仓库）。AMO 还要源码包，因为商店包是 Vite/esbuild 生产构建。复现步骤：[SOURCE.md](../../SOURCE.md) / [SOURCE.zh-CN.md](./SOURCE.zh-CN.md)。

文案草稿：[LISTING.zh-CN.md](./LISTING.zh-CN.md)。本仓库不自动提交 AMO。

## Lint

```bash
pnpm build:firefox
pnpm lint:firefox
```
