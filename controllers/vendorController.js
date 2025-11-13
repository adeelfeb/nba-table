import connectDB from '../lib/db';
import Vendor from '../models/Vendor';
import { jsonError, jsonSuccess } from '../lib/response';

const FULL_VENDOR_ACCESS_ROLES = new Set(['superadmin', 'hr_admin', 'hr']);
const READ_VENDOR_ACCESS_ROLES = new Set([
  'superadmin',
  'hr_admin',
  'hr',
  'admin',
  'base_user',
  'simple_user',
]);

function normalizeRole(role) {
  return typeof role === 'string' ? role.trim().toLowerCase() : '';
}

function hasFullAccess(user) {
  return FULL_VENDOR_ACCESS_ROLES.has(normalizeRole(user?.role));
}

function hasReadAccess(user) {
  return READ_VENDOR_ACCESS_ROLES.has(normalizeRole(user?.role)) || hasFullAccess(user);
}

function ensureReadAccess(res, user) {
  if (!user) {
    jsonError(res, 401, 'Authentication required');
    return false;
  }
  if (!hasReadAccess(user)) {
    jsonError(res, 403, 'Insufficient role permissions');
    return false;
  }
  return true;
}

function ensureFullAccess(res, user) {
  if (!ensureReadAccess(res, user)) return false;
  if (!hasFullAccess(user)) {
    jsonError(res, 403, 'Insufficient role permissions');
    return false;
  }
  return true;
}

const STATUS_OPTIONS = new Set(['compliant', 'at_risk', 'non_compliant', 'needs_review']);

function parseDate(value, field, errors) {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    errors.push(`${field} must be a valid date`);
    return null;
  }
  return date;
}

function normalizeStringArray(value, field, errors) {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  errors.push(`${field} must be an array of strings or string list`);
  return [];
}

function buildVendorPayload(body, { partial = false } = {}) {
  const errors = [];
  const payload = {};

  if (!body || typeof body !== 'object') {
    return { payload, errors: ['Invalid JSON body'], valid: false };
  }

  if (!partial || body.compliance_id != null) {
    if (typeof body.compliance_id !== 'string' || !body.compliance_id.trim()) {
      errors.push('compliance_id is required and must be a non-empty string');
    } else {
      payload.compliance_id = body.compliance_id.trim();
    }
  }

  if (!partial || body.vendor_id != null) {
    if (typeof body.vendor_id !== 'string' || !body.vendor_id.trim()) {
      errors.push('vendor_id is required and must be a non-empty string');
    } else {
      payload.vendor_id = body.vendor_id.trim();
    }
  }

  const stringFields = [
    'license_number',
    'insurance_policy',
    'wcb_number',
    'rationale',
  ];
  stringFields.forEach((field) => {
    if (body[field] != null) {
      if (typeof body[field] !== 'string') {
        errors.push(`${field} must be a string`);
      } else {
        payload[field] = body[field].trim();
      }
    }
  });

  if (body.status != null) {
    if (!STATUS_OPTIONS.has(body.status)) {
      errors.push(`status must be one of: ${Array.from(STATUS_OPTIONS).join(', ')}`);
    } else {
      payload.status = body.status;
    }
  }

  if (body.ai_confidence != null) {
    const parsed = Number(body.ai_confidence);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      errors.push('ai_confidence must be a number between 0 and 100');
    } else {
      payload.ai_confidence = parsed;
    }
  }

  if (body.insurance_coverage != null) {
    const coverage = Number(body.insurance_coverage);
    if (Number.isNaN(coverage) || coverage < 0) {
      errors.push('insurance_coverage must be a positive number');
    } else {
      payload.insurance_coverage = coverage;
    }
  }

  if (body.license_expiry != null) {
    const parsed = parseDate(body.license_expiry, 'license_expiry', errors);
    if (parsed) payload.license_expiry = parsed;
  }

  if (body.insurance_expiry != null) {
    const parsed = parseDate(body.insurance_expiry, 'insurance_expiry', errors);
    if (parsed) payload.insurance_expiry = parsed;
  }

  if (body.created_at != null) {
    const parsed = parseDate(body.created_at, 'created_at', errors);
    if (parsed) payload.created_at = parsed;
  }

  if (body.missing_items != null) {
    payload.missing_items = normalizeStringArray(body.missing_items, 'missing_items', errors);
  }

  return { payload, errors, valid: errors.length === 0 };
}

