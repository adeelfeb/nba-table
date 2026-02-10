import connectDB from '../../../lib/db';
import authMiddleware from '../../../middlewares/authMiddleware';
import { applyCors } from '../../../utils';
import { jsonSuccess, jsonError } from '../../../lib/response';
import User from '../../../models/User';
import ChatMessage from '../../../models/ChatMessage';

const CHAT_ROLES = ['developer', 'hr', 'hr_admin'];

function canAccessChat(role) {
  if (!role) return false;
  const r = (role || '').toLowerCase();
  return r === 'superadmin' || CHAT_ROLES.includes(r);
}

// Developer/superadmin can message any non-base_user. HR/hr_admin can only message developer/superadmin.
function canMessagePartner(myRole, partnerRole) {
  const mine = (myRole || '').toLowerCase();
  const theirs = (partnerRole || '').toLowerCase();
  if (mine === 'developer' || mine === 'superadmin') {
    return theirs !== 'base_user';
  }
  if (mine === 'hr' || mine === 'hr_admin') {
    return theirs === 'developer' || theirs === 'superadmin';
  }
  return false;
}

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;
  await connectDB();
  const user = await authMiddleware(req, res);
  if (!user) return;
  if (!canAccessChat(user.role)) {
    return jsonError(res, 403, 'Chat is only available for developer and HR roles.');
  }

  const myId = user._id;

  if (req.method === 'GET') {
    const withId = req.query.with;
    if (!withId) {
      return jsonError(res, 400, 'Query parameter "with" (user id) is required.');
    }

    const partner = await User.findById(withId).select('_id name email role').lean();
    if (!partner) {
      return jsonError(res, 404, 'User not found.');
    }
    if (!canMessagePartner(user.role, partner.role)) {
      return jsonError(res, 403, 'You cannot chat with this user.');
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const before = req.query.before ? new Date(req.query.before) : null;

    const query = {
      $or: [
        { sender: myId, recipient: partner._id },
        { sender: partner._id, recipient: myId },
      ],
    };
    if (before) query.createdAt = { $lt: before };

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name email')
      .lean();

    const list = messages.reverse().map((m) => ({
      id: m._id.toString(),
      senderId: m.sender._id?.toString() || m.sender.toString(),
      senderName: m.sender?.name || m.sender?.email || 'Unknown',
      recipientId: m.recipient.toString(),
      content: m.content,
      createdAt: m.createdAt,
      readAt: m.readAt,
      sentByMe: m.sender._id?.toString() === myId.toString() || m.sender.toString() === myId.toString(),
    }));

    return jsonSuccess(res, 200, 'Messages retrieved.', {
      messages: list,
      partner: { id: partner._id.toString(), name: partner.name || partner.email, email: partner.email },
    });
  }

  if (req.method === 'POST') {
    const { recipientId, content } = req.body || {};
    if (!recipientId || typeof content !== 'string') {
      return jsonError(res, 400, 'recipientId and content are required.');
    }
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > 5000) {
      return jsonError(res, 400, 'Content must be 1–5000 characters.');
    }

    const recipient = await User.findById(recipientId).select('_id name email role').lean();
    if (!recipient) {
      return jsonError(res, 404, 'Recipient not found.');
    }
    if (!canMessagePartner(user.role, recipient.role)) {
      return jsonError(res, 403, 'You cannot chat with this user.');
    }

    const doc = await ChatMessage.create({
      sender: myId,
      recipient: recipient._id,
      content: trimmed,
    });

    const populated = await ChatMessage.findById(doc._id)
      .populate('sender', 'name email')
      .lean();

    return jsonSuccess(res, 201, 'Message sent.', {
      message: {
        id: populated._id.toString(),
        senderId: populated.sender._id.toString(),
        senderName: populated.sender.name || populated.sender.email,
        recipientId: populated.recipient.toString(),
        content: populated.content,
        createdAt: populated.createdAt,
        readAt: populated.readAt,
        sentByMe: true,
      },
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return jsonError(res, 405, `Method ${req.method} not allowed`);
}
