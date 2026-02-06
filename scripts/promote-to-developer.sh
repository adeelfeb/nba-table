#!/usr/bin/env bash
#
# Promote a user to developer role by email.
# Usage: ./scripts/promote-to-developer.sh
#        (prompts for email)
#
# For deployment/SSH: run from project root. Requires Node.js and MONGODB_URI in .env
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

echo "Enter the email of the user to promote to developer:"
read -r EMAIL
if [ -z "${EMAIL}" ]; then
  echo "Error: Email is required." >&2
  exit 1
fi

node scripts/promote-to-developer.js "${EMAIL}"
