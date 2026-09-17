import { describe, expect, it } from 'vitest';
import {
  applyHostGroupsMigration,
  flattenHostGroups,
  isCloudflareChallengeHost,
  isSupportedUrl,
  mergeHostsIntoGroup,
  parseHost,
} from './hosts';

describe('isCloudflareChallengeHost', () => {
  it('matches the challenge origin and subdomains', () => {
    expect(isCloudflareChallengeHost('challenges.cloudflare.com')).toBe(true);
    expect(isCloudflareChallengeHost('turnstile.challenges.cloudflare.com')).toBe(true);
    expect(isCloudflareChallengeHost('example.com')).toBe(false);
    expect(isCloudflareChallengeHost('')).toBe(false);
    expect(isCloudflareChallengeHost(undefined)).toBe(false);
  });
});

describe('parseHost / isSupportedUrl', () => {
  it('parses http(s) hostnames and rejects chrome://', () => {
    expect(isSupportedUrl('https://anikai.watch/play')).toBe(true);
    expect(parseHost('https://anikai.watch/play')).toBe('anikai.watch');
    expect(parseHost('http://localhost:5173/')).toBe('localhost');
    expect(parseHost('chrome://extensions')).toBe('');
    expect(parseHost('about:debugging')).toBe('');
    expect(parseHost(undefined)).toBe('');
  });
});

describe('flattenHostGroups', () => {
  it('dedupes hosts and drops Cloudflare challenge hosts', () => {
    expect(
      flattenHostGroups({
        'anikai.watch': ['anikai.watch', 'player.example.com', 'anikai.watch'],
        other: ['challenges.cloudflare.com', 'cdn.example.com'],
      }).sort(),
    ).toEqual(['anikai.watch', 'cdn.example.com', 'player.example.com']);
    expect(flattenHostGroups(null)).toEqual([]);
    expect(flattenHostGroups(undefined)).toEqual([]);
  });
});

describe('applyHostGroupsMigration', () => {
  it('keeps hostGroups as source of truth', () => {
    const { groups, didMigrateFlat, shouldRemoveEnabled } = applyHostGroupsMigration({
      hostGroups: { 'a.com': ['a.com', 'b.com'] },
      enabledHosts: ['legacy.com'],
      enabled: true,
    });
    expect(groups).toEqual({ 'a.com': ['a.com', 'b.com'] });
    expect(didMigrateFlat).toBe(false);
    expect(shouldRemoveEnabled).toBe(true);
  });

  it('migrates legacy flat enabledHosts when hostGroups is empty', () => {
    const { groups, didMigrateFlat } = applyHostGroupsMigration({
      hostGroups: {},
      enabledHosts: ['a.com', 'b.com', ''],
    });
    expect(didMigrateFlat).toBe(true);
    expect(groups).toEqual({ 'a.com': ['a.com'], 'b.com': ['b.com'] });
  });
});

describe('mergeHostsIntoGroup', () => {
  it('adds new embed hosts only for an already-enabled main site', () => {
    const first = mergeHostsIntoGroup({ 'a.com': ['a.com'] }, 'a.com', ['player.com', 'a.com']);
    expect(first.added).toBe(true);
    expect(first.groups['a.com'].sort()).toEqual(['a.com', 'player.com']);

    const skipped = mergeHostsIntoGroup({ 'a.com': ['a.com'] }, 'other.com', ['player.com']);
    expect(skipped.added).toBe(false);

    const cf = mergeHostsIntoGroup({ 'a.com': ['a.com'] }, 'a.com', ['challenges.cloudflare.com']);
    expect(cf.added).toBe(false);
  });
});
