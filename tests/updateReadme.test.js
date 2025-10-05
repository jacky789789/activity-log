const { vi, describe, it, expect, beforeEach, afterEach } = require('vitest');

const Module = require('module');

if (typeof vi.mock !== 'function') {
  const moduleStore = new Map();
  const originalRequire = Module.prototype.require;
  const patched = Symbol.for('vitest.require.patched');

  const resolveRequest = (request, parentModule) => {
    try {
      return Module._resolveFilename(request, parentModule);
    } catch (error) {
      return request;
    }
  };

  if (!Module.prototype.require[patched]) {
    Module.prototype.require = function (request) {
      const key = resolveRequest(request, this);
      if (moduleStore.has(key)) {
        const entry = moduleStore.get(key);
        if (!entry.instance) {
          entry.instance = entry.factory();
        }
        return entry.instance;
      }
      if (moduleStore.has(request)) {
        const entry = moduleStore.get(request);
        if (!entry.instance) {
          entry.instance = entry.factory();
        }
        return entry.instance;
      }
      return originalRequire.call(this, request);
    };
    Module.prototype.require[patched] = true;
  }

  vi.mock = (moduleId, factory) => {
    const key = resolveRequest(moduleId, module);
    const entry = { factory };
    moduleStore.set(key, entry);
    moduleStore.set(moduleId, entry);
  };

  const originalClearAll = vi.clearAllMocks?.bind(vi);
  vi.clearAllMocks = () => {
    originalClearAll?.();
    moduleStore.forEach((entry) => {
      if (entry.instance && typeof entry.instance === 'object') {
        Object.values(entry.instance).forEach((value) => {
          if (value && typeof value.mockClear === 'function') {
            value.mockClear();
          }
        });
      }
    });
  };

  const originalResetAll = vi.resetAllMocks?.bind(vi);
  vi.resetAllMocks = () => {
    originalResetAll?.();
    moduleStore.clear();
  };
}

const mockInputValues = {};
const mockGetInput = vi.fn((name) => mockInputValues[name] ?? '');

vi.mock('@actions/core', () => {
  return {
    getInput: mockGetInput,
    setFailed: vi.fn(),
    warning: vi.fn(),
    notice: vi.fn()
  };
});

vi.mock('@actions/github', () => {
  return {
    context: {
      repo: { owner: 'octocat', repo: 'example' },
      ref: 'refs/heads/main'
    },
    getOctokit: vi.fn(() => ({
      rest: {
        git: {
          getRef: vi.fn(),
          getCommit: vi.fn(),
          createTree: vi.fn(),
          createCommit: vi.fn(),
@@ -31,51 +98,51 @@ vi.mock('@actions/github', () => {
});

vi.mock('fs', () => {
  return {
    readFileSync: vi.fn()
  };
});

vi.mock('../src/config', () => {
  return {
    commitMessage: 'Update README',
    dryRun: false,
    readmePath: 'README.md',
    token: 'token'
  };
});

const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const { updateReadme } = require('../src/utils/file');

describe('updateReadme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockInputValues).forEach((key) => delete mockInputValues[key]);
    Object.assign(mockInputValues, {
      GITHUB_USERNAME: 'octocat',
      GITHUB_TOKEN: 'gh-token',
      GH_API_URL: 'https://api.github.com',
      EVENT_LIMIT: '10',
      OUTPUT_STYLE: 'MARKDOWN',
      IGNORE_EVENTS: '[]',
      HIDE_DETAILS_ON_PRIVATE_REPOS: 'false',
      README_PATH: 'README.md',
      COMMIT_MESSAGE: 'Update README',
      EVENT_EMOJI_MAP: '',
      DRY_RUN: 'false'
    });
    delete process.env.ACT;
  });

  afterEach(() => {
    delete process.env.ACT;
  });

  it('warns and returns when no activity is provided', async () => {
    await updateReadme('');

    expect(core.warning).toHaveBeenCalledWith('⚠️ No activity to update. The README.md will not be changed.');
    expect(github.getOctokit).not.toHaveBeenCalled();
