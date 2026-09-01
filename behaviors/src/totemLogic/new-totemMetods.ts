import {
  world,
  system,
  Player,
  EntityComponentTypes,
  EquipmentSlot,
  ItemStack,
  EntityEquippableComponent,
} from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { customEventsManager } from "simplified-mojang-api";
import { EffectDefinition } from "../system/types";
import { utilsClass } from "../worldEvents/worldInit";

/**
 * Clase principal que controla la logica de deteccion y uso de los totems
 * @class
 * @author Emiliocrack1355 & HaJuegos
 */
export class TotemsMetods {
  /**
   * Variable global que indica los efectos vanila al usar el totem
   * @readonly
   * @private
   */
  private readonly vanilaTotemEffects = [
    { eff: "fire_resistance" },
    { eff: "absorption" },
    { eff: "regeneration" },
  ];

  /**
   *  Eventos principales cuando la clase es inicializada
   * @constructor
   */
  constructor() {
    this.totemSensor();
  }

  /**
   *  Controlador que detecta el uso de los totems
   * @private
   * @author Emiliocrack1355 & HaJuegos
   */
  private totemSensor(): void {
    customEventsManager.onEntityUseTotem((entity): void => {
      if (!(entity instanceof Player)) return;
      this.useTotemLogic(entity);
    });
  }

  /**
   *  Metodo auxiliar que se encarga de obtener el item y slots del totem usado
   * @param {Player} player
   * @private
   * @author Emiliocrack1355 & HaJuegos
   */
  private useTotemLogic(player: Player): void {
    const comp = player.getComponent(EntityComponentTypes.Equippable);
    if (!comp) return;
    const mainItem = comp.getEquipment(EquipmentSlot.Mainhand);
    const offItem = comp.getEquipment(EquipmentSlot.Offhand);
    const dataItem = offItem
      ? { item: offItem, slot: EquipmentSlot.Offhand }
      : mainItem
        ? { item: mainItem, slot: EquipmentSlot.Mainhand }
        : undefined;
    if (!dataItem) return;
    // console.info(dataItem.item.typeId);
    system.run((): void => {
      this.applyEffects("remove", player, this.vanilaTotemEffects);
      const result = this.consumeTotem(
        player,
        dataItem.item,
        dataItem.slot,
        comp
      );
      if (!result) {
        player.kill();
        return;
      }
      const totem = world.scoreboard.getObjective("use_totem");
      if (!totem) return;
      totem.addScore(player.name, 1);
    });
  }

  /**
   * Metodo auxiliar que se encarga de la logica de uso por probabilidad y cantidad de totems consumidos por uso
   * @param {Player} player
   * @param {ItemStack} item
   * @param {EquipmentSlot} slot
   * @param {EntityEquippableComponent} comp
   * @returns {Boolean | undefined}
   * @private
   * @author Emiliocrack1355
   */
  private consumeTotem(
    player: Player,
    item: ItemStack,
    slot: EquipmentSlot,
    comp: EntityEquippableComponent
  ): boolean | undefined {
    const config = world.scoreboard.getObjective("config");
    if (!config) return undefined;
    const prob = config.getScore("prob") ?? 101; //  Probabilidad base de 101 ( nunca falla )
    const cost = config.getScore("cost") ?? 1; //  Costo base de 1 totem
    // console.info(cost)
    // console.info(prob)
    // if (prob === undefined || cost === undefined) return false;
    const lore = item.getLore()[0];
    const randomProb = Math.floor(Math.random() * 100) + 1; //  Otorga un numero en rango de 1 al 100
    let value = false;
    const amount = item.amount;
    if (amount > cost) {
      const clone = item.clone();
      clone.amount = amount - cost;
      comp.setEquipment(slot, clone);
      value = true;
    } else if (amount === cost) {
      comp.setEquipment(slot, undefined);
      value = true;
    } else {
      const inv = player.getComponent(
        EntityComponentTypes.Inventory
      )?.container;
      if (!inv) return;
      let items = 0;
      let slots = [];
      for (let i = 0; i < inv.size; i++) {
        const it = inv.getItem(i);
        if (!it || it.typeId !== MinecraftItemTypes.TotemOfUndying) continue;
        if (it.getLore()[0] !== lore) continue;
        items += it.amount;
        slots.push(i);
      }
      let remaining = cost - amount;
      if (items < remaining) {
        world.sendMessage({
          translate: "emi.totems.useTotem.notEnought",
          with: [player.name],
        });
        value = false;
      }
      comp.setEquipment(slot, undefined);
      for (const i of slots) {
        if (remaining <= 0) break;
        const stack = inv.getItem(i);
        if (!stack) continue;
        if (stack.amount > remaining) {
          const clone = stack.clone();
          clone.amount = stack.amount - remaining;
          inv.setItem(i, clone);
          remaining = 0;
        } else {
          remaining -= stack.amount;
          inv.setItem(i, undefined);
        }
      }
      value = true;
    }
    //  Se llama desde aqui para heredar los valores de probabilidad
    //  para enviar el mensaje de alerta de totem normal o en
    //  en caso de aplicar probabilidad con prob <= 100
    this.onTotemEffect(player, item, prob, randomProb);
    return value;
  }

  /**
   * Metodo que se sobreescribira para aplicar los efectos de los totems custom
   * @protected
   * @author Emiliocrack1355
   */
  protected onTotemEffect(
    player: Player,
    item: ItemStack,
    prob: number,
    randomProb: number
  ): void {}

  /**
   * Metodo auxiliar para aplicar o remover efectos
   * @param {"remove" | "add"} type Se declara si se agregaran o eliminaran efectos
   * @param {Player} player El jugador en cuestion
   * @param {EffectDefinition[]} effects Lista de efectos
   * @protected
   * @author Emiliocrack1355
   */
  protected applyEffects(
    type: "remove" | "add",
    player: Player,
    effects: EffectDefinition[]
  ): void {
    // console.info(type); FG
    for (const { eff, dur, amp } of effects) {
      // console.info(eff);
      if (type === "remove") {
        player.removeEffect(eff);
      } else if (type === "add") {
        player.addEffect(eff, (dur ?? 10) * 20, { amplifier: amp ?? 0 });
      }
    }
  }
}
