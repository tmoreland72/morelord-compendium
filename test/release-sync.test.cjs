const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const sync = require('../scripts/release-sync.cjs');
const root = path.join(__dirname, '..');

function fixture({ tagVersion = null, latestVersion = '1.0.6', exists = false, draft = false, failure = null } = {}) {
  const calls = [];
  let tag = tagVersion;
  let latest = latestVersion;
  const missing = () => { throw Object.assign(new Error('Not found'), { status: 404 }); };
  const response = data => ({ data });
  const repos = {
    getBranch: async () => response({ commit: { sha: 'published-commit' } }),
    getContent: async ({ ref }) => response({ content: Buffer.from(JSON.stringify({ version: ref.startsWith('refs/tags/') ? tag : '1.0.8' })).toString('base64') }),
    getReleaseByTag: async () => { if (failure) throw Object.assign(new Error('API failure'), { status: failure }); return exists ? response({ id: 8, draft }) : missing(); },
    getLatestRelease: async () => latest ? response({ tag_name: latest }) : missing(),
    createRelease: async args => { calls.push(args); tag ??= args.tag_name; latest = args.tag_name; return response({ id: 8 }); },
    updateRelease: async args => { calls.push(args); latest = '1.0.8'; return response({ id: 8 }); }
  };
  return { calls, args: { github: { rest: { repos, git: { getRef: async () => tag ? response({}) : missing() } } }, context: { repo: { owner: 'test', repo: 'test' } }, core: { info() {} } } };
}

test('repairs the original missing tag/release and targets the published commit', async () => {
  const f = fixture(); await sync(f.args);
  assert.equal(f.calls[0].tag_name, '1.0.8');
  assert.equal(f.calls[0].target_commitish, 'published-commit');
});
test('aligned releases are a no-op', async () => {
  const f = fixture({ tagVersion: '1.0.8', latestVersion: '1.0.8', exists: true });
  await sync(f.args); assert.equal(f.calls.length, 0);
});
test('repairs latest without replacing an existing release', async () => {
  const f = fixture({ tagVersion: '1.0.8', exists: true });
  await sync(f.args); assert.deepEqual(f.calls[0], { owner: 'test', repo: 'test', release_id: 8, make_latest: 'true' });
});
test('refuses conflicting tags, drafts, downgrades and API failures', async () => {
  for (const options of [{ tagVersion: '1.0.7' }, { tagVersion: '1.0.8', exists: true, draft: true }, { latestVersion: '1.0.9' }, { failure: 403 }]) {
    const f = fixture(options); await assert.rejects(sync(f.args)); assert.equal(f.calls.length, 0);
  }
});
test('an existing valid tag can acquire its missing release', async () => {
  const f = fixture({ tagVersion: '1.0.8', latestVersion: null }); await sync(f.args); assert.equal(f.calls.length, 1);
});

test('builds a newest-first changelog for in-Foundry viewers', () => {
  const changelog = sync.buildChangelog('Graypes Compendium', [
    {
      version: '1.0.9',
      markdown: '# Older\n\n- First\n\n---\n\n## Verification\n\n- hidden\n'
    },
    {
      version: '1.10.0',
      markdown: '## Fixes\n\n### Details\n\n* Nested\n'
    },
    {
      version: '1.9.0',
      markdown: '###Added\n\n+ Middle\n\n## Internal test\n\n- secret\n'
    },
    {
      version: '1.0.10',
      markdown: '# Title 1.0.10\n\n## What Changed\n\n### Improvements\n\n- Visible\n\n## Compatibility and verification\n\nPassed the internal tests.\n'
    }
  ]);
  assert.equal(changelog, [
    '# Graypes Compendium Changelog',
    '',
    '## 1.10.0',
    '',
    '### Fixes',
    '',
    '#### Details',
    '',
    '- Nested',
    '',
    '## 1.9.0',
    '',
    '### Added',
    '',
    '- Middle',
    '',
    '## 1.0.10',
    '',
    '### Improvements',
    '',
    '- Visible',
    '',
    '## 1.0.9',
    '',
    '- First',
    ''
  ].join('\n'));
  assert.doesNotMatch(changelog, /^---+$/m);
  assert.doesNotMatch(changelog, /^#{1,6}[^ #\n]/m);
  assert.doesNotMatch(changelog, /hidden|secret|internal tests|What Changed/);
});

test('syncChangelog writes CHANGELOG.md and check mode rejects drift', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'changelog-'));
  fs.writeFileSync(path.join(directory, 'module.json'), JSON.stringify({ title: 'Graypes Compendium' }));
  fs.mkdirSync(path.join(directory, 'release-notes'));
  fs.writeFileSync(path.join(directory, 'release-notes', 'RELEASE-NOTES-1.0.9.md'), '# Old\n\n- First\n');
  const wrote = sync.syncChangelog({ root: directory });
  assert.deepEqual(wrote, { updated: true, skipped: false });
  assert.match(fs.readFileSync(path.join(directory, 'CHANGELOG.md'), 'utf8'), /^# Graypes Compendium Changelog\n\n## 1\.0\.9\n\n- First\n$/);
  fs.writeFileSync(path.join(directory, 'release-notes', 'RELEASE-NOTES-1.0.10.md'), '# New\n\n- Visible\n\n## Verification\n\n- hidden\n');
  assert.throws(() => sync.syncChangelog({ root: directory, check: true }), /out of sync/);
  assert.equal(sync.syncChangelog({ root: directory }).updated, true);
  const text = fs.readFileSync(path.join(directory, 'CHANGELOG.md'), 'utf8');
  assert.match(text, /## 1\.0\.10\n\n- Visible\n\n## 1\.0\.9\n\n- First\n/);
  assert.doesNotMatch(text, /hidden|---/);
  assert.deepEqual(sync.syncChangelog({ root: directory }), { updated: false, skipped: false });
});

test('syncChangelog skips when release notes are absent', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'changelog-empty-'));
  assert.deepEqual(sync.syncChangelog({ root: directory }), { updated: false, skipped: true });
  assert.equal(fs.existsSync(path.join(directory, 'CHANGELOG.md')), false);
});

test('committed CHANGELOG.md matches release notes and stays in the install archive', () => {
  const result = sync.syncChangelog({ root, check: true });
  assert.deepEqual(result, { updated: false, skipped: false });
  const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
  const versions = [...changelog.matchAll(/^## (\d+\.\d+\.\d+)$/gm)].map(match => match[1]);
  assert.deepEqual(versions, ['1.0.12', '1.0.11', '1.0.10', '1.0.9']);
  assert.match(changelog, /^# Graypes Compendium Changelog\n/);
  assert.match(changelog, /### Added\n\n- Adjust volume of all songs/);
  assert.match(changelog, /^- Verify the live content/m);
  assert.doesNotMatch(changelog, /release-synchronizer|disposable playlist|^---+$|## Verification|## What Changed/m);
  assert.doesNotMatch(changelog, /^#{1,6}[^ #\n]/m);
  const attributes = fs.readFileSync(path.join(root, '.gitattributes'), 'utf8');
  assert.match(attributes, /^release-notes\/ export-ignore$/m);
  assert.doesNotMatch(attributes, /^CHANGELOG\.md export-ignore$/m);
});
