import { login } from '../../../controllers/authController';
import { jsonError } from '../../../lib/response';
import { applyCors } from '../../../utils';
import { requireRecaptcha } from '../../../lib/recaptcha';

export default async function handler(req, res) {
  if (await applyCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }
  const ok = await requireRecaptcha(req, res, jsonError);
  if (!ok) return;
  return login(req, res);
}

