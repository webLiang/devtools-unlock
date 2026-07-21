/**
 * devtools-unlock — block disable-devtool and obfuscated integrity checks
 *
 * Target site traits (scripts-CbWe9mAN.js):
 * 1. Embedded theajack/disable-devtool (500ms poll of isDevToolOpened)
 * 2. ondevtoolopen → rewriteHTML / window.close / 404 redirect after 500ms
 * 3. Extra f3w5S8C integrity check; failure rate ≥50% freezes the page
 *
 * WARNING: Must run before page business scripts.
 * Pasting into Console after DevTools is already open is usually too late; prefer the userscript.
 *
 * Usage:
 *   Chrome DevTools → Sources → Overrides → inject this script at the start of <head>
 *   or Tampermonkey: devtools-unlock.userscript.js
 *
 * Disable: __devtoolsUnlockOff()
 */
(function devtoolsUnlock() {
  'use strict';

  const TAG = '[devtools-unlock]';
  if (window.__devtoolsUnlockInstalled) {
    console.warn(TAG, 'already installed, skip');
    return;
  }
  window.__devtoolsUnlockInstalled = true;

  const saved = {
    outerWDesc: Object.getOwnPropertyDescriptor(window, 'outerWidth'),
    outerHDesc: Object.getOwnPropertyDescriptor(window, 'outerHeight'),
    fnToString: Function.prototype.toString,
    dateToString: Date.prototype.toString,
    regToString: RegExp.prototype.toString,
    setInterval: window.setInterval,
    setTimeout: window.setTimeout,
    locationHrefDesc: Object.getOwnPropertyDescriptor(window.Location.prototype, 'href'),
    locationAssign: window.Location.prototype.assign,
    locationReplace: window.Location.prototype.replace,
    windowOpen: window.open,
    windowClose: window.close,
    consoleLog: console.log,
    consoleTable: console.table,
    consoleClear: console.clear,
    docInnerHTMLDesc: Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML'),
    docInnerTextDesc: Object.getOwnPropertyDescriptor(Element.prototype, 'innerText'),
    defineProperty: Object.defineProperty,
  };

  const snap = {
    innerW: window.innerWidth,
    innerH: window.innerHeight,
  };

  const BLOCK_URL_RE =
    /theajack\.github\.io\/disable-devtool|disable-devtool\/404\.html/i;

  const NATIVE_MARK = '[native code]';

  /** Whether the URL is a malicious disable-devtool redirect. */
  function isBlockedNavigation(url) {
    if (!url) return false;
    const s = String(url);
    return BLOCK_URL_RE.test(s);
  }

  /** Pin outer size to bypass SizeDetector when the site enables it. */
  function installViewportMask() {
    Object.defineProperty(window, 'outerWidth', {
      configurable: true,
      get() {
        return snap.innerW;
      },
    });
    Object.defineProperty(window, 'outerHeight', {
      configurable: true,
      get() {
        return snap.innerH;
      },
    });
  }

  /**
   * Keep console enumerable for for-in.
   * Site f3w5S8C check: for (var k in console) ... empty means DevTools open.
   */
  function installConsoleMask() {
    const names = [
      'log', 'warn', 'error', 'info', 'debug', 'trace', 'table', 'clear',
      'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd',
      'count', 'assert', 'profile', 'profileEnd',
    ];

    for (let i = 0; i < names.length; i++) {
      const key = names[i];
      if (typeof console[key] !== 'function') {
        console[key] = function noop() {};
      }
      try {
        Object.defineProperty(console, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: console[key],
        });
      } catch (e) {
        // Some browsers disallow redefining console props; ignore.
      }
    }
  }

  /**
   * Make Function / Date / RegExp toString look native to reduce
   * RegToString / FuncToString / DateToString and f3w5S8C hit rates.
   */
  function installNativeToStringMask() {
    const origFnToString = saved.fnToString;

    Function.prototype.toString = function patchedFnToString() {
      if (this === patchedFnToString) {
        return 'function toString() { ' + NATIVE_MARK + ' }';
      }
      try {
        const out = origFnToString.call(this);
        if (out.indexOf(NATIVE_MARK) !== -1) return out;
        if (/^function\s/.test(out) || /^class\s/.test(out)) {
          return 'function () { ' + NATIVE_MARK + ' }';
        }
        return out;
      } catch (e) {
        return 'function () { ' + NATIVE_MARK + ' }';
      }
    };

    Date.prototype.toString = function patchedDateToString() {
      try {
        return saved.dateToString.call(this);
      } catch (e) {
        return '[object Date]';
      }
    };

    RegExp.prototype.toString = function patchedRegToString() {
      try {
        return saved.regToString.call(this);
      } catch (e) {
        return '/./';
      }
    };
  }

  /**
   * Swallow console.table / console.log used by disable-devtool Performance checks
   * so slow table timing with DevTools open does not trigger ondevtoolopen.
   */
  function installConsoleTimingMask() {
    console.log = function unlockConsoleLog() {
      // Intentionally silent to reduce Performance / FuncToString / DateToString signals.
    };
    console.table = function unlockConsoleTable() {};
    console.clear = function unlockConsoleClear() {};
  }

  /** Block navigation, reload, open, close and similar page-kill paths. */
  function installNavigationGuard() {
    const locProto = window.Location.prototype;

    if (saved.locationHrefDesc && saved.locationHrefDesc.set) {
      Object.defineProperty(locProto, 'href', {
        configurable: true,
        enumerable: true,
        get: saved.locationHrefDesc.get,
        set(value) {
          if (isBlockedNavigation(value)) {
            console.warn(TAG, 'blocked location.href =', value);
            return;
          }
          return saved.locationHrefDesc.set.call(this, value);
        },
      });
    }

    locProto.assign = function unlockAssign(url) {
      if (isBlockedNavigation(url)) {
        console.warn(TAG, 'blocked location.assign', url);
        return;
      }
      return saved.locationAssign.call(this, url);
    };

    locProto.replace = function unlockReplace(url) {
      if (isBlockedNavigation(url)) {
        console.warn(TAG, 'blocked location.replace', url);
        return;
      }
      return saved.locationReplace.call(this, url);
    };

    const origReload = locProto.reload;
    locProto.reload = function unlockReload() {
      console.warn(TAG, 'blocked location.reload()');
      // no-op
    };

    window.open = function unlockOpen(url, target, features) {
      if (target === '_self' && (!url || url === '')) {
        console.warn(TAG, 'blocked window.open("", "_self")');
        return null;
      }
      if (isBlockedNavigation(url)) {
        console.warn(TAG, 'blocked window.open', url);
        return null;
      }
      return saved.windowOpen.apply(window, arguments);
    };

    window.close = function unlockClose() {
      console.warn(TAG, 'blocked window.close()');
    };
  }

  /** Prevent ondevtoolopen from wiping the entire page HTML. */
  function installDomGuard() {
    function blockWrite(prop, desc) {
      if (!desc || !desc.set) return;

      Object.defineProperty(Element.prototype, prop, {
        configurable: true,
        enumerable: desc.enumerable,
        get: desc.get,
        set(value) {
          if (this === document.documentElement && typeof value === 'string' && value.length > 200) {
            console.warn(TAG, 'blocked documentElement.' + prop + ' overwrite');
            return;
          }
          return desc.set.call(this, value);
        },
      });
    }

    blockWrite('innerHTML', saved.docInnerHTMLDesc);
    blockWrite('innerText', saved.docInnerTextDesc);
  }

  /**
   * If the site exposes DisableDevtool on window, replace it with a noop API.
   * Obfuscated builds may rename it; try several common aliases.
   */
  function installDisableDevtoolApiTrap() {
    const fakeApi = {
      isRunning: true,
      isSuspend: true,
      isDevToolOpened: function () {
        return false;
      },
      version: '0.0.0-unlock',
      DetectorType: {},
      md5: function () {
        return '';
      },
    };

    const names = ['DisableDevtool', 'disableDevtool', 'disableDevtool'];
    for (let i = 0; i < names.length; i++) {
      const n = names[i];
      try {
        Object.defineProperty(window, n, {
          configurable: true,
          get() {
            return fakeApi;
          },
          set(v) {
            console.warn(TAG, 'ignored assignment to', n);
          },
        });
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Wrap setInterval: skip callbacks whose source mentions isDevToolOpened / ondevtoolopen.
   * Fallback so the 500ms poll cannot keep firing.
   */
  function installIntervalFilter() {
    window.setInterval = function unlockSetInterval(fn, delay) {
      let fnText = '';
      try {
        fnText = typeof fn === 'function' ? String(fn) : '';
      } catch (e) {
        fnText = '';
      }

      const looksLikeDevToolPoll =
        delay === 500 &&
        /isDevToolOpened|ondevtoolopen|onDevToolOpen|DevToolOpen|detector|clearLog/i.test(fnText);

      if (looksLikeDevToolPoll) {
        console.warn(TAG, 'skipped suspected disable-devtool setInterval', delay);
        return -1;
      }

      return saved.setInterval.apply(window, arguments);
    };
  }

  function installAll() {
    installViewportMask();
    installConsoleMask();
    installNativeToStringMask();
    installConsoleTimingMask();
    installNavigationGuard();
    installDomGuard();
    installDisableDevtoolApiTrap();
    installIntervalFilter();
  }

  installAll();

  window.__devtoolsUnlockOff = function __devtoolsUnlockOff() {
    if (saved.outerWDesc) Object.defineProperty(window, 'outerWidth', saved.outerWDesc);
    else delete window.outerWidth;
    if (saved.outerHDesc) Object.defineProperty(window, 'outerHeight', saved.outerHDesc);
    else delete window.outerHeight;

    Function.prototype.toString = saved.fnToString;
    Date.prototype.toString = saved.dateToString;
    RegExp.prototype.toString = saved.regToString;
    console.log = saved.consoleLog;
    console.table = saved.consoleTable;
    console.clear = saved.consoleClear;
    window.setInterval = saved.setInterval;
    window.setTimeout = saved.setTimeout;
    window.open = saved.windowOpen;
    window.close = saved.windowClose;

    if (saved.locationHrefDesc) {
      Object.defineProperty(window.Location.prototype, 'href', saved.locationHrefDesc);
    }
    window.Location.prototype.assign = saved.locationAssign;
    window.Location.prototype.replace = saved.locationReplace;

    delete window.__devtoolsUnlockInstalled;
    delete window.__devtoolsUnlockOff;
    console.log(TAG, 'uninstalled');
  };

  console.log(TAG, 'installed — DevTools should work normally');
})();
