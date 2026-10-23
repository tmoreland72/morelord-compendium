# Graypes Compendium Changelog

## 1.0.11

### Added

- Adjust volume of all songs is a GM-only macro that sets every saved playlist-track volume to 25% by default. Its percent constant accepts finite values from 0 to 100 and uses Foundry's native audio volume curve.

### Improvements

- Added the manifest changelog link and consolidated release history in release-notes/.
- Temporary working files belong in ignored /tmp/; temporary files and release-note sources are excluded from GitHub installation archives.

## 1.0.10

- Rename the visible module and compendium folder to Graypes Compendium, separate from Morelord Gaming tools. Preserve internal package, pack, and document identifiers.
- Add seven personal playlists with 98 sound entries, preserving the Morelord Gaming / Drakkenheim grouping and the six existing playlists. Audio file references are preserved; audio files are not newly bundled.
- Verify the live content and folder organization in Dev1 on Foundry 14.368 / D&D5e 6.0.3. Foundry 13 remains the supported minimum.

Distributed through the existing GitHub manifest only; no Foundry package-directory or website publication.

## 1.0.9

- Preserve the latest local compendium pack data and add prepared shop portraits and tokens.
- Verify representative nonempty compendium indexes and documents on Foundry 14.368 with D&D5e 6.0.3; retain Foundry 13 as the supported minimum.
- Correct the release workflow documentation: synchronization runs on pushes or manual dispatch, with no daily schedule.

Pack databases were committed with Foundry stopped. This personal-use package is distributed through its GitHub manifest; it is not published to the Foundry directory or Morelord website feed.
