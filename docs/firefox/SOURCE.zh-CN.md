# AMO 审核源码包

> 中文 · [English](./SOURCE.md)

给 [AMO 源码提交](https://extensionworkshop.com/documentation/publish/source-code-submission/) 打一份**源码**压缩包。商店里的附加组件 zip 是压缩/打包后的产物，Mozilla 要用这份源码复现构建。

```bash
pnpm pack:firefox:sources
```

产物：`releases/devtools-unlock_v{version}.firefox-sources.zip`

- 不含 `node_modules`、`dist`、`releases`、`.git`、`analysis/`
- 解压后根目录有 `SOURCE.md`（英文，给审核员看如何 `pnpm install` + `pnpm build:firefox`）

审核员步骤：

```bash
pnpm install
pnpm build:firefox
# 将 dist/firefox/ 与上传的 *.firefox.zip 对照
```

AMO 上传两个包：

1. 附加组件：`pnpm build:firefox:zip` → `*.firefox.zip`
2. 源码：`pnpm pack:firefox:sources` → `*.firefox-sources.zip`
