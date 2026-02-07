import { submitValentineReply, getValentineReplyCount } from '../../../controllers/valentineController';
import { applyCors } from '../../../utils';
import { jsonError } from '../../../lib/response';
import { requireDB } from '../../../lib/dbHelper';

export const config = {
  api: {
    bodyParser: { sizeLimit: '1mb' },
  },
};

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;
  const db = await requireDB(res);
  if (!db) return;
  if (req.method === 'GET') return getValentineReplyCount(req, res);
  if (req.method === 'POST') return submitValentineReply(req, res);
  res.setHeader('Allow', ['GET', 'POST']);
  return jsonError(res, 405, `Method ${req.method} not allowed`);
}
