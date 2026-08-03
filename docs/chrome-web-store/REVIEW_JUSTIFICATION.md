# Chrome Web Store — Review justification

> Use when filling the dashboard questionnaire or responding to reviewer questions.  
> Keep answers factual and aligned with the shipped `extension/` code.

## Open source

**Repository:** https://github.com/webLiang/devtools-unlock

The extension is fully open source. Reviewers (and users) can audit `extension/` against the public repo: no obfuscation, no remote code loading, no ads. Store listing Official URL / Homepage should point at this repository (or GitHub Pages for ownership verification, with the repo link still in the detailed description).

## Single purpose

**Purpose:** Restore Chrome DevTools availability on websites that embed anti-debug / anti-DevTools scripts (for example disable-devtool), by neutralizing detection and common punishments (forced reload, DOM wipe, hostile redirect) **only on hostnames the user explicitly enables**.

This is a single, focused open-source developer utility. It does not replace the new tab page, inject ads, change search, download media, or provide unrelated features.

## Why broad host access (`<all_urls>`)

Anti-debug libraries typically run as early as possible in the page. The unlock script must register at `document_start` in the **MAIN** world so it can patch abused timers / navigation / wipe callbacks **before** the detector starts.

Users may need the tool on arbitrary sites during legitimate debugging, so host access cannot be limited to a fixed allowlist of domains in the manifest. Runtime behavior is still restricted:

- Default: **no hosts enabled**
- Injection only for hostnames saved in the local whitelist (`hostGroups` / `enabledHosts`)
- Chrome Web Store / Edge add-on pages are excluded via `excludeMatches`

## Permission justification

| Permission | Justification |
|------------|----------------|
| `storage` | Persist local per-hostname enable list. Never uploaded. |
| `scripting` | Dynamically register `unlock.js` for enabled hosts at `document_start` (MAIN world). |
| `tabs` | Popup needs the active tab’s URL/hostname and triggers a reload after toggle. |
| `host_permissions: <all_urls>` | Required so users can enable unlock on any http(s) site; early MAIN-world injection cannot work with only `activeTab`. |

## Data usage / privacy

- **Collected remotely:** none  
- **Stored locally:** hostname whitelist only (`chrome.storage.local`)  
- **Sold / shared / used for ads:** no  
- Privacy policy: repository `PRIVACY.md` / `PRIVACY.zh-CN.md` (host a public URL for the store form)

## Remote code / obfuscation

- All logic ships inside the extension package (`unlock.js`, `background.js`, `popup.js`)
- No remote script loading, no `eval` / `new Function` for app logic
- Production package is plain readable JS (no obfuscator)

## What this extension is NOT

- Not a paywall / DRM / login-wall bypass
- Not for stealing credentials or scraping private content
- Not for circumventing site ToS for piracy; intended for debugging and security research on pages the user can already load

## Suggested one-paragraph reply to reviewers

> DevTools Unlock is open source (https://github.com/webLiang/devtools-unlock) with a single purpose: on user-enabled sites only, inject an early MAIN-world script that neutralizes common anti-DevTools detectors so developers can open DevTools without forced reloads or page wipes. Host access is broad because anti-debug must run before page scripts and users may enable any site, but the default is off and injection is limited to a local hostname whitelist. We do not collect or transmit user data; the shipped package is plain, auditable JS with no remote code.
