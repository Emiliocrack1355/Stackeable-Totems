import { worldInit } from "./worldEvents/worldInit";
new worldInit();

import { Totems } from "./totemLogic/totems";
new Totems();

import { world, system } from "@minecraft/server";
system.run((): void => {
  world.sendMessage("§aHola");
  world.sendMessage("§aHola");
  world.sendMessage("§aHola");
  world.sendMessage("§aHola");
  world.sendMessage("§aHola");
  world.sendMessage("§aHola");
  world.sendMessage("§aHola");
  world.sendMessage("§aHola");
  world.sendMessage("§aHola");
  world.sendMessage("§aHola");
});

/*
- Data 0 => Vanila Totem
- Data 1 => TNT Totem
- Data 2 => Fly Totem
- Data 3 => Ender Totem
- Data 4 => Void Totem
- Data 5 => Tp Totem
- Data 6 => Mini Totem
*/

//  cd c:users/Brian/Desktop/Proyectos/dev
//  npm run watch
