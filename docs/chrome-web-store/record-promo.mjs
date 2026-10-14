#!/usr/bin/env node
/**
 * Capture promo-how-to.html scenes with headless Chrome and encode GIF + MP4.
 *
 * Usage (from repo root or this folder):
 *   node docs/chrome-web-store/record-promo.mjs --lang=en
 *   node docs/chrome-web-store/record-promo.mjs --lang=zh
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HTML = path.join(HERE, 'promo-how-to.html');
const OUT_DIR = path.join(HERE, 'images');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9334;
const WIDTH = 1280;
const HEIGHT = 800;

/** Parse --lang=en|zh (default English). */
function readLang() {
  const arg = process.argv.find(item => item.startsWith('--lang='));
  const value = arg ? arg.slice('--lang='.length).toLowerCase() : 'en';
  return value === 'zh' ? 'zh' : 'en';
}

const LANG = readLang();
const FRAME_DIR = path.join(os.tmpdir(), `devtools-unlock-promo-frames-${LANG}`);
const SCENE_PREFIX = LANG === 'zh' ? 'promo-scene' : 'promo-scene-en';
const GIF_NAME = LANG === 'zh' ? 'how-to-use.gif' : 'how-to-use.en.gif';
const MP4_NAME = LANG === 'zh' ? 'how-to-use.mp4' : 'how-to-use.en.mp4';

/** Scene id + how long that still should hold in the video. */
const SCENES = [
  { id: '0', seconds: 2.4 },
  { id: '1', seconds: 2.4 },
  { id: '2', seconds: 2.2 },
  { id: '3', seconds: 2.8 },
  { id: '4', seconds: 2.5 },
  { id: '5', seconds: 2.2 },
  { id: '6', seconds: 3.2 },
  { id: '7', seconds: 2.8 },
];

/**
 * Run a process and reject if it exits non-zero.
 * @param {string} cmd
 * @param {string[]} args
 * @returns {Promise<void>}
 */
function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${cmd} exited ${code}`));
    });
  });
}

/**
 * Send one CDP command and wait for the matching id.
 * @param {WebSocket} ws
 * @param {number} id
 * @param {string} method
 * @param {Record<string, unknown>} [params]
 * @returns {Promise<unknown>}
 */
function cdp(ws, id, method, params) {
  return new Promise((resolve, reject) => {
    const onMessage = event => {
      let payload;
      try {
        payload = JSON.parse(String(event.data));
      } catch (error) {
        return;
      }
      if (payload.id !== id) {
        return;
      }
      ws.removeEventListener('message', onMessage);
      if (payload.error) {
        reject(new Error(`${method}: ${JSON.stringify(payload.error)}`));
        return;
      }
      resolve(payload.result);
    };
    ws.addEventListener('message', onMessage);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

/**
 * Launch headless Chrome and return a live page WebSocket.
 * @returns {Promise<{ proc: import('node:child_process').ChildProcess, ws: WebSocket }>}
 */
async function launchChrome() {
  if (!fs.existsSync(CHROME)) {
    throw new Error(`Chrome not found: ${CHROME}`);
  }

  const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'devtools-unlock-promo-profile-'));
  const proc = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${userData}`,
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      `--force-device-scale-factor=1`,
      `--window-size=${WIDTH},${HEIGHT}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );

  const deadline = Date.now() + 15000;
  let version;
  while (Date.now() < deadline) {
    try {
      version = await fetch(`http://127.0.0.1:${PORT}/json/version`).then(res => res.json());
      break;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }
  if (!version) {
    proc.kill();
    throw new Error('Chrome remote debugging did not start');
  }

  const targets = await fetch(`http://127.0.0.1:${PORT}/json/list`).then(res => res.json());
  const page = (targets || []).find(item => item.type === 'page');
  if (!page || !page.webSocketDebuggerUrl) {
    proc.kill();
    throw new Error('No Chrome page target');
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  return { proc, ws };
}

/**
 * Navigate, set viewport, screenshot one scene.
 * @param {WebSocket} ws
 * @param {string} sceneId
 * @param {string} outFile
 */
async function captureScene(ws, sceneId, outFile) {
  const url = `file://${HTML}?scene=${sceneId}&lang=${LANG}`;
  await cdp(ws, 1, 'Page.enable');
  await cdp(ws, 2, 'Emulation.setDeviceMetricsOverride', {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp(ws, 3, 'Page.navigate', { url });
  await new Promise(resolve => setTimeout(resolve, 500));
  await cdp(ws, 4, 'Runtime.evaluate', {
    expression: `document.body.dataset.scene = ${JSON.stringify(sceneId)}; document.body.offsetHeight;`,
  });
  await new Promise(resolve => setTimeout(resolve, 200));
  const shot = await cdp(ws, 5, 'Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  });
  const data = shot && shot.data;
  if (!data) {
    throw new Error(`empty screenshot for scene ${sceneId}`);
  }
  fs.writeFileSync(outFile, Buffer.from(data, 'base64'));
}

async function main() {
  if (!fs.existsSync(HTML)) {
    throw new Error(`missing ${HTML}`);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(FRAME_DIR, { recursive: true });

  const { proc, ws } = await launchChrome();
  try {
    for (const scene of SCENES) {
      const file = path.join(OUT_DIR, `${SCENE_PREFIX}-${scene.id}.png`);
      console.log(`[promo] capture ${LANG} scene ${scene.id}`);
      await captureScene(ws, scene.id, file);
    }
  } finally {
    try {
      ws.close();
    } catch {
      /* ignore */
    }
    proc.kill();
  }

  const concatPath = path.join(FRAME_DIR, 'concat.txt');
  const concatLines = [];
  let gifIndex = 0;
  for (const scene of SCENES) {
    const src = path.join(OUT_DIR, `${SCENE_PREFIX}-${scene.id}.png`);
    const copies = Math.max(1, Math.round(scene.seconds * 2));
    for (let i = 0; i < copies; i += 1) {
      const dest = path.join(FRAME_DIR, `gif-${String(gifIndex).padStart(3, '0')}.png`);
      fs.copyFileSync(src, dest);
      gifIndex += 1;
    }
    concatLines.push(`file '${src}'`);
    concatLines.push(`duration ${scene.seconds}`);
  }
  concatLines.push(`file '${path.join(OUT_DIR, `${SCENE_PREFIX}-${SCENES[SCENES.length - 1].id}.png`)}'`);
  fs.writeFileSync(concatPath, `${concatLines.join('\n')}\n`);

  const gif = path.join(OUT_DIR, GIF_NAME);
  const mp4 = path.join(OUT_DIR, MP4_NAME);

  console.log('[promo] encode gif');
  await run('ffmpeg', [
    '-y',
    '-framerate',
    '2',
    '-i',
    path.join(FRAME_DIR, 'gif-%03d.png'),
    '-vf',
    'fps=2,scale=1280:800:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96:stats_mode=single[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3',
    gif,
  ]);

  console.log('[promo] encode mp4');
  await run('ffmpeg', [
    '-y',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    concatPath,
    '-vsync',
    'vfr',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '20',
    '-r',
    '30',
    '-movflags',
    '+faststart',
    mp4,
  ]);

  const gifSize = fs.statSync(gif).size;
  const mp4Size = fs.statSync(mp4).size;
  console.log(`[promo] wrote ${gif} (${gifSize} bytes)`);
  console.log(`[promo] wrote ${mp4} (${mp4Size} bytes)`);
}

main().catch(error => {
  console.error('[promo] failed', error);
  process.exit(1);
});
