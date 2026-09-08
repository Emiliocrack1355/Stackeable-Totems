import { EquipmentSlot } from "@minecraft/server";

/**
 * Tipo de dato que contiene la informacion
 * sobre el coste de use del totem
 */
export type TotemData =
  | { hasStack: false }
  | {
      hasStack: true;
      hand: EquipmentSlot;
      handAmount: number;
      inv?: { slot: number; amount: number }[];
    };

/**
 * Interfaz que contiene los datos de la probabilidad
 * de uso del totem
 */
export interface ProbData {
  hasFailed: boolean;
  rand: number;
  prob: number;
}

/**
 * Interfaz que contiene los datos de la variante
 * del totem custom
 */
export interface TotemVariant {
  id: string;
  data: number;
  name: string;
  lore: string[];
  effects: EffectDefinition[];
  sound?: string;
}

/**
 * Interdaz que define los datos de
 * la lista de efectos
 */
export interface EffectDefinition {
  eff: string;
  dur?: number;
  amp?: number;
}
