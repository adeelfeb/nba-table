import HelpRequest from '../../../models/HelpRequest';
import authMiddleware from '../../../middlewares/authMiddleware';
import { applyCors } from '../../../utils';
import { jsonSuccess, jsonError } from '../../../lib/response';
import { getDBConnection, requireDB } from '../../../lib/dbHelper';
import { requireRecaptcha } from '../../../lib/recaptcha';

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  const ok = await requireRecaptcha(req, res, jsonError);
  if (!ok) return;

  const { connected } = await getDBConnection();
  if (!connected) {
    return jsonSuccess(res, 201, 'Request received. Service is temporarily unavailable; we will get back to you when possible.', {
      id: null,
      createdAt: new Date().toISOString(),
    });
  }

  const user = await authMiddleware(req, res);
  if (!user) return;

  const db = await requireDB(res);
  if (!db) return;

  try {
    const { message } = req.body || {};
    const trimmed = typeof message === 'string' ? message.trim() : '';
    if (!trimmed) {
      return jsonError(res, 400, 'Please enter your request message.');
    }
    if (trimmed.length > 2000) {
      return jsonError(res, 400, 'Message is too long (max 2000 characters).');
    }

    const doc = await HelpRequest.create({
      user: user._id,
      message: trimmed,
    });

    return jsonSuccess(res, 201, 'Request submitted successfully.', {
      id: doc._id.toString(),
      createdAt: doc.createdAt,
    });
  } catch (err) {
    console.error('Help request create error:', err);
    return jsonError(res, 500, 'Failed to submit request.', err.message);
  }
}
