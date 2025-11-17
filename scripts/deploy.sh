#!/bin/bash
# -------------------------------
# deploy.sh - Auto-deploy Proof project with rollback capability
# -------------------------------

set -euo pipefail

# Configuration
PROJECT_DIR="/root/proof"
BACKUP_DIR="/root/proof-backups"
PM2_PROCESS="proof-server"
ECOSYSTEM_FILE="${PROJECT_DIR}/ecosystem.config.js"
HEALTH_CHECK_URL="http://localhost:3000/api/test"
MAX_BACKUPS=5
HEALTH_CHECK_TIMEOUT=10
HEALTH_CHECK_RETRIES=5
STARTUP_WAIT=20

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Create backup
create_backup() {
    local backup_name="backup-$(date +'%Y%m%d-%H%M%S')"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    log "Creating backup: ${backup_name}"
    mkdir -p "${BACKUP_DIR}" "${backup_path}"
    
    # Backup git state
    git -C "${PROJECT_DIR}" rev-parse HEAD > "${backup_path}/git-commit.txt" 2>/dev/null || true
    cp "${PROJECT_DIR}/package.json" "${backup_path}/package.json" 2>/dev/null || true
    cp "${PROJECT_DIR}/package-lock.json" "${backup_path}/package-lock.json" 2>/dev/null || true
    
    # Backup .next if exists
    if [ -d "${PROJECT_DIR}/.next" ]; then
        log "Backing up .next directory..."
        cp -r "${PROJECT_DIR}/.next" "${backup_path}/.next" 2>/dev/null || {
            warn "Failed to backup .next, continuing with git state only"
        }
    else
        warn "No .next directory found, backing up git state only"
    fi
    
    log "Backup created: ${backup_name}"
    echo "${backup_name}"
}

