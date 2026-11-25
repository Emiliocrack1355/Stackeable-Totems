import {
  EntityComponentTypes,
  EntityHealBeforeEvent,
  EquipmentSlot,
  ItemStack,
  Player,
  system,
  world,
} from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { HandData, ProbData, TotemData } from "./types";
import { Totems } from "../totem/logic";

/**
 * Clase que contiene los metodos y variables auxiliares globales
 * @class
 * @author Emiliocrack1355 - 23/11/26 <06:05 pm>
 */
class Utils {
  /**
   * Variable que almacena el World Dynamic ID
   * @readonly
   * @method
   * @public
   * @author Emiliocrack1355 - 23/11/26 <06:05 pm>
   */
  public readonly WorldDynamicID = "emi:TotemVanilaConfig";

  /**
   * Variable que almacena el ID del Totem
   * @readonly
   * @method
   * @public
   * @author Emiliocrack1355 - 23/11/26 <06:28 pm>
   */
  public readonly totem = MinecraftItemTypes.TotemOfUndying;
  constructor() {}

  /**
   * Metodo para formatear el texto de una forma bonita
   * @param text Texto a ser formateado
   * @param title Si se desea con mayusculas por palabra
   * @returns texto formateado
   * @method
   * @public
   * @author Emiliocrack1355 - 23/11/26 <11:10 am>
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
  /**
   * Metodo para obtener la mano principal donde se posea el totem
   * @param player Jugador a analizar
   * @returns mano en donde se encuentra el totem
   * @method
   * @public
   * @author Emiliocrack1355 - 23/11/26 <06:30 pm>
   */
  public getHandTotem(player: Player): HandData | undefined {
    const comp = player.getComponent(EntityComponentTypes.Equippable);
    if (!comp) return;
    const main = comp.getEquipment(EquipmentSlot.Mainhand);
    const off = comp.getEquipment(EquipmentSlot.Offhand);
    let data = undefined;
    if (!main && off && off.typeId === this.totem) {
      data = { hand: EquipmentSlot.Offhand, item: off };
    } else if (main && !off && main.typeId === this.totem) {
      data = { hand: EquipmentSlot.Mainhand, item: main };
    } else if (
      main &&
      off &&
      main.typeId === this.totem &&
      off.typeId === this.totem
    ) {
      data = { hand: EquipmentSlot.Offhand, item: off };
    }
    if (!data) return;
    return data;
  }

  /**
   * Metodo auxiliar para obtener toda la data del Totem
   * @param player Jugador que posee el totem
   * @param slot Slot de mano en donde se encuentra el totem
   * @param item Item de la mano
   * @param amount Cantidad de totem en la mano
   * @param cost Costo por el uso del totem
   * @param lore Lore del totem para su ID
   * @returns
   * @method
   * @public
   * @author Emiliocrack1355 - 23/11/26 <06:35 pm>
   */
  public getTotemData(
    player: Player,
    slot: EquipmentSlot,
    item: ItemStack,
    amount: number,
    cost: number
  ): TotemData {
    if (amount >= cost) {
      return {
        hasStack: true,
        hand: slot,
        handItem: item,
        handAmount: amount - cost,
      };
    }
    const inv = player.getComponent(EntityComponentTypes.Inventory)?.container;
    if (!inv) return { hasStack: false };
    let reqs = cost - amount;
    const itemsInv: { slot: number; amount: number }[] = [];
    for (let i = 0; i < inv.size; i++) {
      if (reqs <= 0) break;
      const it = inv.getItem(i);
      if (!it || it.typeId !== this.totem) continue;
      if (it.amount < reqs) {
        reqs -= it.amount;
        itemsInv.push({ slot: i, amount: it.amount });
      } else {
        itemsInv.push({ slot: i, amount: reqs });
        reqs = 0;
        break;
      }
    }
    return reqs <= 0
      ? {
          hasStack: true,
          hand: slot,
          handItem: item,
          handAmount: amount,
          inv: itemsInv,
        }
      : { hasStack: false };
  }

  /**
   * Metodo auxiliar que anuncia por el chat cuyando al
   * usar un totem este falla
   * @param player Jugador que usa el totem
   * @param lore Lore para identificar el ID
   * @param totemData Informacion respecto al Totem
   * @param probData Informacion respecto a la probabilidad de uso
   * @method
   * @public
   * @author Emiliocrack1355 - 23/11/26 <06:40 pm>
   */
  public failedTotem(
    player: Player,
    totemData: TotemData,
    ev: EntityHealBeforeEvent,
    probData?: ProbData
  ): void {
    ev.cancel = true;
    if (!totemData.hasStack) {
      world.sendMessage({
        translate: "emi.totems.useTotem.notEnought",
        with: [player.name],
      });
      return;
    }
    if (probData) {
      world.sendMessage({
        translate: "emi.totems.useTotem.fail",
        with: [player.name, String(probData.rand), String(probData.prob)],
      });
      return;
    }
  }

  /**
   * Metodo auxiliar que anuncia por el chat cuando alguien
   * utiliza un totem
   * @param player Jugador que usa el totem
   * @param variant Variante del totem
   * @param totemData Informacion respecto al Totem
   * @param probData Informacion respecto a la probabilidad de uso
   * @method
   * @public
   * @author Emiliocrack1355 - 23/11/26 <06:42 pm>
   */
  public successTotem(
    player: Player,
    totemData: TotemData,
    probData?: ProbData
  ): void {
    if (probData) {
      world.sendMessage({
        translate: "emi.totems.useTotem.prob",
        with: [player.name, String(probData.rand), String(probData.prob)],
      });
    } else {
      world.sendMessage({
        translate: "emi.totems.useTotem",
        with: [player.name],
      });
    }
    system.run((): void => {
      Totems.onConsumeTotem(player, totemData);
    });
  }
}

export const utils = new Utils();
