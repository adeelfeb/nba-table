/**
 * React hook for Google reCAPTCHA v2 Invisible
 * Returns a function that executes reCAPTCHA and returns the token.
 */
import { useCallback } from 'react';

const SITE_KEY = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  : '';

export function useRecaptcha() {
  const execute = useCallback(async () => {
    if (!SITE_KEY) return null;
    const { executeRecaptcha } = await import('./recaptcha');
    return executeRecaptcha(SITE_KEY);
  }, []);

  return {
    execute,
    isAvailable: !!SITE_KEY,
    siteKey: SITE_KEY,
  };
}
