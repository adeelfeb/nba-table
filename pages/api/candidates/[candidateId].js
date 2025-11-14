import { applyCors, withErrorHandling } from '../../../utils';
import { jsonError } from '../../../lib/response';
import { getUserFromRequest } from '../../../lib/auth';
import {
  getCandidate,
  updateCandidate,
  deleteCandidate,
} from '../../../controllers/candidateController';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function handler(req, res) {
  if (await applyCors(req, res)) return;

  const currentUser = await getUserFromRequest(req);

  // Extract candidateId from query (Next.js dynamic route)
  // Next.js passes dynamic routes as req.query.[paramName] 
  const { candidateId } = req.query;
  if (!candidateId) {
    return jsonError(res, 400, 'candidateId is required');
  }
  // Pass candidateId to controller functions via query
  req.query.candidateId = candidateId;

  switch (req.method) {
    case 'GET':
      return getCandidate(req, res, currentUser);
    case 'PUT':
      return updateCandidate(req, res, currentUser);
    case 'DELETE':
      return deleteCandidate(req, res, currentUser);
    case 'OPTIONS':
      return res.status(204).end();
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'OPTIONS']);
      return jsonError(res, 405, `Method ${req.method} not allowed`);
  }
}

export default withErrorHandling(handler);

