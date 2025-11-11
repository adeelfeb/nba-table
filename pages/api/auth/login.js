import connectDB from '../../../lib/db';
import User from '../../../models/User';
import { signToken, setAuthCookie } from '../../../lib/auth';
import { jsonError, jsonSuccess } from '../../../lib/response';
import { env } from '../../../lib/config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }
  const { email, password } = req.body || {};
  // Validate presence
  const missing = [];
  if (!email) missing.push('email');
  if (!password) missing.push('password');
  if (missing.length) {
    return jsonError(res, 400, `Missing required field(s): ${missing.join(', ')}`);
  }
  try {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return jsonError(res, 401, 'Email not found');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return jsonError(res, 401, 'Invalid password');
    }
    if (!env.JWT_SECRET) {
      // Log debug info on the server; does not expose secret value
      console.error('AUTH_LOGIN_ENV_ERROR', {
        hasJWT: !!env.JWT_SECRET,
        nodeEnv: env.NODE_ENV,
        hasMongoUri: !!env.MONGODB_URI,
      });
      return jsonError(res, 500, 'Server misconfiguration: JWT_SECRET not set');
    }
    const token = signToken({ id: user._id });
    setAuthCookie(res, token);
    const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role };
    return jsonSuccess(res, 200, 'Login successful', { user: safeUser, token });
  } catch (err) {
    return jsonError(res, 500, 'Login failed', err.message);
  }
}


