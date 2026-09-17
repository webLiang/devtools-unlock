import { resolve } from 'path';

export type BrowserTarget = 'chrome' | 'firefox';

/** Chrome vs Firefox unpacked output folder under dist/. */
export function getBrowserTarget(): BrowserTarget {
  return process.env.__FIREFOX__ === 'true' ? 'firefox' : 'chrome';
}

/**
 * Per-browser unpacked root, same idea as videodownload's dist/<name>[_firefox].
 * Chrome: dist/chrome  Firefox: dist/firefox
 */
export function getOutDir(rootDir: string): string {
  return resolve(rootDir, 'dist', getBrowserTarget());
}
