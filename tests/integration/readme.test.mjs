import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

test('README.md should be present and not empty', () => {
  const txt = readFileSync('README.md', 'utf8');
  assert.ok(txt.length > 0, 'README.md is empty');
});
