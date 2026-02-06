import HelpRequest from '../../../models/HelpRequest';
import authMiddleware from '../../../middlewares/authMiddleware';
import { applyCors } from '../../../utils';
import { jsonSuccess, jsonError } from '../../../lib/response';
import { requireDB } from '../../../lib/dbHelper';

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;
  const db = await requireDB(res);
  if (!db) return;

  const user = await authMiddleware(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

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
