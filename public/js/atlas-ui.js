// public/js/atlas-ui.js
// Vanilla JS forensic UI enhancer for The Cornfield Gazette (crash-conduits.html, deep-state.html,
// carbon-class.html, transhumanism.html, consent.html).
// Renders:
//   (a) 5-Stage Extraction Loop ASCII/DOM tree inside the Dossier drawer
//   (b) Recursive Closed-Loop Ratchet (how each instance built the framework for the next)
//   (c) 10-Mechanism Filter Bar
//   (d) Cross-Generational Lineage Cards (Peabody -> Morgan -> DB -> CIA, Mersey, Tesla/PROMIS/Palantir, Dulles)
//   (e) Cross-Conduit Bridge Badges
//   (f) Paired-Event Flip Button (⇄ between crash-conduits.html and deep-state.html)
//   (g) Evidence-Tier Badges (TIER 1–4; LEAD_ANOMALY blocked from public DOM)
//   (h) "THE DECOY VS. THE LEDGER" adversarial audit box

const TIER_LABELS = Object.freeze({
  TIER_1_STATUTE_COURT: { label: 'TIER 1 · STATUTE / COURT RULING', cls: 'stamp--tier-1' },
  TIER_2_INQUIRY: { label: 'TIER 2 · CONGRESSIONAL / PARLIAMENTARY INQUIRY', cls: 'stamp--tier-2' },
  TIER_3_PRIMARY_LEDGER: { label: 'TIER 3 · PRIMARY CORPORATE / ARCHIVAL LEDGER', cls: 'stamp--tier-3' },
  TIER_4_CONTEMPORARY_PRESS: { label: 'TIER 4 · CONTEMPORANEOUS PRESS', cls: 'stamp--tier-4' }
});

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderTierStamp(tier) {
  if (!tier || tier === 'LEAD_ANOMALY') return '';
  const meta = TIER_LABELS[tier] || TIER_LABELS.TIER_3_PRIMARY_LEDGER;
  return `<span class="stamp ${meta.cls}">${escapeHtml(meta.label)}</span>`;
}

export function renderFiveStageTree(dossier) {
  const loop = dossier?.extractionLoop;
  if (!loop) return '';
  return `
    <div class="atlas-tree-box" aria-label="5-Stage Extraction Loop">
      <div class="atlas-tree-root">[ DOSSIER · ${escapeHtml(dossier.code)} · ${escapeHtml(dossier.yearStart)}–${escapeHtml(dossier.yearEnd || dossier.yearStart)} ]</div>
      <div class="atlas-tree-node">
        <span class="atlas-tree-branch">├── 1. PRE-SHOCK EXTRACTION (The Skim)</span>
        <span class="atlas-tree-leaf">${escapeHtml(loop.stage1_upfrontSkim)}</span>
      </div>
      <div class="atlas-tree-node">
        <span class="atlas-tree-branch">├── 2. PHYSICAL / STRUCTURAL COMPROMISE</span>
        <span class="atlas-tree-leaf">${escapeHtml(loop.stage2_structuralCompromise)}</span>
      </div>
      <div class="atlas-tree-node">
        <span class="atlas-tree-branch">├── 3. THE INFORMATION FOG (The Arbitrage Window)</span>
        <span class="atlas-tree-leaf">${escapeHtml(loop.stage3_informationFog)}</span>
      </div>
      <div class="atlas-tree-node">
        <span class="atlas-tree-branch">├── 4. MANDATORY MONOPOLY CURE (The Windfall)</span>
        <span class="atlas-tree-leaf">${escapeHtml(loop.stage4_monopolyWindfall)}</span>
      </div>
      <div class="atlas-tree-node">
        <span class="atlas-tree-branch">└── 5. THE "LORD MERSEY" FIX &amp; LIABILITY CAP</span>
        <span class="atlas-tree-leaf">${escapeHtml(loop.stage5_merseyWhitewash)}</span>
      </div>
    </div>
  `;
}

export function renderClosedLoopRatchet(dossier) {
  const r = dossier?.closedLoopRatchet;
  if (!r) return '';
  return `
    <div class="atlas-ratchet-box" aria-label="Closed-Loop Institutional Ratchet">
      <div class="atlas-ratchet-title">
        <span>↻ CLOSED-LOOP RATCHET · HOW THIS BUILT THE NEXT CRISIS</span>
        <span>NEXT ➔ ${escapeHtml(r.enablesNextDossier || 'ENDGAME')}</span>
      </div>
      <div class="atlas-ratchet-grid">
        <div class="atlas-ratchet-step">
          <strong>[INHERITED PRECEDENT]:</strong> ${escapeHtml(r.inheritedFramework)}
        </div>
        <div class="atlas-ratchet-step">
          <strong>[NEW FRAMEWORK ERECTED]:</strong> ${escapeHtml(r.newFrameworkCreated)}
        </div>
        <div class="atlas-ratchet-step">
          <strong>[CLOSED-LOOP RECIRCULATION]:</strong> ${escapeHtml(r.closedLoopRecirculation)}
        </div>
      </div>
    </div>
  `;
}

