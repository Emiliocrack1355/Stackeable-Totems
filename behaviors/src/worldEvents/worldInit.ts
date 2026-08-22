import { world, system } from "@minecraft/server";
import { addonState, addonVer } from "../system/utils";

export class worldInit {
  constructor() {
    this.onPlayerSpawn();
  }

  /**
   * Mensaje de bienvenida cada que el jugador enttra al mundo
   */
  private onPlayerSpawn(): void {
    world.afterEvents.playerSpawn.subscribe((ev) => {
      const { player, initialSpawn } = ev;
      if (initialSpawn) {
        system.runTimeout(() => {
          player.sendMessage({
            translate: "emi.totems.system.welcome",
            with: [addonVer, addonState],
          });
          this.setScore();
        }, 600);
      }
    });
  }

  /**
   * Crear el scoreboard de totems en caso de no existir
   */
  private setScore(): void {
    const useScore = world.scoreboard.getObjective("use_totem");
    if (!useScore) {
      world.scoreboard.addObjective("use_totem", "§gTotems Usados");
      world.sendMessage({ translate: "emi.totems.system.notScore" });
      //  Scoreboard de configuraciones globales
      world.scoreboard.addObjective("config");
      system.runTimeout((): void => {
        //  Default Values
        world.scoreboard.getObjective("config")?.setScore("prob", 101); // 0% fail - (100 >= 101) = false
        world.scoreboard.getObjective("config")?.setScore("cost", 1); // -1 totem
      }, 20);
    }
  }
}
