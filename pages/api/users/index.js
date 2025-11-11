import connectDB from '../../../lib/db';
import User from '../../../models/User';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const { method } = req;
  await connectDB();

  switch (method) {
    case 'GET': {
      try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        return res.status(200).json({ users });
      } catch (err) {
        return res.status(500).json({ message: 'Failed to fetch users', error: err.message });
      }
    }
    case 'POST': {
      try {
        const currentUser = await getUserFromRequest(req);
        if (!currentUser || currentUser.role !== 'admin') {
          return res.status(403).json({ message: 'Forbidden' });
        }
        const { name, email, password, role } = req.body || {};
        if (!name || !email || !password) {
          return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ message: 'Email already in use' });
        const user = await User.create({ name, email, password, role });
        const safe = { id: user._id, name: user.name, email: user.email, role: user.role };
        return res.status(201).json({ user: safe });
      } catch (err) {
        return res.status(500).json({ message: 'Failed to create user', error: err.message });
      }
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: `Method ${method} not allowed` });
    }
  }
}


