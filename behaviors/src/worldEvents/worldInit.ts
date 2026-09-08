import {
  CommandPermissionLevel,
  CustomCommandParamType,
  Player,
  system,
  world,
} from "@minecraft/server";
import {
  afterEventsSimplified,
  beforeEventsSimplified,
  customEventsManager,
  worldToolsSimplified,
} from "simplified-mojang-api";

/**
 * Clase principal que contiene distintas utilidades
 * y eventos iniciales
 * @class
 * @author Emiliocrack1355 & HaJuegos - 07/09/26
 */
class WorldEventsManager {
  /**
   * Variable global que indica la version del addon
   * @readonly
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private readonly addonVer = "1.0";

  /**
   * Variable global que indica la version del addon
   * @readonly
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private readonly addonState = "-beta";

  /**
   * Eventos principales cuando la clase es iniciada
   * @constructor
   * @author Emiliocrack1355 - 07/09/26
   */
  constructor() {
    customEventsManager.fastItemsSystem((): string[] => ["totem", "shield"]);
    this.onPlayerSpawnEvents();
  }

  /**
   * Metodo principal que se encarga del mensaje de bienvenida al entrar al mundo
   * @private
   * @author Emiliocrack1355 & HaJuegos - 07/09/26
   */
  private onPlayerSpawnEvents(): void {
    afterEventsSimplified.onPlayerSpawns((args): void => {
      const { player, initialSpawn } = args;
      if (initialSpawn) {
        worldToolsSimplified.setDelay((): void => {
          player.sendMessage({
            translate: "emi.totems.system.welcome",
            with: [this.addonVer, this.addonState],
          });
        }, worldToolsSimplified.convertSecondsToTicks(30));
      }
    });
    world.beforeEvents.playerInteractWithBlock.subscribe((ev) => {
      const { block, player } = ev;
      if (!player || !block) return;
      if (block.typeId !== "minecraft:bed") return;
      if (!player.isSneaking) return;
      ev.cancel = true;
      system.run(() => {
        const tag = player.getTags().find((t) => t.startsWith("spawn:"));
        if (tag) player.removeTag(tag);
        const { x, y, z } = block.location;
        const dim = block.dimension.id.split(":")[1];
        player.sendMessage({
          translate: "emi.totems.saveSpawn",
          with: [`${x}, ${y}, ${z} en ${dim}`],
        });
        player.addTag(`spawn:${x},${y},${z};${dim}`);
        // console.info(`spawn:${x},${y},${z};${dim}`)
      });
    });
    beforeEventsSimplified.createCustomCommand(
      {
        name: "emi:totem",
        description: "emi.totems.cmd",
        cheatsRequired: false,
        permissionLevel: CommandPermissionLevel.Admin,
        mandatoryParameters: [
          { name: "emi:options", type: CustomCommandParamType.Enum },
          { name: "value", type: CustomCommandParamType.Integer },
        ],
      },
      (origin, option, value) => {
        const player = origin.initiator ?? origin.sourceEntity;
        if (!(player instanceof Player)) return;
        const config = world.scoreboard.getObjective("config");
        if (!config) {
          world.sendMessage("pan");
          return;
        }
        system.run(() => {
          switch (option) {
            case "prob":
              config.setScore("prob", value);
              world.sendMessage({
                translate: "emi.totems.system.setProb",
                with: [String(value)],
              });
              break;
            case "cost":
              config.setScore("cost", value);
              world.sendMessage({
                translate: "emi.totems.system.setCost",
                with: [String(value)],
              });
              break;
          }
        });
      },
      { "emi:options": ["prob", "cost"] }
    );
  }

  /**
   * Metodo auxiliar para formatear el texto en una forma bonita UwU
   * @param text Texto a formatear
   * @param title Se indica si se inicia cada palabra con mayuscula
   * @returns Retorna el texto formateado
   * @public
   * @author Emiliocrack1355 - 07/09/26
   */
  public formatText(text: string, title = false): string {
    if (!text) return "";
    let outText = text.replaceAll("minecraft:", "").replaceAll("emi:", "");
    if (title) {
      outText = outText
        .replaceAll("_", " ")
        .split(" ")
        .map((word): string =>
          word ? word.charAt(0).toUpperCase() + word.slice(1) : word
        )
        .join("");
    }
    return outText;
  }
}

export const utilsClass = new WorldEventsManager();
