import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('./public/crash-conduits.html', import.meta.url), 'utf8');
const additions = fs.readFileSync(new URL('./public/js/crash-finance-data.js', import.meta.url), 'utf8');
const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
const data = vm.runInNewContext(additions + '\n' + inline.slice(0, inline.indexOf('let activeNodeId')) + '\n;({nodes,lineages,financialEngineeringNodes,auditedLegacyNodes})');

function page() {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      innerHTML: '', textContent: '', style: {}, children: [],
      classList: { add() {}, remove() {}, toggle() {} },
      appendChild(child) { this.children.push(child); },
      addEventListener(name, fn) { this[name] = fn; }
    });
    return elements.get(id);
  }
  const context = vm.createContext({
    document: { getElementById: element, createElement: () => element('created-' + elements.size), querySelectorAll: () => [], querySelector: () => element('all-pill') },
    window: { location: { hash: '#petrodollar-recycling-1973' } },
    history: { replaceState() {} }
  });
  vm.runInContext(additions + '\n' + inline, context);
  return { context, element };
}

test('atlas adds seventeen unique source-linked entries and is chronological', () => {
  assert.equal(data.financialEngineeringNodes.length, 17);
  assert.equal(data.nodes.length, 85);
  assert.equal(new Set(data.nodes.map(n => n.id)).size, data.nodes.length);
  assert.ok(data.nodes.every((n, i) => !i || n.year >= data.nodes[i - 1].year));
});

test('new entries have complete renderer fields, evidence limits and specific HTTPS sources', () => {
  for (const n of [...data.financialEngineeringNodes, ...data.auditedLegacyNodes]) {
    for (const key of ['id', 'title', 'era', 'country', 'flag', 'category', 'evidence', 'crisis_window', 'quid_pro_quo', 'theft_mechanism', 'who_gained', 'who_lost', 'legacy', 'caveat']) assert.ok(n[key], n.id + ':' + key);
    assert.ok(Array.isArray(n.insiders));
    assert.ok(n.sources.length);
    for (const s of n.sources) { const u = new URL(s.url); assert.equal(u.protocol, 'https:'); assert.notEqual(u.pathname, '/'); assert.ok(s.publisher && s.title); }
  }
});

test('new mechanism groups only reference existing entries', () => {
  const ids = new Set(data.nodes.map(n => n.id));
  for (const group of data.lineages.slice(-4)) for (const id of group.node_ids) assert.ok(ids.has(id), id);
});

test('petrodollar entry separates recycling from unsupported dollar-only treaty claims', () => {
  const n = data.nodes.find(n => n.id === 'petrodollar-recycling-1973');
  assert.equal(n.sources.length, 2);
  assert.match(n.caveat, /do not establish a universal dollar-only oil treaty/);
  assert.match(n.theft_mechanism, /floating-rate/);
});

test('page initializes deep links, dynamic counts and item-level sources', () => {
  const { element } = page();
  assert.equal(element('all-node-count').textContent, 85);
  assert.match(element('inspector-content').innerHTML, /Petrodollar Recycling/);
  assert.match(element('inspector-content').innerHTML, /latin-american-debt-crisis/);
});

test('search and mechanism filters work; empty results clear the stale inspector', () => {
  const { context, element } = page();
  vm.runInContext("searchQuery = 'petrodollar'; refreshAndSelectFirst()", context);
  assert.ok(vm.runInContext('getFilteredNodes().length', context) > 0);
  vm.runInContext("searchQuery = ''; filterLineage('benchmarks-tax-structures')", context);
  assert.equal(vm.runInContext('getFilteredNodes().length', context), 3);
  vm.runInContext("searchQuery = 'no-such-unique-mechanism'; refreshAndSelectFirst()", context);
  assert.match(element('inspector-content').innerHTML, /No entries match/);
  assert.doesNotMatch(element('inspector-content').innerHTML, /Petrodollar Recycling/);
});

