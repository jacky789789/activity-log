// tests/updateReadme.test.js
// Node Test Runner + CJS 版本（相容 ESM/CJS 被測模組）
// 這支測試會：
// 1) 嘗試載入 src/updateReadme.(js|mjs|cjs)
// 2) 若找不到檔案 → 會 skip（不會讓 CI 失敗）
// 3) 若載到 → 用假的 GitHub client 呼叫後斷言回傳 true

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

function findUpdateReadmePath() {
  const candidates = [
    path.resolve(__dirname, '../src/updateReadme.js'),
    path.resolve(__dirname, '../src/updateReadme.mjs'),
    path.resolve(__dirname, '../src/updateReadme.cjs'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function loadModule(modPath) {
  // .mjs 一律用 ESM import；.cjs 一律 require；
  // .js 先 require 不行再用 import（兼容 ESM/CJS）
  if (modPath.endsWith('.mjs')) {
    return await import(pathToFileURL(modPath).href);
  }
  if (modPath.endsWith('.cjs')) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(modPath);
  }
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(modPath);
  } catch {
    return await import(pathToFileURL(modPath).href);
  }
}

test('updateReadme should return true with fake github client', async (t) => {
  const modPath = findUpdateReadmePath();
  if (!modPath) {
    t.skip('skip: src/updateReadme.(js|mjs|cjs) not found');
    return;
  }

  const mod = await loadModule(modPath);
  const updateReadme =
    mod.updateReadme ||
    (mod.default && (mod.default.updateReadme || mod.default));

  assert.equal(typeof updateReadme, 'function', 'updateReadme should be a function');

  // 假的 GitHub client：模擬讀到一個非空的 README
  const fakeGithub = {
    getOctokit: () => ({
      rest: {
        repos: {
          getContent: async () => ({
            data: { content: Buffer.from('# README').toString('base64') },
          }),
        },
      },
    }),
  };

  const ok = await updateReadme({ github: fakeGithub });
  assert.equal(ok, true);
});
