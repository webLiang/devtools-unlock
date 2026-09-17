import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';
import {
  applyHostGroupsMigration,
  EXCLUDE_MATCHES,
  flattenHostGroups,
  isCloudflareChallengeHost,
  isSupportedUrl,
  mergeHostsIntoGroup,
  parseHost,
  type HostGroups,
} from '@src/shared/hosts';
import { executeScriptCompat } from '@src/shared/scripting';

reloadOnUpdate('pages/background');

const SCRIPT_ID = 'devtools-unlock-main';

/** Open-source repository opened once after first install. */
const GITHUB_REPO_URL = 'https://github.com/webLiang/devtools-unlock';

const UNLOCK_FILE = 'unlock.js';
const EMBED_WATCH_FILE = 'embedWatch.js';

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
 * Load and migrate storage: hostGroups is source of truth; support legacy enabled / flat enabledHosts.
 */
async function migrateAndGetHostGroups(): Promise<HostGroups> {
  const data = await chrome.storage.local.get({
    hostGroups: {},
    enabledHosts: [],
    enabled: undefined,
  });

  const { groups, didMigrateFlat, shouldRemoveEnabled } = applyHostGroupsMigration(data);

  if (shouldRemoveEnabled) {
    await chrome.storage.local.remove('enabled');
  }

  if (didMigrateFlat) {
    await chrome.storage.local.set({
      hostGroups: groups,
      enabledHosts: flattenHostGroups(groups),
    });
  }

  return groups;
}

/**
 * Persist hostGroups and sync flattened enabledHosts for script registration.
 */
async function saveHostGroups(groups: HostGroups): Promise<string[]> {
  const enabledHosts = flattenHostGroups(groups);
  await chrome.storage.local.set({ hostGroups: groups, enabledHosts });
  return enabledHosts;
}

/**
 * Collect hostnames from all frames in the tab (including cross-origin iframes).
 * Also scrape iframe[src] from each document so hosts are not missed before navigation finishes.
 */
async function collectTabHosts(tabId: number | undefined, mainHost: string): Promise<string[]> {
  const hosts = new Set<string>();
  if (mainHost && !isCloudflareChallengeHost(mainHost)) {
    hosts.add(mainHost);
  }
  if (!tabId) {
    return Array.from(hosts);
  }

  try {
    const results = await executeScriptCompat({
      target: { tabId, allFrames: true },
      func: () => {
        const found: string[] = [];
        try {
          if (location.hostname) {
            found.push(location.hostname);
          }
        } catch (error) {
          console.warn('[devtools-unlock] collectTabHosts location.hostname skipped', error);
        }
        try {
          const nodes = document.querySelectorAll('iframe[src]');
          for (let i = 0; i < nodes.length; i++) {
            try {
              const host = new URL((nodes[i] as HTMLIFrameElement).src, location.href).hostname;
              if (host) {
                found.push(host);
              }
            } catch (error) {
              console.warn('[devtools-unlock] collectTabHosts iframe src skipped', error);
            }
          }
        } catch (error) {
          console.warn('[devtools-unlock] collectTabHosts iframe query skipped', error);
        }
        return found;
      },
    });
    for (const item of results || []) {
      const list = item && item.result;
      if (!Array.isArray(list)) {
        if (typeof list === 'string' && list && !isCloudflareChallengeHost(list)) {
          hosts.add(list);
        }
        continue;
      }
      for (const host of list) {
        if (typeof host === 'string' && host && !isCloudflareChallengeHost(host)) {
          hosts.add(host);
        }
      }
    }
  } catch (error) {
    console.warn('[devtools-unlock] collectTabHosts failed', error);
  }

  return Array.from(hosts);
}

/** Unregister the unlock content script. */
async function unregisterUnlock(): Promise<void> {
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
  } catch (error) {
    console.warn('[devtools-unlock] unregisterContentScripts expected miss', error);
  }
}

/**
 * Register MAIN-world content script for the whitelist; unregister when empty.
 */
async function registerUnlockForHosts(hosts: string[]): Promise<void> {
  await unregisterUnlock();
  if (!hosts.length) {
    return;
  }

  await chrome.scripting.registerContentScripts([
    {
      id: SCRIPT_ID,
      matches: hosts.map(host => `*://${host}/*`),
      excludeMatches: EXCLUDE_MATCHES,
      js: [UNLOCK_FILE],
      runAt: 'document_start',
      world: 'MAIN',
      allFrames: true,
    },
  ]);
}

/** Sync content-script registration from storage. */
async function syncRegistration(): Promise<void> {
  const groups = await migrateAndGetHostGroups();
  await registerUnlockForHosts(flattenHostGroups(groups));
}

/**
 * Reload the tab; prefer tabs.reload, fall back to executeScript.
 */
async function reloadTab(tabId: number | undefined, tabUrl: string | undefined): Promise<'reloaded' | 'skipped' | 'failed'> {
  if (!tabId || !isSupportedUrl(tabUrl)) {
    return 'skipped';
  }

  try {
    await chrome.tabs.reload(tabId);
    return 'reloaded';
  } catch (error) {
    console.warn('[devtools-unlock] tabs.reload failed, fallback to executeScript', error);
  }

  try {
    await executeScriptCompat({
      target: { tabId },
      func: () => {
        window.location.reload();
      },
    });
    return 'reloaded';
  } catch (error) {
    console.warn('[devtools-unlock] executeScript reload failed', error);
    return 'failed';
  }
}

/**
 * Set toolbar icon for a tab: lit when that site is unlocked, gray otherwise.
 */
