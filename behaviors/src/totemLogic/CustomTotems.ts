import {
  Dimension,
  EntityComponentTypes,
  Player,
  system,
  world,
} from "@minecraft/server";
import { TotemMetods } from "./TotemMetods";
import { EffectDefinition, TotemVariant } from "../system/types";

/**
 * Clase hija que controla toda la logica de los efectos y habilidades
 * de los totems, heredando los metodos de TotemMetods
 * @class
 * @author Emiliocrack1355 - 07/09/26
 */
class CustomTotems extends TotemMetods {
  /**
   * Variable que controla los escaneos de inventario por jugador
   * @readonly
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private readonly activeScans = new Map<String, Generator>();

  /**
   * Variable global que indica los efectos vanila al usar el totem
   * @readonly
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private readonly vanilaTotemEffects = [
    { eff: "fire_resistance" },
    { eff: "absorption" },
    { eff: "regeneration" },
  ];

  /**
   * Metodos que son traspasados a la clase padre, para ser inicializados
   * @constructor
   * @author Emiliocrack1355 - 07/09/26
   */
  constructor() {
    super();
    this.scanTotem();
  }

  /**
   * Metodo sobreescribido de la clase padre, que controla y aplica los efectos y
   * habilidades de cada totem custom
   * @param player El jugador en cuestion que uso el totem
   * @param variant Informacion al respecto del totem custom
   * @protected
   * @author Emiliocrack1355 - 07/09/26
   */
  protected onTotemEffect(player: Player, variant: TotemVariant) {
    this.applyEffects("remove", player, this.vanilaTotemEffects);
    this.applyEffects("add", player, variant.effects);
    if (variant.sound)
      player.dimension.playSound(variant.sound, player.location);
    switch (variant.id) {
      case "§0tnt_totem":
        this.spawnTNT(player);
        break;
      case "§0ender_totem":
        const { x, y, z, dim } = this.getSpawnPoint(player);
        // world.sendMessage(`x:${x}, y:${y}, z:${z}, dim:${dim.id}`);
        player.teleport({ x: x, y: y, z: z }, { dimension: dim });
        break;
      case "§0tp_totem":
        this.randomTp(player);
        break;
    }
  }

  /**
   * Metodo auxiliar principal que controla el escaneo del inventario
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private scanTotem(): void {
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
   * @param player El jugador el cual se escanea su inventario
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private *scanInventory(player: Player): Generator<void, void, unknown> {
    const inv = player.getComponent(EntityComponentTypes.Inventory)?.container;
    if (!inv) return;
    for (let i = 0; i < inv.size; i++) {
      yield;
      const item = inv.getItem(i);
      if (!item || item.typeId !== this.totem) continue;
      if (item.getLore()[0]?.startsWith("§0")) continue;
      for (const variant of this.totemVariants) {
        const query =
          i <= 8
            ? `testfor @s[hasitem={item=${this.totem},location=slot.hotbar,slot=${i},data=${variant.data}}]`
            : `testfor @s[hasitem={item=${this.totem},location=slot.inventory,slot=${i - 9},data=${variant.data}}]`;
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
   * Metodo auxiliar para aplicar o remover efectos
   * @param type Se declara si se agregaran o eliminaran efectos
   * @param player El jugador en cuestion
   * @param effects Lista de efectos
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private applyEffects(
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

  /**
   * Metodo auxiliar para generar TNT
   * @param player El jugador que uso el totem
   * @private
   * @author Emiliocrack1355 - 07/09/26
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
   * @param player El jugador que uso el totem
   * @private
   * @author Emiliocrack1355 - 07/09/26
   */
  private randomTp(player: Player): void {
    const { x, y, z } = player.location;
    const range = 16;
    const nx = x + (Math.random() * range * 2 - range);
    const nz = z + (Math.random() * range * 2 - range);
    player.teleport({ x: nx, y, z: nz }, { dimension: player.dimension });
    //  Agregar particulas desde el origen hasta la nueva posicion
  }

  /**
   * Metodo auxiliar para obtener el spawnpoint del jugador,
   * en caso de no existir, se retorna el world spawn
   * @param player El jugador que uso el totem
   * @returns Retorna el SpawnPoint del jugador o el Spawn por defecto del mundo
   */
  private getSpawnPoint(player: Player): {
    x: number;
    y: number;
    z: number;
    dim: Dimension;
  } {
    const spawnPoint = player
      .getTags()
      .find((t): boolean => t.startsWith("spawn:"));
    if (!spawnPoint) {
      // world.sendMessage("def world spawn");
      const { x, y, z } = world.getDefaultSpawnLocation();
      const dim = world.getDimension("overworld");
      return { x: x, y: y, z: z, dim: dim };
    } else {
      // world.sendMessage("spawnpoint");
      const spawn = spawnPoint.split(":")[1];
      const [coords, dimension] = spawn.split(";");
      const [x, y, z] = coords.split(",");
      const dim = world.getDimension(dimension);
      return { x: Number(x), y: Number(y), z: Number(z), dim: dim };
    }
  }
}

new CustomTotems();
