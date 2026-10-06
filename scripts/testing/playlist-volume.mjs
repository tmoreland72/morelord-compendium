import { assert } from '../../../morelord-core/scripts/testing/in-game.js';
export const playlistVolumeCheck = {
  id: 'morelord-compendium.playlist-volume',
  async run() {
    assert(game.user.isGM, 'Run as GM in Dev1.');
    const macro = (await game.packs.get('morelord-compendium.macros-1').getDocuments()).find(doc => doc.name === 'Adjust volume of all songs');
    assert(macro, 'The pending volume macro is installed.');
    let playlist;
    try {
      playlist = await Playlist.create({ name: 'Volume macro regression fixture', sounds: [{ name: 'Volume fixture', path: 'sounds/dice.wav', volume: 0.6 }] });
      const execute = new (Object.getPrototypeOf(async function() {}).constructor)('game', 'ui', 'foundry', macro.command);
      // Scope the real macro to a disposable native Playlist; never adjust campaign audio.
      const context = { user: game.user, playlists: [playlist] };
      await execute(context, ui, foundry);
      const expected = Math.round(foundry.audio.AudioHelper.inputToVolume(0.25) * 100) / 100; // Native PlaylistSound volume has a 0.01 step.
      assert(playlist.sounds.every(sound => sound.volume === expected), 'Native playlist sounds use the 25% volume curve: ' + JSON.stringify({expected,actual:playlist.sounds.map(sound=>sound.volume)}));
      await playlist.updateEmbeddedDocuments('PlaylistSound', playlist.sounds.map(sound => ({ _id: sound.id, volume: 0.6 })));
      await execute({ ...context, user: { isGM: false } }, { notifications: { warn() {} } }, foundry);
      assert(playlist.sounds.every(sound => sound.volume === 0.6), 'Players cannot change track volume.');
    } finally { await playlist?.delete(); }
  }
};
