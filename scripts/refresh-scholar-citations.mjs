#!/usr/bin/env node
/**
 * Refresh the Google Scholar citation counts stored by citation ID.
 *
 * Google Scholar exposes an author's publications in its public profile HTML;
 * using citation IDs avoids brittle title matching. The script intentionally
 * refuses to write a partial response so a temporary Scholar block cannot
 * erase otherwise valid counts.
 *
 * Usage: pnpm refresh:scholar
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CITATIONS_FILE = path.join(ROOT, 'src', 'data', 'citations.yaml');
const SCHOLAR_URL = 'https://scholar.google.com/citations';

function profileUrl(user) {
  const query = new URLSearchParams({ user, hl: 'en', pagesize: '100' });
  return `${SCHOLAR_URL}?${query}`;
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function citationCountsFromProfile(html, user) {
  // Each Scholar result links to a citation ID and has one visible count cell.
  // Rows are parsed independently so incidental links elsewhere cannot match.
  const counts = new Map();
  const rows = html.match(/<tr[^>]*class=["'][^"']*gsc_a_tr[^"']*["'][\s\S]*?<\/tr>/gi) ?? [];

  for (const row of rows) {
    const idMatch = row.match(/citation_for_view=([^&"']+)/i);
    const countMatch = row.match(/<td[^>]*class=["'][^"']*gsc_a_c[^"']*["'][^>]*>[\s\S]*?<a[^>]*>([\d,]+)<\/a>/i);
    if (!idMatch || !countMatch) continue;

    const citationForView = decodeHtml(idMatch[1]);
    const [citationUser, citationId] = citationForView.split(':');
    const count = Number.parseInt(countMatch[1].replace(/,/g, ''), 10);
    if (citationUser === user && citationId && Number.isSafeInteger(count)) {
      counts.set(citationId, count);
    }
  }
  return counts;
}

async function main() {
  const source = fs.readFileSync(CITATIONS_FILE, 'utf8');
  const data = yaml.parse(source) ?? {};
  const user = data.scholar_user;
  const scholarIds = data.scholar_ids ?? {};

  if (!user || !Object.keys(scholarIds).length) {
    throw new Error('citations.yaml must define scholar_user and scholar_ids.');
  }

  const response = await fetch(profileUrl(user), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; josephbb.github.io citation refresh)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!response.ok) throw new Error(`Google Scholar returned HTTP ${response.status}.`);

  const countsById = citationCountsFromProfile(await response.text(), user);
  const missing = Object.entries(scholarIds)
    .filter(([, id]) => !countsById.has(id))
    .map(([key]) => key);
  if (missing.length) {
    throw new Error(
      `Scholar response is incomplete; missing ${missing.length} configured citation IDs: ${missing.join(', ')}`,
    );
  }

  // Keep manually maintained entries that do not yet have a Scholar citation
  // ID. Only the configured IDs can be refreshed safely.
  const nextCounts = { ...(data.counts ?? {}) };
  for (const [key, id] of Object.entries(scholarIds)) {
    nextCounts[key] = countsById.get(id);
  }
  const changed = JSON.stringify(data.counts ?? {}) !== JSON.stringify(nextCounts);
  if (!changed) {
    console.log('Google Scholar citation counts are already current.');
    return;
  }

  data.counts = nextCounts;
  data.last_updated = new Date().toISOString().slice(0, 10);
  const header = '# Google Scholar citation counts, refreshed automatically from the public profile.\n';
  fs.writeFileSync(CITATIONS_FILE, `${header}${yaml.stringify(data, { lineWidth: 100 })}`);
  console.log(`Updated ${Object.keys(nextCounts).length} Google Scholar citation counts.`);
}

await main();
