# Site notebooks

Little Nix + **uv** + Jupyter environment for drafting analysis posts, then rendering them to Astro Markdown. Pattern matches [IASimple](https://github.com/josephbb/IASimple) / [LLMDiscourse](https://github.com/josephbb/LLMDiscourse): Nix pins Python tooling, uv owns the venv + lockfile, PyMC included.

## Quick start

```bash
cd notebooks
nix develop
just setup          # uv sync + register "Site notebooks (uv)" kernel
just lab            # JupyterLab on drafts/
```

In Cursor, pick kernel **Site notebooks (uv)** (or interpreter `notebooks/.venv/bin/python`).

If the kernel fails with a missing `libstdc++` / `ipykernel` error, the venv was built against Nix’s Python. Fix with:

```bash
just setup          # recreates .venv on uv-managed CPython
```

Then reload the window (or re-select the kernel).

Add packages the usual way:

```bash
uv add <package>
just setup          # refresh lock + kernel if needed
```

## Layout

```
notebooks/
  drafts/           # work-in-progress .ipynb
  exported/         # nbconvert scratch (gitignored)
  scripts/          # install-deps, setup-kernel, nb-to-blog
  flake.nix         # Nix shell (python3.12, uv, just, pandoc, quarto)
  _quarto.yml       # Quarto project config (export + inline python)
  pyproject.toml
  uv.lock
  justfile
```

## Notebook → blog

Name drafts `YYYY-MM-DD-slug.ipynb` when you can (date + slug feed the export).

```bash
TITLE='My title' DESCRIPTION='One-line lede' \
  just export drafts/2026-07-17-example.ipynb
```

That writes:

- `src/content/blog/YYYY-MM-DD-slug.md` (Astro frontmatter + Markdown body)
- `public/assets/img/notebooks/<slug>/` for figures

Review the Markdown (tone, frontmatter, image paths), then commit from the site root.

### Quarto: values in markdown cells

Plain Jupyter markdown is static. [Quarto](https://quarto.org/) executes the notebook and expands inline Python in markdown:

```markdown
... around `{python} round(sign_pct, 1)`%
```

Avoid nested quotes inside `` `{python} ...` `` (e.g. f-strings); use `round()` or simple expressions.

`sign_pct` must be defined in a **code cell above** that markdown cell. Preview with execution:

```bash
just preview drafts/2026-06-17-signmag.ipynb   # HTML
just export drafts/2026-06-17-signmag.ipynb    # md → Astro (via nb-to-blog.sh)
```

In Cursor/Jupyter alone you'll still see the raw `` `{python} ...` `` until you `just preview` or `just export`.

### Images already in `public/`

Jupyter does **not** serve Astro URLs like `/assets/img/foo.gif`. From a draft under `drafts/`, point at the file on disk:

```markdown
![alt](../../public/assets/img/dividebyzero.gif)
```

`just lab` sets the server root to the site repo so that path is allowed. On export, `nb-to-blog` rewrites those links to `/assets/...` for the live site.

Alternatively, preview with a code cell (filesystem, not Markdown):

```python
from IPython.display import Image, display
display(Image(filename="../../public/assets/img/dividebyzero.gif"))
```

## Notes

- `just kernel` / `setup-kernel.sh` **unset `UV_PYTHON`** so the Cursor kernel is not tied to the Nix store path (same rationale as IASimple).
- Inside `nix develop`, `UV_PYTHON` points at Nix’s Python 3.12 and `LD_LIBRARY_PATH` includes zlib/libstdc++ for scientific wheels.
