import { EquipmentSlot, ItemStack } from "@minecraft/server";

/**
 * Interfaz que define la mano donde
 * se encuentra el totem
 */
export interface HandData {
  hand: EquipmentSlot;
  item: ItemStack;
}

/**
 * Interfaz que define la informacion con
 * respecto a la probabilidad de uso del totem
 */
export interface ProbData {
  hasFailed: boolean;
  rand: number;
  prob: number;
}

/**
 * Tipo de dato que contiene la informacion
 * respecto al coste por el uso del totem
 * @type
 * @author Emiliocrack1355 - 23/11/26 <01:20 pm>
 */
export type TotemData =
  | { hasStack: false }
  | {
      hasStack: true;
      hand: EquipmentSlot;
      handItem: ItemStack;
      handAmount: number;
      inv?: { slot: number; amount: number }[];
    };
