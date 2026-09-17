/**
 * Previously used to inline Vite's preload helper into content script chunks
 * (https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/issues/177).
 *
 * Disabled for Vite 8 / Rolldown: scraping meta.chunks for a /preload/ chunk is
 * unreliable under Rolldown. Content-script `import.meta` is handled by
 * fix-content-import-meta.ts instead. Kept for reference only — do not register
 * this plugin in vite.config.ts.
 */
export default function inlineVitePreloadScript() {
  let __vitePreload = '';
  return {
    name: 'replace-vite-preload-script-plugin',
    async renderChunk(code, chunk, options, meta) {
      if (!/content/.test(chunk.fileName)) {
        return null;
      }
      if (!__vitePreload) {
        const chunkName: string | undefined = Object.keys(meta.chunks).find(key => /preload/.test(key));
        const modules = meta.chunks?.[chunkName]?.modules;
        __vitePreload = modules?.[Object.keys(modules)?.[0]]?.code;
        __vitePreload = __vitePreload?.replaceAll('const ', 'var ');
        if (!__vitePreload) {
          return null;
        }
      }
      return {
        code: __vitePreload + code.split(`\n`).slice(1).join(`\n`),
      };
    },
  };
}
