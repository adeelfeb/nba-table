import { applyCors, withErrorHandling } from '../../utils';
import { jsonError, jsonSuccess } from '../../lib/response';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function handler(req, res) {
  if (await applyCors(req, res)) return;

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  return jsonSuccess(res, 200, 'jobComplete endpoint stub', {
    message: 'TODO: implement job completion workflow',
  });
}

export default withErrorHandling(handler);


