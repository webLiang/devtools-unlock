import type { PluginOption } from 'vite';
import { spawn } from 'node:child_process';
import * as path from 'path';

const rootDir = path.resolve(__dirname, '..', '..');

/**
 * After Vite writes popup/background, emit MAIN-world unlock.js and isolated embedWatch.js as IIFE.
 * These files must not use import() — Chrome/Firefox inject them as classic scripts.
 */
function runIifeBuild(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(rootDir, 'scripts', 'build-iife.mjs')], {
      cwd: rootDir,
      stdio: 'inherit',
      env: process.env,
    });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`IIFE build exited with code ${code}`));
    });
  });
}

export default function buildIifeContent(): PluginOption {
  return {
    name: 'build-iife-content',
    async writeBundle() {
      await runIifeBuild();
    },
  };
}
