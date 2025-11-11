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
  const { name, email, password, role } = req.body || {};
  // Validate presence of required fields and provide detailed message
  const missing = [];
  if (!name) missing.push('name');
  if (!email) missing.push('email');
  if (!password) missing.push('password');
  if (missing.length) {
    return jsonError(res, 400, `Missing required field(s): ${missing.join(', ')}`);
  }
  // Minimal email format validation
  const emailOk = typeof email === 'string' && /.+@.+\..+/.test(email);
  if (!emailOk) {
    return jsonError(res, 400, 'Invalid email format');
  }
  // Ensure JWT secret is configured BEFORE creating the user to avoid partial success
  if (!env.JWT_SECRET) {
    console.error('AUTH_SIGNUP_ENV_ERROR', {
      hasJWT: !!env.JWT_SECRET,
      nodeEnv: env.NODE_ENV,
      hasMongoUri: !!env.MONGODB_URI,
    });
    return jsonError(res, 500, 'Server misconfiguration: JWT_SECRET not set');
  }
  try {
    await connectDB();
    // Check existing email
    const existing = await User.findOne({ email });
    if (existing) {
      return jsonError(res, 409, 'Email already registered');
    }
    // Create user (password hashing handled in model pre-save hook)
    const user = await User.create({ name, email, password, role });
    // Generate JWT and set cookie
    const token = signToken({ id: user._id });
    setAuthCookie(res, token);
    const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
    return jsonSuccess(res, 201, 'Signup successful', { user: safeUser, token });
  } catch (err) {
    // Consistent error payload with details
    return jsonError(res, 500, 'Unable to signup', err.message);
  }
}


