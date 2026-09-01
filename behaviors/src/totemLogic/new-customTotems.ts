import {
  world,
  system,
  EntityComponentTypes,
  Player,
  ItemStack,
} from "@minecraft/server";
import { TotemsMetods } from "./new-totemMetods";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { TotemVariant } from "../system/types";

/**
 * Clase hija que hereda los metodos logicos de el uso de totems
 * @class
 * @author Emiliocrack1355
 */
class totems extends TotemsMetods {
  /**
   * Variable que controla los escaneos del inventario por jugador
   * @readonly
   * @private
   * @author Emiliocrack1355
   */
  private readonly activeScans = new Map<String, Generator>();

  /**
   * Eventos principales pasados a la clase padre cuando la clase es inicializada
   * @constructor
   */
  constructor() {
    super();
    this.setTotem();
  }

  /**
   * Metodo sobreescribido que controla y aplica los efectos de cada totem custom
   * @private
   * @author Emiliocrack1355
   */
  protected onTotemEffect(
    player: Player,
    item: ItemStack,
    prob: number,
    randomProb: number
  ): void {
    const variant = this.getVariantByLore(item.getLore()[0]);
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

    if (prob <= 100) {
      if (randomProb >= prob) {
        world.sendMessage({
          translate: "emi.totems.useTotem.fail",
          with: [player.name, variant.name, String(randomProb), String(prob)],
        });
        player.kill();
        return;
      }
      world.sendMessage({
        translate: "emi.totems.useTotem.prob",
        with: [player.name, variant.name, String(randomProb), String(prob)],
      });
      return;
    } else {
      world.sendMessage({
        translate: "emi.totems.useTotem",
        with: [player.name, variant.name],
      });
      return;
    }
  }

  /**
   * Metodo principal que controla el escaneo del inventario por jugador
   * @private
   * @author Emiliocrack1355
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
   * Metodo auxiliar que escanea el inventario en busca de totems con DataValue
   * @param {Player} player
   * @private
   * @author Emiliocrack1355
   */
  private *scanInventory(player: Player): Generator<void, void, unknown> {
    const inv = player.getComponent(EntityComponentTypes.Inventory)?.container;
    if (!inv) return;
    for (let i = 0; i < inv.size; i++) {
      yield;
      const item = inv.getItem(i);
      if (!item || item.typeId !== MinecraftItemTypes.TotemOfUndying) continue;
      if (item.getLore()[0]?.startsWith("§0")) continue;
      for (const variant of this.totemVariants) {
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
   * @private
   * @author Emiliocrack1355
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
   * @private
   * @author Emiliocrack1355
   */
  private randomTp(player: Player): void {
    const { x, y, z } = player.location;
    const range = 8;
    const nx = x + (Math.random() * range * 2 - range);
    const nz = z + (Math.random() * range * 2 - range);
    player.teleport({ x: nx, y, z: nz }, { dimension: player.dimension });
  }

  private getVariantByLore(lore?: string): TotemVariant | undefined {
    return lore
      ? this.totemVariants.find((v): boolean => v.id === lore)
      : undefined;
  }

  /**
   * Variable donde se almacenan todos los tipos de totems custom
   * @readonly
   * @private
   * @author Emiliocrack1355
   */
  private readonly totemVariants: TotemVariant[] = [
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

new totems();
