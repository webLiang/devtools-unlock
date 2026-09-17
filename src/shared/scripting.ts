/**
 * Firefox 128 supports world: MAIN on executeScript but injectImmediately is not
 * guaranteed. Drop the flag on Firefox; document_start still comes from registerContentScripts.
 */
export function isFirefoxRuntime(): boolean {
  try {
    return typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);
  } catch {
    return false;
  }
}

type ScriptInjection = Parameters<typeof chrome.scripting.executeScript>[0];

/**
 * executeScript with optional injectImmediately. Retries without the flag when the
 * browser rejects the property (older Firefox).
 */
export async function executeScriptCompat(injection: ScriptInjection) {
  const payload: ScriptInjection = { ...injection };
  if (isFirefoxRuntime()) {
    delete (payload as { injectImmediately?: boolean }).injectImmediately;
  }

  try {
    return await chrome.scripting.executeScript(payload);
  } catch (error) {
    if (payload.injectImmediately) {
      const retry = { ...payload };
      delete (retry as { injectImmediately?: boolean }).injectImmediately;
      console.warn(
        '[devtools-unlock] executeScript injectImmediately unsupported, retrying without it',
        error,
      );
      return chrome.scripting.executeScript(retry);
    }
    throw error;
  }
}
