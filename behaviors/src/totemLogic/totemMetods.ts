import {
  world,
  system,
  Player,
  EntityHealCause,
  EntityComponentTypes,
  EquipmentSlot,
  EntityEquippableComponent,
  ItemStack,
} from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { vanilaTotemEffects } from "../system/utils";
import { EffectDefinition } from "../system/types";

export class TotemsMetods {
  constructor() {
    this.onUseTotem();
  }

  /**
   * Controlador principal en donde se detecta el uso de los totems
   */
  private onUseTotem(): void {
    world.beforeEvents.entityHeal.subscribe((ev): void => {
      const { healSource, healedEntity: player } = ev;
      if (!(player instanceof Player)) return;
      if (healSource.cause !== EntityHealCause.TotemOfUndying) return;
      const comp = player.getComponent(EntityComponentTypes.Equippable);
      if (!comp) return;
      const main = comp.getEquipment(EquipmentSlot.Mainhand);
      const off = comp.getEquipment(EquipmentSlot.Offhand);
      let item = undefined;
      let slot = undefined;
      if (main && !off) {
        item = main;
        slot = EquipmentSlot.Mainhand;
      }
      if (!main && off) {
        item = off;
        slot = EquipmentSlot.Offhand;
      }
      if (main && off) {
        item = off;
        slot = EquipmentSlot.Offhand;
      }
      if (!item || !slot) return;

      system.run((): void => {
        this.useTotem(player, comp, item, slot);
      });
    });
  }

  /**
   * Logica de uso del totem
   * @param player
   * @param comp
   * @param item
   * @param slot
   */
  private useTotem(
    player: Player,
    comp: EntityEquippableComponent,
    item: ItemStack,
    slot: EquipmentSlot
  ): void {
    this.applyEffects("remove", player, vanilaTotemEffects);
    const result = this.consumeTotem(player, comp, item, slot);
    if (!result) {
      player.kill();
      world.sendMessage({
        translate: "emi.totems.useTotem.notEnought",
        with: [player.name],
      });
      return;
    }
    const totem = world.scoreboard.getObjective("use_totem");
    if (!totem) return;
    totem.addScore(player.name, 1);
    this.onTotemEffect(player, item);
  }

  /**
   * Metodo auxiliar para sobreescribir desde la clase hija Totems
   */
  protected onTotemEffect(_player: Player, _item: ItemStack): void {}

  /**
   * Logica de consumo del stack de totems
   * @param player El jugador en cuestion
   * @param comp Componente Equippable
   * @param item El item de la mano
   * @param slot Slot en donde esta el item
   * @returns
   */
  private consumeTotem(
    player: Player,
    comp: EntityEquippableComponent,
    item: ItemStack,
    slot: EquipmentSlot
  ): boolean | undefined {
    const config = world.scoreboard.getObjective("config");
    if (!config) return false;
    const prob = config.getScore("prob");
    const cost = config.getScore("cost");
    if (prob === undefined || cost === undefined) return false;
    const amount = item.amount;
    if (amount > cost) {
      const clone = item.clone();
      clone.amount = amount - cost;
      comp.setEquipment(slot, clone);
      return true;
    } else if (amount === cost) {
      comp.setEquipment(slot, undefined);
      return true;
    } else {
      const lore = item.getLore()[0];
      const inv = player.getComponent(
        EntityComponentTypes.Inventory
      )?.container;
      if (!inv) return false;
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
      if (items < remaining) return false;
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
      return true;
    }
  }

  /**
   * Metodo auxiliar para aplicar o remover efectos
   * @param type Se declara si se añaden o se eliminan los effectos
   * @param player El jugador en cuestion
   * @param effects Lista de efectos
   */
  protected applyEffects(
    type: "remove" | "add",
    player: Player,
    effects: EffectDefinition[]
  ): void {
    for (const { eff, dur, amp } of effects) {
      if (type === "remove") {
        player.removeEffect(eff);
      } else if (type === "add") {
        player.addEffect(eff, (dur ?? 10) * 20, { amplifier: amp ?? 0 });
      }
    }
  }
}
