import { getResolutions, createResolution } from '../../../controllers/resolutionController';
import authMiddleware from '../../../middlewares/authMiddleware';
import { applyCors } from '../../../utils';
import { jsonError } from '../../../lib/response';
import { requireRecaptcha } from '../../../lib/recaptcha';

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;
  
  const user = await authMiddleware(req, res);
  if (!user) return; // authMiddleware handles error response

  const { method } = req;

  switch (method) {
    case 'GET':
      return getResolutions(req, res);
    case 'POST': {
      const ok = await requireRecaptcha(req, res, jsonError);
      if (!ok) return;
      return createResolution(req, res);
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return jsonError(res, 405, `Method ${method} not allowed`);
  }
}

