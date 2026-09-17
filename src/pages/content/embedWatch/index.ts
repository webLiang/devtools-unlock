/**
 * Isolated-world iframe watcher: report embed hosts as player iframes appear.
 * Injected only into the top frame (allFrames: false). The background uses sender.tab.url
 * as the main-site key, so this script does not take args.
 */
(function embedWatch() {
  const w = window as Window & { __devtoolsUnlockEmbedWatch?: boolean };
  if (w.__devtoolsUnlockEmbedWatch) {
    return;
  }
  w.__devtoolsUnlockEmbedWatch = true;

  let timer = 0;

  const report = () => {
    const hosts: string[] = [];
    try {
      if (location.hostname) {
        hosts.push(location.hostname);
      }
      const nodes = document.querySelectorAll('iframe[src]');
      for (let i = 0; i < nodes.length; i++) {
        try {
          const host = new URL((nodes[i] as HTMLIFrameElement).src, location.href).hostname;
          if (host) {
            hosts.push(host);
          }
        } catch (error) {
          console.warn('[devtools-unlock] embedWatch iframe src parse skipped', error);
        }
      }
    } catch (error) {
      console.warn('[devtools-unlock] embedWatch report failed', error);
    }
    chrome.runtime.sendMessage({ type: 'embedHostsSeen', hosts }).catch(error => {
      console.warn('[devtools-unlock] embedHostsSeen send failed', error);
    });
  };

  const schedule = () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = window.setTimeout(report, 200);
  };

  report();
  try {
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement || document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src'],
    });
  } catch (error) {
    console.warn('[devtools-unlock] embedWatch MutationObserver failed', error);
    schedule();
  }
})();
