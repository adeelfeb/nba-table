#!/bin/bash
# -------------------------------
# rollback.sh - Manual rollback script for Proof project
# -------------------------------

# Configuration
PROJECT_DIR="/root/proof"
BACKUP_DIR="/root/proof-backups"
PM2_PROCESS="proof-server"
HEALTH_CHECK_URL="http://localhost:3000/api/test"
HEALTH_CHECK_TIMEOUT=30
HEALTH_CHECK_RETRIES=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to check application health
check_health() {
    local retries=0
    local max_retries=${HEALTH_CHECK_RETRIES}
    
    log "Checking application health at ${HEALTH_CHECK_URL}..."
    
    while [ $retries -lt $max_retries ]; do
        if curl -f -s -m ${HEALTH_CHECK_TIMEOUT} "${HEALTH_CHECK_URL}" > /dev/null 2>&1; then
            log "Health check passed!"
            return 0
        fi
        
        retries=$((retries + 1))
        if [ $retries -lt $max_retries ]; then
            warn "Health check failed (attempt ${retries}/${max_retries}), retrying in 5 seconds..."
            sleep 5
        fi
    done
    
    error "Health check failed after ${max_retries} attempts"
    return 1
}

# Function to rollback to a specific backup
rollback_to_backup() {
    local backup_name=$1
    
    if [ -z "$backup_name" ]; then
        error "Backup name is required"
        return 1
    fi
    
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    if [ ! -d "$backup_path" ]; then
        error "Backup not found: ${backup_name}"
        return 1
    fi
    
    log "Rolling back to backup: ${backup_name}"
    
    cd "${PROJECT_DIR}" || {
        error "Project directory not found: ${PROJECT_DIR}"
        return 1
    }
    
    # Restore .next directory
    if [ -d "${backup_path}/.next" ]; then
        rm -rf "${PROJECT_DIR}/.next"
        cp -r "${backup_path}/.next" "${PROJECT_DIR}/.next"
        log "Restored .next directory from backup"
    fi
    
    # Restore node_modules if needed
    if [ -d "${backup_path}/node_modules" ] && [ ! -d "${PROJECT_DIR}/node_modules" ]; then
        log "Restoring node_modules from backup"
        cp -r "${backup_path}/node_modules" "${PROJECT_DIR}/node_modules"
    fi
    
    # Restore package files if they differ
    if [ -f "${backup_path}/package.json" ]; then
        if ! cmp -s "${PROJECT_DIR}/package.json" "${backup_path}/package.json"; then
            warn "Package.json differs, restoring from backup"
            cp "${backup_path}/package.json" "${PROJECT_DIR}/package.json"
            cp "${backup_path}/package-lock.json" "${PROJECT_DIR}/package-lock.json" 2>/dev/null || true
            log "Running npm install to sync dependencies..."
            npm install --production=false
        fi
    fi
    
    # Restore git commit if available
    if [ -f "${backup_path}/git-commit.txt" ]; then
        local commit_hash=$(cat "${backup_path}/git-commit.txt")
        log "Restoring git commit: ${commit_hash}"
        git checkout "${commit_hash}" 2>/dev/null || warn "Could not restore git commit"
    fi
    
    # Restart PM2 with restored version
    log "Restarting PM2 process..."
    pm2 restart "${PM2_PROCESS}" --update-env || pm2 start "${PM2_PROCESS}" --update-env
    
    # Wait for the process to start
    sleep 10
    
    # Verify rollback
    if check_health; then
        log "Rollback successful! Application is running with backup version."
        return 0
    else
        error "Rollback completed but health check failed."
        return 1
    fi
}

# List available backups
list_backups() {
    info "Available backups:"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        warn "No backups found in ${BACKUP_DIR}"
        return 1
    fi
    
    local backups=($(ls -t "${BACKUP_DIR}" 2>/dev/null | grep "^backup-" || true))
    
    for i in "${!backups[@]}"; do
        local backup="${backups[$i]}"
        local backup_path="${BACKUP_DIR}/${backup}"
        local commit_info=""
        
        if [ -f "${backup_path}/git-commit.txt" ]; then
            commit_info=$(cat "${backup_path}/git-commit.txt" | cut -c1-7)
        fi
        
        local date_info=$(stat -c %y "${backup_path}" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1 || echo "Unknown")
        
        if [ $i -eq 0 ]; then
            echo -e "  ${GREEN}[$((i+1))]${NC} ${backup} ${YELLOW}(LATEST)${NC}"
        else
            echo -e "  ${BLUE}[$((i+1))]${NC} ${backup}"
        fi
        
        if [ -n "$commit_info" ]; then
            echo -e "       Commit: ${commit_info}"
        fi
        echo -e "       Date: ${date_info}"
        echo ""
    done
}

# Main function
main() {
    if [ "$1" == "list" ] || [ -z "$1" ]; then
        list_backups
        echo ""
        info "Usage: $0 <backup-name>"
        info "Example: $0 backup-20250101-120000"
        exit 0
    fi
    
    if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
        echo "Usage: $0 [backup-name|list]"
        echo ""
        echo "Commands:"
        echo "  list              List all available backups"
        echo "  <backup-name>     Rollback to the specified backup"
        echo "  --help, -h        Show this help message"
        echo ""
        exit 0
    fi
    
    rollback_to_backup "$1"
}

main "$@"

