import { TotemVariant } from "./types";

export const addonVer = "1.0";

export const addonState = "-beta";

export const vanilaTotemEffects = [
  { eff: "fire_resistance" },
  { eff: "absorption" },
  { eff: "regeneration" },
];

export function formatText(text: string | undefined, title = false): string {
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

export function getVariantByLore(lore?: string): TotemVariant | undefined {
  return lore ? totemVariants.find((v): boolean => v.id === lore) : undefined;
}

export const totemVariants: TotemVariant[] = [
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
