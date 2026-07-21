# DevTools Unlock — Privacy Policy

> English · [中文](./PRIVACY.zh-CN.md)

**Last updated:** 2026-07-21

## Summary

DevTools Unlock does **not** collect, store on remote servers, or transmit any personal data or browsing content.

## Data stored locally

The extension saves one setting on your device using `chrome.storage.local`:

| Key | Purpose | Default |
|-----|---------|---------|
| `hostGroups` | Map of main site hostname → hostnames unlocked with it (includes cross-origin iframes such as video embeds) | `{}` |
| `enabledHosts` | Flattened hostname list derived from `hostGroups` (used for script registration) | `[]` (all sites off) |

These values never leave your browser. Unlock scripts are injected only on listed hostnames.

## What the extension does on web pages

When a site is enabled, at `document_start` the extension injects `unlock.js` into that page's main JavaScript world to:

- Patch timers and DOM APIs that anti-DevTools libraries abuse
- Block navigation to known anti-DevTools redirect URLs
- Prevent root-level HTML wipes triggered by detection callbacks

Sites not in the local whitelist are not modified. The extension does **not** read passwords, form fields, cookies, or page text for analytics. It does not phone home.

## Permissions

- **storage** — persist the per-site hostname whitelist
- **scripting** — register the content script at document start for enabled sites
- **host access (`<all_urls>`)** — required because anti-DevTools code can run on any site the user chooses to unlock, and must be patched before page scripts execute

Injection is skipped on Chrome Web Store and similar store URLs.

## Third parties

No third-party analytics, ads, or SDKs are included.

## Contact

For privacy questions, open an issue in the project repository or contact the developer listed on the Chrome Web Store listing.

## Changes

Material changes to this policy will be reflected in the "Last updated" date above and, where required, in the Chrome Web Store listing.
