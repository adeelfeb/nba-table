#!/bin/bash
# -------------------------------
# deploy.sh - Auto-deploy Proof project
# -------------------------------

# Exit immediately if a command exits with a non-zero status
set -e

# Project directory (adjust if different)
PROJECT_DIR="/root/proof"

# PM2 process name
PM2_PROCESS="proof-server"

echo "Starting deployment for Proof project..."

# Navigate to project directory
cd "$PROJECT_DIR"

# Pull latest changes from GitHub
echo "Pulling latest code from GitHub..."
git reset --hard
git pull origin main

# Install/update npm dependencies
echo "Installing npm dependencies..."
npm install

# Build the Next.js project
echo "Building Next.js project..."
npm run build

# Restart PM2 process
echo "Restarting PM2 process: $PM2_PROCESS..."
pm2 restart "$PM2_PROCESS" --update-env

echo "Deployment completed successfully!"
