import fs from 'node:fs';
import path from 'node:path';
import bibtexParse from 'bibtex-parse-js';
import yaml from 'yaml';

export type Publication = {
  key: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  doi?: string;
  url?: string;
  oaUrl?: string;
  isOpenAccess?: boolean;
  note?: string;
  section: string;
  selected: boolean;
  citations?: number;
  citesUrl?: string;
};

const CV_DIR = path.join(process.cwd(), 'vendor', 'cv');

/** Strip LaTeX comments: full-line % and trailing % (naive but good enough for cv.tex). */
function stripTexComments(source: string): string {
  return source
    .split('\n')
    .map((line) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('%')) return '';
      // keep \% ; drop unescaped %
      let out = '';
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '%' && line[i - 1] !== '\\') break;
        out += line[i];
      }
      return out;
    })
    .join('\n');
}

function extractActiveNocites(tex: string): { key: string; section: string }[] {
  const cleaned = stripTexComments(tex);
  const results: { key: string; section: string }[] = [];
  const sectionRe =
    /\\begin\{refsection\}\[([^\]]+)\]([\s\S]*?)\\end\{refsection\}/g;
  let match: RegExpExecArray | null;
  while ((match = sectionRe.exec(cleaned)) !== null) {
    const section = match[1];
    const body = match[2];
    const citeRe = /\\nocite\{([^}]+)\}/g;
    let cite: RegExpExecArray | null;
    while ((cite = citeRe.exec(body)) !== null) {
      for (const key of cite[1].split(',').map((k) => k.trim()).filter(Boolean)) {
        results.push({ key, section });
      }
    }
  }
  return results;
}

