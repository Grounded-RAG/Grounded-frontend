#!/usr/bin/env bash
set -euo pipefail

API_URL="${NEXT_PUBLIC_API_BASE_URL:-${API_BASE_URL:-}}"

if [ -z "$API_URL" ]; then
  echo "ERROR: Set NEXT_PUBLIC_API_BASE_URL and API_BASE_URL before deploying." >&2
  exit 1
fi

if echo "$API_URL" | grep -Eq 'localhost|127\.0\.0\.1'; then
  echo "ERROR: API URL must not use localhost for remote production: $API_URL" >&2
  exit 1
fi

echo "OK: API URL is $API_URL"