export function renderDecoyVsLedger(dossier) {
  const dvl = dossier?.decoyVsLedger;
  if (!dvl) return '';
  return `
    <div class="verdict atlas-decoy-box" aria-label="Adversarial Audit: Decoy vs. Ledger">
      <div class="atlas-decoy-header">[ THE DECOY VS. THE LEDGER · ADVERSARIAL AUDIT ]</div>
      <div class="atlas-decoy-row">
        <strong style="color:var(--red);">✘ VIRAL DECOY:</strong> ${escapeHtml(dvl.viralDecoy)}
      </div>
      <div class="atlas-decoy-row">
        <strong style="color:var(--gold);">⚡ WHY THE DECOY FAILS:</strong> ${escapeHtml(dvl.whyDecoyFails)}
      </div>
      <div class="atlas-decoy-row">
        <strong style="color:var(--note);">✓ DOCUMENTED LEDGER CRIME:</strong> ${escapeHtml(dvl.documentedLedger)}
      </div>
    </div>
  `;
}

export function renderPairedEventButton(dossier, currentPage = window.location.pathname) {
  const pair = dossier?.pairedEvent;
  if (!pair) return '';
  const isDeepStatePage = currentPage.includes('deep-state');
  const targetPage = isDeepStatePage ? 'crash-conduits.html' : 'deep-state.html';
  const targetCode = isDeepStatePage ? pair.crashConduitCode : pair.deepStateCode;
  const label = isDeepStatePage
    ? `⇄ FLIP TO CRASH CONDUIT LEDGER: ${targetCode} (${pair.year})`
    : `⇄ FLIP TO DEEP STATE OPERATOR: ${targetCode} (${pair.year})`;

  return `
    <a class="atlas-paired-flip" href="${targetPage}#${encodeURIComponent(targetCode)}" title="${escapeHtml(pair.sharedMechanismSummary)}">
      ${escapeHtml(label)}
    </a>
  `;
}

export function renderBridgeBadges(dossier) {
  const bridges = Array.isArray(dossier?.bridges) ? dossier.bridges : [];
  if (bridges.length === 0) return '';
  return `
    <div class="atlas-bridges" aria-label="Cross-Conduit Links">
      ${bridges
        .map(
          (b) =>
            `<a class="atlas-bridge-badge entry-ref" href="${escapeHtml(b.targetSlug)}">[${escapeHtml(b.badgeLabel)}]</a>`
        )
        .join('')}
    </div>
  `;
}

export function renderDossierInspectorHTML(dossier) {
  if (!dossier || dossier.tier === 'LEAD_ANOMALY') {
    return `<p class="dek">Select a verified entry to inspect its 5-stage extraction loop, closed-loop ratchet, and primary citations.</p>`;
  }

  const citations = Array.isArray(dossier.citations || dossier.sources)
    ? dossier.citations || dossier.sources
    : [];

  const citationsHtml = citations
    .filter((c) => c.tier !== 'LEAD_ANOMALY')
    .map(
      (c) => `
        <div class="cite" style="margin-top:0.55rem; padding-top:0.55rem; border-top:1px solid var(--rule);">
          ${renderTierStamp(c.tier)}
          <a href="${escapeHtml(c.url)}" target="_blank" rel="noopener" style="color:var(--gold); margin-left:0.4rem;">
            ${escapeHtml(c.title || c.label)} ↗
          </a>
          <div style="font-size:0.78rem; color:var(--muted); margin-top:0.2rem;">
            ${escapeHtml(c.quoteOrFact || c.note || '')}
          </div>
        </div>
      `
    )
    .join('');

  return `
    <div class="atlas-dossier-content">
      <div class="atlas-dossier-header">
        <span>Nº ${escapeHtml(dossier.code)} · ${escapeHtml(dossier.mechanism)}</span>
        ${renderTierStamp(dossier.tier)}
      </div>
      <h3 style="margin-bottom:0.5rem;">${escapeHtml(dossier.title)}</h3>
      <div style="margin-bottom:0.75rem;">
        ${renderPairedEventButton(dossier)}
      </div>
      ${renderFiveStageTree(dossier)}
      ${renderClosedLoopRatchet(dossier)}
      ${renderDecoyVsLedger(dossier)}
      <div class="atlas-citations-block" style="margin-top:0.9rem;">
        <div style="font-family:var(--pixel); font-size:0.7rem; color:var(--gold); text-transform:uppercase;">
          Primary Sources &amp; Docket Verification (${citations.length})
        </div>
        ${citationsHtml}
      </div>
      ${renderBridgeBadges(dossier)}
    </div>
  `;
}