async function updateActionIconForTab(tabId: number | undefined, tabUrl: string | undefined): Promise<void> {
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
  } catch (error) {
    console.warn('[devtools-unlock] updateActionIconForTab failed', error);
  }
}

/** Refresh icon for the active tab in the current window. */
async function updateActiveTabIcon(): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const tab = tabs && tabs[0];
    if (tab && tab.id != null) {
      await updateActionIconForTab(tab.id, tab.url);
    }
  } catch (error) {
    console.warn('[devtools-unlock] updateActiveTabIcon failed', error);
  }
}

/**
 * Merge newly seen iframe hosts into an already-enabled main-site group,
 * then re-register content scripts so later navigations get unlock.js.
 */
async function mergeEmbedHosts(mainHost: string, hosts: string[]): Promise<boolean> {
  if (!mainHost) {
    return false;
  }
  const groups = await migrateAndGetHostGroups();
  const { groups: next, added } = mergeHostsIntoGroup(groups, mainHost, hosts);
  if (!added) {
    return false;
  }
  await saveHostGroups(next);
  await registerUnlockForHosts(flattenHostGroups(next));
  return true;
}

/**
 * Inject unlock.js into every frame we can reach. Idempotent via __devtoolsUnlockInstalled.
 * Covers player iframes that appeared after the first registerContentScripts pass.
 */
async function injectUnlockAllFrames(tabId: number | undefined): Promise<void> {
  if (!tabId) {
    return;
  }
  try {
    await executeScriptCompat({
      target: { tabId, allFrames: true },
      files: [UNLOCK_FILE],
      world: 'MAIN',
      injectImmediately: true,
    });
  } catch (error) {
    console.warn('[devtools-unlock] injectUnlockAllFrames failed', error);
  }
}

/**
 * Isolated-world iframe watcher: report embed hosts as MacPlayer / parse iframes appear.
 */
async function injectEmbedWatch(tabId: number | undefined, mainHost: string): Promise<void> {
  if (!tabId || !mainHost) {
    return;
  }
  try {
    await executeScriptCompat({
      target: { tabId, allFrames: false },
      world: 'ISOLATED',
      injectImmediately: true,
      files: [EMBED_WATCH_FILE],
    });
  } catch (error) {
    console.warn('[devtools-unlock] injectEmbedWatch failed', error);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  syncRegistration()
    .then(() => updateActiveTabIcon())
    .catch(error => {
      console.warn('[devtools-unlock] onInstalled sync failed', error);
    });
});

chrome.runtime.onStartup.addListener(() => {
  syncRegistration()
    .then(() => updateActiveTabIcon())
    .catch(error => {
      console.warn('[devtools-unlock] onStartup sync failed', error);
    });
});

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs
    .get(activeInfo.tabId)
    .then(tab => updateActionIconForTab(tab.id, tab.url))
    .catch(error => {
      console.warn('[devtools-unlock] tabs.onActivated icon update failed', error);
    });
});

/** Refresh icon and, for unlocked sites, watch late iframes + inject unlock. */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    void updateActionIconForTab(tabId, tab.url || changeInfo.url);
  }
  if (changeInfo.status !== 'complete') {
    return;
  }
  const host = parseHost(tab.url);
  if (!host) {
    return;
  }
  migrateAndGetHostGroups()
    .then(async groups => {
      if (!Object.prototype.hasOwnProperty.call(groups, host)) {
        return;
      }
      await injectEmbedWatch(tabId, host);
      await injectUnlockAllFrames(tabId);
    })
    .catch(error => {
      console.warn('[devtools-unlock] tabs.onUpdated unlock refresh failed', error);
    });
});

type RuntimeMessage =
  | { type: 'embedHostsSeen'; hosts?: string[] }
  | { type: 'getStatus'; tabUrl?: string }
  | { type: 'setEnabled'; enabled?: boolean; tabId?: number; tabUrl?: string };

chrome.runtime.onMessage.addListener((message: RuntimeMessage, sender, sendResponse) => {
  if (message.type === 'embedHostsSeen') {
    const tabId = sender.tab && sender.tab.id;
    const mainHost = parseHost(sender.tab && sender.tab.url);
    mergeEmbedHosts(mainHost, message.hosts || [])
      .then(async added => {
        if (added && tabId) {
          await injectUnlockAllFrames(tabId);
        }
        sendResponse({ ok: true, added: !!added });
      })
      .catch(error => {
        console.warn('[devtools-unlock] embedHostsSeen failed', error);
        sendResponse({ ok: false });
      });
    return true;
  }

  if (message.type === 'getStatus') {
    const host = parseHost(message.tabUrl);
    const supported = !!host;

    migrateAndGetHostGroups()
      .then(groups => {
        const group = host && Array.isArray(groups[host]) ? groups[host] : [];
        sendResponse({
          host,
          supported,
          enabled: supported && Object.prototype.hasOwnProperty.call(groups, host),
          embedHosts: group.filter(h => h !== host),
        });
      })
      .catch(error => {
        console.warn('[devtools-unlock] getStatus failed', error);
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
      .then(async groups => {
        const next = { ...groups };
        if (enabled) {
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
          embedHosts: enabled ? (next[host] || []).filter(h => h !== host) : [],
        });
      })
      .catch(error => {
        console.warn('[devtools-unlock] setEnabled failed', error);
        sendResponse({ ok: false });
      });
    return true;
  }

  return undefined;
});

/** Open the public GitHub repo on first install only (not on update / reload). */
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason !== 'install') {
    return;
  }
  chrome.tabs.create({ url: GITHUB_REPO_URL }).catch(error => {
    console.warn('[devtools-unlock] open GitHub on install failed', error);
  });
});
