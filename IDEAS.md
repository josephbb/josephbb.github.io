# Ideas backlog

Future site work — not scheduled. Easy polish from this list is already shipped (Now strip, motion, night grayscale portrait, RSS, talk news items).

## Strong fits

- **Research themes page** (`/research/`) — Markdown already lives in `src/content/themes/` (animals, crowds, stewardship). Wire into nav; link related papers and posts.
- **Book page** for *Of Fish and Fascists* (Princeton, 2027) — teaser now; cover, blurb, and press quotes when available.
- **Bird photography** — full-bleed editorial gallery; atmosphere over information architecture.
- **Talk / media archive** — structured list of talks, interviews, and coverage (separate from essays you wrote). Outlet logos pattern from Writing can reuse.

## Cool but more build

- **Citation story / sparkline** for a few flagship papers (OpenAlex / Scholar time series).
- **Notebook → blog export helper** — clean path from analysis notebooks into `src/content/blog/` (nbconvert / Quarto), so metascience writeups don’t rot privately.

## Probably skip

- Comments, newsletter popups, visitor counters, AI chat widgets, “interactive CV” gimmicks.

## Maintenance notes

- Update the homepage **Now** line in `src/data/site.yaml` (`now` / `now_updated`) roughly monthly.
- RSS feed: `/rss.xml` (blog + news).
