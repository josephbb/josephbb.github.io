#!/usr/bin/env bash
# Install locked deps into ./.venv (IASimple-style; works inside a parent uv workspace).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export UV_PROJECT="$ROOT"

if ! command -v uv >/dev/null 2>&1; then
  echo "uv not found. Run: nix develop" >&2
  exit 1
fi

test -d .venv || uv venv .venv

if [ -f uv.lock ]; then
  req="$(mktemp)"
  trap 'rm -f "$req"' EXIT
  uv export --frozen --no-emit-workspace --no-hashes -o "$req"
  uv pip install -r "$req" --python .venv/bin/python
else
  echo "No uv.lock yet — running uv lock && uv sync"
  uv lock
  uv sync
fi

.venv/bin/python -c "import numpy, ipykernel, jupyter, pymc; print('Python env ready')"
