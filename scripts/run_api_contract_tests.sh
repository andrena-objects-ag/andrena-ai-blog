#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:8000}"
API_CONTRACTS_NAMESPACE="${API_CONTRACTS_NAMESPACE:-ct_$(date +%Y%m%d%H%M%S)_$RANDOM}"

probe_api() {
  local origin="$1"
  curl --silent --fail --max-time 2 "$origin/api/tags" >/dev/null 2>&1
}

API_BASE_URL="${API_BASE_URL%/}"

if [[ ! "$API_BASE_URL" =~ ^https?://[^/]+$ ]]; then
  echo "API_BASE_URL must be an origin like http://127.0.0.1:8000" >&2
  exit 1
fi

HOST_PORT="${API_BASE_URL#*://}"
HOST="${HOST_PORT%%:*}"

if [[ ! "$HOST" =~ ^(127\.0\.0\.1|localhost)$ ]]; then
  echo "test:api only supports local backends (127.0.0.1 or localhost)." >&2
  echo "Received: API_BASE_URL=$API_BASE_URL" >&2
  exit 1
fi

if ! probe_api "$API_BASE_URL"; then
  echo "No API responded at $API_BASE_URL." >&2
  echo "Start the backend first or set API_BASE_URL to a reachable local origin." >&2
  exit 1
fi

echo "Running API contract tests against: $API_BASE_URL"
echo "API contract namespace: $API_CONTRACTS_NAMESPACE"

tests_status=0
cleanup_status=0

(
  cd "$FRONTEND_DIR"
  API_BASE_URL="$API_BASE_URL" API_CONTRACTS_NAMESPACE="$API_CONTRACTS_NAMESPACE" \
    npm run test:api:playwright
) || tests_status=$?

if ! API_CONTRACTS_NAMESPACE="$API_CONTRACTS_NAMESPACE" \
  "$ROOT_DIR/scripts/cleanup_api_contract_data.sh"; then
  echo "Cleanup failed for namespace: $API_CONTRACTS_NAMESPACE" >&2
  cleanup_status=1
fi

if [[ "$tests_status" -ne 0 ]]; then
  exit "$tests_status"
fi

if [[ "$cleanup_status" -ne 0 ]]; then
  exit "$cleanup_status"
fi
