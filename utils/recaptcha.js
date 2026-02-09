/**
 * Google reCAPTCHA v2 Invisible - Client utilities
 * Loads the script and provides executeRecaptcha for getting tokens.
 * @see https://developers.google.com/recaptcha/docs/invisible
 */

const SCRIPT_URL = 'https://www.google.com/recaptcha/api.js';
const LOAD_KEY = '__RECAPTCHA_LOADED__';

/**
 * Load the reCAPTCHA script. Idempotent.
 * @returns {Promise<boolean>}
 */
export function loadRecaptchaScript() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window[LOAD_KEY]) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector('script[src*="recaptcha/api"]');
    if (existing) {
      if (window.grecaptcha && window.grecaptcha.render) {
        window[LOAD_KEY] = true;
        return resolve(true);
      }
      existing.addEventListener('load', () => {
        window[LOAD_KEY] = true;
        resolve(true);
      });
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window[LOAD_KEY] = true;
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

let _widgetId = null;
let _pendingResolve = null;

const _globalCallback = (token) => {
  if (_pendingResolve) {
    _pendingResolve(token || null);
    _pendingResolve = null;
  }
};

/**
 * Execute reCAPTCHA v2 Invisible and return the token via Promise.
 * @param {string} siteKey - NEXT_PUBLIC_RECAPTCHA_SITE_KEY
 * @returns {Promise<string|null>} Token or null if failed/not configured
 */
export async function executeRecaptcha(siteKey) {
  if (typeof window === 'undefined') return null;
  if (!siteKey || !String(siteKey).trim()) return null;

  try {
    const loaded = await loadRecaptchaScript();
    if (!loaded || !window.grecaptcha || !window.grecaptcha.render) return null;

    return new Promise((resolve) => {
      _pendingResolve = resolve;

      if (_widgetId != null) {
        try {
          window.grecaptcha.reset(_widgetId);
          window.grecaptcha.execute(_widgetId);
        } catch (_) {
          _pendingResolve(null);
          _pendingResolve = null;
        }
        return;
      }

      const container = document.createElement('div');
      container.id = 'recaptcha-invisible-' + Date.now();
      container.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
      document.body.appendChild(container);

      try {
        _widgetId = window.grecaptcha.render(container, {
          sitekey: siteKey,
          size: 'invisible',
          callback: _globalCallback,
          'expired-callback': () => {
            if (_pendingResolve) {
              _pendingResolve(null);
              _pendingResolve = null;
            }
          },
          'error-callback': () => {
            if (_pendingResolve) {
              _pendingResolve(null);
              _pendingResolve = null;
            }
          },
        });
        window.grecaptcha.execute(_widgetId);
      } catch (err) {
        try {
          document.body.removeChild(container);
        } catch (_) {}
        _widgetId = null;
        if (_pendingResolve) {
          _pendingResolve(null);
          _pendingResolve = null;
        }
      }
    });
  } catch (err) {
    console.warn('[reCAPTCHA] Error:', err);
    return null;
  }
}
