import connectDB from '../lib/db';
import Transcript from '../models/Transcript';
import { jsonError, jsonSuccess } from '../lib/response';

const FULL_TRANSCRIPT_ACCESS_ROLES = new Set(['hr_admin', 'hr', 'superadmin']);
const READ_TRANSCRIPT_ACCESS_ROLES = new Set(['base_user', 'simple_user', 'admin']);

function hasFullAccess(user) {
  return !!user && FULL_TRANSCRIPT_ACCESS_ROLES.has(user.role);
}

function hasReadAccess(user) {
  if (!user) return false;
  return hasFullAccess(user) || READ_TRANSCRIPT_ACCESS_ROLES.has(user.role);
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

function parseDate(value, field, errors) {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    errors.push(`${field} must be a valid date`);
    return null;
  }
  return date;
}

const STRING_FIELDS = ['raw_text', 'caller_number', 'agent_name', 'ai_parse_json'];

function buildTranscriptPayload(body, { partial = false } = {}) {
  const payload = {};
  const errors = [];
  if (!body || typeof body !== 'object') {
    return { payload, errors: ['Invalid JSON body'], valid: false };
  }

  if (!partial || body.transcript_id != null) {
    if (typeof body.transcript_id !== 'string' || !body.transcript_id.trim()) {
      errors.push('transcript_id is required and must be a non-empty string');
    } else {
      payload.transcript_id = body.transcript_id.trim();
    }
  }

  STRING_FIELDS.forEach((field) => {
    if (body[field] != null) {
      if (typeof body[field] !== 'string') {
        errors.push(`${field} must be a string`);
      } else {
        payload[field] = body[field];
      }
    }
  });

  if (body.parse_confidence != null) {
    if (
      typeof body.parse_confidence !== 'number' ||
      body.parse_confidence < 0 ||
      body.parse_confidence > 1
    ) {
      errors.push('parse_confidence must be a number between 0 and 1');
    } else {
      payload.parse_confidence = body.parse_confidence;
    }
  }

  if (body.call_start != null) {
    const parsed = parseDate(body.call_start, 'call_start', errors);
    if (parsed) payload.call_start = parsed;
  }
  if (body.call_end != null) {
    const parsed = parseDate(body.call_end, 'call_end', errors);
    if (parsed) payload.call_end = parsed;
  }

  return { payload, errors, valid: errors.length === 0 };
}

function toTranscriptResponse(doc) {
  if (!doc) return null;
  const transcript = doc.toObject ? doc.toObject({ versionKey: false }) : doc;
  transcript.id = doc._id?.toString ? doc._id.toString() : doc._id;
  return transcript;
}

export async function createTranscript(req, res, currentUser) {
  if (!ensureFullAccess(res, currentUser)) return;
  const { payload, errors, valid } = buildTranscriptPayload(req.body, { partial: false });
  if (!valid) {
    return jsonError(res, 400, 'Validation error', errors);
  }
  try {
    await connectDB();
    const created = await Transcript.create(payload);
    return jsonSuccess(res, 201, 'Transcript created', {
      transcript: toTranscriptResponse(created),
    });
  } catch (err) {
    if (err.code === 11000) {
      return jsonError(res, 409, 'Transcript with this transcript_id already exists');
    }
    return jsonError(res, 500, 'Failed to create transcript', err.message);
  }
}

export async function listTranscripts(req, res, currentUser) {
  if (!ensureReadAccess(res, currentUser)) return;
  const { limit = '50', offset = '0' } = req.query || {};
  const parsedLimit = Math.min(parseInt(limit, 10) || 50, 200);
  const parsedOffset = parseInt(offset, 10) || 0;
  try {
    await connectDB();
    const [items, total] = await Promise.all([
      Transcript.find()
        .sort({ transcript_id: 1 })
        .skip(parsedOffset)
        .limit(parsedLimit),
      Transcript.countDocuments(),
    ]);
    return jsonSuccess(res, 200, 'Ok', {
      items: items.map(toTranscriptResponse),
      total,
      limit: parsedLimit,
      offset: parsedOffset,
    });
  } catch (err) {
    return jsonError(res, 500, 'Failed to list transcripts', err.message);
  }
}

export async function getTranscriptByTranscriptId(req, res, currentUser, transcriptId) {
  if (!ensureReadAccess(res, currentUser)) return;
  if (!transcriptId || typeof transcriptId !== 'string' || !transcriptId.trim()) {
    return jsonError(res, 400, 'transcriptId is required');
  }
  try {
    await connectDB();
    const transcript = await Transcript.findOne({ transcript_id: transcriptId.trim() });
    if (!transcript) {
      return jsonError(res, 404, 'Transcript not found');
    }
    return jsonSuccess(res, 200, 'Ok', { transcript: toTranscriptResponse(transcript) });
  } catch (err) {
    return jsonError(res, 500, 'Failed to fetch transcript', err.message);
  }
}

export async function updateTranscriptByTranscriptId(
  req,
  res,
  currentUser,
  transcriptId
) {
  if (!ensureFullAccess(res, currentUser)) return;
  if (!transcriptId || typeof transcriptId !== 'string' || !transcriptId.trim()) {
    return jsonError(res, 400, 'transcriptId is required');
  }
  const { payload, errors, valid } = buildTranscriptPayload(req.body, { partial: true });
  if (!valid) {
    return jsonError(res, 400, 'Validation error', errors);
  }
  try {
    await connectDB();
    const updated = await Transcript.findOneAndUpdate(
      { transcript_id: transcriptId.trim() },
      payload,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return jsonError(res, 404, 'Transcript not found');
    }
    return jsonSuccess(res, 200, 'Transcript updated', {
      transcript: toTranscriptResponse(updated),
    });
  } catch (err) {
    if (err.code === 11000) {
      return jsonError(res, 409, 'Transcript with this transcript_id already exists');
    }
    return jsonError(res, 500, 'Failed to update transcript', err.message);
  }
}

export async function deleteTranscriptByTranscriptId(
  req,
  res,
  currentUser,
  transcriptId
) {
  if (!ensureFullAccess(res, currentUser)) return;
  if (!transcriptId || typeof transcriptId !== 'string' || !transcriptId.trim()) {
    return jsonError(res, 400, 'transcriptId is required');
  }
  try {
    await connectDB();
    const deleted = await Transcript.findOneAndDelete({
      transcript_id: transcriptId.trim(),
    });
    if (!deleted) {
      return jsonError(res, 404, 'Transcript not found');
    }
    return jsonSuccess(res, 200, 'Transcript deleted');
  } catch (err) {
    return jsonError(res, 500, 'Failed to delete transcript', err.message);
  }
}


