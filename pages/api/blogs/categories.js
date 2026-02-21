import { getDBConnection, requireDB } from '../../../lib/dbHelper';
import { getCategories } from '../../../controllers/blogController';
import { applyCors } from '../../../utils';
import { jsonSuccess } from '../../../lib/response';

export default async function handler(req, res) {
  const { method } = req;
  if (await applyCors(req, res)) return;

  const { connected } = await getDBConnection();
  if (!connected && method === 'GET') {
    return jsonSuccess(res, 200, 'Categories retrieved', { categories: [] });
  }
  if (!connected) {
    return res.status(503).json({ success: false, message: 'Database service is currently unavailable.' });
  }

  const db = await requireDB(res);
  if (!db) return;

  // Categories endpoint is public
  if (method === 'GET') {
    return getCategories(req, res);
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
}

