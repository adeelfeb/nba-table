import { applyCors, withErrorHandling } from '../../../../../../utils';
import { getAllCandidatesInAJob } from '../../../../../../controllers/loxoController';
import { jsonError } from '../../../../../../lib/response';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function handler(req, res) {
  if (applyCors(req, res)) return;

  const { jobId } = req.query || {};
  const resolvedJobId = Array.isArray(jobId) ? jobId[0] : jobId;

  switch (req.method) {
    case 'GET':
      return getAllCandidatesInAJob(req, res, resolvedJobId);
    default:
      res.setHeader('Allow', ['GET', 'OPTIONS']);
      return jsonError(res, 405, `Method ${req.method} not allowed`);
  }
}

export default withErrorHandling(handler);

