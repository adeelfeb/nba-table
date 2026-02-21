import jwt from 'jsonwebtoken';
import connectDB from '../lib/db';
import User from '../models/User';
import { env } from '../lib/config';
import { jsonError } from '../lib/response';
import { extractTokenFromRequest } from '../lib/auth';
import { ensureUserHasRole } from '../lib/roles';

export default async function authMiddleware(req, res) {
  // Gracefully handle missing auth - don't crash if JWT_SECRET is not set
  const token = extractTokenFromRequest(req);
  if (!token) {
    jsonError(res, 401, 'Authentication required');
    return null;
  }
  if (!env.JWT_SECRET) {
    // Don't return 500 - return 503 (service unavailable) for graceful degradation
    jsonError(res, 503, 'Authentication service unavailable. Please configure JWT_SECRET.');
    return null;
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const dbResult = await connectDB();
    if (!dbResult.success) {
      jsonError(res, 503, 'Database service is currently unavailable. Please try again later.');
      return null;
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      jsonError(res, 401, 'Invalid token');
      return null;
    }
    
    try {
      await ensureUserHasRole(user);
    } catch (roleError) {
      // If role check fails, still allow user (graceful degradation)
      console.warn('[AuthMiddleware] Role check failed:', roleError.message);
    }
    
    req.user = user;
    req.token = token;
    req.jwt = decoded;
    return user;
  } catch (err) {
    // Handle JWT verification errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      jsonError(res, 401, 'Invalid or expired token');
    } else {
      jsonError(res, 500, 'Authentication error', err.message);
    }
    return null;
  }
}


