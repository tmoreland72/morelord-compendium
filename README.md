# Morelord Compendium

Shared D&D 5e compendium packs and the `setAbility` API for Foundry VTT.
This is a personal-use module. The Dev data-directory copy is the authoritative coding workspace.

## Install and enable

In Foundry Setup, choose Add-on Modules > Install Module and paste:

https://raw.githubusercontent.com/tmoreland72/morelord-compendium/master/module.json

Launch a D&D 5e world, open Manage Modules, enable Morelord Compendium, and save.
Repeat enabling it in each world where it is needed. The packs appear under
Morelord Gaming in the Compendium sidebar. Import documents into a world when
world-specific edits are needed; module updates can replace module pack data.

The manifest declares Foundry 14 compatibility and retains Foundry 13 as the minimum. This declaration reflects the personal Foundry 14 development setup; automated package checks passed, but a complete fresh-world interaction test has not been performed.
See INSTALLATION-NOTES.md for external content and asset requirements.

## Development and Git

The existing public repository is https://github.com/tmoreland72/morelord-compendium.
The local master branch tracks origin/master and preserves existing history.
Stop Foundry before committing or packaging packs so LevelDB files are consistent.
Track the complete packs, including CURRENT, MANIFEST files, .ldb files and
numbered .log files. Only LOCK, LOG, and LOG.old are disposable diagnostics.
Pack files are marked binary to prevent Git line-ending conversion.

Review `git status` and `git diff`, then commit intended changes and push master.

## GitHub manifest installation and release synchronization

The personal-use workflow is to install through Foundry using the
manifest URL above, with GitHub generating the download ZIP directly from master.
The `Sync manifest release` GitHub Action creates a matching version tag and
release after pushes to master and verifies that GitHub's latest release agrees
with the manifest. It also runs daily and can be run manually from Actions to
repair missing metadata. Website publication and a Foundry package-directory
listing are not part of this personal-use workflow. There is no need to copy the
module folder manually.

The manifest fields for this workflow are:

```json
{
  "manifest": "https://raw.githubusercontent.com/tmoreland72/morelord-compendium/master/module.json",
  "download": "https://github.com/tmoreland72/morelord-compendium/archive/refs/heads/master.zip"
}
```

Stop Foundry before saving database changes to Git, increment
module.json's version when an update should be detected, commit the complete
module changes, and push master. GitHub generates the ZIP from the pushed branch.
Wait for `Sync manifest release` to pass before considering publication complete.
The workflow uses the repository's built-in token with contents-write permission;
no separate publishing secret is needed. It preserves existing tags and release
notes, refuses conflicting tag versions, draft/prerelease entries and version
downgrades, and fails visibly on API errors. Review a failed run and rerun it after
correcting the cause. Do not move an existing version tag to publish new content;
bump the manifest version instead. Test synchronization logic locally with
`node --test test/release-sync.test.cjs`.

Release entries record the already-published branch version; they do not certify
new Foundry compatibility or replace required compatibility verification before
publishing a new module version. No additional release ZIP is uploaded.

In Foundry Setup, use the module update check to install the newer version.
For a new Foundry installation, paste the same manifest URL into Install Module.
For a new world on an installation that already has the module, simply enable it
in that world's Manage Modules screen.

## API

`game.modules.get("morelord-compendium").api.setAbility(actor, "str")` rolls 3d6,
posts the roll to chat, and updates that ability score. It is available after init.
