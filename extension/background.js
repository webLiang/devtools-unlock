/**
 * MV3 service worker: register MAIN-world unlock script for a per-host whitelist.
 * Enabling a site also collects iframe hostnames on the current tab (e.g. video embeds);
 * otherwise cross-origin player frames never get unlock and detectors like e1-player still fire.
 */
const SCRIPT_ID = 'devtools-unlock-main';

const EXCLUDE_MATCHES = [
  '*://chrome.google.com/*',
  '*://chromewebstore.google.com/*',
  '*://microsoftedge.microsoft.com/addons/*',
];

/** Whether the URL is a normal http(s) page that can be unlocked. */
function isSupportedUrl(url) {
  return /^https?:\/\//i.test(url || '');
}

/** Parse hostname from URL; returns empty string for non-http(s). */
function parseHost(url) {
  if (!isSupportedUrl(url)) {
    return '';
  }
  try {
    return new URL(url).hostname || '';
  } catch (e) {
    return '';
  }
}

/** Flatten hostGroups into a deduplicated hostname list. */
function flattenHostGroups(groups) {
  const set = new Set();
  if (!groups || typeof groups !== 'object') {
    return [];
  }
  for (const list of Object.values(groups)) {
    if (!Array.isArray(list)) {
      continue;
    }
    for (const host of list) {
      if (typeof host === 'string' && host) {
        set.add(host);
      }
    }
  }
  return Array.from(set);
}

/**
 * Load and migrate storage: hostGroups is source of truth; support legacy enabled / flat enabledHosts.
 * @returns {Promise<Record<string, string[]>>}
 */
async function migrateAndGetHostGroups() {
  const data = await chrome.storage.local.get({
    hostGroups: {},
    enabledHosts: [],
    enabled: undefined,
  });

  if (data.enabled !== undefined) {
    await chrome.storage.local.remove('enabled');
  }

  let groups =
    data.hostGroups && typeof data.hostGroups === 'object' && !Array.isArray(data.hostGroups)
      ? { ...data.hostGroups }
      : {};

  // Legacy flat whitelist only: migrate each host as its own group (no embeds known).
  const flat = Array.isArray(data.enabledHosts) ? data.enabledHosts : [];
  if (Object.keys(groups).length === 0 && flat.length > 0) {
    for (const host of flat) {
      if (typeof host === 'string' && host) {
        groups[host] = [host];
      }
    }
    await chrome.storage.local.set({
      hostGroups: groups,
      enabledHosts: flattenHostGroups(groups),
    });
  }

  return groups;
}

/**
 * Persist hostGroups and sync flattened enabledHosts for script registration.
 * @param {Record<string, string[]>} groups
 */
async function saveHostGroups(groups) {
  const enabledHosts = flattenHostGroups(groups);
  await chrome.storage.local.set({ hostGroups: groups, enabledHosts });
  return enabledHosts;
}

/**
 * Collect hostnames from all frames in the tab (including cross-origin iframes).
 * Also scrape iframe[src] from each document so hosts are not missed before navigation finishes.
 * @param {number|undefined} tabId
 * @param {string} mainHost
 * @returns {Promise<string[]>}
 */
async function collectTabHosts(tabId, mainHost) {
  const hosts = new Set([mainHost]);
  if (!tabId) {
    return Array.from(hosts);
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      func: () => {
        const found = [];
        try {
          if (location.hostname) {
            found.push(location.hostname);
          }
        } catch (e) {
          // ignore
        }
        try {
          const nodes = document.querySelectorAll('iframe[src]');
          for (let i = 0; i < nodes.length; i++) {
            try {
              const host = new URL(nodes[i].src, location.href).hostname;
              if (host) {
                found.push(host);
              }
            } catch (e) {
              // ignore
            }
          }
        } catch (e) {
          // ignore
        }
        return found;
      },
    });
    for (const item of results || []) {
      const list = item && item.result;
      if (!Array.isArray(list)) {
        if (typeof list === 'string' && list) {
          hosts.add(list);
        }
        continue;
      }
      for (const host of list) {
        if (typeof host === 'string' && host) {
          hosts.add(host);
        }
      }
    }
  } catch (e) {
    console.warn('[devtools-unlock] collectTabHosts failed', e);
  }

  return Array.from(hosts);
}

/** Unregister the unlock content script. */
async function unregisterUnlock() {
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
  } catch (e) {
    // ignore
  }
}

/**
 * Register MAIN-world content script for the whitelist; unregister when empty.
 * @param {string[]} hosts
 */
async function registerUnlockForHosts(hosts) {
  await unregisterUnlock();
  if (!hosts.length) {
    return;
  }

  await chrome.scripting.registerContentScripts([
    {
      id: SCRIPT_ID,
      matches: hosts.map((host) => `*://${host}/*`),
      excludeMatches: EXCLUDE_MATCHES,
      js: ['unlock.js'],
      runAt: 'document_start',
      world: 'MAIN',
      allFrames: true,
    },
  ]);
}

