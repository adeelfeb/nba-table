import authMiddleware from '../../../../middlewares/authMiddleware';
import { changePassword } from '../../../../controllers/userController';
import { jsonError } from '../../../../lib/response';
import { applyCors } from '../../../../utils';

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;

  const user = await authMiddleware(req, res);
  if (!user) return;

  if (req.method === 'POST') {
    return changePassword(req, res);
  }

  res.setHeader('Allow', ['POST']);
  return jsonError(res, 405, `Method ${req.method} not allowed`);
}

