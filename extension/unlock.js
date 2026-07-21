/**
 * DevTools Unlock — MAIN world injection
 *
 * Targets critical paths in scripts-CbWe9mAN.js / core.bundle.js:
 * 1. Startup check: setInterval/setTimeout/addEventListener.toString() without native code → ca()
 * 2. ca() → sa() clears body/documentElement.innerHTML → location.reload() after 100ms
 * 3. disable-devtool poll interval=200ms (not only 500)
 * 4. ondevtoolopen → same wipe + history.back / 404 redirect
 * 5. core.bundle: Function('debugger') timing + devtoolsFormatters + sessionStorage.devtool
 */
(function devtoolsUnlock() {
  'use strict';

  const TAG = '[devtools-unlock]';
  if (window.__devtoolsUnlockInstalled) {
    return;
  }
  window.__devtoolsUnlockInstalled = true;

  const saved = {
    outerWDesc: Object.getOwnPropertyDescriptor(window, 'outerWidth'),
    outerHDesc: Object.getOwnPropertyDescriptor(window, 'outerHeight'),
    fnToString: Function.prototype.toString,
    dateToString: Date.prototype.toString,
    regToString: RegExp.prototype.toString,
    Function: window.Function,
    fnConstructor: Function.prototype.constructor,
    setInterval: window.setInterval,
    setTimeout: window.setTimeout,
    addEventListener: window.EventTarget.prototype.addEventListener,
    locationHrefDesc: Object.getOwnPropertyDescriptor(window.Location.prototype, 'href'),
    locationAssign: window.Location.prototype.assign,
    locationReplace: window.Location.prototype.replace,
    locationReload: window.Location.prototype.reload,
    historyBack: window.history.back,
    historyGo: window.history.go,
    windowOpen: window.open,
    windowClose: window.close,
    consoleLog: console.log,
    consoleTable: console.table,
    consoleClear: console.clear,
    sessionSetItem: window.sessionStorage && sessionStorage.setItem,
    sessionGetItem: window.sessionStorage && sessionStorage.getItem,
    docInnerHTMLDesc: Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML'),
    docInnerTextDesc: Object.getOwnPropertyDescriptor(Element.prototype, 'innerText'),
  };

  const snap = {
    innerW: window.innerWidth,
    innerH: window.innerHeight,
  };

  const BLOCK_URL_RE =
    /theajack\.github\.io\/disable-devtool|disable-devtool\/404\.html/i;

  const NATIVE_MARK = 'native code';

  /** Make wrapped functions look native via toString to avoid startup tamper checks calling ca(). */
  function mimicNative(fn, ref) {
    const refFn = ref || fn;
    fn.toString = function mimicNativeToString() {
      try {
        return saved.fnToString.call(refFn);
      } catch (e) {
        return 'function () { [' + NATIVE_MARK + '] }';
      }
    };
    return fn;
  }

  /** Whether this timer looks like a disable-devtool / anti-debug poll. */
  function isDevToolTimer(fn, delay) {
    if (typeof fn !== 'function') {
      return false;
    }
    if (delay !== 200 && delay !== 500 && delay !== 100 && delay !== 150 && delay !== 1000) {
      return false;
    }
    let fnText = '';
    try {
      fnText = saved.fnToString.call(fn);
    } catch (e) {
      fnText = '';
    }
    // core.bundle: _detectLoop(500), console.clear(100), penalty interval(100)
    return /isDevToolOpened|ondevtoolopen|onDevToolOpen|DevToolOpen|detector|clearLog|clearDevTool|markDevTool|f3w5S8C|v1i\(|A7u\(|detect(?:Loop)?|_detectLoo|devtoolsFo|checkers|console\.clear|native code|WJwgqCmf/i.test(
      fnText
    );
  }

  /**
   * Intercept Function('debugger') / fn.constructor('debugger') timing probes.
   * core.bundle debuggerChecker and _0x4b3633() use this path:
   * with DevTools open, debugger pauses and elapsed ≥100ms means "open".
   */
  function installDebuggerMask() {
    const NativeFunction = saved.Function;

    function PatchedFunction() {
      const args = Array.prototype.slice.call(arguments);
      try {
        const body = args.length ? String(args[args.length - 1]) : '';
        if (/^\s*debugger(?:\s*;\s*)?\s*$/.test(body)) {
          return function unlockNoopDebugger() {};
        }
      } catch (e) {
        // ignore
      }
      return NativeFunction.apply(this, args);
    }

    PatchedFunction.prototype = NativeFunction.prototype;
    try {
      Object.defineProperty(PatchedFunction, 'prototype', {
        configurable: false,
        writable: false,
        value: NativeFunction.prototype,
      });
    } catch (e) {
      // ignore
    }
    mimicNative(PatchedFunction, NativeFunction);

    try {
      window.Function = PatchedFunction;
    } catch (e) {
      // ignore
    }
    try {
      Function.prototype.constructor = PatchedFunction;
    } catch (e) {
      // ignore
    }
  }

  /**
   * Clear sessionStorage.devtool=open written by core.bundle,
   * and block writing it again so one hit does not punish every reload.
   */
  function installSessionDevtoolGuard() {
    try {
      if (sessionStorage.getItem('devtool') === 'open') {
        sessionStorage.removeItem('devtool');
        console.warn(TAG, 'cleared sessionStorage.devtool');
      }
    } catch (e) {
      // ignore
    }

    if (!saved.sessionSetItem) {
      return;
    }

    try {
      sessionStorage.setItem = mimicNative(function unlockSessionSetItem(key, value) {
        if (String(key) === 'devtool' && String(value) === 'open') {
          console.warn(TAG, 'blocked sessionStorage.devtool=open');
          return;
        }
        return saved.sessionSetItem.call(sessionStorage, key, value);
      }, saved.sessionSetItem);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Guard window.devtoolsFormatters: with DevTools + Custom Formatters on,
   * header() runs and core.bundle's DevtoolsFormatters checker latches on that.
   * Sites may assign an array or push onto an existing one; neutralize header in both cases.
   */
  function installDevtoolsFormattersGuard() {
    const store = [];

    /** Null out formatter.header to remove probe side effects. */
    function neutralizeFormatters(list) {
      if (!Array.isArray(list)) {
        return;
      }
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (item && typeof item.header === 'function') {
          item.header = function unlockFormatterHeader() {
            return null;
          };
        }
      }
    }

    store.push = function unlockFormattersPush() {
      const items = Array.prototype.slice.call(arguments);
      neutralizeFormatters(items);
      return Array.prototype.push.apply(store, items);
    };

    try {
      Object.defineProperty(window, 'devtoolsFormatters', {
        configurable: true,
        enumerable: true,
        get() {
          return store;
        },
        set(value) {
          store.length = 0;
          if (Array.isArray(value)) {
            neutralizeFormatters(value);
            Array.prototype.push.apply(store, value);
          }
        },
      });
    } catch (e) {
      // ignore
    }
  }

  /** Whether this short-delay timer looks like a ca() / e1-player penalty navigation. */
  function isReloadTimer(fn, delay) {
    if (delay !== 100 && delay !== 500) {
      return false;
    }
    if (typeof fn !== 'function') {
      return false;
    }
    let fnText = '';
    try {
      fnText = saved.fnToString.call(fn);
    } catch (e) {
      fnText = '';
    }
    // e1-player penalty callbacks are obfuscated via BB6R/qjOP; may lack location/reload literals
    return /reload|location|href|v1i|A7u|ca\(|u\(\)|qjOP|BB6R|UXJzb|devtoolsDetector/i.test(
      fnText
    );
  }

  function isBlockedNavigation(url) {
    if (!url) {
      return false;
    }
    return BLOCK_URL_RE.test(String(url));
  }

  function isRootNode(el) {
    return (
      el === document.documentElement ||
      el === document.body ||
      (el && (el.tagName === 'HTML' || el.tagName === 'BODY'))
    );
  }

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
    window.addEventListener(
      'resize',
      function refreshSnap() {
        snap.innerW = window.innerWidth;
        snap.innerH = window.innerHeight;
      },
      true
    );
  }

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
        // ignore
      }
    }
  }

  function installNativeToStringMask() {
    const origFnToString = saved.fnToString;

    /**
     * Only disguise hooked APIs themselves (mimicNative covers instances).
     * Do not rewrite arbitrary page functions' toString to [native code]:
     * client.js / e1-player use function.toString() source as a decrypt key (vhpi(sEpq.toString()));
     * wrong key → bootstrap marks tampered → YppH / qjOP undefined → slPz errors.
     */
    Function.prototype.toString = function patchedFnToString() {
      if (this === patchedFnToString) {
        return 'function toString() { [' + NATIVE_MARK + '] }';
      }
      try {
        return origFnToString.call(this);
      } catch (e) {
        return 'function () { [' + NATIVE_MARK + '] }';
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

  /** Silence console output to reduce Performance / FuncToString detectors. */
  function installConsoleTimingMask() {
    console.log = function unlockConsoleLog() {};
    console.table = function unlockConsoleTable() {};
    console.clear = function unlockConsoleClear() {};
  }

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

    locProto.assign = mimicNative(function unlockAssign(url) {
      if (isBlockedNavigation(url)) {
        console.warn(TAG, 'blocked location.assign', url);
        return;
      }
      return saved.locationAssign.call(this, url);
    }, saved.locationAssign);

    locProto.replace = mimicNative(function unlockReplace(url) {
      if (isBlockedNavigation(url)) {
        console.warn(TAG, 'blocked location.replace', url);
        return;
      }
      return saved.locationReplace.call(this, url);
    }, saved.locationReplace);

    locProto.reload = mimicNative(function unlockReload() {
      console.warn(TAG, 'blocked location.reload()');
    }, saved.locationReload);

    try {
      window.location.reload = locProto.reload;
    } catch (e) {
      // ignore
    }

    window.history.back = mimicNative(function unlockBack() {
      console.warn(TAG, 'blocked history.back()');
    }, saved.historyBack);

    window.history.go = mimicNative(function unlockGo(delta) {
      if (delta === 0 || delta === undefined) {
        console.warn(TAG, 'blocked history.go(0) reload');
        return;
      }
      return saved.historyGo.call(window.history, delta);
    }, saved.historyGo);

    window.open = mimicNative(function unlockOpen(url, target) {
      if (target === '_self' && (!url || url === '')) {
        console.warn(TAG, 'blocked window.open("", "_self")');
        return null;
      }
      if (isBlockedNavigation(url)) {
        console.warn(TAG, 'blocked window.open', url);
        return null;
      }
      return saved.windowOpen.apply(window, arguments);
    }, saved.windowOpen);

    window.close = mimicNative(function unlockClose() {
      console.warn(TAG, 'blocked window.close()');
    }, saved.windowClose);
  }

  /**
   * Block sa() page wipes: body / documentElement innerHTML = ""
   * and large rewriteHTML from ondevtoolopen.
   */
  function installDomGuard() {
    function blockWrite(prop, desc) {
      if (!desc || !desc.set) {
        return;
      }

      Object.defineProperty(Element.prototype, prop, {
        configurable: true,
        enumerable: desc.enumerable,
        get: desc.get,
        set(value) {
          if (typeof value !== 'string') {
            return desc.set.call(this, value);
          }

          if (isRootNode(this) && value.length < 100) {
            console.warn(TAG, 'blocked root wipe', this.tagName || 'ROOT', prop);
            return;
          }

          if (this === document.documentElement && value.length > 200) {
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

    const names = ['DisableDevtool', 'disableDevtool'];
    for (let i = 0; i < names.length; i++) {
      const n = names[i];
      try {
        Object.defineProperty(window, n, {
          configurable: true,
          get() {
            return fakeApi;
          },
          set() {
            console.warn(TAG, 'ignored assignment to', n);
          },
        });
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Take over AEPKILL/devtools-detector (used by e1-player / MegaPlay).
   * Prefill a noop API and wrap real assignments: block launch; listeners never see isOpen=true.
   */
  function installDevtoolsDetectorTrap() {
    const noopApi = {
      addListener: function unlockDevtoolsAddListener() {},
      removeListener: function unlockDevtoolsRemoveListener() {},
      launch: function unlockDevtoolsLaunch() {
        console.warn(TAG, 'blocked devtoolsDetector.launch');
      },
      stop: function unlockDevtoolsStop() {},
      isLaunch: function unlockDevtoolsIsLaunch() {
        return false;
      },
      setDetectDelay: function unlockDevtoolsSetDetectDelay() {},
      crashBrowserCurrentTab: function unlockCrashTab() {
        console.warn(TAG, 'blocked crashBrowserCurrentTab');
      },
      crashBrowser: function unlockCrashBrowser() {
        console.warn(TAG, 'blocked crashBrowser');
      },
    };

    /** Wrap a site-provided detector so its detection loop never truly starts. */
    function wrapDetector(real) {
      if (!real || typeof real !== 'object') {
        return noopApi;
      }
      return {
        addListener: function unlockWrappedAddListener(fn) {
          // Do not register with the real library; optionally feed false once for init.
          if (typeof fn === 'function') {
            try {
              fn(false);
            } catch (e) {
              // ignore
            }
          }
        },
        removeListener: function unlockWrappedRemoveListener(fn) {
          if (typeof real.removeListener === 'function') {
            try {
              real.removeListener(fn);
            } catch (e) {
              // ignore
            }
          }
        },
        launch: function unlockWrappedLaunch() {
          console.warn(TAG, 'blocked devtoolsDetector.launch');
          if (typeof real.stop === 'function') {
            try {
              real.stop();
            } catch (e) {
              // ignore
            }
          }
        },
        stop: function unlockWrappedStop() {
          if (typeof real.stop === 'function') {
            try {
              real.stop();
            } catch (e) {
              // ignore
            }
          }
        },
        isLaunch: function unlockWrappedIsLaunch() {
          return false;
        },
        setDetectDelay: function unlockWrappedSetDetectDelay() {},
        crashBrowserCurrentTab: function unlockWrappedCrashTab() {
          console.warn(TAG, 'blocked crashBrowserCurrentTab');
        },
        crashBrowser: function unlockWrappedCrashBrowser() {
          console.warn(TAG, 'blocked crashBrowser');
        },
      };
    }

    let current = noopApi;
    try {
      Object.defineProperty(window, 'devtoolsDetector', {
        configurable: true,
        enumerable: true,
        get() {
          return current;
        },
        set(value) {
          console.warn(TAG, 'intercepted devtoolsDetector assignment');
          current = wrapDetector(value);
        },
      });
    } catch (e) {
      try {
        window.devtoolsDetector = noopApi;
      } catch (e2) {
        // ignore
      }
    }
  }

  function installTimerFilters() {
    window.setInterval = mimicNative(function unlockSetInterval(fn, delay) {
      if (isDevToolTimer(fn, delay)) {
        console.warn(TAG, 'skipped disable-devtool setInterval', delay);
        return -1;
      }
      return saved.setInterval.apply(window, arguments);
    }, saved.setInterval);

    window.setTimeout = mimicNative(function unlockSetTimeout(fn, delay) {
      if (isReloadTimer(fn, delay) || isDevToolTimer(fn, delay)) {
        console.warn(TAG, 'skipped anti-debug setTimeout', delay);
        return -1;
      }
      return saved.setTimeout.apply(window, arguments);
    }, saved.setTimeout);

    EventTarget.prototype.addEventListener = mimicNative(function unlockAddEventListener(type, listener, options) {
      return saved.addEventListener.call(this, type, listener, options);
    }, saved.addEventListener);
  }

  installViewportMask();
  installConsoleMask();
  installNativeToStringMask();
  installConsoleTimingMask();
  installDebuggerMask();
  installSessionDevtoolGuard();
  installDevtoolsFormattersGuard();
  installNavigationGuard();
  installDomGuard();
  installDisableDevtoolApiTrap();
  installDevtoolsDetectorTrap();
  installTimerFilters();

  window.__devtoolsUnlockOff = function __devtoolsUnlockOff() {
    if (saved.outerWDesc) {
      Object.defineProperty(window, 'outerWidth', saved.outerWDesc);
    }
    if (saved.outerHDesc) {
      Object.defineProperty(window, 'outerHeight', saved.outerHDesc);
    }

    Function.prototype.toString = saved.fnToString;
    Date.prototype.toString = saved.dateToString;
    RegExp.prototype.toString = saved.regToString;
    try {
      window.Function = saved.Function;
      Function.prototype.constructor = saved.fnConstructor;
    } catch (e) {
      // ignore
    }
    console.log = saved.consoleLog;
    console.table = saved.consoleTable;
    console.clear = saved.consoleClear;
    if (saved.sessionSetItem) {
      try {
        sessionStorage.setItem = saved.sessionSetItem;
      } catch (e) {
        // ignore
      }
    }
    window.setInterval = saved.setInterval;
    window.setTimeout = saved.setTimeout;
    EventTarget.prototype.addEventListener = saved.addEventListener;
    window.open = saved.windowOpen;
    window.close = saved.windowClose;
    window.history.back = saved.historyBack;
    window.history.go = saved.historyGo;

    if (saved.locationHrefDesc) {
      Object.defineProperty(window.Location.prototype, 'href', saved.locationHrefDesc);
    }
    window.Location.prototype.assign = saved.locationAssign;
    window.Location.prototype.replace = saved.locationReplace;
    window.Location.prototype.reload = saved.locationReload;

    delete window.__devtoolsUnlockInstalled;
    delete window.__devtoolsUnlockOff;
    console.log(TAG, 'uninstalled');
  };

  console.log(TAG, 'injected — DevTools should work normally');
})();
