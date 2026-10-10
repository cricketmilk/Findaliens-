# Research: building out "The Web"

Kenoma (the Forge agent) researches every person, company, fund and agency named
across the investigation pages; you approve what it finds; the approved,
sourced connections appear on [`public/web.html`](../public/web.html).

Nothing here is deployed except `public/data/`. Findings live in
`research/findings/` until you approve them.

## The loop

```bash
node research/extract-entities.mjs        # 1. index every entity on the site → public/data/entities.json
node research/run-kenoma.mjs --limit 5    # 2. ask Kenoma to research the next 5 (runs in Forge)
node research/review.mjs                  # 3. approve / reject / edit each finding → public/data/web.json
```

Re-run step 1 whenever a page changes. `node research/next.mjs` shows what
Kenoma will pick next and what the site already says about it;
`node research/validate.mjs` checks the findings files; `node research/review.mjs --list`
shows counts.

You can also skip the script and ask Kenoma directly in the Forge cockpit, with
the workspace set to this folder: *"research the next 5 entities"*. The
`entity-research` skill in `.forge/skills/` tells it how.

## One-time setup for run-kenoma

Forge's `/hook` endpoint is off until it has a token.

1. Pick a long random string.
2. Give it to Forge: set `FORGE_HOOK_TOKEN` in Forge's environment, or add
   `"hooks": { "token": "…" }` to `C:\Forge\config.json`, then restart Forge.
3. Give the same string to this script: create `research/.env` containing
   `FORGE_HOOK_TOKEN=…` (git ignores it).

Hook turns run without anyone watching, so the first time, run a pass from the
cockpit instead. That way you can approve the skill and its commands once
("always"), and later hook runs won't stall on an approval nobody answers.

## The rules Kenoma follows

Spelled out in `.forge/skills/entity-research/SKILL.md`:
- every claim needs a source it actually opened;
- the status tag must match the evidence (a lawsuit is not a ruling);
- no connection just because two names share a story;
- neutral wording, public roles only;
- it never edits `public/`.

The review step is your check on all of it.

## Handoffs: public programs → private successors

A second record type documents publicly funded programs (or state assets) that
ended, and the private entity that took over: spinouts, privatizations,
outsourced successors, and popular claims like "Facebook replaced DARPA
LifeLog". Records live in `research/handoffs/`; the rules and grading are in
`handoff-lib.mjs`; Kenoma's instructions are the `handoff-research` skill.

```bash
node research/validate-handoffs.mjs   # check records and preview each grade
node research/review.mjs              # approve the record, each link, each claim
```

Each case's grade comes from its **approved, typed links**, never from timing:
- **A:** a license, asset transfer, contract or official successor is documented.
- **B:** documented people moved plus another tie, or a transfer that is only reported.
- **C:** only shared people or funders.
- **D:** timing only.

A and B also need at least two independent publishers. Approved cases appear on
`public/handoffs.html`.

## Notes

`research/notes/` holds working memos for the owner, never site content.
`hot-money-conduits.md` maps the seven-chain "hot money" analysis onto the
Crash Conduits nodes and the records that test it, with a verdict per claim.
