
// @ts-check

import { world, system, EntityHealCause, EquipmentSlot, Player, EntityEquippableComponent, ItemStack, EntityDamageCause, Dimension } from "@minecraft/server";


system.run(() => { world.sendMessage(`§7> §eStackeable Totems §7v${ver}${state} Scripts Reloaded`); });

const ver = "1.3";
const state = "";


world.afterEvents.playerSpawn.subscribe((ev) => {
  const { initialSpawn, player } = ev;
  if (initialSpawn) {
    system.runTimeout(() => {
      player.sendMessage({ translate: "emi.totems.system.welcome", with: [ver, state] });
      const initScore = world.scoreboard.getObjective("use_totem");
      if (!initScore) {
        world.sendMessage({ translate: "emi.totems.system.notScore" });
        world.scoreboard.addObjective("use_totem", "§gTotems Usados");
      }
    }, 600)
  }
});



world.beforeEvents.entityHeal.subscribe((ev) => {
  const { healSource, healedEntity } = ev;
  if (!healedEntity || !(healedEntity instanceof Player)) return;
  if (!healSource || healSource.cause !== EntityHealCause.TotemOfUndying) return;
  const comp = healedEntity.getComponent("equippable");
  if (!comp) return;
  const main = comp.getEquipment(EquipmentSlot.Mainhand);
  const off = comp.getEquipment(EquipmentSlot.Offhand);
  if (!off && main && main.typeId === "minecraft:totem_of_undying") {
    processTotem(healedEntity, comp, main, EquipmentSlot.Mainhand, "normal");
    return;
  }
  else if (!main && off && off.typeId === "minecraft:totem_of_undying") {
    processTotem(healedEntity, comp, off, EquipmentSlot.Offhand, "normal");
    return;
  }
  else if (main && off && main.typeId === "minecraft:totem_of_undying" && off.typeId === "minecraft:totem_of_undying") {
    processTotem(healedEntity, comp, off, EquipmentSlot.Offhand, "normal");
    return;
  }
});



world.beforeEvents.entityHurt.subscribe((ev) => {
  const { hurtEntity: player, damage } = ev;
  const cause = ev.damageSource.cause;
  if (!player || !(player instanceof Player)) return;
  const comp = player.getComponent("equippable");
  if (!comp) return;
  const main = comp.getEquipment(EquipmentSlot.Mainhand);
  const off = comp.getEquipment(EquipmentSlot.Offhand);
  const health = player.getComponent("health");
  if (!health) return;
  if (damage > health.currentValue && cause === EntityDamageCause.void) {
    if (processingVoid.has(player.id)) return;
    processingVoid.add(player.id);
    if (!off && main && main.typeId === "minecraft:totem_of_undying") {
      ev.cancel = true;
      processTotem(player, comp, main, EquipmentSlot.Mainhand, "void");
      return;
    }
    else if (!main && off && off.typeId === "minecraft:totem_of_undying") {
      ev.cancel = true;
      processTotem(player, comp, off, EquipmentSlot.Offhand, "void");
      return;
    }
    else if (main && off && main.typeId === "minecraft:totem_of_undying" && off.typeId === "minecraft:totem_of_undying") {
      ev.cancel = true;
      processTotem(player, comp, off, EquipmentSlot.Offhand, "void");
      return;
    }
  }
});



world.beforeEvents.playerInteractWithBlock.subscribe((ev) => {
  const { block, player } = ev;
  if (!player || !block) return;
  if (block.typeId !== "minecraft:bed") return;
  if (!player.isSneaking) return;
  ev.cancel = true;
  system.run(() => {
    const tag = player.getTags().find((t) => t.startsWith("spawn:"));
    if (tag) player.removeTag(tag);
    const { x, y, z } = block.location;
    const dim = block.dimension.id.split(":")[1];
    player.sendMessage({ translate: "emi.totems.saveSpawn", with: [`${x}, ${y}, ${z} en ${normalize(dim, 1)}`] });
    player.addTag(`spawn:${x},${y},${z};${dim}`);
    // console.info(`spawn:${x},${y},${z};${dim}`)
  });
});



