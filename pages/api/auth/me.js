import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
  const user = await getUserFromRequest(req);
  if (!user) return res.status(200).json({ user: null });
  return res.status(200).json({ user });
}


