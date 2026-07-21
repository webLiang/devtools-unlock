# 替代方案（非 Chrome 扩展）

> 中文 · [English](./README.md)

无法安装扩展时的备选注入方式，逻辑与 `extension/unlock.js` 同源思路，需自行维护同步。

| 文件 | 用法 |
|------|------|
| `devtools-unlock.console.js` | 在 DevTools Console 粘贴执行，或 Chrome Overrides 在 `document_start` 注入 |
| `devtools-unlock.userscript.js` | Tampermonkey / Violentmonkey 用户脚本 |

扩展版仍推荐用于日常调试：注入时机稳定、可按站点一键开关。