test('expanded coverage preserves legal status and reviewed-source limitations', () => {
  const node = id => data.nodes.find(n => n.id === id);
  assert.match(node('jefferson-swaps-2009').caveat, /without admitting or denying/);
  assert.match(node('jefferson-swaps-2009').caveat, /not a cash payment/);
  assert.match(node('aig-maiden-lane-2008').caveat, /full repayment/);
  assert.match(node('aig-maiden-lane-2008').who_lost, /not the same as a realized taxpayer loss/);
  assert.match(node('us-saudi-commission-1974').caveat, /Only GAO’s public highlights/);
  assert.match(node('trade-finance-stress-2014').caveat, /not the full 67-page report/);
  assert.match(node('sovereign-holdouts-2014').caveat, /not an independent review/);
  const { context, element } = page();
  vm.runInContext("filterLineage('public-debt-contracts')", context);
  assert.equal(vm.runInContext('getFilteredNodes().length', context), 2);
  assert.match(element('inspector-content').innerHTML, /Jefferson County/);
});

test('legacy audits replace whole objects without changing IDs or preserving unsupported fields', () => {
  const ids = Array.from(data.auditedLegacyNodes, entry => entry.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ['tulip-1636', 'south-sea-1720', 'mississippi-1720', 'credit-suisse-at1-2023', 'uk-ldi-gilt-crisis-2022', 'archegos-swap-implosion-2021', 'ftx_2022', 'theranos_2015']) assert.ok(ids.includes(id));
  for (const replacement of data.auditedLegacyNodes) {
    assert.equal(data.nodes.filter(n => n.id === replacement.id).length, 1);
    assert.equal(data.nodes.find(n => n.id === replacement.id), replacement);
  }
  const { context, element } = page();
  vm.runInContext("selectNode('tulip-1636')", context);
  assert.match(element('inspector-content').innerHTML, /Anne Goldgar/);
  assert.doesNotMatch(element('inspector-content').innerHTML, /Source audit pending|Planter Elite|Proto-Derivative Enclosure/);
  assert.match(data.nodes.find(n => n.id === 'south-sea-1720').theft_mechanism, /passed before/);
  assert.doesNotMatch(data.nodes.find(n => n.id === 'mississippi-1720').who_gained, /cleared billions/);
});

test('AT1 and LDI audits identify roles without attributing unsupported personal misconduct', () => {
  for (const id of ['credit-suisse-at1-2023', 'uk-ldi-gilt-crisis-2022']) {
    const node = data.nodes.find(n => n.id === id);
    assert.ok(node.sources.length);
    assert.ok(node.insiders.every(name => /\(.+\)/.test(name)));
    for (const key of ['title', 'evidence', 'crisis_window', 'quid_pro_quo', 'theft_mechanism', 'who_gained', 'who_lost', 'legacy', 'caveat']) assert.ok(node[key]);
  }
  assert.match(data.nodes.find(n => n.id === 'credit-suisse-at1-2023').caveat, /not establish the final legal outcome/);
  assert.doesNotMatch(JSON.stringify(data.nodes.find(n => n.id === 'credit-suisse-at1-2023')), /Axel Lehmann|Ulrich Körner|fire-sale acquisition/);
  assert.doesNotMatch(JSON.stringify(data.nodes.find(n => n.id === 'uk-ldi-gilt-crisis-2022')), /Architects|BlackRock|unfunded fiscal mini-budget triggered/);
  const { context, element } = page();
  vm.runInContext("selectNode('credit-suisse-at1-2023')", context);
  assert.match(element('inspector-content').innerHTML, /FINMA/);
  assert.doesNotMatch(element('inspector-content').innerHTML, /Source audit pending/);
});

test('Archegos, FTX and Theranos corrections retain dated legal status and remove unsupported blame', () => {
  const node = id => data.nodes.find(n => n.id === id);
  for (const id of ['archegos-swap-implosion-2021', 'ftx_2022', 'theranos_2015']) {
    const entry = node(id);
    for (const key of ['title', 'era', 'year', 'country', 'flag', 'category', 'evidence', 'crisis_window', 'quid_pro_quo', 'theft_mechanism', 'who_gained', 'who_lost', 'legacy', 'caveat']) assert.ok(entry[key], id + ': ' + key);
    assert.ok(entry.insiders.every(name => /\(.+\)/.test(name)));
    assert.ok(entry.sources.every(source => source.url.startsWith('https://') && source.publisher && source.title));
  }
  assert.match(node('archegos-swap-implosion-2021').caveat, /charging-stage account/);
  assert.doesNotMatch(JSON.stringify(node('archegos-swap-implosion-2021')), /convicted of federal racketeering|Thomas Gottstein|escaped with little or no loss/);
  assert.match(node('ftx_2022').evidence, /sentencing announcement/);
  assert.doesNotMatch(node('ftx_2022').insiders.join(' '), /Deltec|Silvergate|Signature/);
  assert.match(node('theranos_2015').caveat, /neither admitted nor denied/);
  assert.doesNotMatch(JSON.stringify(node('theranos_2015')), /National Security Board Shield|regulatory immunity in exchange for equity|Fortress Investment Group/);
  const { context, element } = page();
  for (const id of ['archegos-swap-implosion-2021', 'ftx_2022', 'theranos_2015']) {
    vm.runInContext('selectNode(' + JSON.stringify(id) + ')', context);
    assert.match(element('inspector-content').innerHTML, /Evidence basis/);
    assert.doesNotMatch(element('inspector-content').innerHTML, /Source audit pending/);
  }
});

