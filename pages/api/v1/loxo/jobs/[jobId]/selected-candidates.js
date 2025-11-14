import { applyCors, withErrorHandling } from '../../../../../../utils';
import { getSelectedCandidates } from '../../../../../../controllers/loxoController';
import { jsonError } from '../../../../../../lib/response';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function handler(req, res) {
  if (await applyCors(req, res)) return;

  const { jobId } = req.query || {};
  const resolvedJobId = Array.isArray(jobId) ? jobId[0] : jobId;

  switch (req.method) {
    case 'GET':
      return getSelectedCandidates(req, res, resolvedJobId);
    default:
      res.setHeader('Allow', ['GET', 'OPTIONS']);
      return jsonError(res, 405, `Method ${req.method} not allowed`);
  }
}

export default withErrorHandling(handler);

