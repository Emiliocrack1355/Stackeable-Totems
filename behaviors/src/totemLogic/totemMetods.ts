import * as mc from '@minecraft/server';

import { customEventsManager, worldToolsSimplified } from "simplified-mojang-api";

/**
 * Clase principal que se encarga de los sensores y la ejecucion de los totems.
 * @version 2
 * @typedef {TotemsManagerClass}
 * @author Emiliocrack1355
 * @modified HaJuegos - v2 - Motivo: Nuevos ajustes y simplificaciones generales - 24-08-2026
 */
class TotemsManagerClass {
    /**
     * Eventos iniciales de la clase cuando es llamada o inicializada.
     * @constructor
     */
    constructor () {
        this.totemSensor();
    }

    /**
     * Controlador principal en donde se detecta el uso de los totems.
     * @returns {void}
     * @version 2
     * @private
     * @author Emiliocrack1355
     * @modified HaJuegos - v2 - Motivo: Simplificacion del metodo principal - 24-08-2026
     */
    private totemSensor(): void {
        customEventsManager.onEntityUseTotem((entity) => {
            if (!(entity instanceof mc.Player)) return;

            this.useTotemLogic(entity);
        });
    }

    /**
     * Metodo auxiliar que se encarga de obtener en primera instancia el orden del item del totem usado.
     * @param {mc.Player} ply Jugador en cuestion a considerar.
     * @returns {void}
     * @version 2
     * @private
     * @author Emiliocrack1355
     * @modified HaJuegos - v2 - Motivo: Simplificacion del metodo y mejora del codigo original - 24-08-2026
     */
    private useTotemLogic(ply: mc.Player): void {
        const armorInv = ply.getComponent(mc.EntityComponentTypes.Equippable);

        if (!armorInv) return;

        const offItem = armorInv.getEquipment(mc.EquipmentSlot.Offhand);
        const mainItem = armorInv.getEquipment(mc.EquipmentSlot.Mainhand);

        const dataItems = offItem ? { item: offItem, slot: mc.EquipmentSlot.Offhand } : mainItem ? { item: mainItem, slot: mc.EquipmentSlot.Mainhand } : undefined;

        if (!dataItems) return;

        worldToolsSimplified.setRun(() => {
            if (dataItems.item.amount > 1) {
                const newItem = dataItems.item.clone();

                newItem.amount--;
                armorInv.setEquipment(dataItems.slot, newItem);
            } else {
                armorInv.setEquipment(dataItems.slot, undefined);
            }
        });
    }
}

new TotemsManagerClass();