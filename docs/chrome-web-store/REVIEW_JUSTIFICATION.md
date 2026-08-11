# Chrome Web Store — Review justification（审核 / 问卷粘贴稿）

> 用于 Developer Dashboard 问卷、权限说明、或回复审核员。  
> 与已发布代码 `extension/` 及开源仓库保持一致。  
> **开源仓库：** https://github.com/webLiang/devtools-unlock

商店 Listing 字段粘贴见：`LISTING.en.md` / `LISTING.zh-CN.md`。

---

## 开源声明（可单独强调）

**English paste：**

```
DevTools Unlock is a fully open-source project. Source code, issues, and releases are public at https://github.com/webLiang/devtools-unlock. Reviewers and users can audit the extension/ package against the repository. There is no obfuscation, no remote code loading, and no advertising SDK.
```

**中文粘贴：**

```
DevTools Unlock 是完全开源项目。源码、Issue 与 Release 公开于 https://github.com/webLiang/devtools-unlock。审核人员与用户可将商店安装包与仓库 extension/ 目录对照审计。无代码混淆、无远程加载可执行逻辑、无广告 SDK。
```

---

## 1) Single purpose（单一用途）

**Purpose:** Restore Chrome DevTools availability on websites that embed anti-debug / anti-DevTools scripts (for example disable-devtool), by neutralizing detection and common punishments (forced reload, DOM wipe, hostile redirect) **only on hostnames the user explicitly enables**.

This is a single, focused **open-source** developer utility. It does not replace the new tab page, inject ads, change search, download media, or provide unrelated features.

**English paste（≤1000 chars）：**

```
Single purpose: restore DevTools on user-enabled sites that block debugging (e.g. disable-devtool). Open source: https://github.com/webLiang/devtools-unlock. Injects an early MAIN-world unlock script only for hostnames the user turns on. Does not replace new tab, inject ads, change search, or add unrelated features.
```

**中文粘贴：**

```
单一用途：在用户明确启用的站点上，恢复被反调试脚本（如 disable-devtool）锁定的 DevTools。开源地址：https://github.com/webLiang/devtools-unlock。仅对用户开启的 hostname 注入早期 MAIN world 解锁脚本。不替换新标签页、不注入广告、不改搜索、无无关功能。
```

---

## 2) Why broad host access（`<all_urls>`）

Anti-debug libraries typically run as early as possible in the page. The unlock script must register at `document_start` in the **MAIN** world so it can patch abused timers / navigation / wipe callbacks **before** the detector starts.

Users may need the tool on arbitrary sites during legitimate debugging, so host access cannot be limited to a fixed allowlist of domains in the manifest. Runtime behavior is still restricted:

- Default: **no hosts enabled**
- Injection only for hostnames saved in the local whitelist (`hostGroups` / `enabledHosts`)
- Chrome Web Store / Edge add-on pages are excluded via `excludeMatches`

**English paste：**

```
Host permission <all_urls> is required because anti-DevTools scripts can appear on any site the user chooses to debug, and unlock.js must run at document_start in the MAIN world before those detectors. Default is off for all sites; injection is limited to a local hostname whitelist. Store pages are excluded. Open source: https://github.com/webLiang/devtools-unlock
```

**中文粘贴：**

```
需要主机权限 <all_urls>：反 DevTools 脚本可能出现在用户需要调试的任意站点，且 unlock.js 必须在 document_start、MAIN world 早于检测器执行。默认全部站点关闭；仅对本地 hostname 白名单注入；商店页已排除。开源：https://github.com/webLiang/devtools-unlock
```

---

## 3) Permission justification（权限理由）

| Permission | Justification |
|------------|----------------|
| `storage` | Persist local per-hostname enable list. Never uploaded. |
| `scripting` | Dynamically register `unlock.js` for enabled hosts at `document_start` (MAIN world). |
| `tabs` | Popup needs the active tab’s URL/hostname and triggers a reload after toggle. |
| `host_permissions: <all_urls>` | Required so users can enable unlock on any http(s) site; early MAIN-world injection cannot work with only `activeTab`. |

