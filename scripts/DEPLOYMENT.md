# Deployment Guide

This document describes the enhanced deployment system with automatic rollback capabilities.

## Features

### Build Optimizations
- **SWC Minification**: Faster than Terser, reduces build time
- **Webpack Filesystem Caching**: Caches build artifacts for faster subsequent builds
- **Optimized Chunk Splitting**: Better code splitting for improved load times
- **Package Import Optimization**: Tree-shaking for ag-grid packages
- **Console Log Removal**: Automatically removes console.log in production (keeps errors/warnings)

### Deployment Features
- **Automatic Backups**: Creates backups before each deployment
- **Health Checks**: Validates deployment success before completing
- **Automatic Rollback**: Reverts to previous version if deployment fails
- **Backup Management**: Keeps last 5 backups, automatically cleans older ones
- **Git Commit Tracking**: Tracks which commit each backup represents

## Usage

### Automatic Deployment

The standard deployment process:

```bash
cd /root/proof
bash scripts/deploy.sh
```

**What happens:**
1. Creates a backup of the current working version
2. Pulls latest code from GitHub
3. Installs dependencies
4. Builds the Next.js application
5. Restarts PM2 process
6. Performs health check
7. If any step fails, automatically rolls back to previous version

### Manual Rollback

If you need to manually rollback to a previous version:

```bash
# List available backups
bash scripts/rollback.sh list

# Rollback to a specific backup
bash scripts/rollback.sh backup-20250101-120000
```

## Configuration

Edit these variables in `scripts/deploy.sh` if needed:

```bash
PROJECT_DIR="/root/proof"              # Project directory
BACKUP_DIR="/root/proof-backups"       # Backup storage location
PM2_PROCESS="proof-server"             # PM2 process name
HEALTH_CHECK_URL="http://localhost:3000/api/test"  # Health check endpoint
MAX_BACKUPS=5                          # Number of backups to keep
HEALTH_CHECK_TIMEOUT=30                # Health check timeout (seconds)
HEALTH_CHECK_RETRIES=3                 # Number of health check retries
```

## Health Check

The deployment script uses `/api/test` endpoint to verify the application is running correctly. Make sure this endpoint:
- Returns a 200 status code when the app is healthy
- Responds within the timeout period
- Is accessible from the server

## Backup Structure

Backups are stored in `/root/proof-backups/` with the following structure:

```
backup-YYYYMMDD-HHMMSS/
├── .next/              # Next.js build output
├── node_modules/       # Dependencies (if needed)
├── package.json        # Package configuration
├── package-lock.json   # Lock file
└── git-commit.txt      # Git commit hash
```

## Troubleshooting

### Deployment Fails and Rollback Doesn't Work

1. Check if backups exist:
   ```bash
   ls -la /root/proof-backups/
   ```

2. Manually rollback:
   ```bash
   bash scripts/rollback.sh list
   bash scripts/rollback.sh <backup-name>
   ```

3. Check PM2 status:
   ```bash
   pm2 status
   pm2 logs proof-server
   ```

### Build Takes Too Long

The build is optimized with:
- Filesystem caching (subsequent builds are faster)
- SWC minification (faster than Terser)
- Optimized webpack configuration

First build will take longer, subsequent builds use cache and are faster.

### Health Check Fails

1. Verify the endpoint is accessible:
   ```bash
   curl http://localhost:3000/api/test
   ```

2. Check if the application is running:
   ```bash
   pm2 status
   pm2 logs proof-server --lines 50
   ```

3. Adjust health check timeout/retries in `deploy.sh` if needed

## Best Practices

1. **Test Before Deploy**: Test changes locally before deploying
2. **Monitor Deployments**: Watch the deployment logs for any issues
3. **Keep Backups**: Don't manually delete backups unless necessary
4. **Health Checks**: Ensure your health check endpoint is reliable
5. **Git Commits**: Make meaningful commits - they're tracked in backups

## Build Performance

The optimized build configuration provides:
- **Faster Builds**: SWC minification and webpack caching
- **Smaller Bundles**: Better code splitting and tree-shaking
- **Better Caching**: Filesystem cache for faster rebuilds
- **Production Optimizations**: Console log removal, compression enabled

Expected build time improvements:
- First build: Similar to before (full compilation)
- Subsequent builds: 30-50% faster (uses cache)
- Production bundles: 10-20% smaller (better optimization)

