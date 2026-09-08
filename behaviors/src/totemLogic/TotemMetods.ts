import {
  EntityComponentTypes,
  EntityHealBeforeEvent,
  EntityHealCause,
  EquipmentSlot,
  ItemStack,
  Player,
  system,
  world,
} from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import * as ha from "simplified-mojang-api";
import { ProbData, TotemData, TotemVariant } from "../system/types";

/**
 * Clase principal que controla toda la logica teorica de los totems,
 * su usos, costes y probabilidades
 * @class
 * @author Emiliocrack1355 - 07/09/26
 */
export class TotemMetods {
  /**
   * Variable que almacena el typeId del totem
   * @readonly
   * @protected
   * @author Emiliocrack1355 - 07/09/26
   */
  protected readonly totem = MinecraftItemTypes.TotemOfUndying;

  /**
   * Eventos que se inicializan al cargar la clase
   * @constructor
   * @author Emiliocrack1355 - 07/09/26
   */
  constructor() {
    this.TotemDetect();
  }

  /**
   * Metodo que detecta cuando un totem es usado
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private TotemDetect() {
    world.beforeEvents.entityHeal.subscribe((ev) => {
      const { healSource, healedEntity } = ev;
      if (!(healedEntity instanceof Player)) return;
      if (healSource.cause !== EntityHealCause.TotemOfUndying) return;
      const data = this.getHand(healedEntity);
      if (!data) return;
      this.onUseTotem(healedEntity, data.hand, data.item, ev);
    });
  }

  /**
   * Metodo auxiliar que obtiene en que mano esta el totem
   * @param player El jugador que uso el totem
   * @returns Retorna el Slot y Item
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private getHand(
    player: Player
  ): { hand: EquipmentSlot; item: ItemStack } | undefined {
    const comp = player.getComponent(EntityComponentTypes.Equippable);
    if (!comp) return;
    const main = comp.getEquipment(EquipmentSlot.Mainhand);
    const off = comp.getEquipment(EquipmentSlot.Offhand);
    let data = undefined;
    if (!main && off && off.typeId === this.totem)
      data = { hand: EquipmentSlot.Offhand, item: off };
    else if (main && !off && main.typeId === this.totem)
      data = { hand: EquipmentSlot.Mainhand, item: main };
    else if (
      main &&
      off &&
      main.typeId === this.totem &&
      off.typeId === this.totem
    )
      data = { hand: EquipmentSlot.Offhand, item: off };
    if (!data) return;
    return data;
  }

  /**
   * Metodo principal que maneja la logica del consumo de totems,
   * calcula su probabilidad de uso y mensajes de chat
   * @param player El jugador que uso el totem
   * @param slot El slot en donde se encuentra el item
   * @param item El item del totem
   * @param ev Evento para cancelar el uso del totem
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private onUseTotem(
    player: Player,
    slot: EquipmentSlot,
    item: ItemStack,
    ev: EntityHealBeforeEvent
  ): void {
    const scoreboard =
      ha.worldToolsSimplified.getOrCreateScorebordObj("config");
    if (!scoreboard) return;
    const cost = scoreboard.getScore("cost") ?? 1;
    const prob = scoreboard.getScore("prob") ?? 101;
    const amount = item.amount;
    const lore = item.getLore()[0];
    const totemData = this.getTotemData(player, slot, cost, amount, lore);
    if (!totemData.hasStack) {
      this.failedTotem(player, lore, ev, totemData);
      return;
    }
    let probData: ProbData | undefined;
    if (prob < 101) {
      const random = Math.floor(Math.random() * 100) + 1; //  Rango 1-100
      probData = { hasFailed: random >= prob, rand: random, prob: prob };
    }
    if (probData?.hasFailed)
      this.failedTotem(player, lore, ev, totemData, probData);
    else this.successTotem(player, lore, totemData, probData);
  }

  /**
   * Metodo auxiliar que obtiene toda la informacion con respecto del coste al usar
   * el totem, analizando el inventario en busca de la misma variante de totem
   * @param player El jugador que uso el totem
   * @param slot Slot en donde esta el item
   * @param cost Cantidad de totems a gastar
   * @param amount Cantidad de totems que existen en el slot
   * @param lore El identificador del totem custom
   * @returns Retorna informacion de donde se encuentran los totems en el inventario, ademas de la cantidad a consumirse
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private getTotemData(
    player: Player,
    slot: EquipmentSlot,
    cost: number,
    amount: number,
    lore: string
  ): TotemData {
    if (amount >= cost)
      return { hasStack: true, hand: slot, handAmount: amount - cost };
    const inv = player.getComponent(EntityComponentTypes.Inventory)?.container;
    if (!inv) return { hasStack: false };
    let needs = cost - amount;
    const itemsInv: { slot: number; amount: number }[] = [];
    for (let i = 0; i < inv.size; i++) {
      if (needs <= 0) break;
      const it = inv.getItem(i);
      if (!it || it.typeId !== this.totem) continue;
      if (it.getLore()[0] !== lore) continue;
      if (it.amount < needs) {
        needs -= it.amount;
        itemsInv.push({ slot: i, amount: it.amount });
      } else {
        itemsInv.push({ slot: i, amount: needs });
        needs = 0;
        break;
      }
    }
    return needs <= 0
      ? { hasStack: true, hand: slot, handAmount: amount, inv: itemsInv }
      : { hasStack: false };
  }

  /**
   * Metodo auxiliar que controla y envia los mensajes al concluirse que el totem ha funcionado
   * @param player El jugador que uso el totem
   * @param lore El identificador del totem custom
   * @param totemData La informacion del inventario con respecto al totem custom
   * @param probData La informacion de probabilidad de uso del totem
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private successTotem(
    player: Player,
    lore: string,
    totemData: TotemData,
    probData?: ProbData
  ): void {
    const variant = this.getVariant(lore);
    if (!variant) return;
    if (probData) {
      world.sendMessage({
        translate: "emi.totems.useTotem.prob",
        with: [
          player.name,
          variant.name,
          String(probData.rand),
          String(probData.prob),
        ],
      });
    } else {
      world.sendMessage({
        translate: "emi.totems.useTotem",
        with: [player.name, variant.name],
      });
    }
    system.run(() => {
      this.onTotemEffect(player, variant);
      this.consumeTotem(player, totemData);
    });
  }

  /**
   * Metodo auxiliar que controla y envia los mensajes al concluirse que el totem ha fallado
   * @param player El jugador que uso el totem
   * @param lore El identificador del totem custom
   * @param ev Evento para cancelar el uso del totem
   * @param totemData La informacion del inventario con respecto al totem custom
   * @param probData La informacion de probabilidad de uso del totem
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private failedTotem(
    player: Player,
    lore: string,
    ev: EntityHealBeforeEvent,
    totemData: TotemData,
    probData?: ProbData
  ): void {
    ev.cancel = true;
    const variant = this.getVariant(lore);
    if (!variant) return;
    if (!totemData.hasStack) {
      world.sendMessage({
        translate: "emi.totems.useTotem.notEnought",
        with: [player.name, variant.name],
      });
      return;
    }
    if (probData) {
      world.sendMessage({
        translate: "emi.totems.useTotem.fail",
        with: [
          player.name,
          variant.name,
          String(probData.rand),
          String(probData.prob),
        ],
      });
    }
  }

  /**
   * Metodo auxiliar que maneja el consume de los totems
   * @param player El jugador que uso el totem
   * @param totemData La informacion del inventario con respecto al totem custom
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private consumeTotem(player: Player, totemData: TotemData): void {
    const equip = player.getComponent(EntityComponentTypes.Equippable);
    if (!equip) return;
    if (totemData.hasStack) {
      if (totemData.handAmount > 0) {
        const handItem = equip.getEquipment(totemData.hand);
        if (!handItem) return;
        handItem.amount = totemData.handAmount;
        equip.setEquipment(totemData.hand, handItem);
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
          if (!it) continue;
          const remaining = it.amount - amount;
          if (remaining > 0) {
            it.amount = remaining;
            inv.setItem(slot, it);
          } else {
            inv.setItem(slot, undefined);
          }
        }
      }
    }
  }

  /**
   * Metodo auxiliar para obtener la variante exacta del totem custom
   * @param lore La variante de totem custom a buscar
   * @returns Retorna la informacion del totem custom requerido, en caso de no existir retorna nulo
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private getVariant(lore: string): TotemVariant | undefined {
    return lore
      ? this.totemVariants.find((v): boolean => v.id === lore)
      : undefined;
  }

  /**
   * Metodo que se sobreescribira en la clase hija, que controlara los efectos
   * y habilidades de los totems custom
   * @param player El jugador que uso el totem
   * @param variant La variante del totem custom
   * @protected
   * @author Emiliocrack1355 - 07/09/26
   */
  protected onTotemEffect(player: Player, variant: TotemVariant): void {}

