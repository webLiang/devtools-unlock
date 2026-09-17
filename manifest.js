import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

/**
 * After changing, reload the unpacked extension from `dist/chrome` (or `dist/firefox`).
 * @type {chrome.runtime.ManifestV3}
 */
const manifest = {
  manifest_version: 3,
  default_locale: 'en',
  name: '__MSG_extName__',
  version: packageJson.version,
  description: '__MSG_extDescription__',
  minimum_chrome_version: '111',
  permissions: ['storage', 'scripting', 'tabs'],
  host_permissions: ['<all_urls>'],
  background: {
    service_worker: 'src/pages/background/index.js',
    type: 'module',
  },
  action: {
    default_title: '__MSG_extName__',
    default_popup: 'src/pages/popup/index.html',
    default_icon: {
      16: 'icons/icon16-off.png',
      48: 'icons/icon48-off.png',
      128: 'icons/icon128-off.png',
    },
  },
  icons: {
    16: 'icons/icon16.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png',
  },
};

export default manifest;
