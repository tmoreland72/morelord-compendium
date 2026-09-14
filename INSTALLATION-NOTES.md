# Installation portability notes

The module requires the dnd5e system. Its JavaScript does not import Morelord Core or require another module; no speculative required dependencies are added.

The bundled module asset paths checked in the pack records resolve locally after URL decoding. However, pack content also references other packages and files outside this module. These are content-specific dependencies, not requirements for enabling the module.

A scan of direct asset-path fields found 41 loose assets/ references, 9 world-specific scene thumbnails, and references to the packages below. HTML, macro code and UUID links may contain additional dependencies; this is not a complete semantic content audit.

External module references:
- ddb-importer: 2 references
- dnd-heroes-faerun: 1 references
- dnd-monster-manual: 1 references
- dnd-phandelver-below: 2 references
- dnd-players-handbook: 28 references
- dnd5e-animations: 30 references
- drakkenheim-scgd: 21 references
- kctg-5e: 15 references
- levels-3d-preview: 14 references
- monks-combat-marker: 119 references

Loose assets and world thumbnails must be supplied or relinked for another installation. Install the relevant source content packages for documents that use their assets. Existing world-local thumbnails can be regenerated in Foundry. No external content has been copied automatically.

Unresolved direct paths in the Dev installation at inspection time:

- `assets/Agathas%20Lair.mp4`
- `assets/images/mythallar.jpg`
- `assets/images/netheril%20scene.jpg`
- `assets/images/obelisk.png`
- `assets/images/Rybalka-BellTower.png`
- `assets/images/Rybalka-BuggsOddsInn.png`
- `assets/images/Rybalka-CarolynBakedGoods.png`
- `assets/images/Rybalka-CathedralInside.png`
- `assets/images/Rybalka-CathedralOutside.png`
- `assets/images/Rybalka-CathedralReliquary.png`
- `assets/images/Rybalka-FishhaulerConsortium.png`
- `assets/images/Rybalka-HopefulSignsMercantile.png`
- `assets/images/Rybalka-Library-Outside.png`
- `assets/images/Rybalka-Lodge.png`
- `assets/images/Rybalka-LookoutWalk.png`
- `assets/images/Rybalka-LumberMill.png`
- `assets/images/Rybalka-MineGuildhall.png`
- `assets/images/Rybalka-QuorrensForge-Outside.png`
- `assets/images/Rybalka-RootCellar.png`
- `assets/images/Rybalka-ShipwrightGuildhall.png`
- `assets/images/Rybalka-SulwotiksSpirits.png`
- `assets/images/Rybalka-ThirstySerpent-Inside.png`
- `assets/images/Rybalka-ThirstySerpent-Outside.png`
- `assets/images/Rybalka-TownHall-Outside.png`
- `assets/images/The%20Emerald%20Enclave.png`
- `assets/images/The%20Harpers.png`
- `assets/images/The%20Lords_%20Alliance.png`
- `assets/images/the%20Order%20of%20the%20Gauntlet.png`
- `assets/images/The%20Zhentarim.png`
- `assets/maps/battle-maps/rybalka-cathedral-belltower.webp`
- `assets/maps/battle-maps/rybalka-cathedral-reliquary.webp`
- `assets/maps/map-scenes/Barthen%E2%80%99s%20Provisions.png`
- `assets/maps/map-scenes/City-Street.mp4`
- `assets/maps/map-scenes/Edermath%20Orchard.png`
- `assets/maps/map-scenes/Lionshield%20Coster.png`
- `assets/maps/map-scenes/Phandalin%20Miner%E2%80%99s%20Exhange.png`
- `assets/maps/map-scenes/Shrine%20of%20Luck.png`
- `assets/maps/map-scenes/Stonehill%20Inn.png`
- `assets/Old%20Owl%20Well.mp4`
- `assets/Ruins%20of%20Thundertree.mp4`
- `assets/Wyvern%20Tor.mp4`
- `modules/ddb-importer/storage/ddb/loot/adventuring-gear.jpg`
- `modules/dnd-heroes-faerun/assets/journal-art/covered-wagon.webp`
- `modules/dnd5e-animations/assets/sounds/Damage/Ice/ice-blast-2.mp3`
- `modules/dnd5e-animations/assets/sounds/Spells/Buff/spell-buff-build-up-2.mp3`
- `modules/dnd5e-animations/assets/sounds/Spells/Whoosh/spell-whoosh-15.mp3`
- `modules/kctg-5e/images/Activities/Consume.png`
- `modules/kctg-5e/images/Ale.webp`
- `modules/kctg-5e/images/Bread.webp`
- `modules/kctg-5e/images/Cheese.webp`
- `modules/kctg-5e/images/Dried%20Meat.webp`
- `modules/kctg-5e/images/Giants%20Green%20Pie.webp`
- `modules/kctg-5e/images/Hand%20Cart.webp`
- `modules/kctg-5e/images/Pickaxe.webp`
- `modules/kctg-5e/images/Sled.webp`
- `modules/kctg-5e/images/Wine.webp`
- `modules/levels-3d-preview/assets/particles/dust.png`
- `modules/levels-3d-preview/assets/particles/magiccircles/magic_circle_07.webp`
- `modules/monks-combat-marker/markers/marker01.webp`
- `modules/monks-combat-marker/markers/marker05.webp`
- `worlds/morelord-phandelver-2025/assets/scenes/C84ql1vmrYGmjPzV-thumb.webp`
- `worlds/morelord-phandelver-2025/assets/scenes/evbC0xyTltGvVGEB-thumb.webp`
- `worlds/morelord-phandelver-2025/assets/scenes/GHPrn3rDjZ2ZQCId-thumb.webp`
- `worlds/morelord-phandelver-2025/assets/scenes/iZDb1nFPxDJ8hrSa-thumb.webp`
- `worlds/morelord-phandelver-2025/assets/scenes/n2gD444ptab48oNU-thumb.webp`
- `worlds/morelord-phandelver-2025/assets/scenes/qTF4I5hV3MwS6MhQ-thumb.webp`
- `worlds/morelord-phandelver-2025/assets/scenes/SsYZmrnSJWxqWOiT-thumb.webp`
- `worlds/rise-of-the-drow/assets/scenes/3ZqcM7FK8a4J5uul-thumb.webp`
- `worlds/rise-of-the-drow/assets/scenes/VwUz2sSYS4pO7iaB-thumb.webp`
