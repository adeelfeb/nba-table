import { requireDB } from '../../../lib/dbHelper';
import User from '../../../models/User';
import authMiddleware from '../../../middlewares/authMiddleware';
import roleMiddleware from '../../../middlewares/roleMiddleware';
import { jsonError, jsonSuccess } from '../../../lib/response';
import { ensureRole } from '../../../lib/roles';
import { applyCors } from '../../../utils';

function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  return /.+@.+\..+/.test(value.trim());
}

const MIN_PASSWORD_LENGTH = 5;

export default async function handler(req, res) {
  const { method } = req;
  if (await applyCors(req, res)) return;
  const db = await requireDB(res);
  if (!db) return;

  switch (method) {
    case 'GET': {
      try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        return jsonSuccess(res, 200, 'Ok', { users });
      } catch (err) {
        return jsonError(res, 500, 'Failed to fetch users', err.message);
      }
    }
    case 'POST': {
      try {
        const user = await authMiddleware(req, res);
        if (!user) return;
        if (!roleMiddleware(['admin', 'superadmin', 'hr', 'hr_admin', 'developer'])(req, res)) return;
        const { name, email, username, password, role } = req.body || {};
        const trimmedName = typeof name === 'string' ? name.trim() : '';
        const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const trimmedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
        const trimmedPassword = typeof password === 'string' ? password.trim() : '';
        const normalizedRole =
          typeof role === 'string' && role.trim() ? role.trim().toLowerCase() : 'base_user';

        const isLovedOneRole = normalizedRole === 'loved_one';

        if (!trimmedName || !trimmedPassword) {
          return jsonError(res, 400, 'Name and password are required');
        }
        
        // For loved_one role, username is required; for others, email is required
        if (isLovedOneRole) {
          if (!trimmedUsername) {
            return jsonError(res, 400, 'Username is required for Loved One role');
          }
          if (trimmedUsername.length < 3) {
            return jsonError(res, 400, 'Username must be at least 3 characters long');
          }
          if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
            return jsonError(res, 400, 'Username can only contain lowercase letters, numbers, and underscores');
          }
          
          // Check if username already exists
          const usernameExists = await User.findOne({ username: trimmedUsername });
          if (usernameExists) return jsonError(res, 409, 'Username already in use');
        } else {
          if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
            return jsonError(res, 400, 'Valid email is required');
          }
          
          // Check if email already exists
          const emailExists = await User.findOne({ email: trimmedEmail });
          if (emailExists) return jsonError(res, 409, 'Email already in use');
        }
        
        if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
          return jsonError(res, 400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
        }

        const roleDoc = await ensureRole(
          normalizedRole,
          `Role created via user creation endpoint: ${normalizedRole}`
        );

        const userData = {
          name: trimmedName,
          password: trimmedPassword,
          role: roleDoc.name,
          roleRef: roleDoc._id,
        };
        
        // Add username or email based on role
        if (isLovedOneRole) {
          userData.username = trimmedUsername;
          // Add email only if provided
          if (trimmedEmail && isValidEmail(trimmedEmail)) {
            userData.email = trimmedEmail;
          } else {
            // Set a placeholder email if not provided (to satisfy schema)
            userData.email = `${trimmedUsername}@lovedone.local`;
          }
          // Mark loved_one users as email verified by default (no email verification needed)
          userData.isEmailVerified = true;
        } else {
          userData.email = trimmedEmail;
        }

        const created = await User.create(userData);

        const safe = {
          id: created._id,
          name: created.name,
          email: created.email,
          username: created.username,
          role: created.role,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        };
        return jsonSuccess(res, 201, 'User created', { user: safe });
      } catch (err) {
        return jsonError(res, 500, 'Failed to create user', err.message);
      }
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST']);
      return jsonError(res, 405, `Method ${method} not allowed`);
    }
  }
}

