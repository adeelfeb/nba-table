import crypto from 'crypto';
import connectDB from '../lib/db';
import ValentineUrl from '../models/ValentineUrl';
import { jsonError, jsonSuccess } from '../lib/response';

function toSlug(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateSecureSlug(recipientName) {
  const namePart = toSlug(recipientName).slice(0, 30) || 'val';
  const randomPart = crypto.randomBytes(10).toString('base64url').slice(0, 14);
  return `val-${namePart}-${randomPart}`;
}

function generateSecretToken() {
  return crypto.randomBytes(24).toString('base64url');
}

function sanitizeForOwner(valentine) {
  if (!valentine) return null;
  const id = valentine._id?.toString?.() || valentine._id;
  return {
    id,
    slug: valentine.slug,
    recipientName: valentine.recipientName,
    welcomeText: valentine.welcomeText,
    mainMessage: valentine.mainMessage,
    buttonText: valentine.buttonText,
    theme: valentine.theme,
    themeColor: valentine.themeColor,
    createdBy: valentine.createdBy?._id || valentine.createdBy,
    createdByName: valentine.createdByName,
    createdAt: valentine.createdAt,
    updatedAt: valentine.updatedAt,
  };
}

function sanitizeForPublic(valentine) {
  if (!valentine) return null;
  return {
    slug: valentine.slug,
    recipientName: valentine.recipientName,
    welcomeText: valentine.welcomeText,
    mainMessage: valentine.mainMessage,
    buttonText: valentine.buttonText,
    theme: valentine.theme,
    themeColor: valentine.themeColor,
  };
}

export async function getMyValentineUrls(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const list = await ValentineUrl.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return jsonSuccess(res, 200, 'Valentine URLs retrieved', {
      valentineUrls: list.map(sanitizeForOwner),
    });
  } catch (error) {
    console.error('Error fetching Valentine URLs:', error);
    return jsonError(res, 500, 'Failed to fetch Valentine URLs', error.message);
  }
}

export async function createValentineUrl(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const {
      recipientName,
      welcomeText,
      mainMessage,
      buttonText,
      theme,
      themeColor,
    } = req.body;

    if (!recipientName || !recipientName.trim()) {
      return jsonError(res, 400, 'Recipient name is required');
    }

    let slug = generateSecureSlug(recipientName.trim());
    let exists = await ValentineUrl.findOne({ slug });
    let attempts = 0;
    while (exists && attempts < 10) {
      slug = generateSecureSlug(recipientName.trim() + '-' + attempts);
      exists = await ValentineUrl.findOne({ slug });
      attempts++;
    }
    if (exists) {
      return jsonError(res, 500, 'Could not generate unique URL. Please try again.');
    }

    const secretToken = generateSecretToken();
    const doc = await ValentineUrl.create({
      slug,
      secretToken,
      recipientName: recipientName.trim(),
      welcomeText: (welcomeText || '').trim() || "You've got something special",
      mainMessage: (mainMessage || '').trim(),
      buttonText: (buttonText || '').trim() || 'Open',
      theme: theme || 'classic',
      themeColor: themeColor || 'rose',
      createdBy: req.user._id,
      createdByName: req.user.name || '',
    });

    return jsonSuccess(res, 201, 'Valentine URL created', {
      valentineUrl: sanitizeForOwner(doc),
      fullUrl: `${getBaseUrl(req)}/valentine/${doc.slug}`,
    });
  } catch (error) {
    console.error('Error creating Valentine URL:', error);
    if (error.code === 11000) {
      return jsonError(res, 400, 'This URL already exists. Please try again.');
    }
    return jsonError(res, 500, 'Failed to create Valentine URL', error.message);
  }
}

function getBaseUrl(req) {
  const host = req.headers?.['x-forwarded-host'] || req.headers?.host || '';
  const proto = req.headers?.['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  return host ? `${proto}://${host}` : '';
}

export async function getValentineUrlById(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'ID is required');
    }
    const doc = await ValentineUrl.findOne({
      _id: id,
      createdBy: req.user._id,
    }).lean();
    if (!doc) {
      return jsonError(res, 404, 'Valentine URL not found');
    }
    return jsonSuccess(res, 200, 'Valentine URL retrieved', {
      valentineUrl: sanitizeForOwner(doc),
      fullUrl: `${getBaseUrl(req)}/valentine/${doc.slug}`,
    });
  } catch (error) {
    console.error('Error fetching Valentine URL:', error);
    return jsonError(res, 500, 'Failed to fetch Valentine URL', error.message);
  }
}

export async function updateValentineUrl(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'ID is required');
    }
    const doc = await ValentineUrl.findOne({ _id: id, createdBy: req.user._id });
    if (!doc) {
      return jsonError(res, 404, 'Valentine URL not found');
    }
    const {
      recipientName,
      welcomeText,
      mainMessage,
      buttonText,
      theme,
      themeColor,
    } = req.body;
    if (recipientName !== undefined) doc.recipientName = recipientName.trim();
    if (welcomeText !== undefined) doc.welcomeText = welcomeText.trim();
    if (mainMessage !== undefined) doc.mainMessage = mainMessage.trim();
    if (buttonText !== undefined) doc.buttonText = buttonText.trim();
    if (theme !== undefined) doc.theme = theme;
    if (themeColor !== undefined) doc.themeColor = themeColor;
    await doc.save();
    return jsonSuccess(res, 200, 'Valentine URL updated', {
      valentineUrl: sanitizeForOwner(doc),
      fullUrl: `${getBaseUrl(req)}/valentine/${doc.slug}`,
    });
  } catch (error) {
    console.error('Error updating Valentine URL:', error);
    return jsonError(res, 500, 'Failed to update Valentine URL', error.message);
  }
}

export async function deleteValentineUrl(req, res) {
  try {
    await connectDB();
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }
    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'ID is required');
    }
    const doc = await ValentineUrl.findOne({ _id: id, createdBy: req.user._id });
    if (!doc) {
      return jsonError(res, 404, 'Valentine URL not found');
    }
    await ValentineUrl.findByIdAndDelete(id);
    return jsonSuccess(res, 200, 'Valentine URL deleted');
  } catch (error) {
    console.error('Error deleting Valentine URL:', error);
    return jsonError(res, 500, 'Failed to delete Valentine URL', error.message);
  }
}

export async function getValentineBySlug(req, res) {
  try {
    await connectDB();
    const { slug } = req.query;
    if (!slug || !slug.trim()) {
      return jsonError(res, 400, 'Invalid link');
    }
    const doc = await ValentineUrl.findOne({ slug: slug.trim().toLowerCase() }).lean();
    if (!doc) {
      return jsonError(res, 404, 'This link is invalid or has been removed');
    }
    return jsonSuccess(res, 200, 'OK', {
      page: sanitizeForPublic(doc),
    });
  } catch (error) {
    console.error('Error fetching Valentine by slug:', error);
    return jsonError(res, 500, 'Failed to load page', error.message);
  }
}
