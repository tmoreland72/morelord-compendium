const ID = 'morelord-compendium';
Hooks.once('init', () => game.settings.register(ID, 'graypesFolderMigration', {scope:'world',config:false,type:Boolean,default:false}));

// Personal collection migration. No Morelord Core dependency or tool-suite parent folder.
export async function migratePersonalFolder() {
  if (!game.user.isGM || game.users.activeGM?.id !== game.user.id || game.settings.get(ID,'graypesFolderMigration')) return;
  const packs = [...game.packs].filter(pack => pack.metadata.packageName === ID);
  if (!packs.length) return;
  let folder = game.folders.find(f => f.type === 'Compendium' && f.name === 'Graypes Compendium' && !f.folder);
  const old = game.folders.find(f => f.type === 'Compendium' && f.name === 'Morelord Gaming' && !f.folder);
  if (!folder && old && !game.folders.some(f => f.folder?.id === old.id)
    && ![...game.packs].some(pack => pack.folder?.id === old.id && pack.metadata.packageName !== ID)) {
    folder = await old.update({name:'Graypes Compendium'});
  }
  folder ??= await Folder.create({name:'Graypes Compendium',type:'Compendium',sorting:'a'});
  for (const pack of packs) if (pack.folder?.id !== folder.id) await pack.configure({folder:folder.id});
  await game.settings.set(ID,'graypesFolderMigration',true);
}
