// CONFIG.debug.hooks = !CONFIG.debug.hooks
// console.warn("Hook debugging set to", CONFIG.debug.hooks)
console.log("Morelord Gaming | main.js LOADED");

import { setAbility } from "./scripts/ability-utils.js";

const MODULE_ID = "morelord-compendium";

Hooks.once("init", () => {
  const mod = game.modules.get(MODULE_ID);
  if (!mod) return console.error(`❌ Module not found: ${MODULE_ID}`);
  
  mod.api = { setAbility };
  console.log("Morelord Gaming | API registered (init)", mod.api);
});

