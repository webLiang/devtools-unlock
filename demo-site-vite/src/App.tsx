import { useCallback, useEffect, useState } from 'react';
import DisableDevtool from 'disable-devtool';
import {
  DEVTOOL_OPEN_EVENT,
  type DevtoolOpenDetail,
} from './devtools/disableDevtoolSetup';
import { DETECTOR_LABELS } from './devtools/detectorLabels';
import { readUnlockProbe } from './devtools/unlockProbe';
import './App.css';

interface RuntimeStatus {
  unlockInstalled: boolean;
  ddIsRunning: boolean;
  ddIsSuspend: boolean;
  ddIsOpened: boolean;
  ddVersion: string;
  initSuccess: boolean;
  initReason: string;
}

function readRuntimeStatus(): RuntimeStatus {
  const unlock = readUnlockProbe();
  const init = window.__ddDemo?.initResult;

  return {
    unlockInstalled: unlock.installed,
    ddIsRunning: DisableDevtool.isRunning,
    ddIsSuspend: DisableDevtool.isSuspend,
    ddIsOpened: DisableDevtool.isDevToolOpened(),
    ddVersion: DisableDevtool.version,
    initSuccess: init?.success ?? false,
    initReason: init?.reason ?? '(pending)',
  };
}

function App() {
  const [status, setStatus] = useState<RuntimeStatus>(readRuntimeStatus);
  const [events, setEvents] = useState<DevtoolOpenDetail[]>(
    () => window.__ddDemo?.events ?? [],
  );

  const refresh = useCallback(() => {
    setStatus(readRuntimeStatus());
    setEvents([...(window.__ddDemo?.events ?? [])]);
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<DevtoolOpenDetail>).detail;
      setEvents((prev) => [detail, ...prev].slice(0, 20));
      refresh();
    };

    window.addEventListener(DEVTOOL_OPEN_EVENT, onOpen);
    const timer = window.setInterval(refresh, 1000);

    return () => {
      window.removeEventListener(DEVTOOL_OPEN_EVENT, onOpen);
      window.clearInterval(timer);
    };
  }, [refresh]);

  return (
    <div className="demo">
      <header className="demo-header">
        <h1>disable-devtool × DevTools Unlock demo</h1>
        <p className="demo-sub">
          This page loads <strong>npm</strong> <code>disable-devtool</code> (same
          as official docs 1.1). Compare DevTools behavior with the extension on
          vs off.
        </p>
      </header>

      <section className="demo-card">
        <h2>Runtime status</h2>
        <div className="demo-grid">
          <StatusItem
            label="DevTools Unlock injected"
            value={status.unlockInstalled ? 'Yes' : 'No'}
            ok={status.unlockInstalled}
          />
          <StatusItem
            label="DisableDevtool.isRunning"
            value={String(status.ddIsRunning)}
            ok={status.ddIsRunning}
          />
          <StatusItem
            label="DisableDevtool.isDevToolOpened()"
            value={String(status.ddIsOpened)}
            warn={status.ddIsOpened}
          />
          <StatusItem
            label="npm init success"
            value={String(status.initSuccess)}
            ok={status.initSuccess}
          />
          <StatusItem label="Library version" value={status.ddVersion} />
          <StatusItem label="init reason" value={status.initReason} />
        </div>
        <button type="button" className="demo-btn" onClick={refresh}>
          Refresh status
        </button>
      </section>

      <section className="demo-card">
        <h2>Test steps</h2>
        <ol className="demo-steps">
          <li>
            Run <code>npm run dev</code> and open this page (default{' '}
            <code>http://localhost:5173</code>)
          </li>
          <li>
            Load <code>../extension/</code> in Chrome, refresh → Unlock should
            show Yes
          </li>
          <li>
            <strong>Extension off</strong>: open DevTools (F12) → page should be
            punished (wipe / redirect / close)
          </li>
          <li>
            <strong>Extension on</strong>: Console should show{' '}
            <code>[devtools-unlock]</code> and the page stays usable
          </li>
        </ol>
      </section>

      <section className="demo-card">
        <h2>ondevtoolopen events (last 20)</h2>
        {events.length === 0 ? (
          <p className="demo-muted">
            Not fired yet. Open DevTools to see detector types here.
          </p>
        ) : (
          <ul className="demo-events">
            {events.map((ev, i) => (
              <li key={`${ev.at}-${ev.type}-${i}`}>
                <time>{ev.at}</time>
                <span className="demo-tag">{ev.label}</span>
                <span className="demo-muted">type={ev.type}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="demo-card">
        <h2>Other load methods (script tag)</h2>
        <ul className="demo-links">
          <li>
            <a href="/script-auto.html" target="_blank" rel="noreferrer">
              1.2 script + disable-devtool-auto (CDN auto-init)
            </a>
          </li>
          <li>
            <a href="/script-manual.html" target="_blank" rel="noreferrer">
              1.2 script + manual DisableDevtool(&#123;...&#125;)
            </a>
          </li>
        </ul>
        <p className="demo-muted demo-detectors">
          DetectorType:{' '}
          {Object.entries(DETECTOR_LABELS)
            .map(([k, v]) => `${k}=${v}`)
            .join(' · ')}
        </p>
      </section>

      <section className="demo-card demo-console-hint">
        <h2>Console tips</h2>
        <p>
          With the extension on, look for:{' '}
          <code>[devtools-unlock] injected</code>,{' '}
          <code>skipped disable-devtool setInterval 200</code>,{' '}
          <code>blocked location.reload()</code>, etc.
        </p>
      </section>
    </div>
  );
}

function StatusItem(props: {
  label: string;
  value: string;
  ok?: boolean;
  warn?: boolean;
}) {
  let valueClass = '';
  if (props.ok) {
    valueClass = 'ok';
  } else if (props.warn) {
    valueClass = 'warn';
  }

  return (
    <div className="demo-stat">
      <span className="demo-stat-label">{props.label}</span>
      <span className={`demo-stat-value ${valueClass}`}>{props.value}</span>
    </div>
  );
}

export default App;
