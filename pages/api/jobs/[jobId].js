import { applyCors, withErrorHandling } from '../../../utils';
import { jsonError } from '../../../lib/response';
import { getUserFromRequest } from '../../../lib/auth';
import {
  deleteJobByJobId,
  getJobByJobId,
  updateJobByJobId,
} from '../../../controllers/jobController';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function handler(req, res) {
  if (applyCors(req, res)) return;

  const {
    query: { jobId },
    method,
  } = req;

  const currentUser = await getUserFromRequest(req);

  switch (method) {
    case 'GET':
      return getJobByJobId(req, res, currentUser, jobId);
    case 'PUT':
      return updateJobByJobId(req, res, currentUser, jobId);
    case 'DELETE':
      return deleteJobByJobId(req, res, currentUser, jobId);
    case 'OPTIONS':
      return res.status(204).end();
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'OPTIONS']);
      return jsonError(res, 405, `Method ${method} not allowed`);
  }
}

export default withErrorHandling(handler);


