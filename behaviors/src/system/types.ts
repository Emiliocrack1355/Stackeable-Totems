/**
 * Interfaz de la lista de efectos
 */
export interface EffectDefinition {
  eff: string;
  dur?: number;
  amp?: number;
}

/**
 * Interfaz para definir los totems customs
 */
export interface TotemVariant {
  id: string;
  data: number;
  name: string;
  lore: string[];
  effects: EffectDefinition[];
  sound?: string;
}
