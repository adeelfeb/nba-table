import { applyCors, withErrorHandling } from '../../../../../utils';
import { getJobById } from '../../../../../controllers/loxoController';
import { jsonError } from '../../../../../lib/response';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function handler(req, res) {
  if (applyCors(req, res)) return;

  const { jobId } = req.query || {};

  switch (req.method) {
    case 'GET':
      return getJobById(req, res, Array.isArray(jobId) ? jobId[0] : jobId);
    default:
      res.setHeader('Allow', ['GET', 'OPTIONS']);
      return jsonError(res, 405, `Method ${req.method} not allowed`);
  }
}

export default withErrorHandling(handler);