world.afterEvents.playerInventoryItemChange.subscribe((ev) => {
  const { itemStack: item, player, slot } = ev;
  if (!item || item.typeId !== "minecraft:totem_of_undying") return;
  const lore = item.getLore()[0];
  if (lore?.includes("§0")) return;
  const inv = player.getComponent("inventory")?.container;
  if (!inv) return;
  for (let idx = 0; idx < totems.length; idx++) {
    let cmd = undefined;
    if (slot <= 8) cmd = player.runCommand(`testfor @s[hasitem={item=totem_of_undying,location=slot.hotbar,slot=${slot},data=${idx}}]`).successCount;
    else cmd = player.runCommand(`testfor @s[hasitem={item=totem_of_undying,location=slot.inventory,slot=${slot},data=${idx}}]`).successCount;
    if (!cmd) continue;
    const newItem = item.clone();
    const { name, lore } = totems[idx];
    const mark = LOREMARK[idx];
    newItem.setLore([mark, ...lore]);
    newItem.nameTag = name;
    inv.setItem(slot, newItem);
    break;
  }
});



//  DECAPRETED
// system.runInterval(() => {
//   for (const player of world.getPlayers()) {
//     if (activeScans.has(player.id)) {
//       const gen = activeScans.get(player.id);
//       const { done } = gen.next();
//       if (done) activeScans.delete(player.id);
//       continue;
//     }
//     const gen = scanInv(player);
//     const { done } = gen.next();
//     if (!done) activeScans.set(player.id, gen);
//   }
// }, 2);



//==============================================================================================================
//
//  CONST
//
//==============================================================================================================


// const activeScans = new Map();


const processingVoid = new Set();


const LOREMARK = [
  "§0vanila_totem",
  "§0tnt_totem",
  "§0fly_totem",
  "§0ender_totem",
  "§0void_totem",
];


const totems = [
  { name: "§r§eVanila Totem", lore: ["§r§9On Use: Normal Totem"] },
  { name: "§r§cTNT Totem", lore: ["§r§9On Use: Spawn 8 TNTs"] },
  { name: "§r§rFly Totem", lore: ["§r§9On Use: Give levitation effect"] },
  { name: "§r§dEnder Totem", lore: ["§r§9On Use: Teleport on your last SpawnPoint saved"] },
  { name: "§r§8Void Totem", lore: ["§r§9On Use: Teleport on your last SpawnPoint saved", "§r§lOnly works in Void"] },
];


//==============================================================================================================
//
//  FUNCTIONS
//
//==============================================================================================================



/**
 * @param {string} text
 * @param {number} [type]
 */
function normalize(text, type) {
  text = text?.replaceAll("minecraft:", "");
  text = text?.replaceAll("emi:", "");
  if (type === 1) { text = text?.replaceAll("_", " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "); }
  return text;
}



/**
 * Funcion de logica para el itemStack
 * @param {Player} player Jugador
 * @param {EntityEquippableComponent} comp Componente Equippable
 * @param {ItemStack} item Item en cuestion
 * @param {EquipmentSlot} slot Slot en el cual se encuentra el item
 * @param {"normal"|"void"} type Tipo de uso
 * @param {number} [prob] Probabilidad de falla ?
 * @param {number} [cost] Costo de usar el totem, default = 1
 */
