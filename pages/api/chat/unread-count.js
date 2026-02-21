import { getDBConnection } from '../../../lib/dbHelper';
import connectDB from '../../../lib/db';
import authMiddleware from '../../../middlewares/authMiddleware';
import { applyCors } from '../../../utils';
import { jsonSuccess, jsonError } from '../../../lib/response';
import ChatMessage from '../../../models/ChatMessage';

const CHAT_ROLES = ['developer', 'hr', 'hr_admin'];

function canAccessChat(role) {
  if (!role) return false;
  const r = (role || '').toLowerCase();
  return r === 'superadmin' || CHAT_ROLES.includes(r);
}

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  const { connected } = await getDBConnection();
  if (!connected) {
    return jsonSuccess(res, 200, 'OK', { unreadCount: 0 });
  }

  await connectDB();
  const user = await authMiddleware(req, res);
  if (!user) return;
  if (!canAccessChat(user.role)) {
    return jsonSuccess(res, 200, 'OK', { unreadCount: 0 });
  }

  try {
    const count = await ChatMessage.countDocuments({ recipient: user._id, readAt: null });
    return jsonSuccess(res, 200, 'OK', { unreadCount: count });
  } catch (err) {
    console.error('Chat unread count error:', err);
    return jsonError(res, 500, 'Failed to get unread count.', err.message);
  }
}
