declare module 'bibtex-parse-js' {
  export type BibEntry = {
    citationKey: string;
    entryType: string;
    entryTags?: Record<string, string>;
  };
  export function toJSON(bibtex: string): BibEntry[];
  export function toBibtex(json: BibEntry[]): string;
  const bibtexParse: { toJSON: typeof toJSON; toBibtex: typeof toBibtex };
  export default bibtexParse;
}
