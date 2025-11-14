import connectDB from '../lib/db';
import Candidate from '../models/Candidate';
import { jsonError, jsonSuccess } from '../lib/response';

// Simple UUID v4 generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const FULL_CANDIDATE_ACCESS_ROLES = new Set(['superadmin', 'hr_admin', 'hr', 'admin']);
const READ_CANDIDATE_ACCESS_ROLES = new Set(['superadmin', 'hr_admin', 'hr', 'admin', 'simple_user']);

function normalizeRole(role) {
  return typeof role === 'string' ? role.trim().toLowerCase() : '';
}

function hasFullAccess(user) {
  if (!user) return false;
  return FULL_CANDIDATE_ACCESS_ROLES.has(normalizeRole(user.role));
}

function hasReadAccess(user) {
  if (!user) return false;
  const role = normalizeRole(user.role);
  // Exclude base_user from access
  if (role === 'base_user') return false;
  return hasFullAccess(user) || READ_CANDIDATE_ACCESS_ROLES.has(role);
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

// Validate E.164 phone number format
function validatePhone(phone) {
  if (!phone) return null;
  const e164Pattern = /^\+[1-9]\d{1,14}$/;
  return e164Pattern.test(phone.trim()) ? phone.trim() : null;
}

function buildCandidatePayload(body, { partial = false } = {}) {
  const errors = [];
  const payload = {};

  // candidate_id - required for new, optional for update
  if (body.candidate_id) {
    payload.candidate_id = String(body.candidate_id).trim();
  } else if (!partial) {
    // Generate UUID if not provided
    payload.candidate_id = `candidate_${generateUUID()}`;
  }

  // source_system - required
  if (body.source_system) {
    payload.source_system = String(body.source_system).trim();
  } else if (!partial) {
    errors.push('source_system is required');
  }

  // source_ref - optional
  if (body.source_ref) {
    payload.source_ref = String(body.source_ref).trim();
  }

  // name / contact_name
  if (body.name) {
    const name = String(body.name).trim();
    payload.name = name;
    payload.contact_name = name;
  }

  // company_name / legal_name
  if (body.company_name) {
    const companyName = String(body.company_name).trim();
    payload.company_name = companyName;
    payload.legal_name = companyName;
  }

  // email
  if (body.email) {
    payload.email = String(body.email).trim().toLowerCase();
  }

  // phone - validate E.164 (optional field)
  if (body.phone && body.phone.trim()) {
    const validatedPhone = validatePhone(body.phone);
    if (validatedPhone) {
      payload.phone = validatedPhone;
    } else {
      // If phone is provided but invalid, only warn in partial mode, otherwise allow it
      // (frontend can handle validation)
      if (!partial) {
        // For create operations, if phone is provided, it should be valid
        // But we'll allow it through and let frontend validate
        payload.phone = body.phone.trim();
      }
    }
  }

  // service_type - required
  if (body.service_type) {
    payload.service_type = String(body.service_type).trim();
  } else if (!partial) {
    errors.push('service_type is required');
  }

  // sub_service / subcategory
  if (body.sub_service || body.subcategory) {
    const subService = String(body.sub_service || body.subcategory).trim();
    payload.sub_service = subService;
    payload.subcategory = subService;
  }

  // service_area
  if (body.service_area) {
    payload.service_area = String(body.service_area).trim();
  }

  // address - handle both nested object and flattened fields
  const hasAddressObject = body.address && typeof body.address === 'object';
  const hasFlattenedAddress = body.address_street || body.address_city || body.address_postal || body.address_province || body.address_country || body.address_unit;
  
  if (hasAddressObject || hasFlattenedAddress) {
    payload.address = {};
    if (hasAddressObject) {
      // Handle nested address object (from external API)
      if (body.address.street) payload.address.street = String(body.address.street).trim();
      if (body.address.unit) payload.address.unit = String(body.address.unit).trim();
      if (body.address.city) payload.address.city = String(body.address.city).trim();
      if (body.address.postal_code) payload.address.postal_code = String(body.address.postal_code).trim();
      if (body.address.province) payload.address.province = String(body.address.province).trim();
      if (body.address.country) payload.address.country = String(body.address.country).trim();
    } else {
      // Handle flattened address fields (from dashboard form)
      if (body.address_street) payload.address.street = String(body.address_street).trim();
      if (body.address_unit) payload.address.unit = String(body.address_unit).trim();
      if (body.address_city) payload.address.city = String(body.address_city).trim();
      if (body.address_postal) payload.address.postal_code = String(body.address_postal).trim();
      if (body.address_postal_code) payload.address.postal_code = String(body.address_postal_code).trim();
      if (body.address_province) payload.address.province = String(body.address_province).trim();
      if (body.address_country) payload.address.country = String(body.address_country).trim();
      if (!payload.address.country && body.address_country !== '') {
        payload.address.country = 'CA'; // Default to Canada
      }
    }
    
    // Remove empty address object if no fields were set
    if (Object.keys(payload.address).length === 0) {
      delete payload.address;
    }
  }

  // documents
  if (Array.isArray(body.documents)) {
    payload.documents = body.documents.map((doc) => ({
      type: doc.type ? String(doc.type).trim() : '',
      url: doc.url ? String(doc.url).trim() : '',
      uploaded_at: doc.uploaded_at ? new Date(doc.uploaded_at) : new Date(),
    }));
  }

  // onboard_status
  const validStatuses = ['pending', 'reviewing', 'approved', 'rejected', 'onboarded'];
  if (body.onboard_status) {
    const status = String(body.onboard_status).trim().toLowerCase();
    if (validStatuses.includes(status)) {
      payload.onboard_status = status;
    } else {
      errors.push(`onboard_status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  // notes
  if (body.notes !== undefined) {
    payload.notes = body.notes ? String(body.notes).trim() : '';
  }

  // vendor_id (optional, for linking to existing vendor)
  if (body.vendor_id) {
    payload.vendor_id = String(body.vendor_id).trim();
  }

  // created_at
  if (body.created_at) {
    const date = new Date(body.created_at);
    if (!Number.isNaN(date.getTime())) {
      payload.created_at = date;
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return payload;
}

function toCandidateResponse(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    candidate_id: obj.candidate_id,
    vendor_id: obj.vendor_id || null,
    source_system: obj.source_system,
    source_ref: obj.source_ref || null,
    name: obj.name || null,
    email: obj.email || null,
    phone: obj.phone || null,
    company_name: obj.company_name || null,
    service_type: obj.service_type,
    sub_service: obj.sub_service || null,
    service_area: obj.service_area || null,
    address: obj.address || null,
    documents: obj.documents || [],
    onboard_status: obj.onboard_status,
    notes: obj.notes || null,
    created_at: obj.created_at ? obj.created_at.toISOString() : null,
    updated_at: obj.updated_at ? obj.updated_at.toISOString() : null,
  };
}

export async function createCandidate(req, res, currentUser) {
  if (!ensureFullAccess(res, currentUser)) return;

  await connectDB();

  try {
    const payload = buildCandidatePayload(req.body, { partial: false });

    // Check for duplicate candidate_id
    const existing = await Candidate.findOne({ candidate_id: payload.candidate_id });
    if (existing) {
      return jsonError(res, 409, 'Candidate with this candidate_id already exists');
    }

    // Set default vendor_id if not provided (use candidate_id)
    if (!payload.vendor_id) {
      payload.vendor_id = payload.candidate_id;
    }

    const candidate = new Candidate(payload);
    await candidate.save();

    return jsonSuccess(res, 201, 'Candidate created successfully', {
      candidate: toCandidateResponse(candidate),
    });
  } catch (error) {
    console.error('Error creating candidate:', error);
    if (error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors || {})
        .map((e) => e.message)
        .join('; ') || error.message;
      return jsonError(res, 400, 'Validation error', errorMessage);
    }
    if (error.code === 11000 || error.message.includes('duplicate key')) {
      return jsonError(res, 409, 'Candidate with this ID already exists');
    }
    return jsonError(res, 500, 'Failed to create candidate', error.message || 'Unknown error occurred');
  }
}

export async function listCandidates(req, res, currentUser) {
  if (!ensureReadAccess(res, currentUser)) return;

  await connectDB();

  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
    const status = req.query.status;
    const sourceSystem = req.query.source_system;
    const serviceType = req.query.service_type;

    const filter = {};

    if (status) {
      filter.onboard_status = status;
    }
    if (sourceSystem) {
      filter.source_system = sourceSystem;
    }
    if (serviceType) {
      filter.service_type = serviceType;
    }

    const candidates = await Candidate.find(filter)
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Candidate.countDocuments(filter);

    return jsonSuccess(res, 200, 'Candidates retrieved successfully', {
      items: candidates.map(toCandidateResponse),
      total,
      limit,
      skip,
    });
  } catch (error) {
    return jsonError(res, 500, 'Failed to retrieve candidates', error.message);
  }
}

export async function getCandidate(req, res, currentUser) {
  if (!ensureReadAccess(res, currentUser)) return;

  await connectDB();

  try {
    const { candidateId } = req.query;
    if (!candidateId) {
      return jsonError(res, 400, 'candidateId is required');
    }

    const candidate = await Candidate.findOne({ candidate_id: candidateId }).lean();
    if (!candidate) {
      return jsonError(res, 404, 'Candidate not found');
    }

    return jsonSuccess(res, 200, 'Candidate retrieved successfully', {
      candidate: toCandidateResponse(candidate),
    });
  } catch (error) {
    return jsonError(res, 500, 'Failed to retrieve candidate', error.message);
  }
}

export async function updateCandidate(req, res, currentUser) {
  if (!ensureFullAccess(res, currentUser)) return;

  await connectDB();

  try {
    const { candidateId } = req.query;
    if (!candidateId) {
      return jsonError(res, 400, 'candidateId is required');
    }

    const payload = buildCandidatePayload(req.body, { partial: true });
    if (Object.keys(payload).length === 0) {
      return jsonError(res, 400, 'No valid fields to update');
    }

    // Don't allow changing candidate_id
    delete payload.candidate_id;

    const candidate = await Candidate.findOneAndUpdate(
      { candidate_id: candidateId },
      { $set: payload },
      { new: true, runValidators: true }
    ).lean();

    if (!candidate) {
      return jsonError(res, 404, 'Candidate not found');
    }

    return jsonSuccess(res, 200, 'Candidate updated successfully', {
      candidate: toCandidateResponse(candidate),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return jsonError(res, 400, 'Validation error', error.message);
    }
    return jsonError(res, 500, 'Failed to update candidate', error.message);
  }
}

export async function deleteCandidate(req, res, currentUser) {
  if (!ensureFullAccess(res, currentUser)) return;

  await connectDB();

  try {
    const { candidateId } = req.query;
    if (!candidateId) {
      return jsonError(res, 400, 'candidateId is required');
    }

    const candidate = await Candidate.findOneAndDelete({ candidate_id: candidateId }).lean();
    if (!candidate) {
      return jsonError(res, 404, 'Candidate not found');
    }

    return jsonSuccess(res, 200, 'Candidate deleted successfully');
  } catch (error) {
    return jsonError(res, 500, 'Failed to delete candidate', error.message);
  }
}

