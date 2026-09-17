import * as esbuild from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browserTarget = process.env.__FIREFOX__ === 'true' ? 'firefox' : 'chrome';
const outDir = path.join(rootDir, 'dist', browserTarget);

/**
 * Bundle MAIN-world unlock.js and isolated embedWatch.js as classic IIFE files.
 * Invoked from the Vite plugin after writeBundle and from `pnpm build:iife`.
 * Writes into dist/chrome or dist/firefox so browser builds do not overwrite each other.
 */
export async function buildIifeFiles() {
  const minify = process.env.__DEV__ !== 'true';
  const shared = {
    absWorkingDir: rootDir,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['chrome111', 'firefox128'],
    minify,
    logLevel: 'warning',
    legalComments: 'none',
  };

  await Promise.all([
    esbuild.build({
      ...shared,
      entryPoints: ['src/pages/content/unlock/index.ts'],
      outfile: path.join(outDir, 'unlock.js'),
    }),
    esbuild.build({
      ...shared,
      entryPoints: ['src/pages/content/embedWatch/index.ts'],
      outfile: path.join(outDir, 'embedWatch.js'),
    }),
  ]);

  console.log(`IIFE content scripts written: dist/${browserTarget}/unlock.js, dist/${browserTarget}/embedWatch.js`);
}

await buildIifeFiles();
