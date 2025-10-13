// tests/updateReadme.test.js  (CommonJS)
const test = require('node:test');
const assert = require('node:assert/strict');

// 建議用依賴注入或假物件來 stub GitHub client
const fakeGithub = {
  getOctokit: () => ({
    rest: {
      repos: {
        getContent: async () => ({
          data: { content: Buffer.from('# README').toString('base64') }
        }),
      },
    },
  }),
};

test('README.md should exist and not be empty', async () => {
  // 在 CJS 裡如果要載 ESM，可用動態 import 放在 async 區塊
  const { updateReadme } = await import('../src/updateReadme.js');
  const ok = await updateReadme({ github: fakeGithub });
  assert.equal(ok, true);
});
