#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:8000}"

run_manage() {
  if command -v uv >/dev/null 2>&1; then
    uv run --directory "$BACKEND_DIR" python manage.py "$@"
  else
    (
      cd "$BACKEND_DIR"
      python manage.py "$@"
    )
  fi
}

# Try HTTP cleanup endpoint first (works for both Django and Java backends)
cleanup_via_http() {
  local namespace="$1"
  local response
  response=$(curl --silent --fail --max-time 5 \
    -X POST "${API_BASE_URL}/api/_cleanup" \
    -H "Content-Type: application/json" \
    -d "{\"namespace\": \"$namespace\"}" 2>/dev/null) && {
    echo "Namespace: $namespace"
    echo "$response" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f\"Matched users: {d.get('users', '?')}\")
print(f\"Matched articles: {d.get('articles', '?')}\")
print(f\"Matched comments: {d.get('comments', '?')}\")
print(f\"Matched tags: {d.get('tags', '?')}\")
print('API contract data cleanup complete.')
" 2>/dev/null || echo "API contract data cleanup complete."
    return 0
  }
  return 1
}

resolve_namespace() {
  if [[ "$#" -gt 0 ]]; then
    # Parse --namespace <value> from args
    while [[ "$#" -gt 0 ]]; do
      case "$1" in
        --namespace) echo "$2"; return 0 ;;
        *) shift ;;
      esac
    done
  fi
  echo "${API_CONTRACTS_NAMESPACE:-}"
}

namespace=$(resolve_namespace "$@")

if [[ -z "$namespace" ]]; then
  echo "Missing cleanup namespace." >&2
  echo "Set API_CONTRACTS_NAMESPACE or pass args like:" >&2
  echo "  scripts/cleanup_api_contract_data.sh --namespace <value>" >&2
  exit 1
fi

# Try HTTP cleanup first, fall back to Django manage.py
if cleanup_via_http "$namespace"; then
  exit 0
fi

if [[ "$#" -eq 0 ]]; then
  run_manage cleanup_api_contract_data --namespace "$API_CONTRACTS_NAMESPACE"
else
  run_manage cleanup_api_contract_data "$@"
fi
