import { getDBConnection } from '../../../lib/dbHelper';
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

const EMPTY_CONVERSATIONS = { conversations: [], totalUnread: 0 };

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  const { connected } = await getDBConnection();
  if (!connected) {
    return jsonSuccess(res, 200, 'Conversations retrieved.', EMPTY_CONVERSATIONS);
  }

  await connectDB();
  const user = await authMiddleware(req, res);
  if (!user) return;
  if (!canAccessChat(user.role)) {
    return jsonError(res, 403, 'Chat is only available for developer and HR roles.');
  }

  try {
    const myId = user._id;
    const myRole = (user.role || '').toLowerCase();

    // Developer/superadmin: see all users who are NOT base_user. HR/hr_admin: see only developer and superadmin.
    const isDeveloperOrSuperadmin = myRole === 'developer' || myRole === 'superadmin';
    const partnerQuery = {
      _id: { $ne: myId },
      isPaused: { $ne: true },
    };
    if (isDeveloperOrSuperadmin) {
      partnerQuery.role = { $ne: 'base_user' };
    } else {
      partnerQuery.role = { $in: ['developer', 'superadmin'] };
    }

    const partners = await User.find(partnerQuery)
      .select('_id name email role')
      .sort({ name: 1 })
      .lean();

    const partnerIds = partners.map((p) => p._id);

    const [recentMessages, unreadCounts] = await Promise.all([
      ChatMessage.find({
        $or: [
          { sender: myId, recipient: { $in: partnerIds } },
          { sender: { $in: partnerIds }, recipient: myId },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(300)
        .lean(),
      ChatMessage.aggregate([
        { $match: { recipient: myId, readAt: null } },
        { $group: { _id: '$sender', count: { $sum: 1 } } },
      ]),
    ]);

    const lastByPartner = {};
    for (const d of recentMessages) {
      const other = d.sender.toString() === myId.toString() ? d.recipient : d.sender;
      const key = other.toString();
      if (!lastByPartner[key]) {
        lastByPartner[key] = {
          content: d.content,
          createdAt: d.createdAt,
          sentByMe: d.sender.toString() === myId.toString(),
        };
      }
    }

    const unreadBySender = {};
    for (const u of unreadCounts) {
      unreadBySender[u._id.toString()] = u.count;
    }

    const list = partners.map((p) => {
      const id = p._id.toString();
      const last = lastByPartner[id];
      return {
        id,
        name: p.name || p.email || 'Unknown',
        email: p.email || null,
        role: p.role || null,
        lastMessage: last ? last.content : null,
        lastMessageAt: last ? last.createdAt : null,
        lastSentByMe: last ? last.sentByMe : null,
        unreadCount: unreadBySender[id] || 0,
      };
    });

    const totalUnread = Object.values(unreadBySender).reduce((a, b) => a + b, 0);

    return jsonSuccess(res, 200, 'Conversations retrieved.', {
      conversations: list,
      totalUnread,
    });
  } catch (err) {
    console.error('Chat conversations error:', err);
    return jsonError(res, 500, 'Failed to load conversations.', err.message);
  }
}
