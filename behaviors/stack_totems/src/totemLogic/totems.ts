import {
  world,
  system,
  Player,
  EntityComponentTypes,
  ItemStack,
} from "@minecraft/server";
import { TotemsMetods } from "./totemMetods";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { getVariantByLore, totemVariants } from "../system/utils";

export class Totems extends TotemsMetods {
  
  /**
   * Escaneos del inventario por jugador
   */
  private readonly activeScans = new Map<String, Generator>();

  constructor() {
    super();
    this.setTotem();
  }

  /**
   * Metodo que aplica los efectos y sonidos de los totems custom
   * @param player
   * @param item
   */
  protected onTotemEffect(player: Player, item: ItemStack): void {
    const variant = getVariantByLore(item.getLore()[0]);
    if (!variant) return;
    this.applyEffects("add", player, variant.effects);
    if (variant.sound) {
      player.dimension.playSound(variant.sound, player.location, {
        volume: 10.0,
      });
    }

    switch (variant.id) {
      case "§0tnt_totem":
        this.spawnTNT(player);
        break;
      case "§0tp_totem":
        this.randomTp(player);
        break;
    }

    world.sendMessage({
      translate: "emi.totems.useTotem",
      with: [player.name, variant.name],
    });
  }

  /**
   * Metodo que controla el escaneo del inventario
   */
  private setTotem(): void {
    system.runInterval((): void => {
      for (const player of world.getPlayers()) {
        const running = this.activeScans.get(player.id);
        if (running) {
          const { done } = running.next();
          if (done) this.activeScans.delete(player.id);
          continue;
        }
        const gen = this.scanInventory(player);
        const { done } = gen.next();
        if (!done) this.activeScans.set(player.id, gen);
      }
    });
  }

  /**
   * Metodo que escanea el inventario en busca de los totems custom con DataValue
   * @param player
   */
  private *scanInventory(player: Player): Generator<void, void, unknown> {
    const inv = player.getComponent(EntityComponentTypes.Inventory)?.container;
    if (!inv) return;
    for (let i = 0; i < inv.size; i++) {
      yield;
      const item = inv.getItem(i);
      if (!item || item.typeId !== MinecraftItemTypes.TotemOfUndying) continue;
      if (item.getLore()[0]?.startsWith("§0")) continue;
      for (const variant of totemVariants) {
        const query =
          i <= 8
            ? `testfor @s[hasitem={item=${MinecraftItemTypes.TotemOfUndying},location=slot.hotbar,slot=${i},data=${variant.data}}]`
            : `testfor @s[hasitem={item=${MinecraftItemTypes.TotemOfUndying},location=slot.inventory,slot=${i - 9},data=${variant.data}}]`;
        if (!player.runCommand(query).successCount) continue;
        const newItem = item.clone();
        newItem.setLore([variant.id, ...variant.lore]);
        newItem.nameTag = variant.name;
        inv.setItem(i, newItem);
        break;
      }
    }
  }

  /**
   * Metodo auxiliar para generar TNT
   * @param player
   */
  private spawnTNT(player: Player): void {
    const { x, y, z } = player.location;
    const dim = player.dimension;
    const offsets: [number, number][] = [
      [4, 0],
      [3, 3],
      [0, 4],
      [-3, 3],
      [-4, 0],
      [-3, -3],
      [0, -4],
      [3, -3],
    ];
    for (const [ox, oz] of offsets) {
      dim.spawnEntity(
        "minecraft:tnt",
        { x: x + ox, y: y + 3, z: z + oz },
        { spawnEvent: "emi:from_totem" }
      );
    }
  }

  /**
   * Metodo auxiliar para realizar Tp aleatorios
   * @param player
   */
  private randomTp(player: Player): void {
    const { x, y, z } = player.location;
    const range = 8;
    const nx = x + (Math.random() * range * 2 - range);
    const nz = z + (Math.random() * range * 2 - range);
    player.teleport({ x: nx, y, z: nz }, { dimension: player.dimension });
  }
}
