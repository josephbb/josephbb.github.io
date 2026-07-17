import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

export type SiteConfig = {
  name: string;
  short_name: string;
  tagline: string;
  subtitle: string;
  location: string;
  title: string;
  affiliation: string;
  /** Optional one-liner under the hero (role + current work/reading). */
  now?: string;
  /** Display label for when `now` was last refreshed (e.g. "Jul 2026"). */
  now_updated?: string;
  book: { title: string; year: number; press: string };
  affiliations: { role: string; org: string; current: boolean }[];
  education: { degree: string; year: number; school: string }[];
  bio_short: string;
  bio: string;
  contact_note: string;
};

export type SocialsConfig = {
  email: string;
  scholar_userid: string;
  orcid_id: string;
  github_username: string;
  cv_pdf: string;
  cv_repo: string;
};

export type Essay = {
  title: string;
  outlet: string;
  date: string;
  url: string;
  blurb: string;
  image?: string;
  featured?: boolean;
  /** If set, this piece is omitted from the Publications page. */
  cite_key?: string;
  /** Resolved from outlets.yaml when present. */
  logo?: string;
};

function loadYaml<T>(relative: string): T {
  const file = path.join(process.cwd(), 'src', 'data', relative);
  return yaml.parse(fs.readFileSync(file, 'utf8')) as T;
}

export function getSite(): SiteConfig {
  return loadYaml<SiteConfig>('site.yaml');
}

export function getSocials(): SocialsConfig {
  return loadYaml<SocialsConfig>('socials.yaml');
}

function getOutletLogos(): Record<string, string> {
  return loadYaml<Record<string, string>>('outlets.yaml') ?? {};
}

/** External essays, newest first. */
export function getEssays(): Essay[] {
  const logos = getOutletLogos();
  const essays = loadYaml<Essay[]>('essays.yaml') ?? [];
  return [...essays]
    .map((essay) => ({
      ...essay,
      logo: essay.image ? undefined : logos[essay.outlet],
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function scholarUrl(id: string) {
  return `https://scholar.google.com/citations?user=${id}`;
}

export function orcidUrl(id: string) {
  return `https://orcid.org/${id}`;
}

export function githubUrl(username: string) {
  return `https://github.com/${username}`;
}
