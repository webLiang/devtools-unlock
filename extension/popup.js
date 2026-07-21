const toggle = document.getElementById('toggle');
const statusEl = document.getElementById('status');
const siteEl = document.getElementById('site');

/** Resolve a chrome.i18n message, with optional placeholders. */
function t(key, substitutions) {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

/** Apply static __MSG_*__ placeholders that some Chromium builds leave unreplaced in popups. */
function applyStaticI18n() {
  const map = {
    subtitle: 'popupSubtitle',
    toggleLabel: 'popupToggleLabel',
    hint: 'popupHint',
  };
  for (const [id, key] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = t(key);
    }
  }
  const title = document.querySelector('h1');
  if (title) {
    title.textContent = t('extName');
  }
}

/** Update status text and toggle checked state. */
function renderStatus(enabled, host, embedHosts) {
  toggle.checked = enabled;
  if (host) {
    const embedCount = Array.isArray(embedHosts) ? embedHosts.length : 0;
    if (enabled && embedCount > 0) {
      statusEl.textContent = t('popupStatusOnWithEmbeds', [String(embedCount)]);
    } else {
      statusEl.textContent = enabled ? t('popupStatusOn') : t('popupStatusOff');
    }
  } else {
    statusEl.textContent = enabled ? t('popupStatusOnGeneric') : t('popupStatusOffGeneric');
  }
  statusEl.classList.toggle('off', !enabled);
}

/** Show current site hostname or unsupported message. */
function renderSite(host, supported) {
  if (!siteEl) {
    return;
  }
  if (!supported || !host) {
    siteEl.textContent = t('popupSiteUnsupported');
    siteEl.classList.add('unsupported');
    return;
  }
  siteEl.textContent = host;
  siteEl.classList.remove('unsupported');
}

/** Disable the toggle on unsupported pages. */
function setToggleSupported(supported) {
  toggle.disabled = !supported;
  toggle.parentElement.classList.toggle('disabled', !supported);
}

/** Update status from background reload result. */
function renderReloadStatus(enabled, reloadResult) {
  const prefix = enabled ? t('popupStatusOnGeneric') : t('popupStatusOffGeneric');
  if (reloadResult === 'reloaded') {
    statusEl.textContent = t('popupReloadReloading', [prefix]);
    return;
  }
  if (reloadResult === 'skipped') {
    statusEl.textContent = t('popupReloadSkipped', [prefix]);
    return;
  }
  if (reloadResult === 'failed') {
    statusEl.textContent = t('popupReloadFailed', [prefix]);
  }
}

/** Read the active tab in the current window. */
function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }
      resolve(tabs && tabs[0] ? tabs[0] : null);
    });
  });
}

/** Load per-site unlock status from the background worker. */
async function loadStatus() {
  const tab = await getActiveTab();
  const tabUrl = tab && tab.url;

  chrome.runtime.sendMessage({ type: 'getStatus', tabUrl }, (res) => {
    if (chrome.runtime.lastError) {
      statusEl.textContent = t('popupStatusLoadFailed');
      statusEl.classList.add('off');
      setToggleSupported(false);
      renderSite('', false);
      return;
    }

    const supported = !!(res && res.supported);
    const host = (res && res.host) || '';
    const enabled = !!(res && res.enabled);

    setToggleSupported(supported);
    renderSite(host, supported);

    if (!supported) {
      toggle.checked = false;
      statusEl.textContent = t('popupUseOnWebpage');
      statusEl.classList.add('off');
      return;
    }

    renderStatus(enabled, host, res && res.embedHosts);
  });
}

toggle.addEventListener('change', async () => {
  if (toggle.disabled) {
    return;
  }

  const enabled = toggle.checked;

  // Capture tab while the popup is still open (context can go away after close).
  const tab = await getActiveTab();
  const tabId = tab && tab.id;
  const tabUrl = tab && tab.url;

  chrome.runtime.sendMessage({ type: 'setEnabled', enabled, tabId, tabUrl }, (res) => {
    if (chrome.runtime.lastError || !res || !res.ok) {
      loadStatus();
      return;
    }
    renderStatus(enabled, res.host, res.embedHosts);
    renderReloadStatus(enabled, res.reloadResult);
  });
});

applyStaticI18n();
loadStatus();
