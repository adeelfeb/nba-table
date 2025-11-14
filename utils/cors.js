// Lightweight CORS middleware for Next.js API routes
// Returns true if the request has been handled (e.g., OPTIONS), otherwise false
import connectDB from '../lib/db';
import { env } from '../lib/config';
import AllowedOrigin from '../models/AllowedOrigin';

const DEFAULT_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const DEFAULT_HEADERS = ['Content-Type', 'Authorization'];
const DEFAULT_MAX_AGE = 60 * 60 * 24; // 24 hours
const CORS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedOrigins = {
  normalized: new Set(),
  raw: [],
  expiresAt: 0,
};

function parseDefaultOrigins() {
  const configured = env.CORS_DEFAULT_ORIGINS || '';
  if (!configured) {
    return [];
  }
  return configured
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => AllowedOrigin.normalizeOrigin?.(value) || '')
    .filter(Boolean);
}

async function loadAllowedOrigins() {
  const now = Date.now();
  if (cachedOrigins.expiresAt > now && cachedOrigins.raw.length) {
    return cachedOrigins;
  }

  const defaults = parseDefaultOrigins();

  try {
    await connectDB();
    const records = await AllowedOrigin.find({ isActive: true })
      .select('origin normalizedOrigin')
      .lean()
      .exec();
    const normalized = new Set(records.map((record) => record.normalizedOrigin));
    defaults.forEach((origin) => normalized.add(origin));
    const raw = Array.from(normalized);

    cachedOrigins = {
      normalized,
      raw,
      expiresAt: now + CORS_CACHE_TTL_MS,
    };
    return cachedOrigins;
  } catch (error) {
    const normalized = new Set(defaults);
    cachedOrigins = {
      normalized,
      raw: defaults,
      expiresAt: now + CORS_CACHE_TTL_MS / 2,
    };
    return cachedOrigins;
  }
}

export function clearCorsCache() {
  cachedOrigins = {
    normalized: new Set(),
    raw: [],
    expiresAt: 0,
  };
}

export async function applyCors(req, res, options = {}) {
  const {
    methods = DEFAULT_METHODS,
    headers = DEFAULT_HEADERS,
    allowCredentials = true,
    maxAge = DEFAULT_MAX_AGE,
    defaultOrigin = '',
    allowWhenNoOrigin = true,
  } = options;

  const { normalized } = await loadAllowedOrigins();

  const requestOrigin = req.headers.origin;
  let resolvedOrigin = '';

  if (requestOrigin) {
    const normalizedOrigin = AllowedOrigin.normalizeOrigin?.(requestOrigin) || '';
    if (!normalizedOrigin || !normalized.has(normalizedOrigin)) {
      res.status(403).json({
        success: false,
        message: 'Origin not allowed',
      });
      return true;
    }
    resolvedOrigin = requestOrigin;
  } else if (allowWhenNoOrigin && defaultOrigin) {
    resolvedOrigin = defaultOrigin;
  }

  if (resolvedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', resolvedOrigin);
  }
  res.setHeader('Vary', 'Origin');

  res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', headers.join(', '));
  res.setHeader('Access-Control-Max-Age', String(maxAge));

  if (allowCredentials && resolvedOrigin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }

  return false;
}

