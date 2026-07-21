import DisableDevtool from 'disable-devtool';
import { labelDetector } from './detectorLabels';

/** Custom event name for the React status panel. */
export const DEVTOOL_OPEN_EVENT = 'dd-demo:devtool-open';

export interface DevtoolOpenDetail {
  type: number;
  label: string;
  at: string;
}

declare global {
  interface Window {
    DisableDevtool?: typeof DisableDevtool;
    __ddDemo?: {
      initResult: { success: boolean; reason: string };
      events: DevtoolOpenDetail[];
    };
  }
}

/**
 * Initialize disable-devtool the official npm way.
 * Config mirrors real sites: interval=200, rewriteHTML, then default penalty via next().
 */
export function initDisableDevtool(): { success: boolean; reason: string } {
  const result = DisableDevtool({
    interval: 200,
    disableMenu: false,
    clearLog: true,
    rewriteHTML: ' ',
    ondevtoolopen(type, next) {
      const detail: DevtoolOpenDetail = {
        type,
        label: labelDetector(type),
        at: new Date().toLocaleTimeString(),
      };

      if (!window.__ddDemo) {
        window.__ddDemo = { initResult: result, events: [] };
      }
      window.__ddDemo.events.unshift(detail);
      if (window.__ddDemo.events.length > 20) {
        window.__ddDemo.events.length = 20;
      }

      console.warn('[disable-devtool-demo] ondevtoolopen', detail);
      window.dispatchEvent(new CustomEvent(DEVTOOL_OPEN_EVENT, { detail }));

      // Official default penalty chain: closeWindow / rewriteHTML / 404, etc.
      next();
    },
  });

  window.DisableDevtool = DisableDevtool;
  window.__ddDemo = { initResult: result, events: [] };

  console.log('[disable-devtool-demo] npm init', result);
  return result;
}
