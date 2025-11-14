import { applyCors, withErrorHandling } from '../../../utils';
import { jsonError } from '../../../lib/response';
import { getUserFromRequest } from '../../../lib/auth';
import {
  deleteVendorByComplianceId,
  getVendorByComplianceId,
  updateVendorByComplianceId,
} from '../../../controllers/vendorController';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function handler(req, res) {
  if (await applyCors(req, res)) return;

  const {
    query: { complianceId },
    method,
  } = req;

  const currentUser = await getUserFromRequest(req);

  switch (method) {
    case 'GET':
      return getVendorByComplianceId(req, res, currentUser, complianceId);
    case 'PUT':
      return updateVendorByComplianceId(req, res, currentUser, complianceId);
    case 'DELETE':
      return deleteVendorByComplianceId(req, res, currentUser, complianceId);
    case 'OPTIONS':
      return res.status(204).end();
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'OPTIONS']);
      return jsonError(res, 405, `Method ${method} not allowed`);
  }
}

export default withErrorHandling(handler);


