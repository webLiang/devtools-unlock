const fs = require('fs');
const vm = require('vm');
const { URL, URLSearchParams } = require('url');
const code = fs.readFileSync(__dirname + '/e1-player.min.js', 'utf8');
const calls = [];

const sandbox = {
  console: {
    log() {},
    warn() {},
    error: (...a) => console.error('[e]', ...a),
    table() {},
    clear() {},
    info() {},
    debug() {},
  },
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  Array,
  Math,
  Number,
  Object,
  Function,
  String,
  RegExp,
  Error,
  TypeError,
  SyntaxError,
  RangeError,
  ReferenceError,
  EvalError,
  URIError,
  Date,
  JSON,
  parseInt,
  parseFloat,
  isNaN,
  isFinite,
  Infinity,
  NaN,
  undefined,
  Boolean,
  Map,
  Set,
  WeakMap,
  WeakSet,
  Promise,
  Proxy,
  Reflect,
  Symbol,
  Uint8Array,
  Int8Array,
  Uint16Array,
  Int16Array,
  Uint32Array,
  Int32Array,
  Float32Array,
  Float64Array,
  ArrayBuffer,
  DataView,
  TextEncoder,
  TextDecoder,
  URL,
  URLSearchParams,
  atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
  encodeURI,
  decodeURI,
  encodeURIComponent,
  decodeURIComponent,
  escape,
  unescape,
  navigator: {
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    language: 'en-US',
    languages: ['en-US'],
    platform: 'MacIntel',
    maxTouchPoints: 0,
    vendor: 'Google Inc.',
    webdriver: false,
  },
  location: {
    href: 'https://megaplay.buzz/stream/x',
    hostname: 'megaplay.buzz',
    host: 'megaplay.buzz',
    protocol: 'https:',
    pathname: '/stream/x',
    search: '',
    hash: '',
    origin: 'https://megaplay.buzz',
    reload() {},
    assign() {},
    replace() {},
    toString() {
      return 'https://megaplay.buzz/stream/x';
    },
  },
  history: {
    back() {},
    go() {},
    forward() {},
    pushState() {},
    replaceState() {},
    length: 1,
  },
  sessionStorage: {
    _d: {},
    getItem(k) {
      return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null;
    },
    setItem(k, v) {
      this._d[k] = String(v);
    },
    removeItem(k) {
      delete this._d[k];
    },
    clear() {
      this._d = {};
    },
  },
  localStorage: {
    _d: {},
    getItem(k) {
      return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null;
    },
    setItem(k, v) {
      this._d[k] = String(v);
    },
    removeItem(k) {
      delete this._d[k];
    },
    clear() {
      this._d = {};
    },
  },
  document: {
    documentElement: {
      clientWidth: 1200,
      clientHeight: 800,
      style: {},
      getBoundingClientRect: () => ({ width: 1200, height: 800, top: 0, left: 0 }),
    },
    body: {
      clientWidth: 1200,
      clientHeight: 800,
      style: {},
      appendChild() {},
      removeChild() {},
      innerHTML: '',
      getBoundingClientRect: () => ({ width: 1200, height: 800, top: 0, left: 0 }),
    },
    head: { appendChild() {} },
    createElement(tag) {
      return {
        tagName: String(tag).toUpperCase(),
        style: {},
        appendChild() {},
        removeChild() {},
        setAttribute() {},
        getAttribute() {
          return null;
        },
        addEventListener() {},
        removeEventListener() {},
        classList: {
          add() {},
          remove() {},
          contains() {
            return false;
          },
          toggle() {},
        },
        parentNode: null,
        children: [],
        childNodes: [],
        offsetWidth: 100,
        offsetHeight: 100,
        clientWidth: 100,
        clientHeight: 100,
        getBoundingClientRect: () => ({ width: 100, height: 100, top: 0, left: 0 }),
      };
    },
    createElementNS() {
      return this.createElement('div');
    },
    createTextNode(t) {
      return { textContent: t };
    },
    getElementById() {
      return null;
    },
    getElementsByTagName() {
      return [];
    },
    getElementsByClassName() {
      return [];
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    addEventListener() {},
    removeEventListener() {},
    cookie: '',
    readyState: 'complete',
    hidden: false,
    visibilityState: 'visible',
    currentScript: null,
    scripts: [],
    location: null,
  },
  Image: function () {
    this.src = '';
  },
  Audio: function () {},
  MutationObserver: function () {
    this.observe = () => {};
    this.disconnect = () => {};
  },
  PerformanceObserver: function () {
    this.observe = () => {};
  },
  ResizeObserver: function () {
    this.observe = () => {};
  },
  IntersectionObserver: function () {
    this.observe = () => {};
  },
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame() {},
  matchMedia: () => ({ matches: false, addListener() {}, addEventListener() {}, media: '' }),
  getComputedStyle: () => new Proxy({}, { get: () => '0px' }),
  innerWidth: 1200,
  innerHeight: 800,
  outerWidth: 1200,
  outerHeight: 800,
  screenX: 0,
  screenY: 0,
  pageXOffset: 0,
  pageYOffset: 0,
  scrollX: 0,
  scrollY: 0,
  screen: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    colorDepth: 24,
    pixelDepth: 24,
  },
  devicePixelRatio: 2,
  performance: {
    now: () => Date.now(),
    timing: { navigationStart: Date.now() },
    getEntriesByType: () => [],
    mark() {},
    measure() {},
  },
  chrome: { runtime: {} },
  Worker: function () {
    this.postMessage = () => {};
    this.terminate = () => {};
    this.addEventListener = () => {};
  },
  SharedWorker: function () {},
  WebSocket: function () {
    this.send = () => {};
    this.close = () => {};
    this.addEventListener = () => {};
  },
  fetch: async () => ({
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => '',
    arrayBuffer: async () => new ArrayBuffer(0),
  }),
  XMLHttpRequest: function () {
    this.open = () => {};
    this.send = () => {};
    this.setRequestHeader = () => {};
    this.readyState = 4;
    this.status = 200;
    this.responseText = '{}';
    this.addEventListener = () => {};
  },
  Event: function (t) {
    this.type = t;
    this.preventDefault = () => {};
    this.stopPropagation = () => {};
  },
  CustomEvent: function (t) {
    this.type = t;
  },
  MessageEvent: function () {},
  Node: { ELEMENT_NODE: 1, TEXT_NODE: 3 },
  HTMLElement: function () {},
  Element: function () {},
  NodeList: function () {},
  DOMParser: function () {
    this.parseFromString = () => ({});
  },
  CSS: { supports: () => false },
  jwplayer: Object.assign(
    function jwplayer() {
      return {
        setup() {
          return this;
        },
        on() {
          return this;
        },
        once() {
          return this;
        },
        off() {
          return this;
        },
        play() {
          return this;
        },
        pause() {
          return this;
        },
        getPosition() {
          return 0;
        },
        getDuration() {
          return 0;
        },
        getState() {
          return 'idle';
        },
        getContainer() {
          return { style: {} };
        },
        remove() {
          return this;
        },
        getPlaylist() {
          return [];
        },
        load() {
          return this;
        },
        setConfig() {
          return this;
        },
      };
    },
    { version: '8.33.2', key: true, defaults: {} }
  ),
  Hls: Object.assign(
    function () {
      this.loadSource = () => {};
      this.attachMedia = () => {};
      this.on = () => {};
      this.destroy = () => {};
    },
    { isSupported: () => true, Events: {} }
  ),
  devtoolsDetector: {
    addListener(fn) {
      calls.push(['addListener']);
      this._fn = fn;
    },
    removeListener() {
      calls.push(['removeListener']);
    },
    launch() {
      calls.push(['launch']);
    },
    stop() {
      calls.push(['stop']);
    },
    isLaunch() {
      return false;
    },
    setDetectDelay(v) {
      calls.push(['setDetectDelay', v]);
    },
  },
};

