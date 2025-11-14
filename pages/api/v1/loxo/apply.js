import { applyCors, withErrorHandling } from '../../../../utils';
import { applyToLoxoJob } from '../../../../controllers/loxoController';
import { jsonError } from '../../../../lib/response';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function handler(req, res) {
  if (await applyCors(req, res)) return;

  switch (req.method) {
    case 'POST':
      return applyToLoxoJob(req, res);
    default:
      res.setHeader('Allow', ['POST', 'OPTIONS']);
      return jsonError(res, 405, `Method ${req.method} not allowed`);
  }
}

export default withErrorHandling(handler);