/** Sync content-script registration from storage. */
async function syncRegistration() {
  const groups = await migrateAndGetHostGroups();
  await registerUnlockForHosts(flattenHostGroups(groups));
}

/**
 * Reload the tab; prefer tabs.reload, fall back to executeScript.
 * @returns {'reloaded' | 'skipped' | 'failed'}
 */
async function reloadTab(tabId, tabUrl) {
  if (!tabId || !isSupportedUrl(tabUrl)) {
    return 'skipped';
  }

  try {
    await chrome.tabs.reload(tabId);
    return 'reloaded';
  } catch (e) {
    console.warn('[devtools-unlock] tabs.reload failed, fallback to executeScript', e);
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        window.location.reload();
      },
    });
    return 'reloaded';
  } catch (e) {
    console.warn('[devtools-unlock] executeScript reload failed', e);
    return 'failed';
  }
}

const ICON_ON = {
  16: 'icons/icon16.png',
  48: 'icons/icon48.png',
  128: 'icons/icon128.png',
};

const ICON_OFF = {
  16: 'icons/icon16-off.png',
  48: 'icons/icon48-off.png',
  128: 'icons/icon128-off.png',
};

/**
 * Set toolbar icon for a tab: lit when that site is unlocked, gray otherwise.
 * @param {number|undefined} tabId
 * @param {string|undefined} tabUrl
 */
async function updateActionIconForTab(tabId, tabUrl) {
  if (!tabId) {
    return;
  }
  try {
    const host = parseHost(tabUrl);
    const groups = await migrateAndGetHostGroups();
    const on = !!(host && Object.prototype.hasOwnProperty.call(groups, host));
    await chrome.action.setIcon({
      tabId,
      path: on ? ICON_ON : ICON_OFF,
    });
  } catch (e) {
    console.warn('[devtools-unlock] updateActionIconForTab failed', e);
  }
}

/** Refresh icon for the active tab in the current window. */
async function updateActiveTabIcon() {
  try {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const tab = tabs && tabs[0];
    if (tab && tab.id != null) {
      await updateActionIconForTab(tab.id, tab.url);
    }
  } catch (e) {
    console.warn('[devtools-unlock] updateActiveTabIcon failed', e);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  syncRegistration().then(() => updateActiveTabIcon());
});

chrome.runtime.onStartup.addListener(() => {
  syncRegistration().then(() => updateActiveTabIcon());
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs
    .get(activeInfo.tabId)
    .then((tab) => updateActionIconForTab(tab.id, tab.url))
    .catch((e) => {
      console.warn('[devtools-unlock] tabs.onActivated icon update failed', e);
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    updateActionIconForTab(tabId, tab.url || changeInfo.url);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'getStatus') {
    const host = parseHost(message.tabUrl);
    const supported = !!host;

    migrateAndGetHostGroups()
      .then((groups) => {
        const group = host && Array.isArray(groups[host]) ? groups[host] : [];
        sendResponse({
          host,
          supported,
          // Enabled only when this hostname is a main-site key (embed hosts alone do not count).
          enabled: supported && Object.prototype.hasOwnProperty.call(groups, host),
          embedHosts: group.filter((h) => h !== host),
        });
      })
      .catch((e) => {
        console.warn('[devtools-unlock] getStatus failed', e);
        sendResponse({ host, supported, enabled: false, embedHosts: [] });
      });
    return true;
  }

  if (message.type === 'setEnabled') {
    const enabled = !!message.enabled;
    const tabId = message.tabId;
    const tabUrl = message.tabUrl;
    const host = parseHost(tabUrl);

    if (!host) {
      sendResponse({ ok: false, supported: false, reloadResult: 'skipped' });
      return false;
    }

    migrateAndGetHostGroups()
      .then(async (groups) => {
        const next = { ...groups };
        if (enabled) {
          // Main host + all iframe hosts on this tab so cross-origin players get injection too.
          next[host] = await collectTabHosts(tabId, host);
        } else {
          delete next[host];
        }
        await saveHostGroups(next);
        await registerUnlockForHosts(flattenHostGroups(next));
        await updateActionIconForTab(tabId, tabUrl);
        const reloadResult = await reloadTab(tabId, tabUrl);
        sendResponse({
          ok: true,
          host,
          supported: true,
          reloadResult,
          embedHosts: enabled ? (next[host] || []).filter((h) => h !== host) : [],
        });
      })
      .catch((e) => {
        console.warn('[devtools-unlock] setEnabled failed', e);
        sendResponse({ ok: false });
      });
    return true;
  }
});
