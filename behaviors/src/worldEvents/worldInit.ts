import { afterEventsSimplified, customEventsManager, worldToolsSimplified } from "simplified-mojang-api";

/**
 * CLase principal encargada de los eventos centrales que se ejecutan cuando se inicia el add-on.
 * @typedef {worldInit}
 * @author Emiliocrack1355
 * @modified HaJuegos - v2 - Motivo: Simplificacion de codigo y mejora del mismo - 24-08-2026
 */
class WorldEventsManagerClass {
    /**
     * Variable global de solo lectura que indica la version del add-on en cuestion.
     * @type {string}
     * @author Emiliocrack1355
     * @readonly
     * @private
     */
    private readonly addonVer = 'v1.4-beta';

    /**
     * Eventos principales de la clase cuando es llamada o inicializada.
     * @constructor
     */
    constructor () {
        // Fast items solo con el totem por defecto.
        customEventsManager.fastItemsSystem(() => ['totem']);

        this.playerSpawnEvents();
    }

    /**
     * Metodo principal que se encarga del mensaje de bienvenida cada que el jugador entra al mundo.
     * @returns {void}
     * @version 2
     * @private
     * @author Emiliocrack1355
     * @modified HaJuegos - v2 - Motivo: Simplificacion de codigo y mejora del mismo - 24-08-2026
     */
    private playerSpawnEvents(): void {
        afterEventsSimplified.onPlayerSpawns((args) => {
            const { player: ply, initialSpawn: firstSpawn } = args;

            if (firstSpawn) {
                worldToolsSimplified.setDelay(() => {
                    ply.sendMessage({ rawtext: [{ translate: 'emi.totems.system.welcome', with: [this.addonVer] }] });
                }, worldToolsSimplified.convertSecondsToTicks(1));
            }
        });
    }
}

new WorldEventsManagerClass();