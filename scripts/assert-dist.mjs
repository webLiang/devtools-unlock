#!/usr/bin/env node
/**
 * Assert unpacked dist/chrome or dist/firefox is a valid package.
 * Usage: node scripts/assert-dist.mjs [--firefox]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wantFirefox = process.argv.includes('--firefox');
const TARGET = wantFirefox ? 'firefox' : 'chrome';
const DIST = path.join(ROOT, 'dist', TARGET);

function fail(message) {
  console.error(`assert-dist: ${message}`);
  process.exit(1);
}

function firstNonEmptyLine(text) {
  return (
    text
      .split(/\r?\n/)
      .map(line => line.trim())
      .find(line => line && !line.startsWith('//') && !line.startsWith('/*')) || ''
  );
}

if (!fs.existsSync(path.join(DIST, 'manifest.json'))) {
  fail(`missing dist/${TARGET}/manifest.json`);
}

const manifest = JSON.parse(fs.readFileSync(path.join(DIST, 'manifest.json'), 'utf8'));
const unlockPath = path.join(DIST, 'unlock.js');
const embedPath = path.join(DIST, 'embedWatch.js');

if (!fs.existsSync(unlockPath)) {
  fail(`missing dist/${TARGET}/unlock.js`);
}
if (!fs.existsSync(embedPath)) {
  fail(`missing dist/${TARGET}/embedWatch.js`);
}

const unlockHead = firstNonEmptyLine(fs.readFileSync(unlockPath, 'utf8'));
if (/^import\s/.test(unlockHead) || unlockHead.startsWith('import(')) {
  fail(`dist/${TARGET}/unlock.js must be a classic IIFE, got: ${unlockHead.slice(0, 80)}`);
}

const embedHead = firstNonEmptyLine(fs.readFileSync(embedPath, 'utf8'));
if (/^import\s/.test(embedHead)) {
  fail(`dist/${TARGET}/embedWatch.js must be a classic IIFE, got: ${embedHead.slice(0, 80)}`);
}

if (wantFirefox) {
  if (!manifest.background || !Array.isArray(manifest.background.scripts)) {
    fail('Firefox manifest must use background.scripts');
  }
  if (manifest.background.service_worker) {
    fail('Firefox manifest must not keep background.service_worker');
  }
  if (manifest.options_ui) {
    fail('Firefox manifest must not emit options_ui (this product has no options page)');
  }
  const gecko = manifest.browser_specific_settings && manifest.browser_specific_settings.gecko;
  if (!gecko || gecko.id !== 'devtools-unlock@webliang') {
    fail('Firefox manifest missing gecko.id devtools-unlock@webliang');
  }
  if (gecko.strict_min_version !== '128.0') {
    fail(`Firefox strict_min_version expected 128.0, got ${gecko.strict_min_version}`);
  }
  const dataCollection = gecko.data_collection_permissions;
  if (!dataCollection || !Array.isArray(dataCollection.required) || !dataCollection.required.includes('none')) {
    fail('Firefox gecko.data_collection_permissions.required should include none');
  }
  if (manifest.minimum_chrome_version) {
    fail('Firefox manifest should not include minimum_chrome_version');
  }
} else {
  if (!manifest.background || !manifest.background.service_worker) {
    fail('Chrome manifest must use background.service_worker');
  }
  if (manifest.browser_specific_settings) {
    fail('Chrome manifest should not include browser_specific_settings');
  }
}

const popup = path.join(DIST, 'src/pages/popup/index.html');
const background = path.join(DIST, 'src/pages/background/index.js');
if (!fs.existsSync(popup)) {
  fail(`missing dist/${TARGET}/src/pages/popup/index.html`);
}
if (!fs.existsSync(background)) {
  fail(`missing dist/${TARGET}/src/pages/background/index.js`);
}

console.log(`assert-dist: ok (${wantFirefox ? 'firefox' : 'chrome'})`);
