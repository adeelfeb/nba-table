import { applyCors, withErrorHandling } from '../../../../utils';
import { getStagingIds } from '../../../../controllers/loxoController';
import { jsonError } from '../../../../lib/response';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function handler(req, res) {
  if (await applyCors(req, res)) return;

  switch (req.method) {
    case 'GET':
      return getStagingIds(req, res);
    default:
      res.setHeader('Allow', ['GET', 'OPTIONS']);
      return jsonError(res, 405, `Method ${req.method} not allowed`);
  }
}

export default withErrorHandling(handler);

