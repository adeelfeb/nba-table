import authMiddleware from '../../../middlewares/authMiddleware';
import { getValentineUrlById, updateValentineUrl, deleteValentineUrl } from '../../../controllers/valentineController';
import { applyCors } from '../../../utils';
import { jsonError } from '../../../lib/response';
import { requireDB } from '../../../lib/dbHelper';

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;
  const db = await requireDB(res);
  if (!db) return;

  const user = await authMiddleware(req, res);
  if (!user) return;

  const { method, query } = req;
  const id = query.id;
  req.query.id = id;

  switch (method) {
    case 'GET':
      return getValentineUrlById(req, res);
    case 'PUT':
    case 'PATCH':
      return updateValentineUrl(req, res);
    case 'DELETE':
      return deleteValentineUrl(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
      return jsonError(res, 405, `Method ${method} not allowed`);
  }
}
