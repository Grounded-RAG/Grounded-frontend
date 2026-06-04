#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:3015}"
CONTAINER="${2:-grounded-portal-app-dev}"

echo "==> Container environment"
docker exec "$CONTAINER" printenv | grep -E '^(API_BASE_URL|NEXT_PUBLIC_API_BASE_URL|PORT)=' || {
  echo "ERROR: Container $CONTAINER is not running or env vars are missing." >&2
  exit 1
}

echo "==> CSS artifacts inside container"
CSS_COUNT="$(docker exec "$CONTAINER" sh -c 'find .next/static -name "*.css" 2>/dev/null | wc -l' | tr -d ' ')"
if [ "${CSS_COUNT:-0}" -eq 0 ]; then
  echo "ERROR: No CSS files under .next/static in the container." >&2
  exit 1
fi
echo "OK: Found ${CSS_COUNT} CSS file(s)"

echo "==> /login HTML"
HTML="$(curl -sf "${BASE_URL}/login")"

if ! echo "$HTML" | grep -q 'rel="stylesheet"'; then
  echo "ERROR: /login HTML has no stylesheet link (CSS will not load in the browser)." >&2
  exit 1
fi
echo "OK: Stylesheet link present"

if ! echo "$HTML" | grep -q '__GROUNDED_API_BASE_URL__'; then
  echo "ERROR: Runtime API config script is missing from /login HTML." >&2
  exit 1
fi
echo "OK: Runtime API config script present"

PAGE_HOST="$(echo "$BASE_URL" | sed -E 's|https?://([^:/]+).*|\1|')"
if ! echo "$PAGE_HOST" | grep -Eq 'localhost|127\.0\.0\.1'; then
  if echo "$HTML" | grep -q '__GROUNDED_API_BASE_URL__="http://localhost:8000"'; then
    echo "ERROR: API URL is still localhost:8000 while the app is served remotely." >&2
    exit 1
  fi
fi

echo "==> Deploy health checks passed"
