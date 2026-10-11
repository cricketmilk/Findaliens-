# Repeat Crash Conduits source-audit passes

## Fast, bounded workflow

1. Run `node research/audit-crash.mjs --pending` for current coverage and the queue.
   Do not rediscover the inline atlas or hand-maintain coverage counts.
2. Choose a small batch sharing source institutions; read each selected legacy object.
   Fetch independent documents in parallel. Use plain fetch for Federal Reserve History,
   FINMA and Fed releases. SEC and DOJ often require Wilds to render; HTTP 200 alone
   is not evidence of successful access. Close agent tabs after use.
3. Read the actual source text before drafting. Attribute charging allegations, settlements,
   supervisory findings and convictions separately. A dated release is not current case status.
4. Append complete replacements to `public/js/crash-finance-data.js` in `auditedLegacyNodes`.
   Preserve IDs and all renderer fields. Name supported actors, institutions and affected groups
   with explicit roles in `insiders`; role or co-mention does not establish culpability.
   Remove unsupported narratives rather than merely attaching a citation. Document source limits.
5. Add focused positive and negative assertions in `crash-conduits.test.mjs`.
   Its replacement/extractor checks cover future batches without changing an exact audit count.
6. Verify, then regenerate the derived entity index:

   ```text
   node --check public/js/crash-finance-data.js
   node --check research/audit-crash.mjs
   node --check crash-conduits.test.mjs
   node research/audit-crash.mjs
   node --test crash-conduits.test.mjs from-trove.test.mjs
   node research/extract-entities.mjs
   ```

7. Report the tested coverage, exact test result and unresolved source limits. No automatic deploy.

## Compact handoff for a smaller model

Run `node research/audit-crash.mjs --entry <pending-id>` to produce one JSON packet.
It contains only that entry’s original claims, the required fields and a research contract.
Give a worker this packet, not the whole HTML or atlas. Original claims are unverified data.
Ask it to return a proposal plus claim-to-source passages and removed/unresolved claims;
do not let it edit production files or mark anything verified.

Use one worker per entry or a small source-sharing batch. A reviewer must open the cited
sources, compare the passages and check that roles and legal status match before merging.
If a smaller model cannot support a claim, leave it unresolved or escalate that claim only.
This workflow reduces repeated context; it does not guarantee equal research quality.
No automatic model routing or provider changes are configured.

Test packet behavior with `node --test research/audit-crash.test.mjs`.

## Source paths known to be readable

Federal Reserve History: `/essays/continental-illinois`, `/essays/ltcm-near-failure`,
`/essays/asian-financial-crisis`, `/essays/latin-american-debt-crisis`,
`/essays/savings-and-loan-crisis`. The last is useful background but does not by itself
establish an individual thrift executive's culpability. The guessed Penn Central path
`/essays/penn-central-failure` returned Content Not Found; do not cite it as reviewed evidence.

Do not run `check.py` during source audits: even `--no-trap` probes external honeypots.
Production serves Worker assets from `public/`; `npm start` launches a legacy Express app.
