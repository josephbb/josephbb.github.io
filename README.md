# Joe B. Bak-Coleman — personal academic site

Astro static site for [joebakcoleman.com](https://joebakcoleman.com), built to deploy on GitHub Pages (`josephbb.github.io`).

**How to update content day-to-day:** see [MANAGING.md](./MANAGING.md).

## Stack

- Astro (static HTML)
- Content collections for news, blog (research themes deferred to v2)
- Publications from [josephbb/CV](https://github.com/josephbb/CV) via `vendor/cv` (active `\nocite` keys in `cv.tex`)
- Hand-written CSS with Sanzo Wada–inspired tokens

## Local development

Node 22+ (Corepack will use the pinned `pnpm` from `package.json`):

```bash
corepack enable
pnpm install
pnpm dev
```

Build:

```bash
pnpm build
pnpm preview
```

Format:

```bash
pnpm format
pnpm format:check
```

## Updating content

| What                            | Where                                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| Bio, affiliations, tagline      | `src/data/site.yaml`                                                                            |
| Email, Scholar, ORCID, CV links | `src/data/socials.yaml`                                                                         |
| Homepage selected papers        | `src/data/selected.yaml` (cite keys)                                                            |
| Citation counts (Greatest sort) | `src/data/citations.yaml` (Scholar snapshot; OpenAlex cites fill gaps)                          |
| DOI / open access               | `src/data/openalex.yaml` — refresh with `pnpm enrich:openalex`                                  |
| News                            | `src/content/news/*.md`                                                                         |
| Blog                            | `src/content/blog/*.md`                                                                         |
| Publications list               | Edit `\nocite` + `.bib` in [josephbb/CV](https://github.com/josephbb/CV), then sync `vendor/cv` |
| CV PDF                          | Rebuild in the CV repo → copy to `public/cv/BakColemanCV.pdf`                                   |

### Sync CV vendor copy

```bash
rm -rf vendor/cv
git clone --depth 1 https://github.com/josephbb/CV.git vendor/cv
rm -rf vendor/cv/.git
```

(Or convert `vendor/cv` to a git submodule later.)

## Deploy

Push to `main` on `josephbb.github.io` with GitHub Pages set to **GitHub Actions**. `public/CNAME` is set to `joebakcoleman.com`.

## v2 (not in this build)

Bird photography, teaching/courses, research themes page (`src/content/themes/`), structured press/coverage library, notebook→blog export helper.
