# Graypes Compendium 1.0.11

## What Changed

### Added

- Adjust volume of all songs is a GM-only macro that sets every saved playlist-track volume to 25% by default. Its percent constant accepts finite values from 0 to 100 and uses Foundry's native audio volume curve.

### Improvements

- Added the manifest changelog link and consolidated release history in release-notes/.
- Temporary working files belong in ignored /tmp/; temporary files and release-note sources are excluded from GitHub installation archives.

## Compatibility and verification

Verified on Foundry VTT 14.368 / D&D5e 6.0.3 in Dev1. The module-owned native playlist regression passed through Core's shared runner, including GM updates and player rejection, using only a disposable playlist. All five release-synchronizer tests passed. Comparison against committed pack records found only one additional macro; other packs differ only through database file rotation. No campaign audio was changed.
