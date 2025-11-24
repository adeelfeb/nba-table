import connectDB from '../lib/db';
import Job from '../models/Job';
import { jsonError, jsonSuccess } from '../lib/response';

const DENIED_ROLES = new Set(['base_user']);

function normalizeRole(role) {
  return typeof role === 'string' ? role.trim().toLowerCase() : '';
}

function hasFullAccess(user) {
  if (!user) return false;
  const role = normalizeRole(user.role);
  return role && !DENIED_ROLES.has(role);
}

function hasReadAccess(user) {
  return hasFullAccess(user);
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
  if (!ensureReadAccess(res, user)) {
    return false;
  }
  if (!hasFullAccess(user)) {
    jsonError(res, 403, 'Insufficient role permissions');
    return false;
  }
  return true;
}

const SOURCE_OPTIONS = new Set(['phone', 'webform', 'partner']);
const SERVICE_TYPE_OPTIONS = new Set(['plumbing', 'hvac', 'restoration']);
const PRIORITY_OPTIONS = new Set(['emergency', 'same_day', 'scheduled']);
const STATUS_OPTIONS = new Set([
  'confirmed',
  'pending_approval',
  'approved_for_outreach',
  'dispatching',
  'assigned',
  'en_route',
  'complete',
  'canceled',
]);

const STRING_FIELDS = [
  'transcript_id',
  'customer_name',
  'customer_phone',
  'customer_email',
  'address_street',
  'address_unit',
  'address_city',
  'address_postal',
  'subcategory',
  'notes_scope',
  'assigned_vendor_id',
  'ai_json',
];

function parseDate(value, field, errors) {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    errors.push(`${field} must be a valid date`);
    return null;
  }
  return date;
}

function buildJobPayload(body, { partial = false } = {}) {
  const payload = {};
  const errors = [];
  if (!body || typeof body !== 'object') {
    return { errors: ['Invalid JSON body'], payload, valid: false };
  }

  if (!partial || body.job_id != null) {
    if (typeof body.job_id !== 'string' || !body.job_id.trim()) {
      errors.push('job_id is required and must be a non-empty string');
    } else {
      payload.job_id = body.job_id.trim();
    }
  }

  if (body.source != null) {
    if (!SOURCE_OPTIONS.has(body.source)) {
      errors.push(`source must be one of: ${Array.from(SOURCE_OPTIONS).join(', ')}`);
    } else {
      payload.source = body.source;
    }
  }

  if (body.service_type != null) {
    if (!SERVICE_TYPE_OPTIONS.has(body.service_type)) {
      errors.push(
        `service_type must be one of: ${Array.from(SERVICE_TYPE_OPTIONS).join(', ')}`
      );
    } else {
      payload.service_type = body.service_type;
    }
  }

  if (body.priority != null) {
    if (!PRIORITY_OPTIONS.has(body.priority)) {
      errors.push(`priority must be one of: ${Array.from(PRIORITY_OPTIONS).join(', ')}`);
    } else {
      payload.priority = body.priority;
    }
  }

  if (body.status != null) {
    if (!STATUS_OPTIONS.has(body.status)) {
      errors.push(`status must be one of: ${Array.from(STATUS_OPTIONS).join(', ')}`);
    } else {
      payload.status = body.status;
    }
  }

  STRING_FIELDS.forEach((field) => {
    if (body[field] != null) {
      if (typeof body[field] !== 'string') {
        errors.push(`${field} must be a string`);
      } else {
        payload[field] = body[field].trim();
      }
    }
  });

  if (body.compliance_only != null) {
    if (typeof body.compliance_only !== 'boolean') {
      errors.push('compliance_only must be a boolean');
    } else {
      payload.compliance_only = body.compliance_only;
    }
  }

  if (body.ai_confidence != null) {
    if (typeof body.ai_confidence !== 'number' || body.ai_confidence < 0 || body.ai_confidence > 1) {
      errors.push('ai_confidence must be a number between 0 and 1');
    } else {
      payload.ai_confidence = body.ai_confidence;
    }
  }

  if (body.window_start != null) {
    const parsed = parseDate(body.window_start, 'window_start', errors);
    if (parsed) payload.window_start = parsed;
  }
  if (body.window_end != null) {
    const parsed = parseDate(body.window_end, 'window_end', errors);
    if (parsed) payload.window_end = parsed;
  }
  if (body.created_at != null) {
    const parsed = parseDate(body.created_at, 'created_at', errors);
    if (parsed) payload.created_at = parsed;
  }

  return { payload, errors, valid: errors.length === 0 };
}

