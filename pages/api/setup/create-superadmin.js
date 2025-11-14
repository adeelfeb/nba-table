import { createInitialSuperAdmin } from '../../../controllers/authController';
import { applyCors } from '../../../utils';

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;
  return createInitialSuperAdmin(req, res);
}