export function renderLineageCards(lineages, containerEl) {
  if (!containerEl || !Array.isArray(lineages)) return;
  containerEl.innerHTML = `
    <div class="atlas-lineage-grid">
      ${lineages
        .map(
          (lin) => `
          <article class="atlas-lineage-card">
            <div>
              <div class="atlas-lineage-title">${escapeHtml(lin.name)}</div>
              <ol class="atlas-lineage-chain">
                ${(lin.chain || [])
                  .map(
                    (step) => `
                    <li class="atlas-lineage-step">
                      <span class="atlas-lineage-year">${escapeHtml(step.year)}</span>
                      <strong>${escapeHtml(step.entity)}</strong>
                      <div style="color:var(--muted); margin-top:2px;">${escapeHtml(step.role)}</div>
                    </li>
                  `
                  )
                  .join('')}
              </ol>
            </div>
            <div class="atlas-lineage-loop-note">
              <strong>CLOSED LOOP:</strong> ${escapeHtml(lin.closedLoopSummary)}
            </div>
          </article>
        `
        )
        .join('')}
    </div>
  `;
}

export function renderMechanismFilterBar(mechanisms, containerEl, onSelect) {
  if (!containerEl || !Array.isArray(mechanisms)) return;
  const allBtn = `<button class="atlas-mech-pill" data-mech="ALL" aria-pressed="true">ALL MECHANISMS (${mechanisms.length})</button>`;
  const pills = mechanisms
    .map(
      (m) =>
        `<button class="atlas-mech-pill" data-mech="${escapeHtml(m.code)}" aria-pressed="false" title="${escapeHtml(m.summary)}">${escapeHtml(m.label)}</button>`
    )
    .join('');

  containerEl.innerHTML = `<div class="atlas-mech-bar">${allBtn}${pills}</div>`;
  containerEl.querySelectorAll('.atlas-mech-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      containerEl.querySelectorAll('.atlas-mech-pill').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      if (typeof onSelect === 'function') onSelect(btn.getAttribute('data-mech'));
    });
  });
}

export async function mountAtlasUI({
  atlasUrl = '/data/atlas-public.json',
  dossierAsideSelector = 'aside[aria-label="Dossier"]',
  lineageContainerSelector = '[data-atlas-lineages]',
  mechanismContainerSelector = '[data-atlas-mechanisms]'
} = {}) {
  try {
    const res = await fetch(atlasUrl);
    if (!res.ok) return null;
    const atlas = await res.json();

    const lineageEl = document.querySelector(lineageContainerSelector);
    if (lineageEl) renderLineageCards(atlas.lineages, lineageEl);

    const asideEl = document.querySelector(dossierAsideSelector);
    const openDossierByCode = (code) => {
      const found = atlas.dossiers.find((d) => d.code === code);
      if (found && asideEl) {
        const targetBody = asideEl.querySelector('div:last-child') || asideEl;
        targetBody.innerHTML = renderDossierInspectorHTML(found);
      }
    };

    const mechEl = document.querySelector(mechanismContainerSelector);
    if (mechEl) {
      renderMechanismFilterBar(atlas.mechanisms, mechEl, (mechCode) => {
        const firstMatch =
          mechCode === 'ALL'
            ? atlas.dossiers[0]
            : atlas.dossiers.find((d) => d.mechanism === mechCode);
        if (firstMatch) openDossierByCode(firstMatch.code);
      });
    }

    // Auto-open dossier if URL hash matches a dossier code (e.g. #CC-1912-IMM or #DS-1912-TITANIC)
    const hashCode = window.location.hash.replace(/^#/, '');
    if (hashCode) {
      openDossierByCode(hashCode);
    } else if (atlas.dossiers.length > 0 && asideEl) {
      openDossierByCode(atlas.dossiers[0].code);
    }

    window.addEventListener('hashchange', () => {
      const code = window.location.hash.replace(/^#/, '');
      if (code) openDossierByCode(code);
    });

    return { atlas, openDossierByCode };
  } catch {
    return null;
  }
}

if (typeof window !== 'undefined') {
  window.CornfieldAtlasUI = {
    mountAtlasUI,
    renderDossierInspectorHTML,
    renderLineageCards,
    renderMechanismFilterBar
  };
  document.addEventListener('DOMContentLoaded', () => {
    mountAtlasUI();
  });
}