# Find latest backup
find_latest_backup() {
    local backups=($(ls -t "${BACKUP_DIR}" 2>/dev/null | grep "^backup-" || true))
    [ ${#backups[@]} -gt 0 ] && echo "${backups[0]}" || echo ""
}

# Rollback function
rollback() {
    local backup_name=$1
    
    if [ -z "$backup_name" ] || [ ! -d "${BACKUP_DIR}/${backup_name}" ]; then
        warn "Specified backup not found, finding latest..."
        backup_name=$(find_latest_backup)
        if [ -z "$backup_name" ] || [ ! -d "${BACKUP_DIR}/${backup_name}" ]; then
            error "No valid backup found"
            ls -la "${BACKUP_DIR}" 2>/dev/null || true
            return 1
        fi
        log "Using latest backup: ${backup_name}"
    fi
    
    error "Rolling back to: ${backup_name}"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    cd "${PROJECT_DIR}" || return 1
    
    # Restore .next
    if [ -d "${backup_path}/.next" ]; then
        rm -rf "${PROJECT_DIR}/.next"
        cp -r "${backup_path}/.next" "${PROJECT_DIR}/.next"
        log "Restored .next directory"
    fi
    
    # Restore git commit
    if [ -f "${backup_path}/git-commit.txt" ]; then
        local commit_hash=$(cat "${backup_path}/git-commit.txt")
        log "Restoring git commit: ${commit_hash}"
        git checkout "${commit_hash}" 2>/dev/null || warn "Could not restore git commit"
    fi
    
    # Restore package.json if different
    if [ -f "${backup_path}/package.json" ]; then
        if ! cmp -s "${PROJECT_DIR}/package.json" "${backup_path}/package.json"; then
            warn "Restoring package.json from backup"
            cp "${backup_path}/package.json" "${PROJECT_DIR}/package.json"
            cp "${backup_path}/package-lock.json" "${PROJECT_DIR}/package-lock.json" 2>/dev/null || true
            npm install --production=false
        fi
    fi
    
    # Restart PM2
    log "Restarting PM2..."
    if [ -f "${ECOSYSTEM_FILE}" ]; then
        pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js --update-env
    else
        pm2 restart "${PM2_PROCESS}" --update-env || pm2 start "${PM2_PROCESS}" --update-env
    fi
    
    sleep 10
    check_health && log "Rollback successful!" || error "Rollback health check failed"
}

# Health check
check_health() {
    local retries=0
    local max_retries=${HEALTH_CHECK_RETRIES}
    
    log "Checking health at ${HEALTH_CHECK_URL}..."
    
    while [ $retries -lt $max_retries ]; do
        # Check PM2 process
        if ! pm2 describe "${PM2_PROCESS}" > /dev/null 2>&1; then
            warn "PM2 process not running"
            retries=$((retries + 1))
            [ $retries -lt $max_retries ] && sleep 5
            continue
        fi
        
        # Check HTTP endpoint
        local http_code=$(curl -s -o /tmp/hc_response.txt -w "%{http_code}" -m ${HEALTH_CHECK_TIMEOUT} "${HEALTH_CHECK_URL}" 2>&1 || echo "000")
        local response=$(cat /tmp/hc_response.txt 2>/dev/null || echo "")
        
        if [ "$http_code" = "200" ]; then
            if echo "$response" | grep -q '"success"'; then
                log "Health check passed! (HTTP 200)"
                rm -f /tmp/hc_response.txt
                return 0
            else
                warn "Got 200 but unexpected response format"
                log "Response: $(echo "$response" | head -c 200)"
            fi
        else
            warn "Health check failed (HTTP $http_code, attempt $((retries + 1))/$max_retries)"
            if [ -n "$response" ]; then
                log "Response: $(echo "$response" | head -c 200)"
            fi
        fi
        
        retries=$((retries + 1))
        [ $retries -lt $max_retries ] && sleep 5
    done
    
    error "Health check failed after ${max_retries} attempts"
    log "PM2 status:"
    pm2 describe "${PM2_PROCESS}" || true
    log "PM2 error logs (last 10 lines):"
    pm2 logs "${PM2_PROCESS}" --err --lines 10 --nostream || true
    rm -f /tmp/hc_response.txt
    return 1
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups (keeping last ${MAX_BACKUPS})..."
    local backups=($(ls -t "${BACKUP_DIR}" 2>/dev/null | grep "^backup-" || true))
    local count=${#backups[@]}
    
    if [ $count -gt $MAX_BACKUPS ]; then
        for ((i=MAX_BACKUPS; i<count; i++)); do
            rm -rf "${BACKUP_DIR}/${backups[$i]}"
            log "Removed old backup: ${backups[$i]}"
        done
    else
        log "No old backups to clean up"
    fi
}

# Main deployment
main() {
    log "Starting deployment..."
    
    cd "${PROJECT_DIR}" || {
        error "Project directory not found: ${PROJECT_DIR}"
        exit 1
    }
    
    # Create backup
    local current_backup=$(create_backup)
    local current_commit=$(git rev-parse HEAD 2>/dev/null || echo "")
    
    # Pull latest
    log "Pulling latest code..."
    git fetch origin main || {
        error "Failed to fetch"
        [ -n "$current_backup" ] && rollback "$current_backup"
        exit 1
    }
    
    local new_commit=$(git rev-parse origin/main 2>/dev/null || echo "")
    git reset --hard origin/main || {
        error "Failed to reset"
        [ -n "$current_backup" ] && rollback "$current_backup"
        exit 1
    }
    
    # Install dependencies
    log "Installing dependencies..."
    npm install || {
        error "npm install failed"
        [ -n "$current_backup" ] && rollback "$current_backup"
        exit 1
    }
    
    # Build
    log "Building Next.js project..."
    npm run build || {
        error "Build failed"
        [ -n "$current_backup" ] && rollback "$current_backup"
        exit 1
    }
    
    # Verify build
    if [ ! -d "${PROJECT_DIR}/.next" ]; then
        error "Build output (.next) not found"
        [ -n "$current_backup" ] && rollback "$current_backup"
        exit 1
    fi
    
    # Restart PM2
    log "Restarting PM2 process..."
    if [ -f "${ECOSYSTEM_FILE}" ]; then
        pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js --update-env
    else
        pm2 restart "${PM2_PROCESS}" --update-env || {
            warn "PM2 restart failed, trying start..."
            pm2 start "${PM2_PROCESS}" --update-env || {
                error "PM2 start failed"
                [ -n "$current_backup" ] && rollback "$current_backup"
                exit 1
            }
        }
    fi
    
    # Wait for startup
    log "Waiting ${STARTUP_WAIT}s for application to start..."
    sleep ${STARTUP_WAIT}
    
    # Health check
    if ! check_health; then
        error "Health check failed after deployment"
        if [ -n "$current_backup" ]; then
            if rollback "$current_backup"; then
                log "Rollback successful! Previous version running."
                log "Previous commit: ${current_commit}"
                exit 0
            else
                error "Rollback failed"
                exit 1
            fi
        else
            error "No backup available for rollback"
            exit 1
        fi
    fi
    
    log "Deployment successful!"
    log "Deployed commit: ${new_commit}"
    [ -n "$current_backup" ] && log "Backup: ${current_backup}"
    
    cleanup_old_backups
}

main "$@"
