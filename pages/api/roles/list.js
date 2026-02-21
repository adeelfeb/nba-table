import authMiddleware from '../../../middlewares/authMiddleware';
import roleMiddleware from '../../../middlewares/roleMiddleware';
import { listRoles } from '../../../controllers/roleController';
import { jsonError, jsonSuccess } from '../../../lib/response';
import { applyCors } from '../../../utils';
import { getDBConnection } from '../../../lib/dbHelper';

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  const { connected } = await getDBConnection();
  if (!connected) {
    return jsonSuccess(res, 200, 'Ok', { roles: [] });
  }

  const user = await authMiddleware(req, res);
  if (!user) return;
  if (!roleMiddleware([])(req, res)) return;
  return listRoles(req, res);
}


