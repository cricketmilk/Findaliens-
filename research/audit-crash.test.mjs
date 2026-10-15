import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./audit-crash.mjs', import.meta.url));
function run(...args) {
  return spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 10000 });
}

test('coverage report distinguishes schema checks from factual verification', () => {
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Legacy coverage: \d+\/68 replaced/);
  assert.match(result.stdout, /not factual verification/);
});

test('entry handoff emits only one unverified candidate and a claim-support contract', () => {
  const result = run('--entry', 'northern-pacific-corner-1901');
  assert.equal(result.status, 0, result.stderr);
  const packet = JSON.parse(result.stdout);
  assert.equal(packet.id, 'northern-pacific-corner-1901');
  assert.equal(packet.originalClaims.id, packet.id);
  assert.equal(packet.originalClaimsAreUnverified, true);
  assert.ok(packet.requiredFields.includes('sources'));
  assert.ok(packet.requiredFields.includes('caveat'));
  assert.match(packet.returnFormat.claimSupport, /passage/);
  assert.match(packet.reviewGate, /compare passages/);
  assert.doesNotMatch(result.stdout, /const nodes =|auditedLegacyNodes/);
});

test('missing, unknown and already-corrected IDs are rejected', () => {
  for (const args of [['--entry'], ['--entry', 'not-an-entry'], ['--entry', 'tulip-1636']]) {
    const result = run(...args);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Expected a pending legacy ID/);
  }
});
