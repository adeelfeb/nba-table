import { applyCors, withErrorHandling } from '../../../utils';
import { jsonError } from '../../../lib/response';
import { getUserFromRequest } from '../../../lib/auth';
import {
  deleteTranscriptByTranscriptId,
  getTranscriptByTranscriptId,
  updateTranscriptByTranscriptId,
} from '../../../controllers/transcriptController';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function handler(req, res) {
  if (await applyCors(req, res)) return;

  const {
    query: { transcriptId },
    method,
  } = req;

  const currentUser = await getUserFromRequest(req);

  switch (method) {
    case 'GET':
      return getTranscriptByTranscriptId(req, res, currentUser, transcriptId);
    case 'PUT':
      return updateTranscriptByTranscriptId(req, res, currentUser, transcriptId);
    case 'DELETE':
      return deleteTranscriptByTranscriptId(req, res, currentUser, transcriptId);
    case 'OPTIONS':
      return res.status(204).end();
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'OPTIONS']);
      return jsonError(res, 405, `Method ${method} not allowed`);
  }
}

export default withErrorHandling(handler);


