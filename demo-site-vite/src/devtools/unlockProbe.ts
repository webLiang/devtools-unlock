/** Marker left by the Unlock extension in the MAIN world (see src/pages/content/unlock/index.ts). */

export function readUnlockProbe(): { installed: boolean } {
  return {
    installed: window.__devtoolsUnlockInstalled === true,
  };
}

declare global {
  interface Window {
    __devtoolsUnlockInstalled?: boolean;
  }
}
