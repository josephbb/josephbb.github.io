#!/usr/bin/env python3
"""Find OpenAlex co-authorship candidates for Laude's four $10M winning teams.

Python 3.10+, standard library only. Examples:
  python3 scripts/check-laude-coauthors.py --out /tmp/laude-coauthors-report
  python3 scripts/check-laude-coauthors.py --committee six --before 2026-04-15

Author IDs are inferred on the first run and saved in author-map.json. Review
them against author-candidates.json; edit an `ids` list to include split records
or exclude namesakes, then rerun. Results are candidates, not verified personal
relationships. A missing match is not proof of no co-authorship.
"""

import argparse
import csv
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import time
import unicodedata
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import urlopen


# Rosters from Laude's November 5, 2026 award announcement and committee page.
SOURCES = ["https://www.laude.org/updates/moonshots-one-labs",
           "https://www.laude.org/moonshots"]
TEAMS = {
    "Stanford workforce": ["Diyi Yang", "Tatsunori Hashimoto", "Chris Piech", "Erik Brynjolfsson"],
    "Cornell civic discourse": ["Cristian Danescu-Niculescu-Mizil", "Natalie Bazarova",
        "Jon Kleinberg", "Robert Kleinberg", "Mor Naaman", "David Rand"],
    "JupyterHealth": ["Ida Sim", "Ahmed Alaa", "Irene Chen", "Jessilyn Dunn",
        "Sandeep Kishore", "Fernando Perez", "Maya Petersen", "JP Pollak"],
    "Chicago weather": ["Rebecca Willett", "Ian Foster", "Pedram Hassanzadeh", "Michael Kremer"],
}
SIX = ["Jeff Dean", "John Jumper", "John Hennessy", "Yejin Choi", "Eric Horvitz", "Thomas Wolf"]
INITIAL = SIX + ["David Autor", "Chris Bail", "Michiel Bakker", "Erik Brynjolfsson",
    "Gillian Hadfield", "Hanna Hajishirzi", "Braden Hancock", "Tom Kalil", "Isaac Kohane",
    "Andy Konwinski", "Tom Mitchell", "Ethan Mollick", "Dave Patterson", "Sylvia Plevritis",
    "David Rand", "Chris Rytting", "Ameet Talwalkar", "Tino Cuellar", "Adam Yala",
    "Diyi Yang", "James Zou"]
FINAL = ["Joda Thongnopnua", "Andy Konwinski", "Dave Patterson", "Braden Hancock", "Ben Gomes"]
# Full names help distinguish namesakes. Institution hints rank search results;
# these are only heuristics, so inspect the saved IDs before relying on findings.
ALIASES = {"Irene Chen": "Irene Y Chen", "Ahmed Alaa": "Ahmed M Alaa",
    "Natalie Bazarova": "Natalya Bazarova", "JP Pollak": "John Pollak",
    "Sandeep Kishore": "Sandeep Prasad Kishore", "John Hennessy": "John L Hennessy",
    "Chris Bail": "Christopher Bail", "Dave Patterson": "David A Patterson",
    "Tom Mitchell": "Tom M Mitchell", "Chris Rytting": "Christopher Rytting",
    "Tino Cuellar": "Mariano Florentino Cuellar"}
HINTS = {
    "Jeff Dean": "google", "John Jumper": "deepmind", "John Hennessy": "stanford",
    "Yejin Choi": "stanford washington", "Eric Horvitz": "microsoft",
    "Thomas Wolf": "hugging", "Diyi Yang": "stanford", "Tatsunori Hashimoto": "stanford",
    "Chris Piech": "stanford", "Erik Brynjolfsson": "stanford",
    **{n: "cornell" for n in TEAMS["Cornell civic discourse"]},
    **{n: "berkeley francisco" for n in TEAMS["JupyterHealth"]},
    "Jessilyn Dunn": "duke", "JP Pollak": "cornell",
    **{n: "chicago" for n in TEAMS["Chicago weather"]},
    "David Autor": "massachusetts", "Chris Bail": "duke", "Michiel Bakker": "massachusetts deepmind",
    "Gillian Hadfield": "hopkins toronto", "Hanna Hajishirzi": "washington",
    "Braden Hancock": "stanford", "Isaac Kohane": "harvard", "Andy Konwinski": "berkeley",
    "Tom Mitchell": "carnegie", "Ethan Mollick": "pennsylvania", "Dave Patterson": "berkeley",
    "Sylvia Plevritis": "stanford", "Ameet Talwalkar": "carnegie",
    "Tino Cuellar": "stanford", "Adam Yala": "berkeley francisco", "James Zou": "stanford",
}