function toVendorResponse(doc) {
  if (!doc) return null;
  const vendor = doc.toObject ? doc.toObject({ versionKey: false }) : doc;
  vendor.id = doc._id?.toString ? doc._id.toString() : doc._id;
  return vendor;
}

export async function createVendor(req, res, currentUser) {
  if (!ensureFullAccess(res, currentUser)) return;
  const { payload, errors, valid } = buildVendorPayload(req.body, { partial: false });
  if (!valid) {
    return jsonError(res, 400, 'Validation error', errors);
  }
  try {
    await connectDB();
    const created = await Vendor.create(payload);
    return jsonSuccess(res, 201, 'Vendor compliance record created', {
      vendor: toVendorResponse(created),
    });
  } catch (err) {
    if (err.code === 11000) {
      return jsonError(res, 409, 'Compliance record with this compliance_id already exists');
    }
    return jsonError(res, 500, 'Failed to create vendor compliance record', err.message);
  }
}

export async function listVendors(req, res, currentUser) {
  if (!ensureReadAccess(res, currentUser)) return;
  const { limit = '50', offset = '0', status } = req.query || {};
  const parsedLimit = Math.min(parseInt(limit, 10) || 50, 200);
  const parsedOffset = parseInt(offset, 10) || 0;
  const query = {};
  if (status && STATUS_OPTIONS.has(status)) {
    query.status = status;
  }
  try {
    await connectDB();
    const [items, total] = await Promise.all([
      Vendor.find(query)
        .sort({ created_at: -1 })
        .skip(parsedOffset)
        .limit(parsedLimit),
      Vendor.countDocuments(query),
    ]);
    return jsonSuccess(res, 200, 'Ok', {
      items: items.map(toVendorResponse),
      total,
      limit: parsedLimit,
      offset: parsedOffset,
    });
  } catch (err) {
    return jsonError(res, 500, 'Failed to list vendor compliance records', err.message);
  }
}

export async function getVendorByComplianceId(req, res, currentUser, complianceId) {
  if (!ensureReadAccess(res, currentUser)) return;
  if (!complianceId || typeof complianceId !== 'string' || !complianceId.trim()) {
    return jsonError(res, 400, 'complianceId is required');
  }
  try {
    await connectDB();
    const vendor = await Vendor.findOne({ compliance_id: complianceId.trim() });
    if (!vendor) {
      return jsonError(res, 404, 'Vendor compliance record not found');
    }
    return jsonSuccess(res, 200, 'Ok', { vendor: toVendorResponse(vendor) });
  } catch (err) {
    return jsonError(res, 500, 'Failed to fetch vendor compliance record', err.message);
  }
}

export async function updateVendorByComplianceId(req, res, currentUser, complianceId) {
  if (!ensureFullAccess(res, currentUser)) return;
  if (!complianceId || typeof complianceId !== 'string' || !complianceId.trim()) {
    return jsonError(res, 400, 'complianceId is required');
  }
  const { payload, errors, valid } = buildVendorPayload(req.body, { partial: true });
  if (!valid) {
    return jsonError(res, 400, 'Validation error', errors);
  }
  try {
    await connectDB();
    const updated = await Vendor.findOneAndUpdate({ compliance_id: complianceId.trim() }, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return jsonError(res, 404, 'Vendor compliance record not found');
    }
    return jsonSuccess(res, 200, 'Vendor compliance record updated', {
      vendor: toVendorResponse(updated),
    });
  } catch (err) {
    if (err.code === 11000) {
      return jsonError(res, 409, 'Compliance record with this compliance_id already exists');
    }
    return jsonError(res, 500, 'Failed to update vendor compliance record', err.message);
  }
}

export async function deleteVendorByComplianceId(req, res, currentUser, complianceId) {
  if (!ensureFullAccess(res, currentUser)) return;
  if (!complianceId || typeof complianceId !== 'string' || !complianceId.trim()) {
    return jsonError(res, 400, 'complianceId is required');
  }
  try {
    await connectDB();
    const deleted = await Vendor.findOneAndDelete({ compliance_id: complianceId.trim() });
    if (!deleted) {
      return jsonError(res, 404, 'Vendor compliance record not found');
    }
    return jsonSuccess(res, 200, 'Vendor compliance record deleted');
  } catch (err) {
    return jsonError(res, 500, 'Failed to delete vendor compliance record', err.message);
  }
}


