// ==UserScript==
// @name         DevTools Unlock (disable-devtool bypass)
// @namespace    local.devtools-unlock
// @version      1.0.0
// @description  Block embedded disable-devtool and anti-debug redirects so DevTools can open
// @author       you
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

/**
 * Tampermonkey / Violentmonkey userscript.
 * @run-at document-start so it runs before scripts-CbWe9mAN.js.
 *
 * To limit to specific sites, change @match to concrete hosts, e.g.:
 *   @match https://your-anime-site.example/*
 */
(function () {
  'use strict';

  const TAG = '[devtools-unlock]';
  if (window.__devtoolsUnlockInstalled) return;
  window.__devtoolsUnlockInstalled = true;

  const snap = { innerW: 0, innerH: 0 };
  const BLOCK_URL_RE = /theajack\.github\.io\/disable-devtool|disable-devtool\/404\.html/i;
  const NATIVE_MARK = '[native code]';

  const saved = {
    fnToString: Function.prototype.toString,
    dateToString: Date.prototype.toString,
    regToString: RegExp.prototype.toString,
    setInterval: window.setInterval,
    locationHrefDesc: null,
    locationAssign: window.Location.prototype.assign,
    locationReplace: window.Location.prototype.replace,
    windowOpen: window.open,
    windowClose: window.close,
    docInnerHTMLDesc: Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML'),
    docInnerTextDesc: Object.getOwnPropertyDescriptor(Element.prototype, 'innerText'),
  };

  function refreshSnap() {
    snap.innerW = window.innerWidth;
    snap.innerH = window.innerHeight;
  }

  function isBlockedNavigation(url) {
    if (!url) return false;
    return BLOCK_URL_RE.test(String(url));
  }

  refreshSnap();

  Object.defineProperty(window, 'outerWidth', {
    configurable: true,
    get() {
      return snap.innerW || window.innerWidth;
    },
  });
  Object.defineProperty(window, 'outerHeight', {
    configurable: true,
    get() {
      return snap.innerH || window.innerHeight;
    },
  });

  (function installConsoleMask() {
    const names = [
      'log', 'warn', 'error', 'info', 'debug', 'trace', 'table', 'clear',
      'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd',
      'count', 'assert', 'profile', 'profileEnd',
    ];
    for (let i = 0; i < names.length; i++) {
      const key = names[i];
      if (typeof console[key] !== 'function') console[key] = function () {};
      try {
        Object.defineProperty(console, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: console[key],
        });
      } catch (e) {}
    }
    console.log = function () {};
    console.table = function () {};
    console.clear = function () {};
  })();

  (function installNativeToStringMask() {
    const orig = saved.fnToString;
    Function.prototype.toString = function patchedFnToString() {
      if (this === patchedFnToString) {
        return 'function toString() { ' + NATIVE_MARK + ' }';
      }
      try {
        const out = orig.call(this);
        if (out.indexOf(NATIVE_MARK) !== -1) return out;
        if (/^function\s/.test(out) || /^class\s/.test(out)) {
          return 'function () { ' + NATIVE_MARK + ' }';
        }
        return out;
      } catch (e) {
        return 'function () { ' + NATIVE_MARK + ' }';
      }
    };
    Date.prototype.toString = function () {
      try {
        return saved.dateToString.call(this);
      } catch (e) {
        return '[object Date]';
      }
    };
    RegExp.prototype.toString = function () {
      try {
        return saved.regToString.call(this);
      } catch (e) {
        return '/./';
      }
    };
  })();

  (function installNavigationGuard() {
    saved.locationHrefDesc = Object.getOwnPropertyDescriptor(window.Location.prototype, 'href');
    const locProto = window.Location.prototype;

    if (saved.locationHrefDesc && saved.locationHrefDesc.set) {
      Object.defineProperty(locProto, 'href', {
        configurable: true,
        enumerable: true,
        get: saved.locationHrefDesc.get,
        set(value) {
          if (isBlockedNavigation(value)) return;
          return saved.locationHrefDesc.set.call(this, value);
        },
      });
    }

    locProto.assign = function (url) {
      if (isBlockedNavigation(url)) return;
      return saved.locationAssign.call(this, url);
    };
    locProto.replace = function (url) {
      if (isBlockedNavigation(url)) return;
      return saved.locationReplace.call(this, url);
    };
    locProto.reload = function () {};

    window.open = function (url, target) {
      if (target === '_self' && (!url || url === '')) return null;
      if (isBlockedNavigation(url)) return null;
      return saved.windowOpen.apply(window, arguments);
    };
    window.close = function () {};
  })();

  (function installDomGuard() {
    function guard(prop, savedDesc) {
      if (!savedDesc || !savedDesc.set) return;
      Object.defineProperty(Element.prototype, prop, {
        configurable: true,
        enumerable: savedDesc.enumerable,
        get: savedDesc.get,
        set(value) {
          if (this === document.documentElement && typeof value === 'string' && value.length > 200) {
            return;
          }
          return savedDesc.set.call(this, value);
        },
      });
    }
    guard('innerHTML', saved.docInnerHTMLDesc);
    guard('innerText', saved.docInnerTextDesc);
  })();

  (function installDisableDevtoolApiTrap() {
    const fake = {
      isRunning: true,
      isSuspend: true,
      isDevToolOpened: function () {
        return false;
      },
    };
    ['DisableDevtool', 'disableDevtool'].forEach(function (name) {
      try {
        Object.defineProperty(window, name, {
          configurable: true,
          get: function () {
            return fake;
          },
          set: function () {},
        });
      } catch (e) {}
    });
  })();

  window.setInterval = function (fn, delay) {
    let src = '';
    try {
      src = typeof fn === 'function' ? String(fn) : '';
    } catch (e) {
      src = '';
    }
    if (
      delay === 500 &&
      /isDevToolOpened|ondevtoolopen|onDevToolOpen|DevToolOpen|detector|clearLog/i.test(src)
    ) {
      return -1;
    }
    return saved.setInterval.apply(window, arguments);
  };

  window.addEventListener('resize', refreshSnap, true);
})();
