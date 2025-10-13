// tests/updateReadme.test.js
import test from 'node:test';
import assert from 'node:assert/strict';

// 手動 stub 一個假的 GitHub client（取代 vi.mock）
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
  // 假設你的 src/updateReadme.js 匯出一個可注入依賴的函式
  const { updateReadme } = await import('../src/updateReadme.js');
  const ok = await updateReadme({ github: fakeGithub }); // 用參數注入
  assert.equal(ok, true);
});