def norm(text):
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower())


def plausible_name(display, name):
    def words(text):
        ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
        return re.findall(r"[a-z]+", ascii_text.lower())
    actual = words(display)
    for label in (name, ALIASES.get(name, name)):
        expected = words(label)
        if actual and expected and actual[-1] == expected[-1]:
            length = min(3, len(actual[0]), len(expected[0]))
            if actual[0][:length] == expected[0][:length]:
                return True
    return False


class OpenAlex:
    def __init__(self, directory):
        self.cache = directory / "cache"
        self.cache.mkdir(parents=True, exist_ok=True)

    def get(self, endpoint, **params):
        # The API key is never included in filenames, cached JSON, or messages.
        cache_key = hashlib.sha256((endpoint + urlencode(sorted(params.items()))).encode()).hexdigest()
        path = self.cache / (cache_key + ".json")
        if path.exists():
            return json.loads(path.read_text())
        if os.getenv("OPENALEX_API_KEY"):
            params["api_key"] = os.environ["OPENALEX_API_KEY"]
        for attempt in range(4):
            time.sleep(1)
            try:
                query = urlencode(params)
                url = "https://api.openalex.org/" + endpoint + ("?" + query if query else "")
                with urlopen(url, timeout=60) as response:
                    data = json.load(response)
                path.write_text(json.dumps(data))
                return data
            except HTTPError as error:
                if error.code not in (429, 500, 502, 503, 504) or attempt == 3:
                    hint = " Set OPENALEX_API_KEY if access or the shared free budget is restricted." if error.code in (401, 403, 429) else ""
                    raise RuntimeError(f"OpenAlex HTTP {error.code} for {endpoint}; rerun to resume from cache.{hint}") from None
                delay = min(float(error.headers.get("Retry-After", 2 ** (attempt + 1))), 30)
                time.sleep(delay)
        raise RuntimeError("OpenAlex request failed")


def resolve(api, names, directory):
    path = directory / "author-map.json"
    mapping = json.loads(path.read_text()) if path.exists() else {}
    candidates_path = directory / "author-candidates.json"
    candidates = json.loads(candidates_path.read_text()) if candidates_path.exists() else {}
    for name in names:
        if name in mapping:
            continue
        found = api.get("authors", search=ALIASES.get(name, name), per_page=25,
                        select="id,display_name,works_count,last_known_institutions")
        if not found["results"] and name in ALIASES:
            found = api.get("authors", search=name, per_page=25,
                            select="id,display_name,works_count,last_known_institutions")
        def rank(author):
            affiliations = " ".join(i["display_name"].lower() for i in (author.get("last_known_institutions") or []))
            hint = any(word in affiliations for word in HINTS.get(name, "").split())
            same = norm(author["display_name"]) in {norm(name), norm(ALIASES.get(name, name))}
            return hint, author["works_count"], same
        choices = sorted(found["results"], key=rank, reverse=True)
        candidates[name] = choices
        selected = [a for a in choices if plausible_name(a["display_name"], name)][:1]
        mapping[name] = {"ids": [a["id"].rsplit("/", 1)[-1] for a in selected], "reviewed": False}
        print(f"Resolve {name}: {[(a['display_name'], a['works_count']) for a in selected]}", flush=True)
        path.write_text(json.dumps(mapping, indent=2))
        candidates_path.write_text(json.dumps(candidates, indent=2))
    return {name: mapping[name] for name in names}


def get_shared_works(api, committee_ids, team_ids, before):
    if not committee_ids or not team_ids:
        return
    # A repeated author filter is AND; | inside each filter is OR. Thus a work
    # needs an author from each group, including authors beyond the first 100.
    # Batch because OpenAlex permits at most 100 IDs per OR filter.
    seen = set()
    for start in range(0, len(committee_ids), 100):
        for other in range(0, len(team_ids), 100):
            filters = ("authorships.author.id:" + "|".join(committee_ids[start:start+100])
                + ",authorships.author.id:" + "|".join(team_ids[other:other+100])
                + ",to_publication_date:" + before)
            cursor, page_number = "*", 1
            has_key = bool(os.getenv("OPENALEX_API_KEY"))
            while True:
                paging = {"cursor": cursor} if has_key else {"page": page_number}
                page = api.get("works", filter=filters, per_page=100, **paging,
                    select="id,doi,title,publication_date,authorships,is_authors_truncated,primary_location")
                if not has_key and page["meta"]["count"] > 10000:
                    raise RuntimeError("More than 10,000 results: set OPENALEX_API_KEY for cursor paging.")
                for work in page["results"]:
                    if work["id"] in seen:
                        continue
                    seen.add(work["id"])
                    if work.get("is_authors_truncated"):
                        work = api.get("works/" + work["id"].rsplit("/", 1)[-1])
                    yield work
                if has_key:
                    cursor = page["meta"].get("next_cursor")
                    if not cursor:
                        break
                elif page_number * 100 >= page["meta"]["count"]:
                    break
                page_number += 1


