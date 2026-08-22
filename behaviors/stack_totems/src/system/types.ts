/**
 * Interfaz de la lista de efectos
 */
interface EffectDefinition {
  eff: string;
  dur?: number;
  amp?: number;
}

/**
 * Interfaz para definir los totems customs
 */
interface TotemVariant {
  id: string;
  data: number;
  name: string;
  lore: string[];
  effects: EffectDefinition[];
  sound?: string;
}

export {
  TotemVariant,
  EffectDefinition
} 