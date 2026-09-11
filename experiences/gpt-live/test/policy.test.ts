import assert from 'node:assert/strict';
import test from 'node:test';
import {EFFECTS, EMOTIONS, THEMES, equal, hash, validateActions, withinBudget} from '../netlify/functions/policy.mjs';

const sectionIds = ['discover', 'catalog', 'agents', 'parallel', 'about'];

test('screen effects are limited to short predefined visual treatments', () => {
  for(const value of EFFECTS) assert.deepEqual(validateActions([{type:'effect',value}],sectionIds),[{type:'effect',value}]);
  for(const value of ['flash','fullscreen','javascript:alert(1)',{},null]) assert.throws(()=>validateActions([{type:'effect',value}],sectionIds));
  assert.throws(()=>validateActions([{type:'effect',value:'confetti',duration:999999}],sectionIds));
});

test('allows bounded presentation actions and trusted navigation IDs', () => {
  const actions = [
    {type: 'navigate', target: 'catalog'},
    {type: 'theme', value: 'ocean'},
    {type: 'emotion', value: 'playful'},
    {type: 'rewrite', target: 'hero', value: 'Good tools for your next big idea.'},
  ];
  assert.deepEqual(validateActions(actions, sectionIds), actions);
  assert.deepEqual(validateActions([{type: 'highlight', target: 'parallel'}], sectionIds), [{type: 'highlight', target: 'parallel'}]);
});

test('rejects an entire mixed batch when one action exceeds website permission', () => {
  assert.throws(() => validateActions([
    {type: 'theme', value: 'ocean'}, {type: 'navigate', target: 'https://attacker.example'},
  ], sectionIds));
  assert.throws(() => validateActions([{type: 'navigate', target: 'catalog', url: 'https://attacker.example'}], sectionIds));
  assert.throws(() => validateActions([{type: 'execute', value: 'document.cookie'}], sectionIds));
  assert.throws(() => validateActions([{type: 'rewrite', target: 'body', value: 'replace the entire site'}], sectionIds));
});

test('rejects executable, network and persistence-shaped actions', () => {
  for (const type of ['eval', 'script', 'fetch', 'purchase', 'login', 'send_email', 'persist', 'deploy', '__proto__']) {
    assert.throws(() => validateActions([{type, value: 'anything'}], sectionIds), type);
  }
  for (const target of ['javascript:alert(1)', '../secret', '#catalog', 'unknown', 'CATALOG']) {
    assert.throws(() => validateActions([{type: 'navigate', target}], sectionIds), target);
  }
});

test('enforces four-action response boundary without truncating a dangerous tail', () => {
  assert.deepEqual(validateActions([], sectionIds), []);
  assert.equal(validateActions(Array.from({length: 4}, () => ({type: 'reset'})), sectionIds).length, 4);
  assert.throws(() => validateActions(Array.from({length: 5}, () => ({type: 'reset'})), sectionIds));
  for (const input of [null, undefined, {}, '[]', 0, true, [null], [[]], ['reset']]) {
    assert.throws(() => validateActions(input, sectionIds));
  }
});

test('allows only supported theme, emotion and density values', () => {
  for (const value of THEMES) assert.deepEqual(validateActions([{type: 'theme', value}], sectionIds), [{type: 'theme', value}]);
  for (const value of EMOTIONS) assert.deepEqual(validateActions([{type: 'emotion', value}], sectionIds), [{type: 'emotion', value}]);
  for (const value of ['comfortable', 'compact']) assert.deepEqual(validateActions([{type: 'density', value}], sectionIds), [{type: 'density', value}]);
  for (const type of ['theme', 'emotion', 'density']) {
    for (const value of ['', 'url(https://attacker.example)', 'ORIGINAL', null, 1, {}]) {
      assert.throws(() => validateActions([{type, value}], sectionIds));
    }
  }
});

test('enforces text boundaries and permits an intentional empty catalog filter', () => {
  assert.equal(validateActions([{type: 'filter', value: 'a'.repeat(100)}], sectionIds)[0]?.value?.length, 100);
  assert.throws(() => validateActions([{type: 'filter', value: 'a'.repeat(101)}], sectionIds));
  assert.deepEqual(validateActions([{type: 'filter', value: ''}], sectionIds), [{type: 'filter', value: ''}]);
  assert.equal(validateActions([{type: 'rewrite', target: 'hero', value: 'a'.repeat(180)}], sectionIds)[0]?.value?.length, 180);
  assert.throws(() => validateActions([{type: 'rewrite', target: 'hero', value: 'a'.repeat(181)}], sectionIds));
  assert.throws(() => validateActions([{type: 'rewrite', target: 'hero', value: '   '}], sectionIds));
});

test('malformed filter values are rejected rather than converted into clearing the filter', () => {
  for (const value of [undefined, null, 0, false, [], {}]) {
    assert.throws(() => validateActions([{type: 'filter', value}], sectionIds), `Rejected ${String(value)}`);
  }
  assert.throws(() => validateActions([{type: 'filter'}], sectionIds));
});

test('returns fresh allowlisted action objects without untrusted fields', () => {
  const input = [{type: 'theme', value: 'ocean'}];
  const output = validateActions(input, sectionIds);
  input[0]!.value = 'forest';
  assert.equal(output[0]?.value, 'ocean');
  const poison = JSON.parse('[{"type":"reset","__proto__":{"polluted":true}}]') as unknown;
  assert.throws(() => validateActions(poison, sectionIds));
});

test('finite default admission permits accept exactly twenty unique slot numbers', () => {
  let admitted = 0;
  for (let slot = -2; slot <= 22; slot++) {
    const allowed = withinBudget(slot);
    assert.equal(allowed, slot >= 0 && slot < 20);
    if (allowed) admitted++;
  }
  assert.equal(admitted, 20);
  for (const slot of [NaN, Infinity, -Infinity, 0.5, 19.5, Number.MAX_SAFE_INTEGER]) assert.equal(withinBudget(slot), false);
});

test('budget policy rejects invalid caps instead of opening an unbounded envelope', () => {
  for (const cap of [NaN, Infinity, -Infinity, -1, 0, 20.5]) assert.equal(withinBudget(0, cap), false, `cap=${cap}`);
  assert.equal(withinBudget(0, 1), true);
  assert.equal(withinBudget(1, 1), false);
  assert.equal(withinBudget(4, 5), true);
  assert.equal(withinBudget(5, 5), false);
});

test('hash is deterministic and tokens differing by one character do not compare equal', () => {
  const token = `0.${'a'.repeat(48)}`;
  const other = `0.${'a'.repeat(47)}b`;
  assert.match(hash(token), /^[a-f0-9]{64}$/);
  assert.equal(equal(hash(token), hash(token)), true);
  assert.equal(equal(hash(token), hash(other)), false);
  assert.equal(equal('short', 'longer'), false);
  assert.equal(equal('', ''), true);
});

test('secret comparison does not throw when UTF-8 byte lengths differ', () => {
  assert.equal(equal('é', 'a'), false);
  assert.equal(equal('a', 'é'), false);
  assert.equal(equal('é', 'é'), true);
});
