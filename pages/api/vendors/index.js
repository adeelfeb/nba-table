import { applyCors, withErrorHandling } from '../../../utils';
import { jsonError } from '../../../lib/response';
import { getUserFromRequest } from '../../../lib/auth';
import { createVendor, listVendors } from '../../../controllers/vendorController';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function handler(req, res) {
  if (await applyCors(req, res)) return;

  const currentUser = await getUserFromRequest(req);

  switch (req.method) {
    case 'GET':
      return listVendors(req, res, currentUser);
    case 'POST':
      return createVendor(req, res, currentUser);
    case 'OPTIONS':
      return res.status(204).end();
    default:
      res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
      return jsonError(res, 405, `Method ${req.method} not allowed`);
  }
}

export default withErrorHandling(handler);


