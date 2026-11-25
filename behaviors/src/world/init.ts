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
  worldToolsSimplified,
} from "simplified-mojang-api";
import { utils } from "../system/utils";

/**
 * Clase que maneja todo lo relacionado a la inicialziacion del mundo
 * @class
 * @author Emiliocrack1355 - 23/11/26 <05:55 pm>
 */
class WorldInit {
  /**
   * Variable que almacena la version del addon
   * @readonly
   * @method
   * @private
   * @author Emiliocrack1355 - 23/11/26 <06:00 pm>
   */
  private readonly AddonVer = "1.0";

  /**
   * Variable que almacena el estado del addon
   * @readonly
   * @method
   * @private
   * @author Emiliocrack1355 - 23/11/26 <06:00 pm>
   */
  private readonly AddonBeta = false;
  constructor() {
    this.onWorldInit();
    this.onPlayerSpawn();
    this.loadCustomCommands();
  }

  /**
   * Metodo que ejecuta todo lo necesario para inicializar el mundo
   * @method
   * @private
   * @author Emiliocrack1355 - 23/11/26 <06:02 pm>
   */
  private onWorldInit(): void {
    afterEventsSimplified.onWorldReady((): void => {
      const dynamic = world.getDynamicProperty(utils.WorldDynamicID);
      if (typeof dynamic === "undefined") {
        world.setDynamicProperty(
          utils.WorldDynamicID,
          JSON.stringify({ prob: 0, cost: 1 })
        );
        console.warn(`Creating World Dynamic Values of Config`);
      } else {
        console.warn(`Load World Dynamic Values of Config`);
      }
    });
  }

  /**
   * Metodo que carga lo necesario cuando el jugador spawnea
   * @method
   * @private
   * @author Emiliocrack1355 - 23/11/26 <06:10 pm>
   */
  private onPlayerSpawn(): void {
    afterEventsSimplified.onPlayerSpawns((args): void => {
      const { initialSpawn, player } = args;
      if (initialSpawn) {
        system.runTimeout(() => {
          player.sendMessage({
            translate: "emi.totems.system.welcome",
            with: [this.AddonVer, this.AddonBeta ? "-beta" : ""],
          });
        }, worldToolsSimplified.convertSecondsToTicks(30));
      }
    });
  }

  /**
   * Metodo que carga los comandos personalizados del addon
   * @method
   * @private
   * @author Emiliocrack1355 - 23/11/26 <06:15 pm>
   * @LastModified 24/11/26 <06:30 pm>
   */
  private loadCustomCommands(): void {
    beforeEventsSimplified.createCustomCommand(
      {
        name: "emi:totem",
        description: "emi.customT.cmd.totem",
        cheatsRequired: false,
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
          { name: "emi:totem_options", type: CustomCommandParamType.Enum },
          { name: "value", type: CustomCommandParamType.Integer },
        ],
      },
      (origin, option: string, value: number): undefined => {
        const player = origin.initiator ?? origin.sourceEntity;
        if (!(player instanceof Player)) return;
        if (!player.hasTag("admin")) {
          player.sendMessage({ translate: "emi.totems.cmd.notAdmin" });
          return;
        }

        const raw = world.getDynamicProperty(utils.WorldDynamicID);
        let config: { prob: number; cost: number } = { prob: 0, cost: 1 };
        if (typeof raw === "string") {
          try {
            config = { ...config, ...JSON.parse(raw) };
          } catch {
            console.warn("Error on Load World Dynamic Config");
          }
        }
        system.run((): void => {
          switch (option) {
            case "prob":
              if (value < 0 || value > 100) {
                world.sendMessage({
                  translate: "emi.totems.cmd.notValidProb",
                  with: [String(value)],
                });
                return;
              }
              config.prob = value;
              world.setDynamicProperty(
                utils.WorldDynamicID,
                JSON.stringify(config)
              );
              world.sendMessage({
                translate: "emi.totems.cmd.setProb",
                with: [String(value)],
              });
              break;
            case "cost":
              if (value < 1) {
                world.sendMessage({
                  translate: "emi.totems.cmd.notValidCost",
                  with: [String(value)],
                });
                return;
              }
              config.cost = value;
              world.setDynamicProperty(
                utils.WorldDynamicID,
                JSON.stringify(config)
              );
              world.sendMessage({
                translate: "emi.totems.cmd.setCost",
                with: [String(value)],
              });
              break;
          }
        });
      },
      { "emi:totem_options": ["prob", "cost"] }
    );
  }
}

new WorldInit();
