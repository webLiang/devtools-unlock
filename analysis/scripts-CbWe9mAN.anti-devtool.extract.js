/*
 * scripts-CbWe9mAN.js — 反调试逻辑提取（可读版）
 * =============================================================================
 * 自 scripts-CbWe9mAN.deobfuscated.js 整理，仅保留 disable-devtool 相关链。
 * 控制流平坦化已尽量去掉，等价逻辑以普通 JS 表达。
 *
 * 全局别名（import 之后，约 2174 行）：
 *   c3kMC = window
 *   J5ffK = document
 *   k     = location
 *   u     = () => location.reload()
 *   n     = jQuery
 *   f     = history
 */

// =============================================================================
// 1. disable-devtool 初始化（原文件约 25209–25221 行）
// =============================================================================
function initDisableDevtool(disableDevtoolFn) {
  disableDevtoolFn({
    rewriteHTML: " ",
    interval: 200, // 每 200ms 轮询，不是 500
    disableMenu: false,
    ondevtoolopen: function (type, defaultCallback) {
      ca(); // 站点自定义惩罚
      defaultCallback(); // 库默认 closeWindow 逻辑
    },
  });
}

// =============================================================================
// 2. ca() / sa() — 检测到 DevTools 后的主惩罚链（约 8926–8948 行）
// =============================================================================
let _punishOnce = false;

/** 清空整页 DOM */
function sa() {
  try {
    document.body.innerHTML = "";
  } catch (e) {}
  try {
    document.documentElement.innerHTML = "";
  } catch (e) {}
}

/** 清页 + 100ms 后 reload */
function ca() {
  if (_punishOnce) return;
  _punishOnce = true;
  sa();
  r.v1i(); // 触发 f3w5S8C 完整性检测
  setTimeout(function () {
    r.v1i();
    u(); // () => location.reload()
  }, 100);
}

// =============================================================================
// 3. ondevtoolopen 备用实现 l()（约 6845–6890 行，disable-devtool 内部也会调到）
// =============================================================================
function onDevToolOpenHandler_l(config) {
  // 覆写整页 HTML
  try {
    document.documentElement.innerHTML = config.rewriteHTML;
  } catch (e) {
    document.documentElement.innerText = config.rewriteHTML;
  }

  // closeWindow 默认行为
  try {
    window.opener = null;
    window.open("", "_self");
    window.close();
    window.history.back();
  } catch (e) {
    console.log(e);
  }

  // 500ms 后跳转 404
  setTimeout(function () {
    window.location.href =
      config.timeOutUrl ||
      "https://theajack.github.io/disable-devtool/404.html?h=" +
        encodeURIComponent(location.host);
  }, 500);

  // 若配置了 url，直接跳转
  if (config.url) {
    window.location.href = config.url;
  }
}

// =============================================================================
// 4. 启动时 native code 自检（约 25277–25293 行）
//    若 setInterval/setTimeout/addEventListener 被 hook 且 toString 不像原生 → ca()
// =============================================================================
function startupNativeCodeTamperCheck() {
  if (!/WebKit|Gecko/i.test(navigator.userAgent)) return;

  var fns = [window.setInterval, window.setTimeout, window.addEventListener];
  for (var i = 0; i < fns.length; i++) {
    var fn = fns[i];
    if (fn && fn.toString().indexOf("native code") === -1) {
      ca();
      break;
    }
  }
}

// =============================================================================
// 5. app_version / sourceMappingURL 探测循环（约 25229–25254 行）
//    每 200ms 检查 localStorage，异常则 ca()
// =============================================================================
function startAppVersionProbe() {
  var KEY = "app_version";

  function injectSourceMapScript() {
    var s = document.createElement("script");
    s.innerHTML = "//# sourceMappingURL=/app.js.map";
    document.body.appendChild(s);
    document.body.removeChild(s);
  }

  injectSourceMapScript();
  setInterval(injectSourceMapScript, 1500);

  setInterval(function probe() {
    var tampered = !!localStorage.getItem(KEY);
    if (tampered) {
      localStorage.removeItem(KEY);
      ca();
    }
    setTimeout(probe, 1000);
  }, 200);
}

// =============================================================================
// 6. f3w5S8C — 混淆层完整性检测（约 1851–2146 行，结构摘要）
// =============================================================================
/*
 * r.v1i() / r.A7u() 每次调用都会执行 f3w5S8C()：
 *
 *   - 跑多组探针 Z0a()：
 *       · for (var k in console) — console 无可枚举属性 → 判定 DevTools
 *       · RegExp / Function / String 原生 toString 校验
 *       · 其他环境指纹
 *
 *   - 统计失败率，若 ≥ 50% → 进入 while(true) 死循环，页面卡死
 *   - 通过则 return 92
 */

// =============================================================================
// 7. disable-devtool 检测器（库内逻辑，未混淆在站点字符串里）
// =============================================================================
/*
 * interval 200ms 内依次执行：
 *   RegToString   — Firefox/QQ 浏览器
 *   DefineId
 *   DateToString  — console.log(date) 触发 toString 计数
 *   FuncToString  — 同上，针对 function
 *   Debugger      — debugger 语句耗时（iOS Chrome）
 *   Performance   — console.table vs console.log 耗时差（Chrome 桌面）
 *   DebugLib      — #__vconsole 等
 *
 * 任一检测器标记打开 → ondevtoolopen → ca() + 默认 closeWindow
 */
