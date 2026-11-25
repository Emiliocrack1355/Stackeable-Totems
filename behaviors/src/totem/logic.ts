import {
  Entity,
  EntityComponentTypes,
  EntityHealBeforeEvent,
  EntityHealCause,
  Player,
  world,
} from "@minecraft/server";
import { utils } from "../system/utils";
import { HandData, ProbData, TotemData } from "../system/types";

/**
 * Clase que maneja toda la logica de los Totems
 * @class
 * @author Emiliocrack1355 - 23/11/26 <06:23 pm>
 */
class TotemLogic {
  constructor() {
    this.TotemDetect();
  }

  /**
   * Metodo que detecta el uso de un Totem
   * @method
   * @private
   * @author Emiliocrack1355 - 23/11/26 <06:25 pm>
   */
  private TotemDetect(): void {
    world.beforeEvents.entityHeal.subscribe((ev): void => {
      const { healSource, healedEntity } = ev;
      if (!(healedEntity instanceof Player)) return;
      if (healSource.cause !== EntityHealCause.TotemOfUndying) return;
      const data = utils.getHandTotem(healedEntity);
      if (!data) return;
      this.onUseTotem(healedEntity, data, ev);
    });
  }

  /**
   * Metodo de logica al confirmar el uso del Totem
   * @param player Jugador que uso el totem
   * @param data Informacion respecto al Item y Mano donde se encuentra el totem
   * @method
   * @private
   * @author Emiliocrack1355 - 23/11/26 <06:33 pm>
   */
  private onUseTotem(
    player: Player,
    data: HandData,
    ev: EntityHealBeforeEvent
  ): void {
    const raw = world.getDynamicProperty(utils.WorldDynamicID);
    let config: { prob: number; cost: number } = { prob: 0, cost: 1 };
    if (typeof raw === "string") {
      try {
        config = { ...config, ...JSON.parse(raw) };
      } catch {
        console.warn("Error on Load World Dynamic Config, Default Values");
      }
    }
    const amount = data.item.amount;
    const totemData = utils.getTotemData(
      player,
      data.hand,
      data.item,
      amount,
      config.cost
    );
    if (!totemData.hasStack) {
      utils.failedTotem(player, totemData, ev);
      return;
    }
    let probData: ProbData | undefined;
    if (config.prob > 0) {
      const random = Math.floor(Math.random() * 100) + 1;
      probData = {
        hasFailed: random >= config.prob,
        rand: random,
        prob: config.prob,
      };
    }
    if (probData?.hasFailed) utils.failedTotem(player, totemData, ev, probData);
    else utils.successTotem(player, totemData, probData);
  }

  /**
   * Metodo que maneja la logica para consumir los
   * totems de la mano y del inventario
   * @param player
   * @param totemData
   * @method
   * @public
   * @author Emiliocrack1355 - 23/11/26 <06:48 pm>
   */
  public onConsumeTotem(player: Player, totemData: TotemData): void {
    const equip = player.getComponent(EntityComponentTypes.Equippable);
    if (!equip) return;
    if (totemData.hasStack) {
      if (totemData.handAmount > 0) {
        const newHandItem = totemData.handItem.clone();
        newHandItem.amount = totemData.handAmount;
        equip.setEquipment(totemData.hand, newHandItem);
      } else {
        equip.setEquipment(totemData.hand, undefined);
      }
      if (totemData.inv) {
        const inv = player.getComponent(
          EntityComponentTypes.Inventory
        )?.container;
        if (!inv) return;
        for (const { slot, amount } of totemData.inv) {
          const it = inv.getItem(slot);
          if (!it) return;
          const remaining = it.amount - amount;
          if (remaining > 0) {
            const newItem = it.clone();
            newItem.amount = remaining;
            inv.setItem(slot, newItem);
          } else {
            inv.setItem(slot, undefined);
          }
        }
      }
    }
  }
}

export const Totems = new TotemLogic();
