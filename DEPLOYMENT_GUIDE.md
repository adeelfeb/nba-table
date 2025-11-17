# Deployment Guide - Next.js + PM2 on Ubuntu

## Files Overview

1. **ecosystem.config.js** - PM2 configuration file
2. **scripts/deploy.sh** - Automated deployment script
3. **scripts/rollback.sh** - Manual rollback script

## Initial Setup

### 1. Copy ecosystem.config.js to server

```bash
# On your local machine, copy to server
scp ecosystem.config.js root@your-server:/root/proof/
```

### 2. Setup PM2 with ecosystem file

```bash
# SSH into server
ssh root@your-server

# Navigate to project
cd /root/proof

# Delete old PM2 process if exists
pm2 delete proof-server 2>/dev/null || true

# Start with ecosystem config
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions it outputs
```

## Deployment Commands

### Automated Deployment

```bash
cd /root/proof
bash scripts/deploy.sh
```

### Manual Rollback

```bash
# List available backups
bash scripts/rollback.sh list

# Rollback to specific backup
bash scripts/rollback.sh backup-20250101-120000
```

## Debugging Commands

### Check if server is running

```bash
# Check PM2 status
pm2 status

# Check specific process
pm2 describe proof-server

# Check if port 3000 is in use
lsof -i :3000
# OR
netstat -tulpn | grep 3000
```

### Check logs

```bash
# All logs
pm2 logs proof-server

# Error logs only
pm2 logs proof-server --err

# Output logs only
pm2 logs proof-server --out

# Last 50 lines
pm2 logs proof-server --lines 50

# Real-time logs
pm2 logs proof-server --lines 0
```

### Test health endpoint

```bash
# Simple test
curl http://localhost:3000/api/test

# Verbose test
curl -v http://localhost:3000/api/test

# Test with timeout
curl -m 10 http://localhost:3000/api/test
```

### Check process details

```bash
# PM2 process info
pm2 describe proof-server

# System process info
ps aux | grep node

# Check environment variables
pm2 env proof-server
```

## Reset PM2 (Without Losing Backups)

### Complete Reset

```bash
# Stop all PM2 processes
pm2 stop all

# Delete all processes
pm2 delete all

# Clear PM2 logs (optional)
pm2 flush

# Restart with ecosystem config
cd /root/proof
pm2 start ecosystem.config.js

# Save configuration
pm2 save
```

### Reset Single Process

```bash
# Stop and delete
pm2 stop proof-server
pm2 delete proof-server

# Restart
cd /root/proof
pm2 start ecosystem.config.js

# Save
pm2 save
```

## Validation Checklist

After deployment, verify:

- [ ] PM2 process is running: `pm2 status`
- [ ] Process shows "online" status
- [ ] Port 3000 is listening: `lsof -i :3000`
- [ ] Health endpoint responds: `curl http://localhost:3000/api/test`
- [ ] No errors in logs: `pm2 logs proof-server --err --lines 20`
- [ ] Process uptime is stable (not restarting)
- [ ] `.next` directory exists: `ls -la /root/proof/.next`
- [ ] Git commit matches expected: `cd /root/proof && git log -1`

## Common Issues

### Issue: HTTP 000 (Connection Refused)

**Causes:**
- Server not started
- Wrong port
- Firewall blocking
- Process crashed

**Fix:**
```bash
# Check if process is running
pm2 status

# Check logs for errors
pm2 logs proof-server --err

# Check if port is listening
lsof -i :3000

# Restart process
pm2 restart proof-server
```

### Issue: PM2 Shows Wrong Script Path

**Cause:** PM2 not using ecosystem.config.js

**Fix:**
```bash
# Delete old process
pm2 delete proof-server

# Start with ecosystem config
cd /root/proof
pm2 start ecosystem.config.js

# Save
pm2 save
```

### Issue: Process Keeps Restarting

**Causes:**
- Application error
- Port conflict
- Missing dependencies
- Environment variables

**Fix:**
```bash
# Check error logs
pm2 logs proof-server --err --lines 50

# Check for port conflicts
lsof -i :3000

# Verify dependencies
cd /root/proof
npm install

# Check environment
pm2 env proof-server
```

### Issue: Rollback Can't Find Backup

**Fix:**
```bash
# List backups
ls -la /root/proof-backups/

# Check backup contents
ls -la /root/proof-backups/backup-*/

# Manual rollback
cd /root/proof
bash scripts/rollback.sh list
```

## PM2 Start Command

The correct command to start the server:

```bash
cd /root/proof
pm2 start ecosystem.config.js
```

Or if ecosystem.config.js is not available:

```bash
cd /root/proof
pm2 start npm --name "proof-server" -- start
```

## Environment Variables

Ensure `.env` file exists in `/root/proof/` with:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=production
PORT=3000
```

## File Permissions

Ensure scripts are executable:

```bash
chmod +x /root/proof/scripts/deploy.sh
chmod +x /root/proof/scripts/rollback.sh
```

## Backup Location

Backups are stored in: `/root/proof-backups/`

Each backup contains:
- `.next/` directory (build output)
- `package.json` and `package-lock.json`
- `git-commit.txt` (git commit hash)

