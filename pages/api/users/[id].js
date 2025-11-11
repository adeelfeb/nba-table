import connectDB from '../../../lib/db';
import User from '../../../models/User';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const { method, query: { id } } = req;
  await connectDB();

  switch (method) {
    case 'GET': {
      try {
        const user = await User.findById(id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json({ user });
      } catch (err) {
        return res.status(500).json({ message: 'Failed to fetch user', error: err.message });
      }
    }
    case 'PUT': {
      try {
        const currentUser = await getUserFromRequest(req);
        if (!currentUser) return res.status(401).json({ message: 'Unauthorized' });
        const update = req.body || {};
        // Prevent role changes unless admin
        if (update.role && currentUser.role !== 'admin') delete update.role;
        if (update.password) delete update.password; // Use dedicated password change flow if needed
        const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json({ user });
      } catch (err) {
        return res.status(500).json({ message: 'Failed to update user', error: err.message });
      }
    }
    case 'DELETE': {
      try {
        const currentUser = await getUserFromRequest(req);
        if (!currentUser || currentUser.role !== 'admin') {
          return res.status(403).json({ message: 'Forbidden' });
        }
        const user = await User.findByIdAndDelete(id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json({ user });
      } catch (err) {
        return res.status(500).json({ message: 'Failed to delete user', error: err.message });
      }
    }
    default: {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Method ${method} not allowed` });
    }
  }
}


