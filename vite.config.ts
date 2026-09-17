import type {} from 'vitest/config';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path, { resolve } from 'path';
import makeManifest from './utils/plugins/make-manifest';
import customDynamicImport from './utils/plugins/custom-dynamic-import';
import fixContentImportMeta from './utils/plugins/fix-content-import-meta';
import addHmr from './utils/plugins/add-hmr';
import watchRebuild from './utils/plugins/watch-rebuild';
import buildIifeContent from './utils/plugins/build-iife-content';
import { getOutDir } from './utils/browser-out-dir';

const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, 'src');
const pagesDir = resolve(srcDir, 'pages');
const assetsDir = resolve(srcDir, 'assets');
const outDir = getOutDir(rootDir);
const publicDir = resolve(rootDir, 'public');

const isDev = process.env.__DEV__ === 'true';
const isProduction = !isDev;

const enableHmrInBackgroundScript = true;
const cacheInvalidationKeyRef = { current: generateKey() };

export default defineConfig({
  resolve: {
    alias: {
      '@root': rootDir,
      '@src': srcDir,
      '@assets': assetsDir,
      '@pages': pagesDir,
    },
  },
  plugins: [
    makeManifest({
      getCacheInvalidationKey,
      outDir,
    }),
    react(),
    customDynamicImport(),
    fixContentImportMeta(),
    addHmr({ background: enableHmrInBackgroundScript, view: true }),
    buildIifeContent(),
    isDev && watchRebuild({ afterWriteBundle: regenerateCacheInvalidationKey }),
  ],
  publicDir,
  build: {
    outDir,
    minify: isProduction,
    modulePreload: false,
    reportCompressedSize: isProduction,
    emptyOutDir: !isDev,
    rolldownOptions: {
      input: {
        background: resolve(pagesDir, 'background', 'index.ts'),
        popup: resolve(pagesDir, 'popup', 'index.html'),
      },
      output: {
        entryFileNames: 'src/pages/[name]/index.js',
        chunkFileNames: isDev ? 'assets/js/[name].js' : 'assets/js/[name].[hash].js',
        assetFileNames: assetInfo => {
          const name = assetInfo.names?.[0] ?? assetInfo.name;
          const { name: baseName } = path.parse(name ?? '');
          return `assets/[ext]/${baseName}.chunk.[ext]`;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    setupFiles: './test-utils/vitest.setup.js',
  },
});

function getCacheInvalidationKey() {
  return cacheInvalidationKeyRef.current;
}
function regenerateCacheInvalidationKey() {
  cacheInvalidationKeyRef.current = generateKey();
  return cacheInvalidationKeyRef;
}

function generateKey(): string {
  return `${Date.now().toFixed()}`;
}
