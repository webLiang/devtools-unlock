# Firefox AMO listing draft (English)

Not submitted automatically. Gecko ID: `devtools-unlock@webliang`.

## Name

```
DevTools Unlock Open
```

## Summary (≤250 characters)

```
Open-source unlock for sites that block DevTools (e.g. disable-devtool). Opt-in per site. Firefox 128+.
```

## Description

**OPEN SOURCE:** https://github.com/webLiang/devtools-unlock

This add-on restores Firefox DevTools on sites that ship anti-debug libraries (for example disable-devtool). It is **off by default**. You enable unlock for the current hostname only. Enabling also covers cross-origin iframe hosts found on that tab (video players).

Injection runs at `document_start` in the page (MAIN) world so detectors cannot wipe the document or force-reload before DevTools opens.

**Not for:** bypassing paywalls, DRM, logins, or Cloudflare challenges.

**Permissions:** `storage` (local whitelist), `scripting` (register unlock), `tabs` (current site + reload), `<all_urls>` (user may enable any http(s) site; iframe hosts are unknown at install time).

Support: https://github.com/webLiang/devtools-unlock/issues
