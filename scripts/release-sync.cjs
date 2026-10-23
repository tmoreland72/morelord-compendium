// Compendium distributes master directly; releases record its manifest version.
// When release-notes/RELEASE-NOTES-*.md exist, root CHANGELOG.md is kept in sync
// so in-Foundry viewers can read the cumulative history from the installed module.
const fs = require('node:fs');
const path = require('node:path');

const GENERIC_SECTIONS = new Set([
  'what changed',
  'changes',
  'changelog',
  'change log',
  'release notes',
  'summary',
  'overview'
]);

function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) throw new Error(`Release note version must be major.minor.patch: ${version}`);
  return match.slice(1).map(Number);
}

function compareSemver(a, b) {
  const left = parseSemver(a);
  const right = parseSemver(b);
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

function parseHeading(line) {
  const match = /^(#{1,6})(?:[ \t]+|(?=\S))(.*\S)\s*$/.exec(line);
  if (!match) return null;
  return { level: match[1].length, text: match[2].trim() };
}

function isBareVersionHeading(text) {
  return /^v?\d+\.\d+\.\d+$/.test(text.trim());
}

function isOmittedHeading(text) {
  const cleaned = text.replace(/[`*_]/g, '').trim().toLowerCase();
  return /\bverification\b/.test(cleaned)
    || /\binternal tests?\b/.test(cleaned)
    || cleaned === 'test'
    || cleaned === 'tests'
    || cleaned === 'testing';
}

function isGenericWrapper(text) {
  return GENERIC_SECTIONS.has(text.trim().toLowerCase().replace(/[:.]+$/g, ''));
}

function isHorizontalRule(line) {
  return /^[ \t]*([-*_])(\s*\1){2,}[ \t]*$/.test(line);
}

function formatHeading(level, text) {
  return `${'#'.repeat(level)} ${text.trim()}`;
}

function normalizeBody(lines) {
  const cleaned = [];
  for (const line of lines) {
    if (!line.trim()) {
      if (cleaned.length && cleaned[cleaned.length - 1] !== '') cleaned.push('');
      continue;
    }
    cleaned.push(line);
  }
  while (cleaned[0] === '') cleaned.shift();
  while (cleaned.at(-1) === '') cleaned.pop();
  return cleaned.join('\n');
}

function userFacingBody(markdown) {
  const lines = String(markdown).replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const output = [];
  let skip = false;
  let skipLevel = 0;
  let skippedTitle = false;
  let demoteFrom = 0;
  let demoteBy = 0;

  for (const line of lines) {
    const heading = parseHeading(line);
    if (heading) {
      if (skip && heading.level <= skipLevel) skip = false;
      if (demoteFrom && heading.level <= demoteFrom) {
        demoteFrom = 0;
        demoteBy = 0;
      }
      if (skip) continue;
      if (!skippedTitle && heading.level === 1) {
        skippedTitle = true;
        continue;
      }
      if (isBareVersionHeading(heading.text)) continue;
      if (isOmittedHeading(heading.text)) {
        skip = true;
        skipLevel = heading.level;
        continue;
      }
      if (heading.level === 2 && isGenericWrapper(heading.text)) continue;

      let level = heading.level;
      if (level === 1) level = 3;
      else if (level === 2) {
        level = 3;
        demoteFrom = 2;
        demoteBy = 1;
      } else if (demoteBy && heading.level > demoteFrom) {
        level = Math.min(heading.level + demoteBy, 6);
      }
      output.push(formatHeading(level, heading.text));
      continue;
    }

    if (skip || isHorizontalRule(line)) continue;
    const bullet = /^([ \t]*)([-*+])[ \t]+(\S.*)$/.exec(line);
    if (bullet) {
      output.push(`${bullet[1].replace(/\t/g, '  ')}- ${bullet[3].replace(/[ \t]+$/g, '')}`);
      continue;
    }
    output.push(line.replace(/[ \t]+$/g, ''));
  }

  return normalizeBody(output);
}

function buildChangelog(title, releases) {
  const heading = String(title ?? '').trim();
  if (!heading) throw new Error('module.json title is required to build CHANGELOG.md');
  const versions = releases.map(release => release.version);
  const duplicate = versions.find((version, index) => versions.indexOf(version) !== index);
  if (duplicate) throw new Error(`Duplicate changelog version ${duplicate}`);

  const sections = [`# ${heading} Changelog`];
  const sorted = [...releases].sort((a, b) => compareSemver(b.version, a.version));
  for (const release of sorted) {
    parseSemver(release.version);
    const body = userFacingBody(release.markdown);
    sections.push(body ? `## ${release.version}\n\n${body}` : `## ${release.version}`);
  }
  return `${sections.join('\n\n')}\n`;
}

function readReleaseNotes(root) {
  const directory = path.join(root, 'release-notes');
  if (!fs.existsSync(directory)) return null;
  const names = fs.readdirSync(directory).filter(name => /^RELEASE-NOTES-.+\.md$/.test(name)).sort();
  if (!names.length) return [];
  return names.map(name => {
    const version = name.slice('RELEASE-NOTES-'.length, -'.md'.length);
    parseSemver(version);
    return {
      version,
      markdown: fs.readFileSync(path.join(directory, name), 'utf8')
    };
  });
}

function syncChangelog({ root = process.cwd(), check = false } = {}) {
  const notes = readReleaseNotes(root);
  if (!notes?.length) return { updated: false, skipped: true };
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'module.json'), 'utf8'));
  const changelog = buildChangelog(manifest.title, notes);
  const destination = path.join(root, 'CHANGELOG.md');
  const current = fs.existsSync(destination) ? fs.readFileSync(destination, 'utf8') : '';
  if (current === changelog) return { updated: false, skipped: false };
  if (check) {
    throw new Error('CHANGELOG.md is out of sync with release-notes/RELEASE-NOTES-*.md. Run node scripts/release-sync.cjs to regenerate it.');
  }
  fs.writeFileSync(destination, changelog);
  return { updated: true, skipped: false };
}

async function syncRelease({ github, context, core, root, syncChangelog: shouldSync = true, checkChangelog }) {
  if (shouldSync && !process.env.NODE_TEST_CONTEXT) {
    syncChangelog({
      root,
      check: checkChangelog ?? Boolean(process.env.GITHUB_ACTIONS)
    });
  }
  const repo = context.repo;
  async function optional(call) {
    try { return (await call()).data; }
    catch (error) { if (error.status === 404) return null; throw error; }
  }
  async function manifest(ref) {
    const { data } = await github.rest.repos.getContent({ ...repo, path: 'module.json', ref });
    return JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
  }
  const { data: branch } = await github.rest.repos.getBranch({ ...repo, branch: 'master' });
  const sha = branch.commit.sha;
  const { version } = await manifest(sha);
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Manifest version must be major.minor.patch');
  const tag = await optional(() => github.rest.git.getRef({ ...repo, ref: `tags/${version}` }));
  if (tag && (await manifest(`refs/tags/${version}`)).version !== version) {
    throw new Error(`Existing tag ${version} has a different manifest version; refusing to move it`);
  }
  let release = await optional(() => github.rest.repos.getReleaseByTag({ ...repo, tag: version }));
  if (release?.draft || release?.prerelease) throw new Error(`Release ${version} is draft/prerelease; review it manually`);
  const latest = await optional(() => github.rest.repos.getLatestRelease(repo));
  if (latest && latest.tag_name !== version) {
    const current = version.split('.').map(Number);
    const previous = latest.tag_name.replace(/^v/, '').split('.').map(Number);
    const difference = current.map((part, i) => part - previous[i]).find(part => part !== 0);
    if (difference < 0) throw new Error('Manifest version is older than the latest release; refusing to downgrade');
  }
  // A queued run always reads current master; stop if it changed during validation.
  const { data: currentBranch } = await github.rest.repos.getBranch({ ...repo, branch: 'master' });
  if (currentBranch.commit.sha !== sha) throw new Error('master changed during synchronization; rerun the workflow');
  if (!release) {
    ({ data: release } = await github.rest.repos.createRelease({
      ...repo, tag_name: version, target_commitish: sha, name: version,
      make_latest: 'true', generate_release_notes: true,
      body: 'Records the version already published through the master branch manifest. Installation and updates continue through the manifest URL in README.md. This entry does not add a new Foundry compatibility certification.'
    }));
  } else if (latest?.tag_name !== version) {
    await github.rest.repos.updateRelease({ ...repo, release_id: release.id, make_latest: 'true' });
  }
  const verified = await manifest(`refs/tags/${version}`);
  const { data: published } = await github.rest.repos.getLatestRelease(repo);
  if (verified.version !== version || published.tag_name !== version) throw new Error('Release synchronization verification failed');
  core.info(`Manifest, tag and latest release agree: ${version}`);
}

syncRelease.buildChangelog = buildChangelog;
syncRelease.syncChangelog = syncChangelog;
syncRelease.readReleaseNotes = readReleaseNotes;
module.exports = syncRelease;

if (require.main === module) {
  const check = process.argv.includes('--check');
  try {
    const result = syncChangelog({ check });
    if (result.skipped) console.log('No release notes found; CHANGELOG.md was left unchanged.');
    else if (result.updated) console.log('Updated CHANGELOG.md from release-notes/RELEASE-NOTES-*.md.');
    else console.log('CHANGELOG.md already matches release-notes/RELEASE-NOTES-*.md.');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
