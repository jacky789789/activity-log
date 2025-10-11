import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

// 檢查 README.md 是否存在且非空
test('README.md should exist and not be empty', () => {
  const txt = readFileSync('README.md', 'utf8');
  assert.ok(txt.length > 0, 'README.md is empty');
});
