# Database Connection Troubleshooting Guide

## Issue: "Database service is currently unavailable"

If you're seeing this error during signup/login, follow these steps:

## Quick Diagnosis

### 1. Check if MongoDB URI is Set

Visit: `http://localhost:3000/api/debug/db-connection`

This will show you:
- Whether `MONGODB_URI` is configured
- Connection status
- Error details (if any)

### 2. Verify Environment Variables

Make sure your `.env.local` file contains:

```env
MONGODB_URI=mongodb://localhost:27017/your-database-name
```

Or for MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

### 3. Check MongoDB Service

**For Local MongoDB:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Or on macOS
brew services list | grep mongodb

# Start MongoDB if not running
sudo systemctl start mongod
# Or on macOS
brew services start mongodb-community
```

**For MongoDB Atlas:**
- Verify your IP is whitelisted in Atlas dashboard
- Check your connection string is correct
- Verify your username/password

## Common Error Codes

### `NO_DB_URI`
**Problem**: `MONGODB_URI` environment variable is not set

**Solution**:
1. Create or update `.env.local` file
2. Add: `MONGODB_URI=your-connection-string`
3. Restart your development server

### `CONNECTION_TIMEOUT`
**Problem**: Cannot connect to MongoDB server within 3 seconds

**Possible Causes**:
- MongoDB server is not running
- Network connectivity issues
- Firewall blocking connection
- Wrong host/port in connection string

**Solution**:
1. Verify MongoDB is running: `sudo systemctl status mongod`
2. Check connection string format
3. Test connection: `mongosh "your-connection-string"`
4. Check firewall settings

### `DNS_RESOLUTION_FAILED`
**Problem**: Cannot resolve the database hostname

**Possible Causes**:
- Invalid hostname in connection string
- Network/DNS issues
- MongoDB Atlas cluster URL is incorrect

**Solution**:
1. Verify the hostname in your connection string
2. Test DNS resolution: `nslookup your-mongodb-host`
3. For Atlas, verify cluster URL in dashboard

### `AUTHENTICATION_FAILED`
**Problem**: Invalid username/password

**Solution**:
1. Verify credentials in MongoDB Atlas dashboard
2. Check if user exists and has proper permissions
3. Reset password if needed

## Connection Timeout Improvements

The connection now:
- Times out after **3 seconds** (reduced from 5 seconds)
- Provides detailed error messages
- Logs errors for debugging
- Fails fast to prevent long waits

## Testing Connection

### Method 1: Debug Endpoint
```bash
curl http://localhost:3000/api/debug/db-connection
```

### Method 2: Direct MongoDB Test
```bash
# For local MongoDB
mongosh mongodb://localhost:27017/your-database

# For MongoDB Atlas
mongosh "your-atlas-connection-string"
```

### Method 3: Check Server Logs
Look for error messages in your terminal:
```
Database connection failed: {
  code: 'CONNECTION_TIMEOUT',
  message: '...',
  hasUri: true
}
```

## Quick Fixes

### Fix 1: Restart Development Server
```bash
# Stop server (Ctrl+C)
# Then restart
npm run dev
```

### Fix 2: Clear Connection Cache
The connection is cached. If you changed `MONGODB_URI`, restart the server.

### Fix 3: Verify .env.local File
```bash
# Check if file exists
ls -la .env.local

# View contents (be careful with secrets)
cat .env.local | grep MONGODB_URI
```

## Production Deployment

For production, ensure:
1. `MONGODB_URI` is set in your hosting platform's environment variables
2. MongoDB server is accessible from your hosting platform
3. IP whitelist includes your hosting platform's IPs (for Atlas)
4. Connection string uses proper authentication

## Still Having Issues?

1. Check server logs for detailed error messages
2. Verify MongoDB is accessible from your network
3. Test connection string directly with `mongosh`
4. Check firewall/security group settings
5. Verify MongoDB version compatibility

## Performance Notes

- Connection timeout: **3 seconds** (fast failure)
- Connection pooling: Enabled (1-10 connections)
- Idle timeout: **30 seconds**
- Automatic retry: Enabled (on next request)

