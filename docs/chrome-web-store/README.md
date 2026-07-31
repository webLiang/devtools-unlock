# Chrome Web Store — 上架资源包

> 本目录为 **DevTools Unlock** 提交 Chrome 网上应用店所需的**完整素材**（文案 + 图标 + 介绍图）。  
> 上传步骤见仓库根目录 [STORE.zh-CN.md](../../STORE.zh-CN.md) / [STORE.md](../../STORE.md)。

## 目录

```
docs/chrome-web-store/
├── README.md                 ← 本说明 + 提交清单
├── LISTING.en.md             ← 英文商店文案（可直接粘贴）
├── LISTING.zh-CN.md          ← 中文商店文案（可直接粘贴）
├── REVIEW_JUSTIFICATION.md   ← 审核说明（单一用途 / 权限理由）
└── images/
    ├── icon-128.png                    # 128×128 商店图标（必填）
    ├── promo-small-440x280.png         # 小宣传图（必填）
    ├── promo-marquee-1400x560.png      # Marquee 宣传图（选填，利于首页推荐）
    ├── screenshot-01-popup-enabled.png # 截图 1/5
    ├── screenshot-02-before-after.png  # 截图 2/5
    ├── screenshot-03-console-injected.png
    ├── screenshot-04-how-it-works.png
    └── screenshot-05-iframe-hosts.png
```

## 图片规格对照

| 资源 | 尺寸 | 必填 | 文件 |
|------|------|:----:|------|
| 扩展图标 | 128×128 | ✅ | `images/icon-128.png`（zip 内亦有 `icons/icon128.png`） |
| 小宣传图 | 440×280 | ✅ | `images/promo-small-440x280.png` |
| Marquee | 1400×560 | 推荐 | `images/promo-marquee-1400x560.png` |
| 截图 | 1280×800 | ✅≥1，最多 5 | `images/screenshot-0*.png` |

格式：PNG，直角、无透明边距（宣传图已扁平化为 RGB）。

> 说明：截图为**功能示意合成图**（品牌色 + 真实 popup 文案）。若审核偏好「真实浏览器截图」，可用 demo 站点 + 本机 popup 再拍 1～2 张替换 01 / 03。

## 提交前清单

### A. 包体

- [ ] `pnpm zip` → `releases/devtools-unlock_v{version}.zip`（仅 `extension/`）
- [ ] `package.json` 与 `extension/manifest.json` 版本一致
- [ ] 干净环境加载 zip 解压内容，开关与注入日志正常

### B. 商店 Listing（Dashboard → Store listing）

- [ ] 名称：`DevTools Unlock`
- [ ] 简短说明 ≤132 字符（见 `LISTING.*.md`）
- [ ] 详细说明（见 `LISTING.*.md`）
- [ ] 分类：**Developer Tools**
- [ ] 语言：English + 中文（简体）（与 `_locales` 一致）
- [ ] 上传 `icon-128` / 小宣传图 / 截图（建议 5 张）/ Marquee
- [ ] 隐私政策 URL：托管 [PRIVACY.md](../../PRIVACY.md) 后填入（如 GitHub raw / Pages）

### C. 隐私与权限问卷

- [ ] 声明：**不收集**用户数据（或仅本地存储设置）
- [ ] `storage` / `scripting` / `tabs` / `<all_urls>` 理由见 `REVIEW_JUSTIFICATION.md`
- [ ] 单一用途说明见同文件

### D. 合规自检（摘要）

- [ ] 单一用途：恢复 DevTools 可用性
- [ ] 不绕过付费墙 / DRM / 登录墙
- [ ] 无远程代码、无混淆、无广告/挖矿
- [ ] 默认全站 OFF，按站点白名单注入

## 推荐上传顺序（截图）

1. `screenshot-01-popup-enabled.png` — 核心：按站开关  
2. `screenshot-02-before-after.png` — 价值：前后对比  
3. `screenshot-03-console-injected.png` — 技术可信度  
4. `screenshot-04-how-it-works.png` — 使用步骤 + 隐私  
5. `screenshot-05-iframe-hosts.png` — 跨域 iframe 能力  

## 重新生成图片

```bash
# 需本机 Python3 + Pillow
pip3 install Pillow
# 可复用此前生成脚本逻辑；或从本目录已有 PNG 直接上传
```

当前 PNG 已按官方尺寸生成，一般无需重跑。