function cleanLatex(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/\{\\/g, '')
    .replace(/\\textsuperscript\{[^}]*\}/g, '')
    .replace(/\\[a-zA-Z]+\*?\{([^}]*)\}/g, '$1')
    .replace(/[{}]/g, '')
    .replace(/~/g, ' ')
    .replace(/---/g, '—')
    .replace(/--/g, '–')
    .replace(/``|''/g, '"')
    .replace(/\\&/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatAuthors(raw: string | undefined): string {
  if (!raw) return '';
  const names = raw.split(/\s+and\s+/i).map((part) => {
    const cleaned = cleanLatex(part);
    if (cleaned.includes(',')) {
      const [last, first] = cleaned.split(',').map((s) => s.trim());
      return `${first ?? ''} ${last}`.trim();
    }
    return cleaned;
  });
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function loadBibEntries(): Map<string, Record<string, string>> {
  const map = new Map<string, Record<string, string>>();
  for (const file of fs.readdirSync(CV_DIR).filter((f) => f.endsWith('.bib'))) {
    const raw = fs.readFileSync(path.join(CV_DIR, file), 'utf8');
    // Parse entry-by-entry — full-file parse fails on some LaTeX-heavy entries
    for (const chunk of raw.split(/(?=@\w+\s*\{)/)) {
      if (!chunk.trim().startsWith('@')) continue;
      try {
        const entries = bibtexParse.toJSON(chunk);
        for (const entry of entries) {
          map.set(entry.citationKey.toLowerCase(), {
            ...(entry.entryTags ?? {}),
            __key: entry.citationKey,
          });
        }
      } catch {
        // skip malformed entry
      }
    }
  }
  return map;
}

function tagValue(tags: Record<string, string>, ...names: string[]): string {
  const lower = new Map(
    Object.entries(tags).map(([k, v]) => [k.toLowerCase(), v]),
  );
  for (const name of names) {
    const v = lower.get(name.toLowerCase());
    if (v) return cleanLatex(v);
  }
  return '';
}

function venueFromTags(tags: Record<string, string>): string {
  return (
    tagValue(tags, 'journal') ||
    tagValue(tags, 'booktitle') ||
    tagValue(tags, 'publisher') ||
    tagValue(tags, 'howpublished') ||
    tagValue(tags, 'note') ||
    ''
  );
}

type OpenAlexWork = {
  doi?: string | null;
  is_oa?: boolean;
  oa_url?: string | null;
  cited_by_count?: number | null;
  unmatched?: boolean;
  title_score?: number;
  openalex_id?: string;
};

export function getPublications(options: { openAlex?: boolean } = {}): Publication[] {
  const useOpenAlex = options.openAlex !== false;
  const tex = fs.readFileSync(path.join(CV_DIR, 'cv.tex'), 'utf8');
  const nocites = extractActiveNocites(tex);
  const bib = loadBibEntries();
  const selectedPath = path.join(process.cwd(), 'src', 'data', 'selected.yaml');
  const selectedKeys = new Set<string>(
    (yaml.parse(fs.readFileSync(selectedPath, 'utf8')) as string[]).map((k) =>
      k.toLowerCase(),
    ),
  );
  const aliasPath = path.join(process.cwd(), 'src', 'data', 'cite-aliases.yaml');
  const aliases = (
    fs.existsSync(aliasPath)
      ? (yaml.parse(fs.readFileSync(aliasPath, 'utf8')) as Record<string, string>)
      : {}
  );
  const citationsPath = path.join(process.cwd(), 'src', 'data', 'citations.yaml');
  const citationsFile = fs.existsSync(citationsPath)
    ? (yaml.parse(fs.readFileSync(citationsPath, 'utf8')) as {
        counts?: Record<string, number>;
        scholar_user?: string;
        scholar_ids?: Record<string, string>;
      })
    : {};
  const citationCounts = new Map<string, number>(
    Object.entries(citationsFile.counts ?? {}).map(([k, v]) => [
      k.toLowerCase(),
      Number(v),
    ]),
  );
  const scholarUser = citationsFile.scholar_user || 'Y5000VQAAAAJ';
  const scholarIds = new Map<string, string>(
    Object.entries(citationsFile.scholar_ids ?? {}).map(([k, v]) => [
      k.toLowerCase(),
      v,
    ]),
  );
  const openalexPath = path.join(process.cwd(), 'src', 'data', 'openalex.yaml');
  const openalexFile =
    useOpenAlex && fs.existsSync(openalexPath)
      ? (yaml.parse(fs.readFileSync(openalexPath, 'utf8')) as {
          works?: Record<string, OpenAlexWork>;
        })
      : {};
  const openalex = openalexFile.works ?? {};

  const pubs: Publication[] = [];
  const seen = new Set<string>();
  const essaysPath = path.join(process.cwd(), 'src', 'data', 'essays.yaml');
  const writingKeys = new Set(
    (
      fs.existsSync(essaysPath)
        ? (yaml.parse(fs.readFileSync(essaysPath, 'utf8')) as { cite_key?: string }[])
        : []
    )
      .map((e) => e.cite_key?.toLowerCase())
      .filter((k): k is string => Boolean(k)),
  );

  for (const { key, section } of nocites) {
    const resolved = aliases[key] || key;
    if (seen.has(resolved.toLowerCase())) continue;
    if (
      writingKeys.has(key.toLowerCase()) ||
      writingKeys.has(resolved.toLowerCase())
    ) {
      continue;
    }
    seen.add(resolved.toLowerCase());
    const tags = bib.get(resolved.toLowerCase());
    if (!tags) {
      console.warn(`[publications] Missing bib entry for nocite key: ${key}`);
      continue;
    }
    const year = Number.parseInt(cleanLatex(tags.year), 10) || 0;
    const pubKey = tags.__key || resolved;
    const oaRaw = openalex[pubKey] ?? openalex[resolved] ?? openalex[key];
    const oa =
      oaRaw &&
      !oaRaw.unmatched &&
      (oaRaw.title_score === undefined || oaRaw.title_score >= 0.55)
        ? oaRaw
        : undefined;
    const arxivId =
      cleanLatex(tags.eprint) ||
      cleanLatex(tags.arxiv) ||
      (cleanLatex(tags.url) || '').match(/arxiv\.org\/abs\/([0-9.]+)/i)?.[1];
    const arxivDoi = arxivId ? `10.48550/arXiv.${arxivId}` : undefined;
    const arxivAbs = arxivId ? `https://arxiv.org/abs/${arxivId}` : undefined;
    const arxivPdf = arxivId ? `https://arxiv.org/pdf/${arxivId}` : undefined;
    const doi =
      cleanLatex(tags.doi) || oa?.doi || arxivDoi || undefined;
    const bibUrl = cleanLatex(tags.url) || cleanLatex(tags.URL) || undefined;
    const bibPdf = cleanLatex(tags.pdf) || cleanLatex(tags.PDF) || undefined;
    const bibHtml = cleanLatex(tags.html) || cleanLatex(tags.HTML) || undefined;
    const bibLooksFree = (u?: string) =>
      Boolean(
        u &&
          (/arxiv\.org|socarxiv|osf\.io\/preprints|pmc\.ncbi\.nlm\.nih\.gov|europepmc\.org|\.pdf(\?|$)/i.test(
            u,
          ) ||
            /\bpdf\b/i.test(u)),
      );
    const oaUrl =
      oa?.oa_url ||
      arxivPdf ||
      (bibLooksFree(bibPdf) ? bibPdf : undefined) ||
      (bibLooksFree(bibHtml) ? bibHtml : undefined) ||
      (bibLooksFree(bibUrl) ? bibUrl : undefined) ||
      (section === 'policy' && bibUrl ? bibUrl : undefined) ||
      undefined;
    const isOpenAccess = Boolean(
      oaUrl &&
        (oa?.is_oa ||
          Boolean(arxivId) ||
          bibLooksFree(oaUrl) ||
          section === 'policy'),
    );
    const url =
      bibUrl ||
      arxivAbs ||
      (doi ? `https://doi.org/${doi}` : undefined) ||
      undefined;
    const citations =
      citationCounts.get(pubKey.toLowerCase()) ??
      citationCounts.get(resolved.toLowerCase()) ??
      citationCounts.get(key.toLowerCase()) ??
      (typeof oa?.cited_by_count === 'number' ? oa.cited_by_count : undefined);
    const scholarId =
      scholarIds.get(pubKey.toLowerCase()) ??
      scholarIds.get(resolved.toLowerCase()) ??
      scholarIds.get(key.toLowerCase());
    const citesUrl = scholarId
      ? `https://scholar.google.com/citations?view_op=view_citation&hl=en&user=${scholarUser}&citation_for_view=${scholarUser}:${scholarId}`
      : undefined;

    pubs.push({
      key: pubKey,
      title: cleanLatex(tags.title),
      authors: formatAuthors(tags.author),
      year,
      venue: venueFromTags(tags),
      doi: doi || undefined,
      url,
      oaUrl: oaUrl || undefined,
      isOpenAccess,
      note: cleanLatex(tags.note) || undefined,
      section,
      selected:
        selectedKeys.has(key.toLowerCase()) ||
        selectedKeys.has(resolved.toLowerCase()) ||
        selectedKeys.has((tags.__key || '').toLowerCase()),
      citations,
      citesUrl,
    });
  }

  pubs.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  return pubs;
}

export function getSelectedPublications(): Publication[] {
  const selectedOrder = (
    yaml.parse(
      fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'selected.yaml'), 'utf8'),
    ) as string[]
  ).map((k) => k.toLowerCase());
  const byKey = new Map(
    getPublications().map((p) => [p.key.toLowerCase(), p]),
  );
  return selectedOrder
    .map((key) => byKey.get(key))
    .filter((p): p is Publication => Boolean(p));
}

export function groupByYear(pubs: Publication[]): [number, Publication[]][] {
  const map = new Map<number, Publication[]>();
  for (const pub of pubs) {
    const list = map.get(pub.year) ?? [];
    list.push(pub);
    map.set(pub.year, list);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}

export function sortByCitations(pubs: Publication[]): Publication[] {
  return [...pubs].sort((a, b) => {
    const ca = a.citations ?? -1;
    const cb = b.citations ?? -1;
    if (cb !== ca) return cb - ca;
    return b.year - a.year || a.title.localeCompare(b.title);
  });
}

export function getCitationsUpdated(): string | undefined {
  const citationsPath = path.join(process.cwd(), 'src', 'data', 'citations.yaml');
  if (!fs.existsSync(citationsPath)) return undefined;
  const data = yaml.parse(fs.readFileSync(citationsPath, 'utf8')) as {
    last_updated?: string;
  };
  return data.last_updated;
}

export function getPublicationStats(pubs: Publication[] = getPublications()): {
  items: number;
  citations: number;
  hIndex: number;
} {
  const counts = pubs
    .map((p) => p.citations ?? 0)
    .filter((n) => n > 0)
    .sort((a, b) => b - a);
  const citations = pubs.reduce((sum, p) => sum + (p.citations ?? 0), 0);
  let hIndex = 0;
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] >= i + 1) hIndex = i + 1;
    else break;
  }
  return { items: pubs.length, citations, hIndex };
}
