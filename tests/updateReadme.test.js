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
          updateRef: vi.fn()
        }
      }
    }))
  };
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
  });

  it('skips updating when the README section has not changed', async () => {
    fs.readFileSync.mockReturnValue(`Start<!--START_SECTION:activity-->
existing content
<!--END_SECTION:activity-->End`);

    await updateReadme('existing content');

    expect(core.notice).toHaveBeenCalledWith('📄 No changes in README.md, skipping...');
    expect(github.getOctokit).not.toHaveBeenCalled();
  });

  it('logs activity and exits early when running under act', async () => {
    process.env.ACT = 'true';
    fs.readFileSync.mockReturnValue(`Start<!--START_SECTION:activity-->
old content
<!--END_SECTION:activity-->End`);

    await updateReadme('new content');

    expect(core.notice).toHaveBeenCalledWith('🚧 Act-Debug mode enabled');
    expect(github.getOctokit).not.toHaveBeenCalled();
  });
});
