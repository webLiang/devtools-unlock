/** Match patterns that must never receive unlock.js. */
export const EXCLUDE_MATCHES = [
  '*://chrome.google.com/*',
  '*://chromewebstore.google.com/*',
  '*://microsoftedge.microsoft.com/addons/*',
  '*://addons.mozilla.org/*',
  // Cloudflare Turnstile / Managed Challenge widget — never inject unlock here.
  '*://challenges.cloudflare.com/*',
  '*://*.challenges.cloudflare.com/*',
];

export type HostGroups = Record<string, string[]>;

/**
 * Hostnames that must never receive unlock.js.
 * Injecting into Turnstile / challenge iframes breaks Cloudflare verification.
 */
export function isCloudflareChallengeHost(host: string | undefined | null): boolean {
  if (!host || typeof host !== 'string') {
    return false;
  }
  const h = host.toLowerCase();
  return h === 'challenges.cloudflare.com' || h.endsWith('.challenges.cloudflare.com');
}

/** Whether the URL is a normal http(s) page that can be unlocked. */
export function isSupportedUrl(url?: string | null): boolean {
  return /^https?:\/\//i.test(url || '');
}

/** Parse hostname from URL; returns empty string for non-http(s). */
export function parseHost(url?: string | null): string {
  if (!isSupportedUrl(url)) {
    return '';
  }
  try {
    return new URL(url as string).hostname || '';
  } catch {
    return '';
  }
}

/** Flatten hostGroups into a deduplicated hostname list (drops CF challenge hosts). */
export function flattenHostGroups(groups: HostGroups | null | undefined): string[] {
  const set = new Set<string>();
  if (!groups || typeof groups !== 'object') {
    return [];
  }
  for (const list of Object.values(groups)) {
    if (!Array.isArray(list)) {
      continue;
    }
    for (const host of list) {
      if (typeof host === 'string' && host && !isCloudflareChallengeHost(host)) {
        set.add(host);
      }
    }
  }
  return Array.from(set);
}

export type StorageShape = {
  hostGroups?: unknown;
  enabledHosts?: unknown;
  enabled?: unknown;
};

/**
 * Apply storage-shape migration without I/O.
 * hostGroups is source of truth; legacy `enabled` / flat `enabledHosts` are folded in.
 */
export function applyHostGroupsMigration(data: StorageShape): {
  groups: HostGroups;
  didMigrateFlat: boolean;
  shouldRemoveEnabled: boolean;
} {
  const shouldRemoveEnabled = data.enabled !== undefined;
  const groups: HostGroups =
    data.hostGroups && typeof data.hostGroups === 'object' && !Array.isArray(data.hostGroups)
      ? { ...(data.hostGroups as HostGroups) }
      : {};

  const flat = Array.isArray(data.enabledHosts) ? data.enabledHosts : [];
  let didMigrateFlat = false;
  if (Object.keys(groups).length === 0 && flat.length > 0) {
    didMigrateFlat = true;
    for (const host of flat) {
      if (typeof host === 'string' && host) {
        groups[host] = [host];
      }
    }
  }

  return { groups, didMigrateFlat, shouldRemoveEnabled };
}

/**
 * Merge newly seen iframe hosts into an already-enabled main-site group.
 * @returns added=true when the whitelist grew
 */
export function mergeHostsIntoGroup(
  groups: HostGroups,
  mainHost: string,
  hosts: string[] | undefined,
): { groups: HostGroups; added: boolean } {
  if (!mainHost || !Object.prototype.hasOwnProperty.call(groups, mainHost)) {
    return { groups, added: false };
  }
  const next: HostGroups = { ...groups };
  const prev = Array.isArray(next[mainHost]) ? next[mainHost] : [mainHost];
  const nextSet = new Set(prev);
  let added = false;
  for (const host of hosts || []) {
    if (typeof host === 'string' && host && !isCloudflareChallengeHost(host) && !nextSet.has(host)) {
      nextSet.add(host);
      added = true;
    }
  }
  if (!added) {
    return { groups, added: false };
  }
  next[mainHost] = Array.from(nextSet);
  return { groups: next, added: true };
}