def match_rows(works, mapping, committee):
    for work in works:
        ids = {a["author"]["id"].rsplit("/", 1)[-1] for a in work["authorships"] if a["author"].get("id")}
        for team, members in TEAMS.items():
            for member in members:
                if not ids.intersection(mapping[member]["ids"]):
                    continue
                for person in committee:
                    if member == person:  # Committee members' own papers aren't co-authorship edges.
                        continue
                    if not ids.intersection(mapping[person]["ids"]):
                        continue
                    # Do not let a wrongly shared author ID become a self-edge.
                    if not any(a != b for a in ids.intersection(mapping[member]["ids"])
                               for b in ids.intersection(mapping[person]["ids"])):
                        continue
                    yield {"team": team, "team_member": member, "committee_member": person,
                        "date": work["publication_date"], "title": work["title"],
                        "url": work.get("doi") or (work.get("primary_location") or {}).get("landing_page_url") or work["id"],
                        "openalex_work": work["id"], "authors_count": len(work["authorships"]),
                        "author_ids_reviewed": mapping[member].get("reviewed", False) and mapping[person].get("reviewed", False)}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--out", type=Path, default=Path("/tmp/laude-coauthors-report"))
    parser.add_argument("--committee", choices=["initial", "six", "final"], default="initial")
    parser.add_argument("--before", default="2026-11-19", help="Inclusive publication-date cutoff (YYYY-MM-DD)")
    parser.add_argument("--resolve-only", action="store_true", help="Save author choices without querying papers")
    args = parser.parse_args()
    time.strptime(args.before, "%Y-%m-%d")
    args.out.mkdir(parents=True, exist_ok=True)
    # A failed run must not leave an old success report looking current.
    summary = args.out / "summary.json"
    summary.unlink(missing_ok=True)
    api = OpenAlex(args.out)
    committee = {"initial": INITIAL, "six": SIX, "final": FINAL}[args.committee]
    names = list(dict.fromkeys(sum(TEAMS.values(), []) + committee))
    mapping = resolve(api, names, args.out)
    if args.resolve_only:
        print(f"Review IDs in {args.out / 'author-map.json'}; then rerun without --resolve-only.")
        return
    committee_ids = sorted({i for n in committee for i in mapping[n]["ids"]})
    team_ids = sorted({i for n in sum(TEAMS.values(), []) for i in mapping[n]["ids"]})
    works = list(get_shared_works(api, committee_ids, team_ids, args.before))
    (args.out / "shared-works.json").write_text(json.dumps(works, indent=2))
    rows = sorted(match_rows(works, mapping, committee), key=lambda r: (r["team"], r["team_member"], r["committee_member"], r["date"]))
    fields = ["team", "team_member", "committee_member", "date", "title", "url", "openalex_work", "authors_count", "author_ids_reviewed"]
    with (args.out / "coauthors.csv").open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    report = {"sources": SOURCES, "committee": args.committee, "before": args.before,
        "status": "Candidate matches; verify author identities and original paper bylines",
        "unresolved_names": [n for n in names if not mapping[n]["ids"]],
        "unreviewed_names": [n for n in names if not mapping[n].get("reviewed")],
        "teams_with_matches": sorted({r["team"] for r in rows}),
        "pairs": [list(pair) for pair in sorted({(r["team_member"], r["committee_member"]) for r in rows})],
        "rows": len(rows), "note": "Preprint and journal versions may both appear; no match is not proof of absence."}
    summary.write_text(json.dumps(report, indent=2))
    for member, person in report["pairs"]:
        print(f"{member} <-> {person}")
    print(f"\n{len(report['pairs'])} candidate pairs; {len(report['teams_with_matches'])}/4 teams. See {args.out / 'coauthors.csv'}")
    print(f"Review {len(report['unreviewed_names'])} inferred author IDs; unresolved: {report['unresolved_names']}")


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, HTTPError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
