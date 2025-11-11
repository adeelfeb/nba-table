import mongoose from 'mongoose';
import { env } from './config';

// Resolve MongoDB URI with a safe development fallback (prevents startup crashes during dev)
const resolvedUri = env.MONGODB_URI;

if (!resolvedUri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using Mongoose
 * Uses cached connection in development to prevent multiple connections
 * during hot reloads
 * @returns {Promise<mongoose.Connection>}
 */
async function connectDB() {
  // If already connected, return the existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // If connection is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Create connection promise
    cached.promise = mongoose.connect(resolvedUri, opts).then((mongoose) => mongoose);
  }

  try {
    // Wait for connection and cache it
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset promise on error to allow retry
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
