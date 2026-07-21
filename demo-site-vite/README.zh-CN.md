# disable-devtool 演示站（Vite + React + TS）

> 中文 · [English](./README.md)

用于本地验证 **DevTools Unlock** 扩展对 [disable-devtool](https://github.com/theajack/disable-devtool) 的解锁效果。

## 启动

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`（Vite 默认端口）。

## 三种引入方式

| 页面 | 方式 | 说明 |
|------|------|------|
| `/` | **npm** `import DisableDevtool from 'disable-devtool'` | 主演示：React 状态面板 + 事件日志 |
| `/script-auto.html` | **script** + `disable-devtool-auto` | 官网 1.2 CDN 自动初始化 |
| `/script-manual.html` | **script** + `DisableDevtool({...})` | 官网 3.4，命中时 `alert` 探测器类型 |

## 对比测试（Unlock 开 / 关）

1. `chrome://extensions/` 加载上级目录的 `extension/`
2. **扩展关闭** → 刷新演示页 → 打开 DevTools  
   - 预期：页面被惩罚（空白/跳转/关页等）
3. 在 popup **开启当前网站解锁** → 页面刷新 → 打开 DevTools  
   - 预期：Console 出现 `[devtools-unlock]` 日志；npm 页「Unlock injected」为 **Yes**

## 配置说明

npm 入口见 `src/devtools/disableDevtoolSetup.ts`：

- `interval: 200`（与真实站点一致）
- `ondevtoolopen` 会 `console.warn` 并调用 `next()` 走官方惩罚链

## 构建

```bash
npm run build
```

技术细节见 [force-debug-blocked-sites.zh-CN.md](../docs/force-debug-blocked-sites.zh-CN.md)。
