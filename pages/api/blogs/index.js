import { getDBConnection, requireDB } from '../../../lib/dbHelper';
import authMiddleware from '../../../middlewares/authMiddleware';
import { getAllBlogs, createBlog } from '../../../controllers/blogController';
import { applyCors } from '../../../utils';
import { jsonError, jsonSuccess } from '../../../lib/response';
import { requireRecaptcha } from '../../../lib/recaptcha';

const EMPTY_BLOGS_RESPONSE = {
  blogs: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
};

export default async function handler(req, res) {
  const { method } = req;
  if (await applyCors(req, res)) return;

  const { connected } = await getDBConnection();
  if (!connected && method === 'GET') {
    return jsonSuccess(res, 200, 'Blogs retrieved', EMPTY_BLOGS_RESPONSE);
  }
  if (!connected) {
    return jsonError(res, 503, 'Database service is currently unavailable. Please try again later.');
  }

  const db = await requireDB(res);
  if (!db) return;

  switch (method) {
    case 'GET':
      return getAllBlogs(req, res);
    
    case 'POST': {
      const user = await authMiddleware(req, res);
      if (!user) return;
      const ok = await requireRecaptcha(req, res, jsonError);
      if (!ok) return;
      return createBlog(req, res);
    }
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }
}














