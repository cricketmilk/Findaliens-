// research/verify/runner.mjs
// 3-Agent Adversarial Verification Pipeline Runner.
// Modes:
//   1. `--print`: Offline/local mode that prints the assembled 3-stage prompts for local llama-server / manual run.
//   2. `--audit-file <path>`: Deterministically audits a dossier JSON file, strips LEAD_ANOMALY and unresolved {VERIFY}
//      items into research/leads/<code.json>, and verifies compliance with research/atlas-engine/schema.mjs.
//   3. Live API mode: Uses OPENAI_API_BASE and OPENAI_API_KEY from env vars to run the 3 passes sequentially.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EVIDENCE_TIERS, isPublicRenderable } from '../atlas-engine/schema.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const LEADS_DIR = path.join(REPO_ROOT, 'research/leads');

export function loadPrompts() {
  return {
    prosecutor: fs.readFileSync(path.join(__dirname, 'prosecutor.md'), 'utf8'),
    devilsAdvocate: fs.readFileSync(path.join(__dirname, 'devils-advocate.md'), 'utf8'),
    forensicAuditor: fs.readFileSync(path.join(__dirname, 'forensic-auditor.md'), 'utf8')
  };
}

/**
 * Deterministic Forensic Gatekeeper:
 * Separates verified public claims from LEAD_ANOMALY / {VERIFY} leads and writes quarantined items to research/leads/.
 */
export function enforceForensicGate(dossierDraft, citations = []) {
  fs.mkdirSync(LEADS_DIR, { recursive: true });

  const quarantinedCitations = [];
  const verifiedCitations = [];

  for (const cit of citations) {
    const hasUnresolvedVerify = typeof cit.url === 'string' && cit.url.includes('{VERIFY:');
    const isLeadTier = cit.tier === 'LEAD_ANOMALY' || !EVIDENCE_TIERS.includes(cit.tier);

    if (hasUnresolvedVerify || isLeadTier) {
      quarantinedCitations.push({
        ...cit,
        quarantineReason: hasUnresolvedVerify ? 'UNRESOLVED_VERIFY_TOKEN' : 'LEAD_ANOMALY_TIER'
      });
    } else {
      verifiedCitations.push(cit);
    }
  }

  const dossierIsLead = !isPublicRenderable(dossierDraft);
  if (dossierIsLead || quarantinedCitations.length > 0) {
    const leadFile = path.join(LEADS_DIR, `${dossierDraft.code || 'DRAFT'}.leads.json`);
    fs.writeFileSync(
      leadFile,
      JSON.stringify(
        {
          code: dossierDraft.code,
          quarantinedAt: new Date().toISOString(),
          dossierDisposition: dossierDraft.auditDisposition || null,
          dossierTier: dossierDraft.tier,
          quarantinedCitations
        },
        null,
        2
      ) + '\n',
      'utf8'
    );
  }

  return {
    passedPublicGate: !dossierIsLead && verifiedCitations.length > 0,
    verifiedDossier: dossierIsLead
      ? null
      : {
          ...dossierDraft,
          citationIds: verifiedCitations.map((c) => c.id)
        },
    verifiedCitations,
    quarantinedCitations
  };
}

async function callLlmStage(systemPrompt, userPayload) {
  const baseUrl = process.env.OPENAI_API_BASE || 'http://127.0.0.1:8080/v1';
  const apiKey = process.env.OPENAI_API_KEY || 'local-llama';
  const model = process.env.OPENAI_MODEL || 'local-model';

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(userPayload, null, 2) }
      ]
    })
  });

  if (!res.ok) {
    throw new Error(`LLM endpoint returned HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// Portable main guard (see migrate.mjs): the raw file:// compare never matches on
// Windows paths (the repo path contains a space), so resolve both sides instead.
if (path.resolve(process.argv[1]) === __filename) {
  const args = process.argv.slice(2);
  const printMode = args.includes('--print');
  const draftIdx = args.indexOf('--draft');
  const draftPath = draftIdx >= 0 ? args[draftIdx + 1] : null;

  const prompts = loadPrompts();
  const sampleDraft = draftPath && fs.existsSync(draftPath)
    ? JSON.parse(fs.readFileSync(draftPath, 'utf8'))
    : {
        code: 'DS-1915-LUSITANIA',
        tier: 'TIER_2_INQUIRY',
        auditDisposition: 'DOCUMENTED',
        title: 'Lusitania Munitions & Lord Mersey Inquiry'
      };

  if (printMode) {
    console.log('=== STAGE 1: PROSECUTOR PROMPT ===\n' + prompts.prosecutor);
    console.log('\n=== STAGE 2: DEVILS ADVOCATE PROMPT ===\n' + prompts.devilsAdvocate);
    console.log('\n=== STAGE 3: FORENSIC AUDITOR PROMPT ===\n' + prompts.forensicAuditor);
    console.log('\n=== TARGET DRAFT PAYLOAD ===\n' + JSON.stringify(sampleDraft, null, 2));
    process.exit(0);
  }

  if (process.env.OPENAI_API_BASE) {
    const s1 = await callLlmStage(prompts.prosecutor, sampleDraft);
    const s2 = await callLlmStage(prompts.devilsAdvocate, { draft: sampleDraft, stage1: s1 });
    const s3 = await callLlmStage(prompts.forensicAuditor, { draft: sampleDraft, stage1: s1, stage2: s2 });
    console.log(s3);
  } else {
    const result = enforceForensicGate(sampleDraft, sampleDraft.citations || []);
    console.log(JSON.stringify(result, null, 2));
  }
}