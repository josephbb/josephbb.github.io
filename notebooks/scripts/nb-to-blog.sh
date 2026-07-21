#!/usr/bin/env bash
# Convert a draft notebook → Astro blog Markdown (+ figures under public/).
#
# Usage:
#   ./scripts/nb-to-blog.sh drafts/my-analysis.ipynb
#   TITLE="My title" DESCRIPTION="One liner" ./scripts/nb-to-blog.sh drafts/x.ipynb
#
# Writes:
#   ../src/content/blog/YYYY-MM-DD-<slug>.md
#   ../public/assets/img/notebooks/<slug>/   (nbconvert media)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_ROOT="$(cd "$ROOT/.." && pwd)"
cd "$ROOT"

if [ $# -lt 1 ]; then
  echo "Usage: $0 drafts/some-notebook.ipynb" >&2
  exit 1
fi

NB="$(realpath "$1")"
if [ ! -f "$NB" ]; then
  echo "Notebook not found: $1" >&2
  exit 1
fi

BASE="$(basename "$NB" .ipynb)"
# Prefer leading YYYY-MM-DD- in the filename; otherwise use today.
if [[ "$BASE" =~ ^([0-9]{4}-[0-9]{2}-[0-9]{2})-(.+)$ ]]; then
  DATE="${BASH_REMATCH[1]}"
  SLUG="${BASH_REMATCH[2]}"
else
  DATE="$(date +%F)"
  SLUG="$BASE"
fi

TITLE="${TITLE:-}"
DESCRIPTION="${DESCRIPTION:-}"
TAGS="${TAGS:-}"

OUT_DIR="$ROOT/exported/$SLUG"
BLOG_MD="$SITE_ROOT/src/content/blog/${DATE}-${SLUG}.md"
ASSET_DIR="$SITE_ROOT/public/assets/img/notebooks/$SLUG"
ASSET_URL="/assets/img/notebooks/$SLUG"

mkdir -p "$OUT_DIR" "$ASSET_DIR"

if [ ! -x .venv/bin/python ]; then
  ./scripts/install-deps.sh
fi

if ! command -v quarto >/dev/null 2>&1; then
  echo "quarto not found. Run: nix develop" >&2
  exit 1
fi

# Avoid nix-shell temp dirs disappearing mid-execute (PyMC/Quarto tempfile errors).
export TMPDIR="${TMPDIR:-/tmp}"

# gfm preserves citation brackets better than markdown_strict.
quarto render "$NB" --to gfm --output-dir "$OUT_DIR" --execute

# Quarto keeps path segments under output-dir (e.g. exported/slug/drafts/foo.md).
MD_SRC="$(find "$OUT_DIR" -name "${BASE}.md" -type f | head -1)"
if [ -z "$MD_SRC" ] || [ ! -f "$MD_SRC" ]; then
  echo "Quarto did not produce ${BASE}.md under $OUT_DIR" >&2
  exit 1
fi
FILES_DIR="$(find "$OUT_DIR" -type d -name "${BASE}_files" | head -1)"

# Prefer notebook H1 as the post title when TITLE wasn't passed.
if [ -z "$TITLE" ]; then
  TITLE="$(perl -ne 'if (/^#\s+(.+)$/) { print $1; exit }' "$MD_SRC")"
  TITLE="${TITLE:-$SLUG}"
fi

# Astro template already renders title (+ optional lede). Drop Quarto's leading H1
# so the heading isn't duplicated on the page.
perl -i -0pe 's/\A(?:---[\s\S]*?---\s*)?#\s+[^\n]+\n+//' "$MD_SRC"

# Move media into the site public tree and rewrite links.
if [ -n "$FILES_DIR" ] && [ -d "$FILES_DIR" ]; then
  cp -a "$FILES_DIR"/. "$ASSET_DIR"/
  # quarto emits: ![..](basename_files/...) (may include figure-*/...)
  sed -i.bak -E "s|\(${BASE}_files/|(${ASSET_URL}/|g" "$MD_SRC"
  rm -f "${MD_SRC}.bak"
fi

# Notebook-relative links into public/ → site-root URLs for Astro.
# Markdown: ![](../../public/assets/...) and HTML: src="../../public/assets/..."
perl -i -pe \
  's|\((\.\./)+public(/assets/[^)]+)\)|($2|g; s|(src=["'\''])(\.\./)+public(/assets/[^"'\''>]+)|$1$3|g' \
  "$MD_SRC"

# Pandoc often escapes citation brackets: [\[1\]](#ref-1) / <strong>\[1\]</strong>
# Unescape, then rewrite in-text cites to HTML so Astro shows [1] (not bare 1).
perl -i -pe \
  's/\[\\\[(\d+)\\\]\]\((#ref-\d+)\)/[$1]($2)/g; s/\\\[(\d+)\\\]/[$1]/g' \
  "$MD_SRC"
perl -i -pe \
  's/\[\[(\d+)\]\]\((#ref-\d+)\)/<a href="$2">[$1]<\/a>/g; s/(?<!! )\[(\d+)\]\((#ref-\d+)\)/<a href="$2">[$1]<\/a>/g' \
  "$MD_SRC"

# Drop Jupyter widget stubs (PyMC progress Output()) and empty rich-pre dumps.
perl -i -0pe \
  's/(^|\n)[ \t]*Output\(\)[ \t]*\n//g; s/<pre[^>]*>\s*<\/pre>\n?//g' \
  "$MD_SRC"

# Normalize ``` python → ```python and wrap source fences in foldable <details>.
# Prefer $$ display math in notebooks: Quarto GFM drops \begin{align}…\end{align}.
python3 - "$MD_SRC" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text()
# Avoid double-wrapping on re-export.
if "<details markdown=\"1\">" in text and "Python model + plot code" in text:
    path.write_text(re.sub(r"```\s+python\n", "```python\n", text))
    raise SystemExit(0)

def wrap(match: re.Match[str]) -> str:
    body = match.group(0)
    body = re.sub(r"^```\s*python\n", "```python\n", body)
    return (
        '<details markdown="1">\n'
        "<summary>Python model + plot code</summary>\n\n"
        f"{body}"
        "</details>\n\n"
    )

text2, n = re.subn(r"```\s*python\n.*?```\n", wrap, text, count=1, flags=re.S)
if n == 0:
    text2 = re.sub(r"```\s+python\n", "```python\n", text)
path.write_text(text2)
PY

{
  echo "---"
  echo "title: '$(printf "%s" "$TITLE" | sed "s/'/''/g")'"
  echo "date: $DATE"
  echo "description: '$(printf "%s" "$DESCRIPTION" | sed "s/'/''/g")'"
  if [ -n "$TAGS" ]; then
    echo "tags:"
    # shellcheck disable=SC2086
    for t in $TAGS; do
      echo "  - $t"
    done
  else
    echo "tags: []"
  fi
  echo "---"
  echo ""
  cat "$MD_SRC"
} >"$BLOG_MD"

echo "Wrote $BLOG_MD"
if [ -d "$FILES_DIR" ]; then
  echo "Figures → $ASSET_DIR"
fi
echo "Review the Markdown, then commit when ready."
