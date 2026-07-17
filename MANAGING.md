# Managing this website

This is the operator’s manual for [joebakcoleman.com](https://joebakcoleman.com): **what to edit, where it lives, and how it gets online.**

The site is a static Astro site. There is no CMS, no database, and almost no client JavaScript. You change files → build → GitHub Pages serves HTML.

---

## Mental model

| Layer                            | Role                                                                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **YAML in `src/data/`**          | Facts and curated lists (bio, links, essays, selected papers, citation counts)                                                                               |
| **Markdown in `src/content/`**   | Dated writing (news, blog notes)                                                                                                                             |
| **`vendor/cv/`**                 | Copy of [josephbb/CV](https://github.com/josephbb/CV) — publications on the site are driven by active `\nocite{...}` lines in `cv.tex` plus the `.bib` files |
| **`public/`**                    | Files served as-is (CV PDF, portrait, outlet logos, `CNAME`)                                                                                                 |
| **`src/pages/` + `src/styles/`** | Layout and look — change only when you want design/behavior changes                                                                                          |

**Rule of thumb:** update content in YAML/Markdown/`vendor/cv`/`public`. Don’t edit Astro/CSS unless you’re changing how the site works.

---

## One-time setup

Requirements: **Node 22+**, **pnpm** (pinned in `package.json`).

```bash
cd /path/to/josephbb.github.io   # or this PersonalWebsite checkout
corepack enable
pnpm install
pnpm dev
```

Open the URL Astro prints (usually `http://localhost:4321/`).

Useful commands:

| Command                | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `pnpm dev`             | Local preview with hot reload                   |
| `pnpm build`           | Production build into `dist/`                   |
| `pnpm preview`         | Serve `dist/` locally                           |
| `pnpm format`          | Prettier on the repo                            |
| `pnpm enrich:openalex` | Refresh DOI / OA metadata (optional; see below) |

---

## How the site is structured (pages)

| URL              | Purpose                                         | Content sources                                                         |
| ---------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| `/` (About)      | Portrait, name, bio, recent news, selected pubs | `site.yaml`, `socials.yaml`, `content/news/`, `selected.yaml` + CV pubs |
| `/news/`         | Full news list                                  | `content/news/`                                                         |
| `/publications/` | All CV-listed works (Latest / Greatest)         | `vendor/cv` + `citations.yaml` (+ optional OpenAlex)                    |
| `/writing/`      | Published elsewhere + Notes (blog)              | `essays.yaml`, `content/blog/`                                          |
| `/cv/`           | PDF + short summary                             | `public/cv/…`, `site.yaml`, `socials.yaml`                              |

Nav is defined in `src/layouts/BaseLayout.astro`.

**Not in v1 (deferred):** Research themes page, bird photography, teaching, full press/coverage library. Theme Markdown still exists under `src/content/themes/` for later.

---

## Day-to-day: identity and About page

### Bio, job title, affiliations, book

Edit **`src/data/site.yaml`**.

- `bio` uses a **literal** YAML block (`bio: |`) so blank lines become real paragraphs on the About page.
- Do **not** switch `bio` back to folded style (`>`): that collapses paragraphs into one run-on block.
- `book:` is the actual book (_Of Fish and Fascists_) — it is **not** the blog name.
- `affiliations` / `education` feed the CV page summary and (affiliations) the About narrative context.

### Email, Scholar, ORCID, GitHub, CV links

Edit **`src/data/socials.yaml`**.

```yaml
email: …
scholar_userid: … # Google Scholar user id
orcid_id: …
github_username: …
cv_pdf: /cv/BakColemanCV.pdf
cv_repo: https://github.com/josephbb/CV
```

Portrait: replace **`public/images/prof_pic.jpg`**. Keep a sensible landscape headshot; the homepage shows the full frame (no ear-clipping crop).

---

## News

**Folder:** `src/content/news/`  
**One file per item.** Filename is for you; the date in frontmatter controls sort order.

```markdown
---
date: 2025-05-01
---

Joined the University of Washington as a Research Scientist.
```

Optional:

```yaml
date_label: Early 2025 # shown instead of the calendar day when the exact day is fuzzy
title: Optional title # rarely needed; body Markdown is the main text
```

**Rules:**

- Dates are treated as **UTC calendar days** (so `2025-05-01` doesn’t slip to April 30 in US timezones).
- Newest first on About (first 6) and on `/news/`.
- Links, italics, etc. are normal Markdown in the body.
- News is for career/events/coverage pointers — **not** a substitute for essays on Writing or papers on Publications.

---

## Writing → Notes (your blog)

**Folder:** `src/content/blog/`  
**Section on site:** Writing → **Notes**

Frontmatter:

```markdown
---
title: 'Your post title'
date: 2026-07-04
description: One-line summary for the list page.
tags: [stats, metascience]
---

Post body in Markdown / MDX…
```

- Sorted **newest first**.
- URL shape: `/blog/<filename-stem>/` (from the file id Astro assigns).
- This is **not** branded _Of Fish and Fascists_ — that name is reserved for the book.

---

## Writing → Published elsewhere (essays for outlets)

**File:** `src/data/essays.yaml`  
**Logos:** `src/data/outlets.yaml` → images in `public/outlets/`

Each entry:

```yaml
- title: Article title
  outlet: Nature # must match a key in outlets.yaml for a logo
  date: 2025-06-25 # ISO date; list is newest-first
  url: https://…
  blurb: One short sentence.
  # optional:
  image: /writing/my-thumb.jpg # per-piece image instead of outlet logo
  cite_key: BergstromBakColeman2025 # IMPORTANT — see below
```

### `cite_key` (critical)

If a Nature correspondence (or similar) also exists in the CV bib/`\nocite` list, set **`cite_key`** to that BibTeX key.

- It **appears on Writing**.
- It is **automatically omitted from Publications** (and won’t show as “selected” on the homepage).
- It **stays on the CV PDF** if `\nocite` remains in `cv.tex`.

Current examples: `BergstromBakColeman2025`, `bak2023create`.

### New outlet logo

1. Drop a square PNG in `public/outlets/something.png`.
2. Add a line to `outlets.yaml`:

```yaml
Nature: /outlets/nature.png
```

Outlet name in `essays.yaml` must match the key exactly.

---

## Publications

Publications on the website are **not** hand-maintained as a second list. They are built from the CV.

### Source of truth

1. Edit **[josephbb/CV](https://github.com/josephbb/CV)** (preferred): add/update `.bib` entries and `\nocite{key}` in the appropriate `refsection` of `cv.tex`.
2. Sync into this repo’s **`vendor/cv/`** (see below).
3. Rebuild / push.

Only **active** (uncommented) `\nocite{...}` keys inside `\begin{refsection}...\end{refsection}` appear on the site.

### Sync `vendor/cv`

```bash
rm -rf vendor/cv
git clone --depth 1 https://github.com/josephbb/CV.git vendor/cv
rm -rf vendor/cv/.git
```

Commit the updated `vendor/cv` tree with your site changes.

### Cite key aliases

If `\nocite{Foo}` in `cv.tex` doesn’t match the `@article{Bar,` key in a `.bib` file, map it in **`src/data/cite-aliases.yaml`**:

```yaml
Garland2025: garland2026case
```

### Homepage “Selected publications”

**File:** `src/data/selected.yaml` — list of cite keys, **in display order**.

```yaml
- bak2026industry
- bak2025randomized
- Mada2024
```

Keys must exist in the active CV `\nocite` set (and not be excluded via an essay `cite_key`).

### Latest vs Greatest

- **Latest:** by year (from the bib).
- **Greatest:** by citation counts in **`src/data/citations.yaml`**, with OpenAlex counts as a fill-in when present.
- Stats line (count · citations · h-index) also uses that citations snapshot.

Refresh Scholar counts periodically by editing `citations.yaml` (`counts:`, `scholar_ids:`, `last_updated:`). Keys should match CV cite keys (case-insensitive match is used).

### Policy / preprint styling

Driven by CV **section names** and bib fields (e.g. policy notes, arXiv). Prefer fixing the CV/bib over special-casing the website.

### OpenAlex enrichment (DOI + free PDFs)

```bash
pnpm enrich:openalex
```

Pulls your OpenAlex author profile in bulk and writes `src/data/openalex.yaml`. The Publications UI uses that for **Free PDF** / **Open** badges (plus arXiv `eprint` from the CV bib, and policy report URLs).

Re-run after adding papers to the CV. Commit the updated `openalex.yaml`.

---

## CV PDF

1. Build the PDF in the **CV repo**.
2. Copy it to **`public/cv/BakColemanCV.pdf`** (path must match `socials.yaml` → `cv_pdf`).
3. Commit.

The `/cv/` page also shows affiliations/education from `site.yaml` and profile links from `socials.yaml`.

---

## Deploy (go live)

Hosting: **GitHub Pages** via Actions on [`josephbb/josephbb.github.io`](https://github.com/josephbb/josephbb.github.io), custom domain **`joebakcoleman.com`**.

1. Push to **`main`** (this repo’s remote).
2. Workflow: `.github/workflows/deploy.yml`
   - `pnpm install --frozen-lockfile`
   - `pnpm run build`
   - upload `dist/` → GitHub Pages
3. `public/CNAME` must contain `joebakcoleman.com`.
4. In the GitHub repo: **Settings → Pages → Source = GitHub Actions**.

Build also emits **`/sitemap-index.xml`** and **`/robots.txt`**. After deploy, submit `sitemap-index.xml` in [Google Search Console → Sitemaps](https://search.google.com/search-console).

The previous al-folio site is preserved on `archive/al-folio` (source) and `archive/gh-pages-legacy` (built HTML).

**There is no separate Vercel/Netlify step** for this static site; Pages replaces that.

---

## Formatting and style

- Run `pnpm format` before committing if you’ve touched many files.
- Visual design: hand-written CSS in `src/styles/global.css` (Sanzo Wada–inspired tokens). No Tailwind.
- Prettier config: `.prettierrc` (+ Astro plugin). Ignored paths: `dist`, `vendor`, etc. (`.prettierignore`).

---

## Common gotchas

| Symptom                                        | Cause / fix                                                                            |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| About bio is one giant paragraph               | `bio` used `>` instead of `\|` in `site.yaml`                                          |
| Paper appears on both Writing and Publications | Add `cite_key` on the essay entry matching the bib/`\nocite` key                       |
| New paper missing from Publications            | Not `\nocite`’d in active CV section, or `vendor/cv` not synced                        |
| Selected paper missing on homepage             | Key not in `selected.yaml`, or excluded by essay `cite_key`, or missing from CV nocite |
| News date shows wrong day                      | Use `YYYY-MM-DD`; display uses UTC. Or set `date_label`                                |
| Outlet has letter mark, not logo               | Add logo under `public/outlets/` and map it in `outlets.yaml`                          |
| Dev server looks stale after CV edit           | Pubs are read from disk each build; hard-refresh. Touch `publications.ts` if needed    |
| `pnpm install --frozen-lockfile` fails in CI   | Commit an updated `pnpm-lock.yaml` after dependency changes                            |

---

## Checklist: “I published something”

### Academic paper / preprint / policy report

1. Add bib + `\nocite` in **josephbb/CV**; rebuild CV PDF if you distribute it.
2. Sync `vendor/cv`; copy new PDF to `public/cv/` if needed.
3. Optionally add cite counts / Scholar id in `citations.yaml`.
4. If it should be on the homepage: add key to `selected.yaml`.
5. If it’s commentary that belongs on Writing instead: add to `essays.yaml` **with** `cite_key`.

### Op-ed / SciAm / Tech Policy Press / similar

1. Add entry to `essays.yaml` (date, url, blurb, outlet).
2. Ensure outlet logo exists.
3. Add a short news item only if you want it in the news feed too.

### Job / talk / media mention

1. Add `src/content/news/YYYY-….md`.
2. Update `site.yaml` if title/affiliation changed.

### Blog note

1. Add `src/content/blog/….md` with title, date, description.

Then: `pnpm build` locally if you want to verify → commit → push to `main`.

---

## Repo map (quick)

```
src/
  content/
    news/          # News items
    blog/          # Notes
    themes/        # v2 Research (unused in nav)
  data/
    site.yaml      # Identity + bio
    socials.yaml   # Contact + profile ids
    essays.yaml    # Published elsewhere
    outlets.yaml   # Outlet → logo path
    selected.yaml  # Homepage selected cite keys
    citations.yaml # Scholar citation snapshot
    cite-aliases.yaml
    openalex.yaml  # Optional enrich output
  pages/           # Routes
  layouts/
  components/
  styles/global.css
  lib/             # publications.ts, site.ts, dates.ts
public/
  cv/              # BakColemanCV.pdf
  images/          # prof_pic.jpg
  outlets/         # Logos
  CNAME
vendor/cv/         # Vendored josephbb/CV
.github/workflows/deploy.yml
```

---

## v2 backlog (do not build into nav yet)

- Bird photography
- Teaching / proposed courses
- Research themes page (content already in `src/content/themes/`)
- Structured press/coverage library (quotes and stories _about_ you, separate from essays you wrote)
- Notebook → Notes pipeline (e.g. `nbconvert` / Quarto export into `src/content/blog/`, plus a small helper script) — analysis stays in notebooks; the site still publishes static Markdown

---

## When you’re stuck

1. Change the **data file** for that content type (table at the top of this doc).
2. Run `pnpm dev` and check the page.
3. Only then dig into `src/pages/*` or `publications.ts`.

The site is meant to stay boring to maintain: **YAML and Markdown for words, CV repo for the bibliography, git push for deploy.**
