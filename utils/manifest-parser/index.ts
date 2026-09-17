type Manifest = chrome.runtime.ManifestV3;

/** Stable AMO / Firefox addon id. Do not change after first AMO submission. */
export const GECKO_ID = 'devtools-unlock@webliang';

/** MAIN-world scripting APIs require Firefox 128+. */
export const GECKO_STRICT_MIN_VERSION = '128.0';

class ManifestParser {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static convertManifestToString(manifest: Manifest): string {
    if (process.env.__FIREFOX__) {
      manifest = this.convertToFirefoxCompatibleManifest(manifest);
    }
    return JSON.stringify(manifest, null, 2);
  }

  /**
   * Chrome MV3 source stays service_worker; Firefox 128+ still prefers background.scripts.
   * Do not emit options_ui when this product has no options page.
   */
  static convertToFirefoxCompatibleManifest(manifest: Manifest) {
    const manifestCopy = { ...manifest } as { [key: string]: unknown };

    const serviceWorker = manifest.background && 'service_worker' in manifest.background
      ? (manifest.background as chrome.runtime.ManifestV3['background'] & { service_worker?: string }).service_worker
      : undefined;

    manifestCopy.background = {
      scripts: [serviceWorker].filter(Boolean),
      type: 'module',
    };

    if (manifest.options_page) {
      manifestCopy.options_ui = {
        page: manifest.options_page,
        browser_style: false,
      };
      delete manifestCopy.options_page;
    }

    delete manifestCopy.minimum_chrome_version;
    delete manifestCopy.side_panel;

    manifestCopy.browser_specific_settings = {
      gecko: {
        id: GECKO_ID,
        strict_min_version: GECKO_STRICT_MIN_VERSION,
        data_collection_permissions: {
          required: ['none'],
        },
      },
    };

    manifestCopy.content_security_policy = {
      extension_pages: "script-src 'self'; object-src 'self'",
    };

    return manifestCopy as Manifest;
  }
}

export default ManifestParser;
