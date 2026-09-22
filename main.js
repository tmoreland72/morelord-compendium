// CONFIG.debug.hooks = !CONFIG.debug.hooks
// console.warn("Hook debugging set to", CONFIG.debug.hooks)
console.log("Graypes Compendium | main.js LOADED");

import { setAbility } from "./scripts/ability-utils.js";

const MODULE_ID = "morelord-compendium";

Hooks.once("init", () => {
  const mod = game.modules.get(MODULE_ID);
  if (!mod) return console.error(`❌ Module not found: ${MODULE_ID}`);
  
  mod.api = { setAbility };
  console.log("Graypes Compendium | API registered (init)", mod.api);
});


import { migratePersonalFolder } from "./scripts/personal-folder.js";
Hooks.once("ready", () => migratePersonalFolder().catch(error => ui.notifications.error(error.message)));
