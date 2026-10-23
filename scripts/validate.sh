#!/usr/bin/env bash
# Valida um bundle contra o perfil OKF BOSUN. Uso: ./scripts/validate.sh ./okf [--graph]
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
py="$(command -v python3 || command -v python || true)"
[ -n "$py" ] || { echo "python 3 não encontrado" >&2; exit 2; }
exec "$py" -I "$here/okf_validate.py" "${1:-./okf}" "${@:2}"