function toJobResponse(doc) {
  if (!doc) return null;
  const job = doc.toObject ? doc.toObject({ versionKey: false }) : doc;
  job.id = doc._id?.toString ? doc._id.toString() : doc._id;
  return job;
}

export async function createJob(req, res, currentUser) {
  if (!ensureFullAccess(res, currentUser)) return;
  const { payload, errors, valid } = buildJobPayload(req.body, { partial: false });
  if (!valid) {
    return jsonError(res, 400, 'Validation error', errors);
  }
  try {
    await connectDB();
    const created = await Job.create(payload);
    return jsonSuccess(res, 201, 'Job created', { job: toJobResponse(created) });
  } catch (err) {
    if (err.code === 11000) {
      return jsonError(res, 409, 'Job with this job_id already exists');
    }
    return jsonError(res, 500, 'Failed to create job', err.message);
  }
}

export async function listJobs(req, res, currentUser) {
  if (!ensureReadAccess(res, currentUser)) return;
  const { limit = '50', offset = '0' } = req.query || {};
  const parsedLimit = Math.min(parseInt(limit, 10) || 50, 200);
  const parsedOffset = parseInt(offset, 10) || 0;
  try {
    await connectDB();
    const [items, total] = await Promise.all([
      Job.find().sort({ created_at: -1 }).skip(parsedOffset).limit(parsedLimit),
      Job.countDocuments(),
    ]);
    return jsonSuccess(res, 200, 'Ok', {
      items: items.map(toJobResponse),
      total,
      limit: parsedLimit,
      offset: parsedOffset,
    });
  } catch (err) {
    return jsonError(res, 500, 'Failed to list jobs', err.message);
  }
}

export async function getJobByJobId(req, res, currentUser, jobId) {
  if (!ensureReadAccess(res, currentUser)) return;
  if (!jobId || typeof jobId !== 'string' || !jobId.trim()) {
    return jsonError(res, 400, 'jobId is required');
  }
  try {
    await connectDB();
    const job = await Job.findOne({ job_id: jobId.trim() });
    if (!job) {
      return jsonError(res, 404, 'Job not found');
    }
    return jsonSuccess(res, 200, 'Ok', { job: toJobResponse(job) });
  } catch (err) {
    return jsonError(res, 500, 'Failed to fetch job', err.message);
  }
}

export async function updateJobByJobId(req, res, currentUser, jobId) {
  if (!ensureFullAccess(res, currentUser)) return;
  if (!jobId || typeof jobId !== 'string' || !jobId.trim()) {
    return jsonError(res, 400, 'jobId is required');
  }
  const { payload, errors, valid } = buildJobPayload(req.body, { partial: true });
  if (!valid) {
    return jsonError(res, 400, 'Validation error', errors);
  }
  try {
    await connectDB();
    const updated = await Job.findOneAndUpdate({ job_id: jobId.trim() }, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return jsonError(res, 404, 'Job not found');
    }
    return jsonSuccess(res, 200, 'Job updated', { job: toJobResponse(updated) });
  } catch (err) {
    if (err.code === 11000) {
      return jsonError(res, 409, 'Job with this job_id already exists');
    }
    return jsonError(res, 500, 'Failed to update job', err.message);
  }
}

export async function deleteJobByJobId(req, res, currentUser, jobId) {
  if (!ensureFullAccess(res, currentUser)) return;
  if (!jobId || typeof jobId !== 'string' || !jobId.trim()) {
    return jsonError(res, 400, 'jobId is required');
  }
  try {
    await connectDB();
    const deleted = await Job.findOneAndDelete({ job_id: jobId.trim() });
    if (!deleted) {
      return jsonError(res, 404, 'Job not found');
    }
    return jsonSuccess(res, 200, 'Job deleted');
  } catch (err) {
    return jsonError(res, 500, 'Failed to delete job', err.message);
  }
}


