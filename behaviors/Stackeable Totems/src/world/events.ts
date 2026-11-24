import { system } from "@minecraft/server";
import { MinecraftBlockTypes } from "@minecraft/vanilla-data";
import { beforeEventsSimplified } from "simplified-mojang-api";
import { utils } from "../system/utils";

/**
 * Clase que maneja los eventos del mundo generales
 * @class
 * @author Emiliocrack1355 - 23/11/26 <06:20 pm>
 */
class WorldEvents {
  constructor() {
    this.onPlayerUseTotem();
  }

  /**
   * Metodo que detecta cuando se usa una cama
   * @method
   * @private
   * @author Emiliocrack1355 - 23/11/26 <06:20 pm>
   */
  private onPlayerUseTotem(): void {
    beforeEventsSimplified.onInteractBlock((args): void => {
      const { player, block } = args;
      if (!block || block.typeId !== MinecraftBlockTypes.Bed) return;
      if (!player.isSneaking) return;
      args.cancel = true;
      system.run((): void => {
        const tag = player
          .getTags()
          .find((t): Boolean => t.startsWith("SpawnPoint:"));
        if (tag) player.removeTag(tag);
        const { x, y, z } = block.location;
        const dim = block.dimension.id.split(":")[1];
        player.sendMessage({
          translate: "emi.totems.system.saveSpawn",
          with: [String(x), String(y), String(z), utils.formatText(dim, true)],
        });
        player.addTag(`SpawnPoint:${x},${y},${z};${dim}`);
      });
    });
  }
}

new WorldEvents();
