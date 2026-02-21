/**
 * Safe JSON response parsing for client-side fetch.
 * When deployed, API routes may return HTML (e.g. 404/500 pages) instead of JSON.
 * Calling response.json() on HTML throws "Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON".
 * This helper reads text first and only parses when the response is actually JSON,
 * otherwise throws a user-friendly error.
 *
 * Use for all client-side fetch().then(res => ...) where you would call res.json().
 */

const FALLBACK_MESSAGE = 'Please try again later.';

/**
 * @param {Response} response - Fetch API Response object
 * @returns {Promise<object|array>} Parsed JSON (object or array)
 * @throws {Error} When response body is not valid JSON (e.g. HTML error page)
 */
export async function safeParseJsonResponse(response) {
  const text = await response.text();
  const contentType = (response.headers.get('Content-Type') || '').toLowerCase();
  const looksLikeJson =
    contentType.includes('application/json') ||
    /^\s*[{[]/.test(text);

  if (!looksLikeJson) {
    const err = new Error(FALLBACK_MESSAGE);
    err.isHtmlResponse = true;
    throw err;
  }

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    const err = new Error(FALLBACK_MESSAGE);
    err.isHtmlResponse = true;
    throw err;
  }
}
