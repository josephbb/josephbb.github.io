#!/usr/bin/env bash
# Register a Jupyter kernel for Cursor / JupyterLab.
# Uses uv's managed Python (not Nix store) so the kernel works outside `nix develop`
# (same idea as IASimple/scripts/setup-kernel.sh).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

KERNEL_NAME="site-notebooks"
DISPLAY_NAME="Site notebooks (uv)"

if ! command -v uv >/dev/null 2>&1; then
  echo "uv not found. Run: nix develop" >&2
  exit 1
fi

# Cursor often lacks Nix's LD_LIBRARY_PATH — don't pin the Nix store Python here.
unset UV_PYTHON || true
unset UV_PYTHON_DOWNLOADS || true

uv venv .venv --allow-existing --python 3.12
export UV_PROJECT="$ROOT"

if [ -f uv.lock ]; then
  req="$(mktemp)"
  trap 'rm -f "$req"' EXIT
  uv export --frozen --no-emit-workspace --no-hashes -o "$req"
  uv pip install -r "$req" --python .venv/bin/python
else
  uv lock
  uv sync
fi

uv pip install pip --python .venv/bin/python
.venv/bin/python -c "import ipykernel, pymc, zmq; print('kernel env ok')"

.venv/bin/python -m ipykernel install --user \
  --name "$KERNEL_NAME" \
  --display-name "$DISPLAY_NAME"

echo ""
echo "Kernel registered. In Cursor / Jupyter select:"
echo "  $DISPLAY_NAME"
echo "  interpreter: $ROOT/.venv/bin/python"
if [ -f "$HOME/.local/share/jupyter/kernels/$KERNEL_NAME/kernel.json" ]; then
  cat "$HOME/.local/share/jupyter/kernels/$KERNEL_NAME/kernel.json"
elif [ -f "$HOME/Library/Jupyter/kernels/$KERNEL_NAME/kernel.json" ]; then
  cat "$HOME/Library/Jupyter/kernels/$KERNEL_NAME/kernel.json"
fi