function processTotem(player, comp, item, slot, type, prob, cost = 1) {
  system.run(() => {
    player.removeEffect("fire_resistance");
    player.removeEffect("absorption");
    player.removeEffect("regeneration");
    const lore = item.getLore()[0];
    if (item.amount > cost) {
      const newItem = item.clone();
      newItem.amount = item.amount - cost;
      comp.setEquipment(slot, newItem);
    }
    else if (item.amount === cost) {
      comp.setEquipment(slot, undefined);
    }
    else {
      const remaining = cost - item.amount;
      const inv = player.getComponent("inventory")?.container;
      if (!inv) {
        player.kill();
        world.sendMessage({ translate: "emi:totems.useTotem.notEnought", with: [player.name] });
        return;
      }
      const slots = [];
      let hasTotem = 0;
      for (let i = 0; i < inv.size; i++) {
        const it = inv.getItem(i);
        if (!it || it.typeId !== "minecraft:totem_of_undying") continue;
        if (it.getLore()[0] !== lore) continue;
        slots.push(i);
        hasTotem += it.amount;
      }
      if (hasTotem < remaining) {
        player.kill();
        world.sendMessage({ translate: "emi:totems.useTotem.notEnought", with: [player.name] });
        return;
      }
      comp.setEquipment(slot, undefined);
      let consume = remaining;
      for (const s of slots) {
        if (consume <= 0) break;
        const it = inv.getItem(s);
        if (!it) continue;
        if (it.amount > consume) {
          const newIt = it.clone();
          newIt.amount = it.amount - consume;
          inv.setItem(s, newIt);
          consume = 0;
        }
        else {
          consume -= it.amount;
          inv.setItem(s, undefined);
        }
      }
    }
    const score = world.scoreboard.getObjective("use_totem");
    if (!score) return;
    score.addScore(player.name, 1);
    if (prob) {
      const random = Math.floor(Math.random() * 100) + 1; //  Number in range 1 - 100
      if (random > prob) {
        player.kill();
        world.sendMessage({ translate: "emi.totems.useTotem.fail", with: [player.name, normalize(lore.slice(2), 1), String(random), String(prob)] });
        return;
      }
      else world.sendMessage({ translate: "emi.totems.useTotem.prob", with: [player.name, normalize(lore.slice(2), 1), String(random), String(prob)] });
    }
    else world.sendMessage({ translate: "emi.totems.useTotem", with: [player.name, normalize(lore.slice(2), 1)] });
    //
    if (type === "normal") useTotem(player, item);
    else if (type === "void") useVoidTotem(player, item);
  });
}



/**
 * Funciona general que aplica los efectos
 * @param {Player} player Jugador
 * @param {ItemStack} item Item en cuestion
 */
function useTotem(player, item) {
  const lore = item.getLore()[0];
  const { x, y, z, dim } = getSpawn(player);
  switch (lore.slice(2)) {
    case "vanila_totem":
      applyEffects(player, [
        { eff: "fire_resistance", dur: 15, amp: 0 },
        { eff: "absorption", dur: 15, amp: 0 },
        { eff: "regeneration", dur: 45, amp: 1 },
      ]);
      break;

    case "tnt_totem":
      applyEffects(player, [
        { eff: "resistance", dur: 2, amp: 4 },
        { eff: "regeneration", dur: 10, amp: 1 },
      ], "totems.tnt");
      spawnTNT(player, dim);
      break;

    case "fly_totem":
      applyEffects(player, [
        { eff: "levitation", dur: 1, amp: 59 },
        { eff: "slow_falling", dur: 12, amp: 0 },
        { eff: "regeneration", dur: 15, amp: 1 },
      ], "totems.fly");
      break;

    case "ender_totem":
      applyEffects(player, [
        { eff: "health_boost", dur: 45, amp: 6 },
        { eff: "regeneration", dur: 30, amp: 1 },
        { eff: "fire_resistance", dur: 3, amp: 0 },
      ], "totems.ender");
      player.teleport({ x: x, y: y, z: z }, { dimension: dim });
      break;
  }
}



/**
 * Funcion unica para el uso del Void Totem
 * @param {Player} player Jugador
 * @param {ItemStack} item 
 */
function useVoidTotem(player, item) {
  processingVoid.delete(player.id);
  const lore = item.getLore()[0].slice(2);
  if (lore !== "void_totem") {
    world.sendMessage({ translate: "emi.totems.useTotem.void-normal", with: [normalize(lore, 1)] });
    player.kill();
    // processingVoid.delete(player.id);
    return;
    // world.sendMessage({ translate: "emi.totems.useTotem.void" });
    // player.kill();
  }
  const { x, y, z, dim } = getSpawn(player);
  applyEffects(player, [
    { eff: "nausea", dur: 15, amp: 0 },
    { eff: "resistance", dur: 15, amp: 1 },
    { eff: "regeneration", dur: 10, amp: 1 },
    { eff: "fire_resistance", dur: 3, amp: 0 },
  ], "totem.void");
  player.teleport({ x: x, y: y, z: z }, { dimension: dim });
}



