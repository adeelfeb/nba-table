import { applyCors, withErrorHandling } from '../../utils';
import { jsonError, jsonSuccess } from '../../lib/response';
import connectDB from '../../lib/db';
import Candidate from '../../models/Candidate';

export const config = {
  api: {
    bodyParser: true,
  },
};

// Simple UUID generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Validate E.164 phone number format
function validatePhone(phone) {
  if (!phone) return null;
  const e164Pattern = /^\+[1-9]\d{1,14}$/;
  return e164Pattern.test(phone.trim()) ? phone.trim() : null;
}

async function handler(req, res) {
  if (await applyCors(req, res)) return;

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  await connectDB();

  try {
    const body = req.body;

    // Required fields validation
    if (!body.source_system) {
      return jsonError(res, 400, 'source_system is required');
    }
    if (!body.service_type) {
      return jsonError(res, 400, 'service_type is required');
    }
    // Require at least name or company_name
    if (!body.name && !body.company_name) {
      return jsonError(res, 400, 'name or company_name is required');
    }
    // Require at least phone or email
    if (!body.phone && !body.email) {
      return jsonError(res, 400, 'phone or email is required');
    }

    // Build payload
    const candidateId = body.candidate_id || `candidate_${generateUUID()}`;

    // Check for duplicate (idempotency)
    const existing = await Candidate.findOne({ candidate_id: candidateId });
    if (existing) {
      return jsonSuccess(res, 200, 'Candidate already exists', {
        status: 'ok',
        vendor_id: existing.vendor_id || existing.candidate_id,
        candidate_id: existing.candidate_id,
        message: 'candidate recorded',
      });
    }

    const payload = {
      candidate_id: candidateId,
      source_system: String(body.source_system).trim(),
      source_ref: body.source_ref ? String(body.source_ref).trim() : null,
      name: body.name ? String(body.name).trim() : null,
      email: body.email ? String(body.email).trim().toLowerCase() : null,
      phone: body.phone ? validatePhone(body.phone) : null,
      company_name: body.company_name ? String(body.company_name).trim() : null,
      service_type: String(body.service_type).trim(),
      sub_service: body.sub_service ? String(body.sub_service).trim() : null,
      service_area: body.service_area ? String(body.service_area).trim() : null,
      address: body.address
        ? {
            street: body.address.street ? String(body.address.street).trim() : null,
            unit: body.address.unit ? String(body.address.unit).trim() : null,
            city: body.address.city ? String(body.address.city).trim() : null,
            postal_code: body.address.postal_code ? String(body.address.postal_code).trim() : null,
            province: body.address.province ? String(body.address.province).trim() : null,
            country: body.address.country ? String(body.address.country).trim() || 'CA' : 'CA',
          }
        : null,
      documents: Array.isArray(body.documents)
        ? body.documents.map((doc) => ({
            type: doc.type ? String(doc.type).trim() : '',
            url: doc.url ? String(doc.url).trim() : '',
            uploaded_at: doc.uploaded_at ? new Date(doc.uploaded_at) : new Date(),
          }))
        : [],
      onboard_status: body.onboard_status || 'pending',
      notes: body.notes ? String(body.notes).trim() : null,
      created_at: body.created_at ? new Date(body.created_at) : new Date(),
    };

    // Set vendor_id to candidate_id (can be updated later when mapped to Vendor)
    payload.vendor_id = payload.candidate_id;

    // Set mapped fields
    if (payload.name) {
      payload.contact_name = payload.name;
    }
    if (payload.company_name) {
      payload.legal_name = payload.company_name;
    }
    if (payload.sub_service) {
      payload.subcategory = payload.sub_service;
    }

    const candidate = new Candidate(payload);
    await candidate.save();

    return jsonSuccess(res, 200, 'candidate recorded', {
      status: 'ok',
      vendor_id: candidate.vendor_id || candidate.candidate_id,
      candidate_id: candidate.candidate_id,
      message: 'candidate recorded',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return jsonError(res, 400, 'Validation error', error.message);
    }
    if (error.code === 11000) {
      // Duplicate key error
      return jsonError(res, 409, 'Candidate with this ID already exists');
    }
    return jsonError(res, 500, 'Failed to create candidate', error.message);
  }
}

export default withErrorHandling(handler);
