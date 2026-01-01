import connectDB from '../../../lib/db';
import { jsonSuccess, jsonError } from '../../../lib/response';
import { env } from '../../../lib/config';

/**
 * Debug endpoint to check database connection status
 * Useful for troubleshooting connection issues
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  try {
    const hasUri = !!env.MONGODB_URI;
    const uriPreview = env.MONGODB_URI 
      ? `${env.MONGODB_URI.substring(0, 20)}...` 
      : 'Not set';

    const dbResult = await connectDB();
    
    return jsonSuccess(res, 200, 'Database connection status', {
      configured: hasUri,
      uriPreview: uriPreview,
      connected: dbResult.success,
      error: dbResult.error ? {
        message: dbResult.error.message,
        code: dbResult.code,
      } : null,
      connectionState: dbResult.connection?.readyState || 'N/A',
      connectionStates: {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      },
    });
  } catch (error) {
    return jsonError(res, 500, 'Failed to check database connection', error.message);
  }
}

