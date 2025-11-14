#!/bin/bash
# Script to seed default allowed origins (googleweb.uk) into the database

echo "Seeding default allowed origins..."

# Get the base URL from environment or use default
BASE_URL="${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}"

# Make POST request to seed endpoint
curl -X POST "${BASE_URL}/api/setup/seed-allowed-origins" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo "Done!"

