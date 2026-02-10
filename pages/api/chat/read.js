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
  await connectDB();
  const user = await authMiddleware(req, res);
  if (!user) return;
  if (!canAccessChat(user.role)) {
    return jsonError(res, 403, 'Chat is only available for developer and HR roles.');
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  const { userId, messageIds } = req.body || {};

  try {
    if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
      await ChatMessage.updateMany(
        { _id: { $in: messageIds }, recipient: user._id, readAt: null },
        { $set: { readAt: new Date() } }
      );
      return jsonSuccess(res, 200, 'Messages marked as read.');
    }

    if (userId) {
      const result = await ChatMessage.updateMany(
        { sender: userId, recipient: user._id, readAt: null },
        { $set: { readAt: new Date() } }
      );
      return jsonSuccess(res, 200, 'Conversation marked as read.', { modified: result.modifiedCount });
    }

    return jsonError(res, 400, 'Provide userId or messageIds.');
  } catch (err) {
    console.error('Chat read error:', err);
    return jsonError(res, 500, 'Failed to mark as read.', err.message);
  }
}
