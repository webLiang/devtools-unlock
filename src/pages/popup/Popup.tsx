import React, { useCallback, useEffect, useState } from 'react';
import '@pages/popup/Popup.css';

type ReloadResult = 'reloaded' | 'skipped' | 'failed';

type StatusResponse = {
  host?: string;
  supported?: boolean;
  enabled?: boolean;
  embedHosts?: string[];
  ok?: boolean;
  reloadResult?: ReloadResult;
};

/** Resolve a chrome.i18n message, with optional placeholders. */
function t(key: string, substitutions?: string | string[]): string {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

/** Read the active tab in the current window. */
function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }
      resolve(tabs && tabs[0] ? tabs[0] : null);
    });
  });
}

function Popup() {
  const [host, setHost] = useState('');
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [statusText, setStatusText] = useState(t('popupLoading'));
  const [statusOff, setStatusOff] = useState(false);
  const [busy, setBusy] = useState(false);

  const applyStatus = useCallback((nextEnabled: boolean, nextHost: string, nextEmbeds?: string[]) => {
    setEnabled(nextEnabled);
    const embedCount = Array.isArray(nextEmbeds) ? nextEmbeds.length : 0;
    if (nextHost) {
      if (nextEnabled && embedCount > 0) {
        setStatusText(t('popupStatusOnWithEmbeds', [String(embedCount)]));
      } else {
        setStatusText(nextEnabled ? t('popupStatusOn') : t('popupStatusOff'));
      }
    } else {
      setStatusText(nextEnabled ? t('popupStatusOnGeneric') : t('popupStatusOffGeneric'));
    }
    setStatusOff(!nextEnabled);
  }, []);

  const loadStatus = useCallback(async () => {
    const tab = await getActiveTab();
    const tabUrl = tab && tab.url;

    chrome.runtime.sendMessage({ type: 'getStatus', tabUrl }, (res: StatusResponse | undefined) => {
      if (chrome.runtime.lastError) {
        setStatusText(t('popupStatusLoadFailed'));
        setStatusOff(true);
        setSupported(false);
        setHost('');
        return;
      }

      const nextSupported = !!(res && res.supported);
      const nextHost = (res && res.host) || '';
      const nextEnabled = !!(res && res.enabled);

      setSupported(nextSupported);
      setHost(nextHost);

      if (!nextSupported) {
        setEnabled(false);
        setStatusText(t('popupUseOnWebpage'));
        setStatusOff(true);
        return;
      }

      applyStatus(nextEnabled, nextHost, res && res.embedHosts);
    });
  }, [applyStatus]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const onToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!supported || busy) {
      return;
    }

    const nextEnabled = event.target.checked;
    setBusy(true);

    const tab = await getActiveTab();
    const tabId = tab && tab.id;
    const tabUrl = tab && tab.url;

    chrome.runtime.sendMessage(
      { type: 'setEnabled', enabled: nextEnabled, tabId, tabUrl },
      (res: StatusResponse | undefined) => {
        setBusy(false);
        if (chrome.runtime.lastError || !res || !res.ok) {
          void loadStatus();
          return;
        }
        setHost(res.host || '');
        applyStatus(nextEnabled, res.host || '', res.embedHosts);
        const prefix = nextEnabled ? t('popupStatusOnGeneric') : t('popupStatusOffGeneric');
        if (res.reloadResult === 'reloaded') {
          setStatusText(t('popupReloadReloading', [prefix]));
        } else if (res.reloadResult === 'skipped') {
          setStatusText(t('popupReloadSkipped', [prefix]));
        } else if (res.reloadResult === 'failed') {
          setStatusText(t('popupReloadFailed', [prefix]));
        }
      },
    );
  };

  const siteUnsupported = !supported || !host;

  return (
    <div className="popup">
      <h1>{t('extName')}</h1>
      <p className="subtitle">{t('popupSubtitle')}</p>
      <div className={`site${siteUnsupported ? ' unsupported' : ''}`}>
        {siteUnsupported ? t('popupSiteUnsupported') : host}
      </div>
      <label className={`toggle${supported ? '' : ' disabled'}`}>
        <input type="checkbox" checked={enabled} disabled={!supported || busy} onChange={onToggle} />
        <span>{t('popupToggleLabel')}</span>
      </label>
      <div className={`status${statusOff ? ' off' : ''}`}>{statusText}</div>
      <div className="hint">{t('popupHint')}</div>
    </div>
  );
}

export default Popup;