test('bank rescues and debt crises distinguish assistance, losses and culpability', () => {
  const node = id => data.nodes.find(n => n.id === id);
  for (const id of ['london-whale-2012', 'continental-illinois-1984', 'ltcm-bailout-1998', 'asian-financial-crisis-1997', 'latin-american-debt-1982']) {
    const entry = node(id);
    for (const key of ['evidence', 'crisis_window', 'quid_pro_quo', 'theft_mechanism', 'who_gained', 'who_lost', 'legacy', 'caveat']) assert.ok(entry[key]);
    assert.ok(entry.insiders.length && entry.insiders.every(name => /\(.+\)/.test(name)));
    assert.ok(entry.sources.length && entry.sources.every(source => /^https:\/\//.test(source.url)));
  }
  assert.match(node('ltcm-bailout-1998').quid_pro_quo, /did not put its own funds at risk/);
  assert.match(node('continental-illinois-1984').who_lost, /distinct from the gross size of assistance/);
  assert.match(node('latin-american-debt-1982').who_gained, /not a Latin-America-only total/);
  assert.doesNotMatch(node('london-whale-2012').insiders.join(' '), /BlueMountain|Saba Capital/);
  assert.doesNotMatch(node('asian-financial-crisis-1997').who_gained, /Lone Star|Carlyle|Newbridge/);
  const { context, element } = page();
  for (const id of ['london-whale-2012', 'continental-illinois-1984', 'ltcm-bailout-1998', 'asian-financial-crisis-1997', 'latin-american-debt-1982']) {
    vm.runInContext('selectNode(' + JSON.stringify(id) + ')', context);
    assert.match(element('inspector-content').innerHTML, /Evidence basis/);
    assert.doesNotMatch(element('inspector-content').innerHTML, /Source audit pending/);
  }
});

test('mirror trades, customer funds and settlement risk retain separate evidence boundaries', () => {
  const node = id => data.nodes.find(n => n.id === id);
  const ids = ['deutsche_mirror_trump_2011', 'mf-global-rehypothecation-2011', 'herstatt-risk-1974'];
  for (const id of ids) {
    const entry = node(id);
    assert.ok(entry.sources.length && entry.caveat && entry.evidence);
    assert.ok(entry.insiders.every(name => /\(.+\)/.test(name)));
  }
  assert.doesNotMatch(node('deutsche_mirror_trump_2011').insiders.join(' '), /Donald Trump|Vrablic|Kennedy/);
  assert.match(node('deutsche_mirror_trump_2011').who_lost, /transaction-volume measure/);
  assert.match(node('mf-global-rehypothecation-2011').evidence, /admission/);
  assert.match(node('mf-global-rehypothecation-2011').who_lost, /not proof that every customer/);
  assert.match(node('mf-global-rehypothecation-2011').caveat, /not their current legal status/);
  assert.doesNotMatch(JSON.stringify(node('herstatt-risk-1974')), /38,000|620 million|Dany Dattel/);
  const { context, element } = page();
  for (const id of ids) {
    vm.runInContext('selectNode(' + JSON.stringify(id) + ')', context);
    assert.match(element('inspector-content').innerHTML, /Evidence basis/);
    assert.doesNotMatch(element('inspector-content').innerHTML, /Source audit pending/);
  }
});

test('Maiden Lane corrections separate risk, repayment and vendor-role allegations', () => {
  const node = id => data.nodes.find(n => n.id === id);
  assert.match(node('aig-goldman-cds-2008').who_lost, /not a realized taxpayer loss/);
  assert.match(node('blackrock-maidenlane-2008').who_gained, /Vendor compensation.*not quantified/);
  assert.doesNotMatch(node('aig-goldman-cds-2008').insiders.join(' '), /Cassano|Blankfein/);
  assert.doesNotMatch(node('blackrock-maidenlane-2008').theft_mechanism, /Aladdin|Fourth Branch/);
  const { context, element } = page();
  for (const id of ['aig-goldman-cds-2008', 'blackrock-maidenlane-2008']) {
    vm.runInContext('selectNode(' + JSON.stringify(id) + ')', context);
    assert.match(element('inspector-content').innerHTML, /Evidence basis/);
    assert.doesNotMatch(element('inspector-content').innerHTML, /Source audit pending/);
  }
});

test('Gold Pool and dot-com corrections preserve supported parties without importing unsupported losses', () => {
  const gold = data.nodes.find(n => n.id === 'london-gold-pool-1968');
  const dotcom = data.nodes.find(n => n.id === 'dot-com-bubble-2000');
  assert.equal(gold.insiders.filter(role => /founding pool member/.test(role)).length, 8);
  assert.match(gold.theft_mechanism, /separate official and private tiers/);
  assert.match(gold.who_lost, /does not provide a pool loss ledger/);
  assert.doesNotMatch(JSON.stringify(gold), /3\.5 billion|2\.4 billion|Fort Knox|Rowley|Cromer/);
  assert.equal(dotcom.insiders.filter(role => /settling research-conflict enforcement actions|settling firm/.test(role)).length, 10);
  assert.match(dotcom.evidence, /neither admitted nor denied/);
  assert.match(dotcom.who_lost, /1,387\.5 million/);
  assert.match(dotcom.who_lost, /not a measure of aggregate investor losses/);
  assert.match(dotcom.caveat, /subject to court approval/);
  assert.doesNotMatch(dotcom.insiders.join(' '), /Ebbers|Andersen/);
  assert.doesNotMatch(dotcom.theft_mechanism, /capitalized expenses|round-trip|11 billion/);
  const { context, element } = page();
  for (const entry of [gold, dotcom]) {
    assert.ok(entry.insiders.every(role => /\(.+\)/.test(role)));
    vm.runInContext('selectNode(' + JSON.stringify(entry.id) + ')', context);
    assert.match(element('inspector-content').innerHTML, /Evidence basis/);
    assert.doesNotMatch(element('inspector-content').innerHTML, /Source audit pending/);
  }
});

test('Madoff correction separates admissions, forfeitures and bounded victim recovery', () => {
  const entry = data.nodes.find(n => n.id === 'madoff_2008');
  assert.equal(entry.year, 2008);
  assert.match(entry.crisis_window, /pleaded guilty to 11 federal felonies/);
  assert.match(entry.legacy, /two Bank Secrecy Act charges/);
  assert.match(entry.evidence, /admitted conduct/);
  assert.match(entry.who_lost, /40,930 victims.*93\.71%/);
  assert.match(entry.who_lost, /not a universal recovery rate/);
  assert.match(entry.caveat, /Civil forfeiture contributions do not by themselves establish criminal guilt/);
  assert.doesNotMatch(entry.insiders.join(' '), /Walter Noel|Tremont/);
  assert.doesNotMatch(entry.theft_mechanism, /shadow liquidity|collateral|65 billion/i);
  assert.ok(entry.insiders.every(role => /\(.+\)/.test(role)));
  const { context, element } = page();
  vm.runInContext("selectNode('madoff_2008')", context);
  assert.match(element('inspector-content').innerHTML, /Evidence basis/);
  assert.doesNotMatch(element('inspector-content').innerHTML, /Source audit pending/);
});

test('Flash Crash correction distinguishes market inquiry from individual spoofing guilt', () => {
  const entry = data.nodes.find(n => n.id === 'flash-boys-2010');
  assert.match(entry.legacy, /pleaded guilty to one count each of wire fraud and spoofing/);
  assert.match(entry.theft_mechanism, /does not establish that he alone caused the crash/);
  assert.match(entry.who_gained, /12\.8 million.*more than five years/);
  assert.match(entry.who_gained, /not a May 6-only profit total/);
  assert.match(entry.who_lost, /not a quantified permanent investor-loss total/);
  assert.match(entry.legacy, /proposals at that date/);
  assert.doesNotMatch(entry.insiders.join(' '), /Waddell|Nanex|Citadel|Virtu/);
  assert.doesNotMatch(entry.theft_mechanism, /4\.1 billion|75,000|quote stuffing/i);
  assert.ok(entry.insiders.every(role => /\(.+\)/.test(role)));
  const { context, element } = page();
  vm.runInContext("selectNode('flash-boys-2010')", context);
  assert.match(element('inspector-content').innerHTML, /Evidence basis/);
  assert.doesNotMatch(element('inspector-content').innerHTML, /Source audit pending/);
});

test('1990s batch separates disclosure findings, consent penalties and policy estimates', () => {
  const node = id => data.nodes.find(n => n.id === id);
  const orange = node('orange-county-1994');
  const copper = node('sumitomo-copper-1996');
  const mexico = node('mexico_tequilazo_1994');
  assert.equal(orange.insiders.filter(role => /supervisor/i.test(role) && !/Board/.test(role)).length, 5);
  assert.match(orange.who_lost, /600 million.*not the entire pool/);
  assert.match(orange.caveat, /not a criminal judgment/);
  assert.doesNotMatch(orange.insiders.join(' '), /Merrill|Goldman/);
  assert.match(copper.evidence, /neither admitted nor denied/);
  assert.match(copper.who_lost, /125 million.*25 million.*escrowed/);
  assert.match(copper.who_lost, /not a trading-loss measure/);
  assert.doesNotMatch(copper.insiders.join(' '), /Hamanaka|JPMorgan|Chase|UBS|Merrill/);
  assert.match(mexico.who_lost, /14\.4% of 1997 GDP/);
  assert.match(mexico.caveat, /not a court finding or an independent audit/);
  assert.doesNotMatch(mexico.insiders.join(' '), /Salinas|Aspe|Zedillo|Oligarchs/);
  assert.doesNotMatch(mexico.theft_mechanism, /tip.off|fraudulent|55 billion/i);
  const { context, element } = page();
  for (const entry of [orange, copper, mexico]) {
    assert.ok(entry.insiders.every(role => /\(.+\)/.test(role)));
    vm.runInContext('selectNode(' + JSON.stringify(entry.id) + ')', context);
    assert.match(element('inspector-content').innerHTML, /Evidence basis/);
    assert.doesNotMatch(element('inspector-content').innerHTML, /Source audit pending/);
  }
});

test('Enron correction distinguishes bank settlements, criminal outcomes and victim-fund amounts', () => {
  const entry = data.nodes.find(n => n.id === 'enron_2001');
  assert.equal(entry.year, 2001);
  assert.match(entry.quid_pro_quo, /without admitting or denying/);
  assert.match(entry.who_lost, /\$135 million from J.P. Morgan Chase and \$120 million from Citigroup/);
  assert.match(entry.who_lost, /101 million concerned Enron and \$19 million Dynegy/);
  assert.match(entry.who_lost, /intended \$236 million for Enron victims/);
  assert.match(entry.who_lost, /approximately \$42 million forfeiture/);
  assert.match(entry.who_lost, /not aggregate investor losses or proof of completed distribution/);
  assert.match(entry.legacy, /resentencing to 168 months/);
  assert.match(entry.who_gained, /over \$23 million/);
  assert.doesNotMatch(entry.insiders.join(' '), /Kenneth Lay|Arthur Andersen/);
  assert.doesNotMatch(entry.theft_mechanism, /14B|14 billion|Chewco|LJM/);
  assert.doesNotMatch(entry.legacy, /cartel|monopoly/i);
  assert.ok(entry.insiders.every(role => /\(.+\)/.test(role)));
  const { context, element } = page();
  vm.runInContext("selectNode('enron_2001')", context);
  assert.match(element('inspector-content').innerHTML, /Evidence basis/);
  assert.doesNotMatch(element('inspector-content').innerHTML, /Source audit pending/);
});

test('BCCI correction separates Senate findings, liquidation plea and depositor scope', () => {
  const entry = data.nodes.find(n => n.id === 'bcci_1991');
  assert.equal(entry.year, 1972);
  assert.match(entry.quid_pro_quo, /central-bank deposits|bribes|bribing/);
  assert.match(entry.theft_mechanism, /ICIC|unrecorded deposits|front-men|shell corporations/);
  assert.match(entry.who_gained, /3,000 criminal customers/);
  assert.match(entry.who_lost, /one million depositors/);
  assert.match(entry.legacy, /Foreign Bank Supervision Enhancement Act/);
  assert.match(entry.caveat, /does not establish that CIA covert operations ran through BCCI as policy/);
  assert.doesNotMatch(entry.who_lost, /250,000/);
  assert.doesNotMatch(entry.legacy, /Swiss private banking|charity conduit/);
  assert.doesNotMatch(entry.crisis_window, /Afghan Mujahideen|Iran-Contra clandestine/);
  assert.ok(entry.insiders.every(role => /\(.+\)/.test(role)));
  const { context, element } = page();
  vm.runInContext("selectNode('bcci_1991')", context);
  assert.match(element('inspector-content').innerHTML, /Evidence basis/);
  assert.doesNotMatch(element('inspector-content').innerHTML, /Source audit pending/);
});

test('Haiti indemnity correction separates ordinance, loan discount and legacy estimates', () => {
  const entry = data.nodes.find(n => n.id === 'haiti-indemnity-1825');
  assert.equal(entry.year, 1825);
  assert.match(entry.crisis_window, /150 million francs/);
  assert.match(entry.quid_pro_quo, /first 30-million-franc installment/);
  assert.match(entry.theft_mechanism, /800 francs per 1,000|20 percent discount/);
  assert.match(entry.who_gained, /Laffitte|National City Bank/);
  assert.match(entry.who_lost, /112 million francs|1947/);
  assert.match(entry.legacy, /odious debt/);
  assert.match(entry.caveat, /estimates, not audited facts/);
  assert.doesNotMatch(entry.theft_mechanism, /14 warships|gunboat/);
  assert.ok(entry.insiders.every(role => /\(.+\)/.test(role)));
  const { context, element } = page();
  vm.runInContext("selectNode('haiti-indemnity-1825')", context);
  assert.match(element('inspector-content').innerHTML, /Evidence basis/);
  assert.doesNotMatch(element('inspector-content').innerHTML, /Source audit pending/);
});

test('entity extractor uses the same audited legacy objects as the browser', () => {
  const source = fs.readFileSync(new URL('./research/extract-entities.mjs', import.meta.url), 'utf8');
  const functionCode = source.slice(source.indexOf('function pageData(name)'), source.indexOf('function htmlSections(name)'));
  const extracted = vm.runInNewContext(functionCode + "\n;pageData('crash-conduits')", {
    fs, path, vm, PUBLIC: fileURLToPath(new URL('./public', import.meta.url))
  });
  for (const replacement of data.auditedLegacyNodes) {
    assert.equal(JSON.stringify(extracted.nodes.find(n => n.id === replacement.id)), JSON.stringify(replacement));
  }
  assert.equal(extracted.nodes.length, data.nodes.length);
});

test('legacy audit application rejects missing and duplicate replacement targets', () => {
  const code = additions + '\n;applyLegacyAudits(input)';
  assert.throws(() => vm.runInNewContext(code, { input: [] }), /one matching ID/);
  assert.throws(() => vm.runInNewContext(code, { input: [{ id: 'tulip-1636' }, { id: 'tulip-1636' }] }), /one matching ID/);
});

test('unaudited legacy entries show an explicit source-audit warning', () => {
  const { context, element } = page();
  vm.runInContext("selectNode('northern-pacific-corner-1901')", context);
  assert.match(element('inspector-content').innerHTML, /Source audit pending/);
  assert.doesNotMatch(element('inspector-content').innerHTML, /Sources:<\/strong> Compiled/);
});

test('mention ledger does not describe recurrence as verified crimes', () => {
  const { element } = page();
  assert.match(element('culprit-cards-grid').innerHTML, /Appears in participant lists/);
  assert.doesNotMatch(element('culprit-cards-grid').innerHTML, /Verified Conduits|CRITICAL CONDUITS/);
  assert.doesNotMatch(html, /their crimes|Top Recurring Kingpins|65 Master Nodes/);
});