sandbox.$ = Object.assign(
  function () {
    return sandbox.$;
  },
  {
    ready(fn) {
      try {
        fn && fn();
      } catch (e) {}
      return this;
    },
    fn: {},
    extend() {
      return {};
    },
    each() {},
    ajax() {},
    getJSON() {},
  }
);
sandbox.jQuery = sandbox.$;
sandbox.document.location = sandbox.location;
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
sandbox.top = sandbox;
sandbox.parent = sandbox;
sandbox.frames = sandbox;
sandbox.global = sandbox;

const context = vm.createContext(sandbox);
sandbox.eval = (s) => vm.runInContext(String(s), context);

try {
  vm.runInContext(code, context, { timeout: 8000 });
  console.log('ran OK');
} catch (e) {
  console.log('ERR', e.message);
  console.log(e.stack.split('\n').slice(0, 8).join('\n'));
}

console.log('BB6R', typeof sandbox.BB6R);
console.log('calls', calls);
if (sandbox.BB6R) {
  const B = sandbox.BB6R;
  console.log(
    'keys',
    Object.keys(B)
      .filter((k) => typeof B[k] === 'function')
      .slice(0, 20)
  );
  const idxs = [
    ['uiiO', 230],
    ['m6AN', 233],
    ['ynnO', 317],
    ['CssO', 28],
    ['uiiO', 318],
    ['qfKO', 319],
    ['qjOP', 0],
    ['qjOP', 8],
    ['qjOP', 320],
    ['qfKO', 151],
    ['eYXN', 323],
    ['CssO', 324],
    ['m6AN', 209],
    ['m6AN', 321],
    ['Gv0N', 322],
  ];
  for (const [fn, i] of idxs) {
    try {
      console.log(`${fn}(${i}) =>`, JSON.stringify(B[fn](i)));
    } catch (e) {
      console.log(`${fn}(${i}) ERR`, e.message);
    }
  }
}