### Short paste blocks

**`storage`：**

```
Store the local per-hostname unlock whitelist in chrome.storage.local. Never uploaded or shared.
```

**`scripting`：**

```
Register unlock.js at document_start (MAIN world) only for hostnames the user enabled. Used solely for the DevTools unlock feature.
```

**`tabs`：**

```
Read the active tab URL/hostname for the popup toggle and reload the tab after the user enables or disables unlock.
```

**Host / `<all_urls>`：**

```
Allow the user to enable unlock on any http(s) site. Anti-debug must be patched before page scripts; activeTab alone is insufficient for document_start MAIN-world injection. Default off; whitelist only. Open source: https://github.com/webLiang/devtools-unlock
```

---

## 4) Data usage / privacy（隐私实践）

- **Collected remotely:** none  
- **Stored locally:** hostname whitelist only (`chrome.storage.local`)  
- **Sold / shared / used for ads:** no  
- Privacy policy: `PRIVACY.md` / `PRIVACY.zh-CN.md`

**English paste：**

```
We do not collect, transmit, sell, or share user data. The only stored data is a local hostname whitelist in chrome.storage.local. No analytics, ads, or third-party trackers. Privacy policy: https://github.com/webLiang/devtools-unlock/blob/master/PRIVACY.md. Open source: https://github.com/webLiang/devtools-unlock
```

**中文粘贴：**

```
不收集、不传输、不出售、不共享用户数据。仅在本机 chrome.storage.local 保存 hostname 白名单。无分析统计、无广告、无第三方追踪。隐私政策：https://github.com/webLiang/devtools-unlock/blob/master/PRIVACY.md。开源：https://github.com/webLiang/devtools-unlock
```

**Privacy policy URL：**

```
https://github.com/webLiang/devtools-unlock/blob/master/PRIVACY.md
```

---

## 5) Remote code / obfuscation（远程代码 / 混淆）

- All logic ships inside the extension package (`unlock.js`, `background.js`, `popup.js`)
- No remote script loading, no `eval` / `new Function` for app logic
- Production package is plain readable JS (no obfuscator)
- Public repo for audit: https://github.com/webLiang/devtools-unlock

**English paste：**

```
All extension logic ships in the package. No remote code execution, no obfuscation intended to hide functionality. Source is publicly auditable at https://github.com/webLiang/devtools-unlock.
```

**中文粘贴：**

```
全部扩展逻辑均在安装包内。无远程可执行代码加载，无用于隐藏功能的混淆。源码可公开审计：https://github.com/webLiang/devtools-unlock。
```

---

## 6) What this extension is NOT

- Not a paywall / DRM / login-wall bypass  
- Not for stealing credentials or scraping private content  
- Not for circumventing site ToS for piracy; intended for debugging and security research on pages the user can already load  

**English paste：**

```
This extension is not for bypassing paywalls, DRM, or login walls, and not for stealing credentials. It only restores DevTools availability for legitimate debugging and research on pages the user can already load. Open source: https://github.com/webLiang/devtools-unlock
```

---

## 7) Suggested one-paragraph reply to reviewers

**English：**

```
DevTools Unlock is open source (https://github.com/webLiang/devtools-unlock) with a single purpose: on user-enabled sites only, inject an early MAIN-world script that neutralizes common anti-DevTools detectors so developers can open DevTools without forced reloads or page wipes. Host access is broad because anti-debug must run before page scripts and users may enable any site, but the default is off and injection is limited to a local hostname whitelist. We do not collect or transmit user data; the shipped package is plain, auditable JS with no remote code.
```

**中文：**

```
DevTools Unlock 为开源项目（https://github.com/webLiang/devtools-unlock），单一用途：仅在用户启用的站点上，注入早期 MAIN world 脚本以抵消常见反 DevTools 检测，避免强制刷新或清空页面，便于正当调试。主机权限较宽是因为反调试须早于页面脚本执行、且用户可能启用任意站点；默认关闭，仅本地 hostname 白名单注入。不收集、不传输用户数据；安装包为可审计的明文 JS，无远程代码。
```
