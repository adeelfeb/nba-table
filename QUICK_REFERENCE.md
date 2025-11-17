# Quick Reference - Deployment Fixes

## Files Created/Updated

1. ✅ **ecosystem.config.js** - Proper PM2 configuration
2. ✅ **scripts/deploy.sh** - Fixed deployment script
3. ✅ **scripts/rollback.sh** - Fixed rollback script
4. ✅ **DEPLOYMENT_GUIDE.md** - Complete deployment guide

## Key Fixes Applied

### A. PM2 Configuration (ecosystem.config.js)
- ✅ Uses `npm start` command correctly
- ✅ Sets working directory to `/root/proof`
- ✅ Configures port 3000
- ✅ Proper restart policies
- ✅ Log file locations

### B. Deployment Script (deploy.sh)
- ✅ Confirms PROJECT_DIR="/root/proof"
- ✅ Verifies `.next` exists after build
- ✅ 20-second warm-up delay before health check
- ✅ Doesn't delete `.next` if build fails
- ✅ Backups always contain `.next` folder
- ✅ Uses ecosystem.config.js for PM2 management

### C. Rollback Script (rollback.sh)
- ✅ Automatically finds latest backup
- ✅ Restores `.next` folder properly
- ✅ Restores package.json and git commit
- ✅ Restarts PM2 with correct configuration

### D. Health Check Improvements
- ✅ Waits 20 seconds for server startup
- ✅ 5 retries with 5-second intervals
- ✅ Better error logging
- ✅ Shows actual HTTP response
- ✅ Checks PM2 process status first

## Immediate Actions Required

### 1. Copy ecosystem.config.js to Server

```bash
# From your local machine
scp ecosystem.config.js root@your-server:/root/proof/
```

### 2. Reset PM2 on Server

```bash
# SSH into server
ssh root@your-server

# Stop and delete old process
pm2 stop proof-server
pm2 delete proof-server

# Start with ecosystem config
cd /root/proof
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
```

### 3. Verify Setup

```bash
# Check PM2 status
pm2 status

# Should show:
# - name: proof-server
# - status: online
# - script path: should show ecosystem.config.js or npm

# Check if port is listening
lsof -i :3000

# Test health endpoint
curl http://localhost:3000/api/test
```

## Debugging Commands

```bash
# Check PM2 process
pm2 describe proof-server

# Check logs
pm2 logs proof-server --err --lines 20
pm2 logs proof-server --out --lines 20

# Check port
lsof -i :3000
netstat -tulpn | grep 3000

# Test endpoint
curl -v http://localhost:3000/api/test

# Check if .next exists
ls -la /root/proof/.next
```

## Deployment Command

```bash
cd /root/proof
bash scripts/deploy.sh
```

## Rollback Command

```bash
# List backups
bash scripts/rollback.sh list

# Rollback to specific backup
bash scripts/rollback.sh backup-20250101-120000
```

## Validation Checklist

After setup, verify:

- [ ] `pm2 status` shows proof-server as "online"
- [ ] `lsof -i :3000` shows process listening
- [ ] `curl http://localhost:3000/api/test` returns JSON
- [ ] `pm2 describe proof-server` shows correct script path
- [ ] Process uptime is stable (not restarting)
- [ ] `/root/proof/.next` directory exists
- [ ] No errors in `pm2 logs proof-server --err`

## Expected PM2 Output

After fixing, `pm2 describe proof-server` should show:

```
script path: /root/proof/ecosystem.config.js
OR
script path: /usr/bin/npm
script args: start
exec cwd: /root/proof
```

NOT:
```
script path: /usr/bin/npm (without proper cwd)
```

## Troubleshooting

### If health check still fails:

1. Check PM2 logs: `pm2 logs proof-server --err`
2. Check if port is bound: `lsof -i :3000`
3. Check if .next exists: `ls -la /root/proof/.next`
4. Manually test: `cd /root/proof && npm start` (in separate terminal)
5. Check environment variables: `pm2 env proof-server`

### If PM2 shows wrong path:

1. Delete process: `pm2 delete proof-server`
2. Start with ecosystem: `cd /root/proof && pm2 start ecosystem.config.js`
3. Save: `pm2 save`

### If rollback can't find backup:

1. List backups: `ls -la /root/proof-backups/`
2. Check backup contents: `ls -la /root/proof-backups/backup-*/`
3. Use rollback script: `bash scripts/rollback.sh list`

