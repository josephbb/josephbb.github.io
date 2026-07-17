#!/usr/bin/env node
/**
 * Enrich publications with DOI + open-access metadata from OpenAlex.
 * Fetches the author's works in bulk (avoids per-title 429s), then matches
 * local CV pubs by DOI / title. Writes src/data/openalex.yaml.
 *
 * Usage: pnpm enrich:openalex
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'yaml';
import { getPublications } from '../src/lib/publications.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'data', 'openalex.yaml');
const MAILTO = 'jbakcoleman@gmail.com';
const AUTHOR_ID = 'A5029967709'; // Joseph B. Bak-Coleman
const API = 'https://api.openalex.org';
const MIN_TITLE_SCORE = 0.55;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeDoi(doi) {
  if (!doi) return undefined;
  return String(doi)
    .replace(/^https?:\/\/doi\.org\//i, '')
    .replace(/^doi:/i, '')
    .trim()
    .toLowerCase();
}

function normalizeTitle(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleScore(a, b) {
  const ta = new Set(normalizeTitle(a).split(' ').filter((w) => w.length > 2));
  const tb = new Set(normalizeTitle(b).split(' ').filter((w) => w.length > 2));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const w of ta) if (tb.has(w)) inter++;
  return inter / Math.max(ta.size, tb.size);
}

function pickOaUrl(work) {
  const best = work.best_oa_location;
  return (
    best?.pdf_url ||
    best?.landing_page_url ||
    work.open_access?.oa_url ||
    undefined
  );
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': `joebakcoleman-site (mailto:${MAILTO})` },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function fetchAllAuthorWorks() {
  const works = [];
  let cursor = '*';
  while (cursor) {
    const q = new URLSearchParams({
      filter: `authorships.author.id:${AUTHOR_ID}`,
      'per-page': '200',
      cursor,
      mailto: MAILTO,
    });
    const data = await fetchJson(`${API}/works?${q}`);
    works.push(...(data.results ?? []));
    cursor = data.meta?.next_cursor || null;
    if (cursor) await sleep(200);
  }
  return works;
}

function indexWorks(works) {
  const byDoi = new Map();
  const list = [];
  for (const work of works) {
    const doi = normalizeDoi(work.doi);
    if (doi) byDoi.set(doi, work);
    list.push(work);
  }
  return { byDoi, list };
}

function matchWork(pub, index) {
  const doi = normalizeDoi(pub.doi);
  if (doi && index.byDoi.has(doi)) {
    const work = index.byDoi.get(doi);
    return { work, tScore: titleScore(pub.title, work.display_name ?? '') || 1 };
  }

  let best = null;
  for (const work of index.list) {
    const tScore = titleScore(pub.title, work.display_name ?? '');
    if (tScore < MIN_TITLE_SCORE) continue;
    const workYear = work.publication_year ?? 0;
    const yearDelta =
      pub.year && workYear ? Math.abs(pub.year - workYear) : 99;
    const yearScore =
      yearDelta === 0 ? 1 : yearDelta === 1 ? 0.7 : yearDelta <= 2 ? 0.4 : 0;
    const score = tScore * 0.75 + yearScore * 0.25;
    if (!best || score > best.score) best = { work, tScore, score };
  }
  return best ? { work: best.work, tScore: best.tScore } : null;
}

async function lookupByDoi(doi) {
  try {
    const work = await fetchJson(
      `${API}/works/https://doi.org/${encodeURIComponent(doi)}?mailto=${MAILTO}`,
    );
    return work?.id ? work : null;
  } catch {
    return null;
  }
}

const pubs = getPublications({ openAlex: false });
console.log(`Fetching OpenAlex works for author ${AUTHOR_ID}…`);
const authorWorks = await fetchAllAuthorWorks();
console.log(`  ${authorWorks.length} works on profile`);
const index = indexWorks(authorWorks);

const works = {};
let matched = 0;
let oaCount = 0;

for (const pub of pubs) {
  process.stdout.write(`  ${pub.key}… `);
  let hit = matchWork(pub, index);

  // DOI not on author profile (e.g. some policy/report DOIs) — one lookup
  if (!hit && pub.doi && !String(pub.doi).toLowerCase().includes('arxiv')) {
    await sleep(150);
    const work = await lookupByDoi(normalizeDoi(pub.doi));
    if (work) {
      const tScore = titleScore(pub.title, work.display_name ?? '');
      if (tScore >= 0.4) hit = { work, tScore };
    }
  }

  if (!hit) {
    console.log('no confident match');
    works[pub.key] = { unmatched: true };
    continue;
  }

  const { work, tScore } = hit;
  const doi = normalizeDoi(work.doi);
  const isOa = Boolean(work.open_access?.is_oa);
  const oaUrl = pickOaUrl(work) || null;
  works[pub.key] = {
    openalex_id: work.id,
    matched_title: work.display_name,
    title_score: Number(tScore.toFixed(3)),
    doi: doi || null,
    is_oa: isOa,
    oa_url: oaUrl,
    cited_by_count: work.cited_by_count ?? null,
  };
  matched++;
  if (isOa && oaUrl) oaCount++;
  console.log(
    `${doi ?? 'no-doi'} | oa=${isOa}${oaUrl ? ' ✓' : ''} | score=${tScore.toFixed(2)}`,
  );
}

const out = {
  last_updated: new Date().toISOString().slice(0, 10),
  source: 'OpenAlex',
  author_id: AUTHOR_ID,
  works,
};

fs.writeFileSync(OUT, yaml.stringify(out, { lineWidth: 100 }));
console.log(
  `Wrote ${OUT} (${matched}/${pubs.length} matched, ${oaCount} with OA URL)`,
);