  /**
   * Variable donde se almacenan todos los tipos de totems custom
   * @readonly
   * @protected
   * @author Emiliocrack1355 - 07/09/26
   */
  protected readonly totemVariants: TotemVariant[] = [
    {
      id: "§0vanila_totem",
      data: 0,
      name: "§r§eVanila Totem",
      lore: ["§r§9On Use: Normal Totem"],
      effects: [
        { eff: "fire_resistance", dur: 15, amp: 0 },
        { eff: "absorption", dur: 15, amp: 0 },
        { eff: "regeneration", dur: 45, amp: 0 },
      ],
    },
    {
      id: "§0tnt_totem",
      data: 1,
      name: "§r§cTNT Totem",
      lore: ["§r§9On Use: Genera 6 tnt"],
      effects: [
        { eff: "resistance", dur: 2, amp: 4 },
        { eff: "regeneration", dur: 10, amp: 1 },
      ],
      sound: "totems.tnt",
    },
    {
      id: "§0fly_totem",
      data: 2,
      name: "§r§rFly Totem",
      lore: ["§r§9On Use: Otorga Levitacion"],
      effects: [
        { eff: "levitation", dur: 1, amp: 59 },
        { eff: "slow_falling", dur: 12, amp: 0 },
        { eff: "regeneration", dur: 15, amp: 1 },
      ],
      sound: "totems.fly",
    },
    {
      id: "§0ender_totem",
      data: 3,
      name: "§r§dEnder Totem",
      lore: ["§r§9On Use: Tp al ultimo SpawnPoint"],
      effects: [
        { eff: "health_boost", dur: 45, amp: 6 },
        { eff: "regeneration", dur: 30, amp: 1 },
        { eff: "fire_resistance", dur: 3, amp: 0 },
      ],
      sound: "totems.ender",
    },
    {
      id: "§0void_totem",
      data: 4,
      name: "§r§8Void Totem",
      lore: ["§r§9On Use: Tp al ultimo SpawnPoint", "> Solo funciona en Vacio"],
      effects: [
        { eff: "nausea", dur: 15, amp: 0 },
        { eff: "resistance", dur: 15, amp: 1 },
        { eff: "regeneration", dur: 10, amp: 1 },
        { eff: "fire_resistance", dur: 3, amp: 0 },
      ],
      sound: "totem.void",
    },
    {
      id: "§0tp_totem",
      data: 5,
      name: "§r§4Tp Totem",
      lore: ["§r§9On Use: Random Tp"],
      effects: [
        { eff: "nausea", dur: 5, amp: 0 },
        { eff: "resistance", dur: 15, amp: 2 },
        { eff: "regeneration", dur: 15, amp: 2 },
        { eff: "absorption", dur: 15, amp: 2 },
      ],
    },
    {
      id: "§0mini_totem",
      data: 6,
      name: "§r§bMini Totem",
      lore: ["§r§9On Use: Tamaño mini x 30 seg"],
      effects: [{ eff: "regeneration", dur: 10, amp: 4 }],
    },
  ];
}