/**
 * 
 * @param {Player} player 
 * @param {{eff: string, dur: number, amp: number}[]} effects
 * @param {string} [sound]
 */
function applyEffects(player, effects, sound) {
  system.run(() => {
    if (sound) player.dimension.playSound(sound, player.location, { volume: 10.0 });
    for (const { eff, dur, amp } of effects) { player.addEffect(eff, dur * 20, { amplifier: amp }); }
  });
}



/**
 * @param {Player} player 
 * @returns {{x: number, y: number, z: number, dim: Dimension}}
 */
function getSpawn(player) {
  const spawnPoint = player.getTags().find((t) => t.startsWith("spawn:"))
  if (!spawnPoint) {
    const { x, y, z } = world.getDefaultSpawnLocation();
    const dim = world.getDimension("overworld");
    return { x: x, y: y, z: z, dim: dim };
  }
  else {
    const spawn = spawnPoint.split(":")[1];
    const [coords, dimension] = spawn.split(";");
    const [x, y, z] = coords.split(",");
    const dim = world.getDimension(dimension);
    return { x: Number(x), y: Number(y), z: Number(z), dim: dim }
  }
}



/**
 * @param {Player} player 
 * @param {Dimension} dim 
 */
function spawnTNT(player, dim) {
  const { x, y, z } = player.location;
  dim.spawnEntity("minecraft:tnt", { x: x + 4, y: y + 3, z: z }, { spawnEvent: "emi:from_totem" })
  dim.spawnEntity("minecraft:tnt", { x: x + 3, y: y + 3, z: z + 3 }, { spawnEvent: "emi:from_totem" })
  dim.spawnEntity("minecraft:tnt", { x: x, y: y + 3, z: z + 4 }, { spawnEvent: "emi:from_totem" })
  dim.spawnEntity("minecraft:tnt", { x: x - 3, y: y + 3, z: z + 3 }, { spawnEvent: "emi:from_totem" })
  dim.spawnEntity("minecraft:tnt", { x: x - 4, y: y + 3, z: z }, { spawnEvent: "emi:from_totem" })
  dim.spawnEntity("minecraft:tnt", { x: x - 3, y: y + 3, z: z - 3 }, { spawnEvent: "emi:from_totem" })
  dim.spawnEntity("minecraft:tnt", { x: x, y: y + 3, z: z - 4 }, { spawnEvent: "emi:from_totem" })
  dim.spawnEntity("minecraft:tnt", { x: x + 3, y: y + 3, z: z - 3 }, { spawnEvent: "emi:from_totem" })
}



//  DECAPRETED
// /**
//  * @param {Player} player
//  */
// function* scanInv(player) {
//   const inv = player.getComponent("inventory")?.container;
//   if (!inv) return;
//   for (let i = 0; i < inv.size; i++) {
//     yield;
//     const item = inv.getItem(i);
//     if (!item || item.typeId !== "minecraft:totem_of_undying") continue;
//     // const lore = ;
//     // if (!lore) continue;
//     if (item.getLore()[0]?.includes("§0")) continue;
//     for (let idx = 0; idx < totems.length; idx++) {
//       let cmdSuccess = undefined;
//       if (i <= 8) cmdSuccess = player.runCommand(`testfor @s[hasitem={item=totem_of_undying,location=slot.hotbar,slot=${i},data=${idx}}]`).successCount;
//       else cmdSuccess = player.runCommand(`testfor @s[hasitem={item=totem_of_undying,location=slot.inventory,slot=${i - 9},data=${idx}}]`).successCount;
//       if (!cmdSuccess) continue;
//       const newItem = item.clone();
//       const { name, lore } = totems[idx];
//       const mark = LOREMARK[idx];
//       newItem.setLore([mark, ...lore]);
//       newItem.nameTag = name;
//       inv.setItem(i, newItem);
//       break;
//     }
//   }
// }