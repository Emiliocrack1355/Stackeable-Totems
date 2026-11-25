var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/core/errorHandler.js
var CatLogHandler;
var init_errorHandler = __esm({
  "node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/core/errorHandler.js"() {
    CatLogHandler = class {
      constructor() {
      }
      /**
       * Método principal que convierte y modifica los eventos para cuando hay un error en la API, siendo más detallada al respecto y con guías.
       * @param {*} e Error en concreto que sucedió.
       * @param {string} ctxName Evento en concreto donde sucedió el error.
       * @param {?string} [registrationTrace] (Opcional) El track en concreto donde haya sucedido el error.
       * @author HaJuegos - 31-03-2026
       * @public
       * @static
       */
      static handleError(e, ctxName, registrationTrace) {
        const error = e;
        let isInfoLevel = false;
        let logMessage = `
\xA7c=== [CATLOG ERROR] ===\xA7r
`;
        logMessage += `\xA7eContexto:\xA7r ${ctxName}
`;
        logMessage += `\xA7cMotivo:\xA7r ${error.message}
`;
        if (error.message.includes("restricted execution")) {
          logMessage += `\xA7b[TIP]:\xA7r Envuelve tu logica dentro de un 'worldToolsSimplified.setRun()' o usa async.
`;
        } else if (error.message.includes("early execution")) {
          logMessage += `\xA7b[TIP]:\xA7r Mueve este codigo al evento 'onWorldReady' para asegurarte de que los datos existan.
`;
        } else if (error.message.includes("Entity being invalid") || error.message.includes("has the Entity been removed")) {
          logMessage += `\xA7b[TIP]:\xA7r La entidad ya fue eliminada del mundo. Verifica si es valida con 'if (entity.isValid)' antes de intentar algo con ella.
`;
        } else if (error.message.includes("not in a chunk currently loaded")) {
          isInfoLevel = true;
        }
        const execStack = error.stack?.split("\n").find((line) => line.includes("at ") && !line.includes("BaseEventManager") && !line.includes("CatlogErrorHandler") && !line.includes("WorldToolsSimplified"));
        if (execStack) {
          logMessage += `\xA74[Fallo exacto]:\xA7r ${execStack.trim()}
`;
        }
        if (registrationTrace) {
          const cleanTrace = registrationTrace.split("\n").filter((line) => line.includes("at ") && !line.includes("__require") && !line.includes("<anonymous>") && !line.includes("BaseEventManager") && !line.includes("CatlogErrorHandler") && !line.includes("WorldToolsSimplified")).map((line) => `  -> ${line.trim()}`).join("\n");
          if (cleanTrace) {
            logMessage += `\xA7a[Origen de la Ejecuci\xF3n]:\xA7r
${cleanTrace}
`;
          }
        }
        logMessage += `\xA7c========================\xA7r`;
        if (isInfoLevel) {
          console.info(logMessage);
        } else {
          console.warn(logMessage);
        }
      }
    };
  }
});

// node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/core/eventsManager.js
var BaseEventManager;
var init_eventsManager = __esm({
  "node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/core/eventsManager.js"() {
    init_errorHandler();
    BaseEventManager = class {
      /**
       * Argumentos principales para instanciar un evento base creado con eventos relacionales.
       * @constructor
       * @param {EventRegister<T>} evnSignal Evento relacional a considerar.
       * @param {string} evnName Nombre Simplificado dado a este evento relacional a considerar.
       * @author HaJuegos - 15-07-2026
       */
      constructor(evnSignal, evnName) {
        this.evnSignal = evnSignal;
        this.evnName = evnName;
        this.callbacks = [];
        this.isSub = false;
      }
      /**
       * Método que registra el callback para los eventos relacionales del evento final. Internamente solo existe un único suscrito por evento; Entonces los callbacks adicionales se agregan a un array y se ejecutan dentro del mismo listener.
       * @param callback La lógica individual del evento final.
       * @version 2 Cambio total de instancias en su formato de registro para optimizaciones internas.
       * @returns {void}
       * @public
       * @author HaJuegos - 15-07-2026
       */
      register(callback) {
        const registrationTrace = new Error().stack;
        this.callbacks.push({ fn: callback, trance: registrationTrace });
        if (!this.isSub) {
          this.isSub = true;
          this.evnSignal.subscribe((args) => {
            for (const { fn, trance } of this.callbacks) {
              try {
                fn(args);
              } catch (e) {
                CatLogHandler.handleError(e, `Evento ${this.evnName}`, trance);
              }
            }
          });
        }
      }
      /**
       * Método que elimina un callback previamente registrado.
       * @param {(args: T) => void} callback Referencia exacta a la función registrada en el register.
       * @public
       * @author HaJuegos - 15-07-2026
       */
      unregister(callback) {
        this.callbacks = this.callbacks.filter((c) => c.fn != callback);
      }
    };
  }
});

// node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/events/afterEventsSimplifiedManager.js
import * as mc from "@minecraft/server";
var AfterEventsSimplified, afterEventsSimplified;
var init_afterEventsSimplifiedManager = __esm({
  "node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/events/afterEventsSimplifiedManager.js"() {
    init_eventsManager();
    AfterEventsSimplified = class {
      /**
       * Eventos que se inicializan cuando la clase es llamada o inicializada.
       * @constructor
       */
      constructor() {
        this.entityDieManager = new BaseEventManager(mc.world.afterEvents.entityDie, "AfterEntityDie");
        this.playerSpawnManager = new BaseEventManager(mc.world.afterEvents.playerSpawn, "AfterPlayerSpawn");
        this.worldLoadManager = new BaseEventManager(mc.world.afterEvents.worldLoad, "AfterWorldLoad");
        this.chatSendManager = new BaseEventManager(mc.world.afterEvents.chatSend, "AfterChatSend");
        this.itemUseManager = new BaseEventManager(mc.world.afterEvents.itemUse, "AfterItemUse");
        this.explosionManager = new BaseEventManager(mc.world.afterEvents.explosion, "AfterExplodes");
        this.onProjectileHitEntityManager = new BaseEventManager(mc.world.afterEvents.projectileHitEntity, "AfterProyectileHitEntity");
        this.onProjectileHitBlockManager = new BaseEventManager(mc.world.afterEvents.projectileHitBlock, "AfterProyectileHitBlock");
        this.onHitEntityManager = new BaseEventManager(mc.world.afterEvents.entityHitEntity, "AfterHitEntity");
        this.onEntityHurtManager = new BaseEventManager(mc.world.afterEvents.entityHurt, "AfterHurtEntity");
        this.onHealthEntityChangeManager = new BaseEventManager(mc.world.afterEvents.entityHealthChanged, "AfterHealthChangeEntity");
        this.onChangeDimensionManager = new BaseEventManager(mc.world.afterEvents.playerDimensionChange, "AfterChangeDimension");
        this.interactEntityManager = new BaseEventManager(mc.world.afterEvents.playerInteractWithEntity, "AfterInteractEntity");
        this.interactBlockManager = new BaseEventManager(mc.world.afterEvents.playerInteractWithBlock, "AfterInteractBlock");
        this.entitySpawnsManager = new BaseEventManager(mc.world.afterEvents.entitySpawn, "AfterEntitySpawns");
        this.effectAddManager = new BaseEventManager(mc.world.afterEvents.effectAdd, "AfterEffectAdd");
        this.placeBlockManager = new BaseEventManager(mc.world.afterEvents.playerPlaceBlock, "AfterPlaceBlock");
        this.breakBlockManager = new BaseEventManager(mc.world.afterEvents.playerBreakBlock, "AfterBreakBlock");
        this.dataEventsManager = new BaseEventManager(mc.world.afterEvents.dataDrivenEntityTrigger, "AfterDataEvents");
        this.changeInvManager = new BaseEventManager(mc.world.afterEvents.playerInventoryItemChange, "AfterInvChangeOnPly");
        this.onGetItem = new BaseEventManager(mc.world.afterEvents.entityItemPickup, "AfterEntityPickItem");
        this.onDropItem = new BaseEventManager(mc.world.afterEvents.entityItemDrop, "AfterEntityDropItem");
        this.playerJoinsManager = new BaseEventManager(mc.world.afterEvents.playerJoin, "AfterPlayerJoins");
        this.playerLeavesManager = new BaseEventManager(mc.world.afterEvents.playerLeave, "AfterPlayerLeaves");
        this.entityLoadWorld = new BaseEventManager(mc.world.afterEvents.entityLoad, "AfterEntityLoadInWorld");
        this.entityHealh = new BaseEventManager(mc.world.afterEvents.entityHeal, "AfterEntityHealing");
        this.entityRemove = new BaseEventManager(mc.world.afterEvents.entityRemove, "AfterEntityRemove");
        this.entityTamed = new BaseEventManager(mc.world.afterEvents.entityTamed, "AfterEntityTamed");
        this.soundCompleted = new BaseEventManager(mc.world.afterEvents.soundCompleted, "AfterSoundFinish");
        this.weatherChange = new BaseEventManager(mc.world.afterEvents.weatherChange, "AfterWeatherChange");
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionado cuando una entidad muere de forma simplificada.
       * @param {(args: mc.EntityDieAfterEvent) => void} callback Los argumentos del evento y su lógica.
       * @returns {void}
       * @author HaJuegos - 11-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onEntityDie((args) => {
       *     const entity = args.deadEntity;
       *     const source = args.damageSource;
       *
       *     console.warn(`La entidad ${entity.typeId} murió en ${entity.location} debido a ${source.cause}.`);
       * });
       * ```
       */
      onEntityDie(callback) {
        this.entityDieManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionado cuando un jugador respawnea de forma simplificada.
       * @param {(args: mc.PlayerSpawnAfterEvent) => void} callback Los argumentos del evento y su lógica.
       * @returns {void}
       * @author HaJuegos - 11-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onPlayerSpawns((args) => {
       *     const ply = args.player;
       *     const firstSpawn = args.initialSpawn;
       *
       *     console.warn(`El Jugador ${ply.name} spawneó en ${ply.location}. (Primera aparicion: ${firstSpawn})`);
       * });
       * ```
       */
      onPlayerSpawns(callback) {
        this.playerSpawnManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un mundo se terminó de cargar de forma simplificada.
       * @param {(args: mc.WorldLoadAfterEvent) => void} callback Los argumentos del evento y su lógica.
       * @returns {void}
       * @author HaJuegos - 11-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onWorldReady(() => {
       *     console.warn(`El mundo se ha cargado correctamente`);
       * });
       * ```
       */
      onWorldReady(callback) {
        this.worldLoadManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando se recibe un mensaje en el chat de forma simplificada.
       * @param {(args: mc.ChatSendAfterEvent) => void} callback Los argumentos y lógica a ejecutar en el evento.
       * @returns {void}
       * @author HaJuegos - 14-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onSendMessageChat((args) => {
       *     console.warn(`El usuario ${args.sender.name} envio el mensaje ${args.message}`);
       * });
       * ```
       */
      onSendMessageChat(callback) {
        this.chatSendManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando ya se usa el item de forma simplificada.
       * @param {(args: mc.ItemUseAfterEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 15-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onUseItem((args) => {
       *     const ply = args.source;
       *     const item = args.itemStack;
       *
       *     console.warn(`El Jugador ${ply.name} uso el item ${item.typeId}`);
       * });
       * ```
       */
      onUseItem(callback) {
        this.itemUseManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando algo explotó de forma simplificada.
       * @param {(args: mc.ExplosionAfterEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 17-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onExplodes((args) => {
       *     const source = args.source;
       *
       *     if (source && source.typeId == 'minecraft:creeper') {
       *        console.warn(`Un creeper explotó.`);
       *     }
       * });
       * ```
       */
      onExplodes(callback) {
        this.explosionManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un proyectil golpea una entidad de forma simplificada.
       * @param {(args: mc.ProjectileHitEntityAfterEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 18-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onProjectileHitEntity((args) => {
       *     const sourceEntity = args.source;
       *     const hitEntity = args.getEntityHit().entity;
       *
       *     console.warn(`${source?.typeId} ha golpeado a ${hitEntity.typeId}.`);
       * });
       * ```
       */
      onProjectileHitEntity(callback) {
        this.onProjectileHitEntityManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un proyectil golpea un bloque de forma simplificada.
       * @param {(args: mc.ProjectileHitBlockAfterEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 18-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onProjectileHitBlock((args) => {
       *     const sourceEntity = args.source;
       *     const hitBlock = args.getBlockHit().entity;
       *
       *     console.warn(`${source.typeId} ha golpeado al bloque ${hitBlock.typeId}.`);
       * });
       * ```
       */
      onProjectileHitBlock(callback) {
        this.onProjectileHitBlockManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando se golpea una entidad de forma simplificada.
       * @param {(args: mc.EntityHitEntityAfterEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 18-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onHitEntity((args) => {
       *    const sourceEntity = args.damagingEntity;
       *    const hitEntity = args.hitEntity;
       *
       *    console.warn(`${sourceEntity.typeId} ha golpeado a ${hitEntity.typeId}`);
       * });
       * ```
       */
      onHitEntity(callback) {
        this.onHitEntityManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando se lastima una entidad de forma simplificada.
       * @param {(args: mc.EntityHurtAfterEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 18-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onHurtEntity((args) => {
       *    const source = args.damageSource;
       *    const sourceEntity = source.damagingEntity;
       *    const cause = source.cause;
       *    const hitEntity = args.hurtEntity;
       *
       *    console.warn(`${sourceEntity.typeId} ha lastimado a ${hitEntity.typeId} mediante ${cause}`);
       * });
       * ```
       */
      onHurtEntity(callback) {
        this.onEntityHurtManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando la vida de una entidad cambia de forma simplificada.
       * @param {(args: mc.EntityHealthChangedAfterEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 19-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onHealthEntityChange((args) => {
       *    console.warn(`${args.entity.typeId} tenia ${args.oldValue} de vida y ahora tiene ${args.newValue}.`);
       * });
       * ```
       */
      onHealthEntityChange(callback) {
        this.onHealthEntityChangeManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un jugador cambia de dimensión de forma simplificada.
       * @param {(args: mc.PlayerDimensionChangeAfterEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 20-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onChangeDimension((args) => {
       *     const ply = args.player;
       *     const fromDime = args.fromDimension;
       *     const toDime = args.toDimension;
       *
       *     console.warn(`${ply.name} estaba en el ${fromDime.id} y ahora está en ${toDime.id}.`);
       * });
       * ```
       */
      onChangeDimension(callback) {
        this.onChangeDimensionManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un jugador interactuó con una entidad de forma simplificada.
       * @param {(args: mc.PlayerInteractWithEntityAfterEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 20-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onInteractEntity((args) => {
       *     const ply = args.player;
       *     const hitEntity = args.target;
       *
       *     console.warn(`${ply.name} interactuó con ${hitEntity.typeId}.`);
       * });
       * ```
       */
      onInteractEntity(callback) {
        this.interactEntityManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un jugador interactuó con un bloque de forma simplificada.
       * @param {(args: mc.PlayerInteractWithBlockAfterEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 20-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onInteractBlock((args) => {
       *     const ply = args.player;
       *     const block = args.block;
       *
       *     console.warn(`${ply.name} interactuó con el bloque ${block.typeId}.`);
       * });
       * ```
       */
      onInteractBlock(callback) {
        this.interactBlockManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando una entidad spawnea de forma simplificada.
       * @param {(args: mc.EntitySpawnAfterEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 20-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onEntitySpawns((args) => {
       *     console.warn(`${args.entity.typeId} ha spawneado en el mundo`);
       * });
       * ```
       */
      onEntitySpawns(callback) {
        this.entitySpawnsManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un efecto es añadido en una entidad o jugador de forma simplificada.
       * @param {(args: mc.EffectAddAfterEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 20-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onAddsEffect((args) => {
       *     console.warn(`${args.entity.typeId} ahora tiene el efecto ${args.effect.displayName}.`);
       * });
       * ```
       */
      onAddsEffect(callback) {
        this.effectAddManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un bloque es colocado de forma simplificada.
       * @param {(args: mc.PlayerPlaceBlockAfterEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 20-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onPlaceBlock((args) => {
       *     console.warn(`${args.player.name} coloco el bloque ${args.block.typeId}.`);
       * });
       * ```
       */
      onPlaceBlock(callback) {
        this.placeBlockManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un bloque es roto de forma simplificada.
       * @param {(args: mc.PlayerBreakBlockAfterEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 23-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onBreakBlock((args) => {
       *     console.warn(`${args.player.name} rompio el bloque ${args.block.typeId}.`);
       * });
       * ```
       */
      onBreakBlock(callback) {
        this.breakBlockManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando una entidad ejecuta uno o varios de sus eventos de su JSON para cambiar componentes, o también por comandos como /event. De forma más simple, sirve como un log de cuales component groups cambió la entidad en ese instante.
       * @param {(args: mc.DataDrivenEntityTriggerAfterEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 26-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.getEntityEvents((args) => {
       *     const entity = args.entity;
       *     const events = args.getModifiers();
       *
       *     if (entity.typeId == 'minecraft:player' && entity instanceof mc.Player) {
       *        console.warn(`${entity.name} ha cambiado de componentes: ${JSON.stringify(events)}`);
       *     }
       * });
       * ```
       */
      getEntityEvents(callback) {
        this.dataEventsManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un item se remueve o añade a un inventario de un jugador de forma simplificada.
       * @param {(args: mc.PlayerInventoryItemChangeAfterEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 01-04-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onPlyInvChange((args) => {
       *     const previusItem = args.beforeItemStack;
       *     const newItem = args.itemStack;
       *     const ply = args.player;
       *     const slotI = args.slot;
       *     const invType = args.inventoryType;
       *
       *     console.warn(`${ply.name} previamente tenía el item ${previusItem.typeId} en el slot ${slotI} en el inventario ${invType}; Y ahora tiene el item ${newItem.typeId} en su lugar`);
       * });
       * ```
       */
      onPlyInvChange(callback) {
        this.changeInvManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando una entidad obtiene items de forma simplificada.
       * @param {(args: mc.EntityItemPickupAfterEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 19-06-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onGetItemEntity((args) => {
       *      const item = args.items;
       *      const entity = args.entity;
       *
       *      console.log(`${entity.typeId} ha agarrado los items ${JSON.stringify(item)}.`);
       * });
       * ```
       */
      onGetItemEntity(callback) {
        this.onGetItem.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando una entidad dropea items de forma simplificada.
       * @param {(args: mc.EntityItemDropAfterEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 19-06-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onDropItemEntity((args) => {
       *      const item = args.items;
       *      const entity = args.entity;
       *
       *      console.log(`${entity.typeId} ha dropeado los items ${JSON.stringify(item)}.`);
       * });
       * ```
       */
      onDropItemEntity(callback) {
        this.onDropItem.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un jugador se une al mundo de forma simplificada.
       * @param {(args: mc.PlayerJoinAfterEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 21-06-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onPlayerJoinsWorld((args) => {
       *      const name = args.playerName;
       *
       *      console.log(`${name} entró al mundo.`);
       * });
       * ```
       */
      onPlayerJoinsWorld(callback) {
        this.playerJoinsManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un jugador se va del mundo de forma simplificada.
       * @param {(args: mc.PlayerLeaveAfterEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 21-06-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onPlayerLeavesWorld((args) => {
       *      const name = args.playerName;
       *
       *      console.log(`${name} salió del mundo.`);
       * });
       * ```
       */
      onPlayerLeavesWorld(callback) {
        this.playerLeavesManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando una entidad se carga en el mundo de forma simplificada.
       * @param {(args: mc.EntityLoadAfterEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 21-07-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onEntityLoadInWorld((args) => {
       *      const typeId = args.entity;
       *
       *      console.log(`${typeId} se cargó en el mundo previamente.`);
       * });
       * ```
       */
      onEntityLoadInWorld(callback) {
        this.entityLoadWorld.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando una entidad se curó de diferentes formas de forma simplificada.
       * @param {(args: mc.EntityHealBeforeEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 19-06-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onEntityHeals((args) => {
       *      const sourceHealh = args.healSource;
       *      const entity = args.healedEntity;
       *
       *      console.log(`${entity.typeId} se regeneró por vía ${sourceHealh.cause}.`);
       * });
       * ```
       */
      onEntityHeals(callback) {
        this.entityHealh.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando una entidad es removida del mundo detectando solo su ID de forma simplificada.
       * @param {(args: mc.EntityRemoveAfterEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @public
       * @author HaJuegos - 06-08-2026
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * afterEventsSimplified.onEntityRemove((args) => {
       *      const typeID = args.typeId;
       *      const entityID = args.removedEntityId;
       *
       *      console.log(`${typeId} fue eliminado del mundo, su id era ${entityID}.`);
       * });
       * ```
       */
      onEntityRemove(callback) {
        this.entityRemove.register(callback);
      }
      /**
       * Metodo auxiliar que ejecuta los eventos relacionados cuando una entidad es domada de forma simplificada.
       * @param {(args: mc.EntityTamedAfterEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 30-08-2026
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @public
       * @example
       * ```ts
       * afterEventsSimplified.onTamedEntity((args) => {
       *      const { tamingEntity: sourceEntity, entity } = args
       *
       *      console.log(`${sourceEntity.typeId} ha domando a la entidad ${entity.typeId}.`);
       * });
       * ```
       */
      onTamedEntity(callback) {
        this.entityTamed.register(callback);
      }
      /**
       * Metodo auxiliar que ejecuta los eventos relacionados cuando un sonido termina de forma simplificada.
       * @param {(args: mc.SoundCompletedAfterEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 30-08-2026
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @public
       * @example
       * ```ts
       * afterEventsSimplified.onSoundFinish((args) => {
       *      const { soundInstanceId: idSound } = args
       *
       *      console.log(`${idSound} ha terminado o ha dejado de sonar.`);
       * });
       * ```
       */
      onSoundFinish(callback) {
        this.soundCompleted.register(callback);
      }
      /**
       * Metodo auxiliar que ejecuta los eventos relacionados cuando el clima ha cambiado en una dimension de forma simplificada.
       * @param {(args: mc.WeatherChangeAfterEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 30-08-2026
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @public
       * @example
       * ```ts
       * afterEventsSimplified.onWeatherChange((args) => {
       *      const { dimension, newWeather, previousWeather } = args
       *
       *      console.log(`En la dimension ${dimension.id} el clima ha pasado de ${previousWeather} a ${newWeather}.`);
       * });
       * ```
       */
      onWeatherChange(callback) {
        this.weatherChange.register(callback);
      }
    };
    afterEventsSimplified = new AfterEventsSimplified();
  }
});

// node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/events/beforeEventsSimplifiedManager.js
import * as mc2 from "@minecraft/server";
var BeforeEventsSimplified, beforeEventsSimplified;
var init_beforeEventsSimplifiedManager = __esm({
  "node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/events/beforeEventsSimplifiedManager.js"() {
    init_eventsManager();
    BeforeEventsSimplified = class {
      /**
       * Eventos que se inicializan cuando la clase es llamada o inicializada.
       * @constructor
       */
      constructor() {
        this.startUpManager = new BaseEventManager(mc2.system.beforeEvents.startup, "BeforeStartup");
        this.shutDownManager = new BaseEventManager(mc2.system.beforeEvents.shutdown, "BeforeShutdown");
        this.interactBlockManager = new BaseEventManager(mc2.world.beforeEvents.playerInteractWithBlock, "BeforeInteractBlock");
        this.chatSendManager = new BaseEventManager(mc2.world.beforeEvents.chatSend, "BeforeChatSend");
        this.itemUseManager = new BaseEventManager(mc2.world.beforeEvents.itemUse, "BeforeItemUse");
        this.explosionManager = new BaseEventManager(mc2.world.beforeEvents.explosion, "BeforeExplodes");
        this.interactEntityManager = new BaseEventManager(mc2.world.beforeEvents.playerInteractWithEntity, "BeforeInteractEntity");
        this.effectAddManager = new BaseEventManager(mc2.world.beforeEvents.effectAdd, "BeforeAddEffect");
        this.placeBlockManager = new BaseEventManager(mc2.world.beforeEvents.playerPlaceBlock, "BeforePlayerPlaceBlock");
        this.breakBlockManager = new BaseEventManager(mc2.world.beforeEvents.playerBreakBlock, "BeforePlayerBreakBlock");
        this.entityHurtManager = new BaseEventManager(mc2.world.beforeEvents.entityHurt, "BeforeEtntityHurt");
        this.entityItemPickUpManager = new BaseEventManager(mc2.world.beforeEvents.entityItemPickup, "BeforeEntityItemPickup");
        this.entityHealing = new BaseEventManager(mc2.world.beforeEvents.entityHeal, "BeforeEntityHealing");
        this.entityRemove = new BaseEventManager(mc2.world.beforeEvents.entityRemove, "BeforeEntityRemove");
        this.entityTamed = new BaseEventManager(mc2.world.beforeEvents.entityTamed, "BeforeEntityTamed");
        this.weatherChange = new BaseEventManager(mc2.world.beforeEvents.weatherChange, "BeforeWeatherChange");
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando el add-on se carga por primera vez
       * @param {(args: mc.StartupEvent) => void} callback Los argumentos del evento y su lógica.
       * @returns {void}
       * @author HaJuegos - 11-03-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * beforeEventsSimplified.onAddonStarts((args) => {
       *     console.warn('El addon está iniciando');
       * });
       * ```
      */
      onAddonStarts(callback) {
        this.startUpManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un mundo o servidor se cierra de forma simplificada.
       * @param {(args: mc.ShutdownEvent) => void} callback Los argumentos del evento y su lógica.
       * @returns {void}
       * @author HaJuegos - 11-03-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * beforeEventsSimplified.onAddonStops((args) => {
       *     console.warn('El addon se está deteniendo');
       * });
       * ```
      */
      onAddonStops(callback) {
        this.shutDownManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando se interactúa con un bloque antes de que pase de forma simplificada.
       * @param {(args: mc.PlayerInteractWithBlockBeforeEvent) => void} callback Los argumentos del evento y su lógica.
       * @returns {void}
       * @author HaJuegos - 11-03-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * beforeEventsSimplified.onInteractBlock((args) => {
       *     console.warn(`Se está interactuando con el bloque ${args.block.typeId}`);
       * });
       * ```
      */
      onInteractBlock(callback) {
        this.interactBlockManager.register(callback);
      }
      /**
       * Método auxiliar que controla los eventos del chat, manejando los mensajes enviados antes de que se muestren.
       * @param {(args: mc.ChatSendBeforeEvent) => void} callback Los argumentos del evento y su lógica.
       * @returns {void}
       * @author HaJuegos - 14-03-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * beforeEventsSimplified.chatManager((args) => {
       *     console.warn(`El usuario ${args.sender.name} ha enviado el mensaje ${args.message}`);
       *     args.cancel = true; // El mensaje que envió el jugador es cancelado.
       * });
       * ```
       */
      chatManager(callback) {
        this.chatSendManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando se va a usar un item de forma simplificada.
       * @param {(args: mc.ItemUseBeforeEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 15-03-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * beforeEventsSimplified.onUseItem((args) => {
       *     console.warn(`Se está usando el item ${args.itemStack.typeId}.`);
       *     args.cancel = true;
       * });
       * ```
       */
      onUseItem(callback) {
        this.itemUseManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando algo está a punto de explotar de forma simplificada.
       * @param {(args: mc.ExplosionBeforeEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 17-03-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * beforeEventsSimplified.onExplosion((args) => {
       *     const source = args.source;
       *
       *     if (source && source.typeId == 'minecraft:creeper') {
       *         console.warn(`Un creeper está a punto de explotar.`);
       *         args.cancel = true; // Ya no va a explotar.
       *     }
       * });
       * ```
       */
      onExplosion(callback) {
        this.explosionManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un jugador va a interactuar con una entidad de forma simplificada.
       * @param {(args: mc.PlayerInteractWithEntityBeforeEvent) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @author HaJuegos - 20-03-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * beforeEventsSimplified.onInteractEntity((args) => {
       *     const ply = args.player;
       *     const hitEntity = args.target;
       *
       *     console.warn(`${ply.name} está interactuando con ${hitEntity.typeId}.`);
       *
       *     args.cancel = true; // ya no se puede.
       * });
       * ```
       */
      onInteractEntity(callback) {
        this.interactEntityManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un efecto está a punto de darse a una entidad de forma simplificada.
       * @param {(args: mc.EffectAddBeforeEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 20-03-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * beforeEventsSimplified.onEffectAdds((args) => {
       *     console.warn(`${args.entity.typeId} tendrá el efecto ${args.effect.displayName}.`);
       *     args.cancel = true; // Ahora ya no sucede.
       * });
       * ```
       */
      onEffectAdds(callback) {
        this.effectAddManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un jugador va a colocar un bloque de forma simplificada.
       * @param {(args: mc.PlayerPlaceBlockBeforeEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 20-03-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * beforeEventsSimplified.onPlaceBlock((args) => {
       *     console.warn(`${args.player.name} va a colocar el bloque ${args.block.typeId}.`);
       *     args.cancel = true; // Ahora ya no puede colocarlo
       * });
       * ```
       */
      onPlaceBlock(callback) {
        this.placeBlockManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando un jugador va a romper un bloque de forma simplificada.
       * @param {(args: mc.PlayerBreakBlockBeforeEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 23-03-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * beforeEventsSimplified.onBreakBlock((args) => {
       *     console.warn(`${args.player.name} va a romper el bloque ${args.block.typeId}.`);
       *     args.cancel = true; // Ahora ya no puede romperlo
       * });
       * ```
       */
      onBreakBlock(callback) {
        this.breakBlockManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando una entidad va a ser lastimada de forma simplificada.
       * @param {(args: mc.EntityHurtBeforeEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 19-06-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * beforeEventsSimplified.onEntityHurt((args) => {
       *      const hurtEntity = args.hurtEntity;
       *      const source = args.damageSource;
       *      const sourceEntity = source.damagingEntity;
       *
       *      if (hurtEntity && sourceEntity) {
       *          console.log(`${sourceEntity.typeId} va a lastimar a ${hurtEntity.typeId}.`);
       *
       *          args.cancel = true; // Ya no funciona
       *      }
       * });
       * ```
       */
      onEntityHurt(callback) {
        this.entityHurtManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando una entidad va a agarrar un item forma simplificada.
       * @param {(args: mc.EntityItemPickupBeforeEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 19-06-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * beforeEventsSimplified.onItemPickupEntity((args) => {
       *      const item = args.item;
       *      const entity = args.entity;
       *
       *      console.log(`${entity.typeId} va a obtener el item ${item.typeId}.`);
       *      args.cancel = true; // Ya no funciona
       * });
       * ```
       */
      onItemPickupEntity(callback) {
        this.entityItemPickUpManager.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando una entidad se va a curar de diferentes formas de forma simplificada.
       * @param {(args: mc.EntityHealBeforeEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 19-06-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * beforeEventsSimplified.onEntityHeal((args) => {
       *      const sourceHealh = args.healSource;
       *      const entity = args.healedEntity;
       *
       *      console.log(`${entity.typeId} se va a regenerar con ${sourceHealh.cause}.`);
       *      args.cancel = true; // Ya no funciona
       * });
       * ```
       */
      onEntityHeal(callback) {
        this.entityHealing.register(callback);
      }
      /**
       * Método auxiliar que ejecuta los eventos relacionados cuando una entidad va a ser removida del mundo de forma simplificada.
       * @param {(args: mc.EntityRemoveBeforeEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @public
       * @author HaJuegos - 06-08-2026
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * beforeEventsSimplified.onEntityRemoved((args) => {
       *      const entityRemoved = args.removedEntity;
       *
       *      console.log(`${entityRemoved.typeId} va a ser eliminado del mundo.`);
       *      args.cancel = true; // Ya no se eliminará.
       * });
       * ```
       */
      onEntityRemoved(callback) {
        this.entityRemove.register(callback);
      }
      /**
       * Metodo auxiliar que ejecuta los eventos relacionados cuando una entidad va a ser domada de forma simplificada.
       * @param {(args: mc.EntityTamedBeforeEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 30-08-2026
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @public
       * @example
       * ```ts
       * beforeEventsSimplified.onEntityTame((args) => {
       *      const { tamingEntity: sourceEntity, entity } = args
       *
       *      console.log(`${sourceEntity.typeId} va a domar a la entidad ${entity.typeId}.`);
       *
       *      args.cancel = true; // Ya no puede ser domada.
       * });
       * ```
       */
      onEntityTame(callback) {
        this.entityTamed.register(callback);
      }
      /**
       * Metodo auxiliar que ejecuta los eventos relacionados cuando el clima va a cambiar de forma simplificada.
       * @param {(args: mc.WeatherChangeBeforeEvent) => void} callback Los eventos relacionados.
       * @returns {void}
       * @author HaJuegos - 30-08-2026
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @public
       * @example
       * ```ts
       * beforeEventsSimplified.onWeatherChange((args) => {
       *      const { previousWeather, newWeather } = args
       *
       *      console.log(`El clima va a pasar de ${previousWeather} a ${newWeather}.`);
       *
       *      args.cancel = true; // Ya no va a ocurrir.
       * });
       * ```
       */
      onWeatherChange(callback) {
        this.weatherChange.register(callback);
      }
      // Metodos no auxiliares
      /**
       * Método auxiliar que registra y ejecuta los eventos relacionados cuando se quiere registrar un custom component de un bloque.
       * @param {string} nameComponent Nombre del componente en cuestión a registrar.
       * @param {mc.BlockCustomComponent} eventsComponent Los eventos del componente que se van a ejecutar.
       * @author HaJuegos - 17-03-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * // Método casual
       * beforeEventsSimplified.createBlockComponent('ha:custom_component', {
       *    onBreak(arg) {
       *       console.warn(`El bloque ${args.block.typeId} se rompió.`);
       *    }
       * } as mc.BlockCustomComponent);
       *
       * // Método más ordenado
       * const events: mc.BlockCustomComponent = {
       *    onBreak(arg) {
       *       console.warn(`El bloque ${args.block.typeId} se rompió.`);
       *    }
       * }
       *
       * beforeEventsSimplified.createBlockComponent('ha:custom_component', events);
       * ```
       */
      createBlockComponent(nameComponent, eventsComponent) {
        this.onAddonStarts((args) => {
          args.blockComponentRegistry.registerCustomComponent(nameComponent, eventsComponent);
        });
      }
      /**
       * Método auxiliar que registra y ejecuta los eventos relacionados cuando se quiere registrar un custom component de un item.
       * @param {string} nameComponent Nombre del componente en cuestión a registrar.
       * @param {mc.ItemCustomComponent} eventsComponent Los eventos del componente que se van a ejecutar.
       * @author HaJuegos - 17-03-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * // Método casual
       * beforeEventsSimplified.createItemComponent('ha:custom_component', {
       *    onConsume(arg) {
       *       console.warn(`El item ${args.itemStack.typeId} fue consumido.`);
       *    }
       * } as mc.ItemCustomComponent);
       *
       * // Método más ordenado
       * const events: mc.ItemCustomComponent = {
       *    onConsume(arg) {
       *       console.warn(`El item ${args.itemStack.typeId} fue consumido.`);
       *    }
       * }
       *
       * beforeEventsSimplified.createItemComponent('ha:custom_component', events);
       * ```
       */
      createItemComponent(nameComponent, eventsComponent) {
        this.onAddonStarts((args) => {
          args.itemComponentRegistry.registerCustomComponent(nameComponent, eventsComponent);
        });
      }
      /**
       * Método auxiliar que registra y ejecuta los eventos relacionados cuando se quiere registrar un comando custom al juego.
       * @param {mc.CustomCommand} commandData Los datos del comando a registrar
       * @param {(origin: mc.CustomCommandOrigin, ...args: any[]) => mc.CustomCommandResult | undefined} callback Los eventos a ejecutar después de haber sido activado o usado el comando.
       * @param {?Record<string, string[]>} [customEnums] (Opcional) Opciones o valores que se registran junto con el comando en caso de ser necesario. Por ej: para que aparezca "ha juegos" al momento de poner este comando, lo considere un valor rellenable automático.
       * @author HaJuegos - 17-03-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * const commandData: mc.CustomCommand = {
       *     name: 'ha:command_test',
       *     description: 'Este es un comando de prueba',
       *     permissionLevel: mc.CommandPermissionLevel.Admin
       * };
       *
       * beforeEventsSimplified.createCustomCommand(commandData, ((args => {
       *     const entity = args.sourceEntity as mc.Player;
       *
       *     console.warn(`El jugador ${entity.name} ha usado el comando custom.`);
       * })));
       * ```
       */
      createCustomCommand(commandData, callback, customEnums) {
        this.onAddonStarts((args) => {
          if (customEnums) {
            for (const [enumName, enumValues] of Object.entries(customEnums)) {
              args.customCommandRegistry.registerEnum(enumName, enumValues);
            }
          }
          args.customCommandRegistry.registerCommand(commandData, callback);
        });
      }
      /**
       * Método auxiliar que registra una nueva dimensión custom en el mundo. Basado en su prefix.
       * @param {string} prefixDimension Prefix de la dimensión en cuestión a crear.
       * @returns {void}
       * @author HaJuegos - 15-07-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * // Esto creará la nueva dimensión 'ha:backrooms'. Pero es una dimensión totalmente vacía. Debes crear todo a base de feature y feature rules.
       * beforeEventsSimplified.createCustomDimension('ha:backrooms');
       * ```
       */
      createCustomDimension(prefixDimension) {
        this.onAddonStarts((args) => {
          args.dimensionRegistry.registerCustomDimension(prefixDimension);
        });
      }
    };
    beforeEventsSimplified = new BeforeEventsSimplified();
  }
});

// node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/events/worldToolsSimplifiedManager.js
import * as mc3 from "@minecraft/server";
var WorldToolsSimplified, worldToolsSimplified;
var init_worldToolsSimplifiedManager = __esm({
  "node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/events/worldToolsSimplifiedManager.js"() {
    init_eventsManager();
    init_errorHandler();
    WorldToolsSimplified = class {
      /**
       * Eventos que se inicializan cuando la clase es llamada o inicializada.
       * @constructor
       */
      constructor() {
        this.scriptEventManager = new BaseEventManager(mc3.system.afterEvents.scriptEventReceive, "ScriptEventSensor");
      }
      /**
       * Método auxiliar que programa la ejecución de una lógica para el siguiente tick del juego. Ideal principalmente para los eventos before para saltarse la ejecución restringida.
       * @param {() => void} callback Los eventos o lógica en cuestión a ejecutar.
       * @returns {Promise<void>}
       * @author HaJuegos - 15-03-2026
       * @async Es un método asíncrono, principalmente para terminar el flujo después de que ocurra los eventos.
       * @public
       * @systemEvent Método que usa los eventos del módulo "system" herramientas auxiliares fuera de los eventos sensores de "world".
       * @example
       * ```ts
       * beforeEventsSimplified.onUseItem((args) => {
       *    const ply = args.source;
       *    const item = args.itemStack;
       *    const plyArmor = ply.getComponent(EntityComponentTypes.Equippable)
       *
       *    worldToolsSimplified.setRun(() => {
       *        // Esto ya funciona porque pasa después de un tick y no hay restricciones.
       *        plyArmor.setEquipment(EquipmentSlot.Offhand, item);
       *    });
       * });
       * ```
       */
      async setRun(callback) {
        return new Promise((resolve) => {
          const registrationTrace = new Error().stack;
          const currentRun = mc3.system.run(() => {
            try {
              callback();
              mc3.system.clearRun(currentRun);
              resolve();
            } catch (e) {
              CatLogHandler.handleError(e, "WorldsetRun", registrationTrace);
              resolve();
            }
          });
        });
      }
      /**
       * Método auxiliar que establece una serie de eventos con un pequeño retraso determinado. Luego de terminar el retraso, elimina la tarea para no dejarlo en memoria.
       * @param {() => void} callback Los eventos en cuestión a ejecutar.
       * @param {number} ticksDelay Los tiempos en ticks que se tardará para ejecutarse.
       * @returns {Promise<void>}
       * @author HaJuegos - 13-03-2026
       * @async Es un método asíncrono, debido a que se limpia después de la ejecución.
       * @public
       * @systemEvent Método que usa los eventos del módulo "system" herramientas auxiliares fuera de los eventos sensores de "world".
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * worldToolsSimplified.setDelay(() => {
       *    console.warn('Este evento se ejecutará después de 5 segundos');
       * } worldToolsSimplified.convertSecondsToTicks(5))
       * ```
       */
      async setDelay(callback, ticksDelay) {
        return new Promise((resolve) => {
          const registrationTrace = new Error().stack;
          const currentJob = mc3.system.runTimeout(() => {
            try {
              callback();
              mc3.system.clearRun(currentJob);
              resolve();
            } catch (e) {
              CatLogHandler.handleError(e, "worldSetDelay", registrationTrace);
              resolve();
            }
          }, ticksDelay);
        });
      }
      /**
       * Método auxiliar que establece una serie de eventos en concreto que se mantendrán en loop.
       * @param {() => void} callback Los eventos en concreto.
       * @param {number} loopTicks El número en ticks que se repetirá este loop.
       * @returns {number} Devuelve el ID de la memoria, del proceso loop creado.
       * @author HaJuegos - 13-03-2026
       * @public
       * @systemEvent Método que usa los eventos del módulo "system" herramientas auxiliares fuera de los eventos sensores de "world".
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * worldToolsSimplified.setLoop(() => {
       *    console.warn('Este evento se ejecutará cada 1 segundo');
       * } worldToolsSimplified.convertSecondsToTicks(1))
       * ```
       */
      setLoop(callback, loopTicks) {
        const registrationTrace = new Error().stack;
        return mc3.system.runInterval(() => {
          try {
            callback();
          } catch (e) {
            CatLogHandler.handleError(e, "worldSetLoop", registrationTrace);
          }
        }, loopTicks);
      }
      /**
       * Método auxiliar que detiene un proceso looping creado previamente por medio de su ID generado en memoria.
       * @param {number} runID ID del proceso generado.
       * @author HaJuegos - 13-03-2026
       * @public
       * @systemEvent Método que usa los eventos del módulo "system" herramientas auxiliares fuera de los eventos sensores de "world".
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * // Se crea el evento primero, generado su ID en memoria.
       * const idLoop = worldToolsSimplified.setLoop(() => {
       *   console.warn('este evento se esta repitiendo cada 1 segundo');
       * } worldToolsSimplified.convertSecondsToTicks(1))
       *
       * // Con el ID generado en memoria, lo usamos para detenerlo cuando queramos.
       * worldToolsSimplified.stopLoop(idLoop);
       * ```
       */
      stopLoop(runID) {
        mc3.system.clearRun(runID);
      }
      /**
       * Método auxiliar que envía un mensaje global al mundo en formato string o rawmessage.
       * @public
       * @param {string | mc.RawMessage | (string | mc.RawMessage)[]} message Mensaje o RawMessage en concreto a enviar.
       * @author HaJuegos - 12-03-2026
       * @example
       * ```ts
       * // Este es un mensaje simple
       * worldToolsSimplified.sendMessageGlobal('hola soy un mensaje');
       *
       * // Este es un mensaje RawText
       * worldToolsSimplified.sendMessageGlobal({ rawtext: 'chat.test.message' });
       * ```
       */
      sendMessageGlobal(message) {
        mc3.world.sendMessage(message);
      }
      /**
       * Método auxiliar que maneja la lógica de los eventos cuando se ejecuta el comando scriptevent.
       * @param {((args: mc.ScriptEventCommandMessageAfterEvent) => void)} callback La lógica del evento en concreto.
       * @author HaJuegos - 14-03-2026
       * @public
       * @systemEvent Método que usa los eventos del módulo "system" herramientas auxiliares fuera de los eventos sensores de "world".
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * worldToolsSimplified.listenerScriptEvents((args) => {
       *   console.warn(`Se ha ejecutado el comando /scriptevent con el ID ${args.id}`)
       * });
       * ```
       */
      listenerScriptEvents(callback) {
        this.scriptEventManager.register(callback);
      }
      /**
       * Método auxiliar que obtiene un objective de scoreboard, en caso de no encontrarlo, pues lo crea. Para devolver el mismo objectivo de forma simplificada.
       * @param {string} idObj ID del objectivo a encontrar o crear en cuestión.
       * @param {?string} [nameDisplayObj] (Opcional) Nombre del objectivo a colocar cuando se cree.
       * @returns {(mc.ScoreboardObjective | undefined)} Devuelve el objectivo si todo salió correcto, sino será un error.
       * @author HaJuegos - 31-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * // Esto obtiene y crea el objectivo en caso de no estar creado.
       * const obj = worldToolsSimplified.getOrCreateScorebordObj('conteo', 'Conteo');
       * ```
       */
      getOrCreateScorebordObj(idObj, nameDisplayObj) {
        const registrationTrace = new Error().stack;
        try {
          const scoreboard = mc3.world.scoreboard;
          let obj = scoreboard.getObjective(idObj);
          if (!obj) {
            obj = scoreboard.addObjective(idObj, nameDisplayObj);
          }
          return obj;
        } catch (e) {
          CatLogHandler.handleError(e, "getOrCreateObj", registrationTrace);
          return;
        }
      }
      /**
       * Método auxiliar que obtiene el score de un jugador en concreto de un objective de scoreboard. En caso de que el objective no esté creado, se creará. De forma simplificada.
       * @param {mc.Entity | mc.Player | string} targetEntity Target en concreto a obtener su score.
       * @param {string} idObj ID del objectivo el concreto a obtener el score.
       * @param {?string} [nameDisplayObj] (Opcional) Nombre del objectivo en caso de que el mismo no esté creado, a asignar.
       * @returns {number} Devuelve el score total que tiene el jugador si todo esta bien, sino siempre será 0.
       * @author HaJuegos - 31-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * // Esto crea el objective en caso de no estar creado y luego, obtiene el score que tiene el jugador, en este caso sería 0.
       * const score = worldToolsSimplified.getPlyScoreInObj(ply, 'conteo', 'Conteo');
       * ```
       */
      getScoreInObj(targetEntity, idObj, nameDisplayObj) {
        const registrationTrace = new Error().stack;
        try {
          const scoreboard = mc3.world.scoreboard;
          let obj = scoreboard.getObjective(idObj);
          if (!obj) {
            obj = scoreboard.addObjective(idObj, nameDisplayObj);
          }
          if (!obj.hasParticipant(targetEntity)) {
            return 0;
          }
          const score = obj.getScore(targetEntity) ?? 0;
          return score;
        } catch (e) {
          CatLogHandler.handleError(e, "getPlyScore", registrationTrace);
          return 0;
        }
      }
      /**
       * Método auxiliar que modifica el score de un jugador en concreto en un objectivo. En caso de que no esté creado el objectivo, se creará automáticamente. De forma simplificada.
       * @param {mc.Entity | mc.Player | string} targetEntity Target en concreto a modificar.
       * @param {string} idObj ID del objectivo en concreto.
       * @param {('set' | 'add')} changeMode Método específico a modificar del jugador. En caso de set, es que sería un valor no acumulable. Por ej: si antes tenía uno y se establece 2, pues será 2 sin más; Caso contrario con add, que es acumulativo y sirve fórmulas negativas. Por ej: Misma situación, donde tienes 1 y adicionas 1 más, pues dará 2.
       * @param {number} newScore El nuevo valor a añadir o cambiar.
       * @param {?string} [nameDisplayObj] (Opcional) Nombre del objectivo en caso de no estar creado.
       * @returns {(number | undefined)} El nuevo score cambiado del jugador si todo sale correcto, sino será un error.
       * @author HaJuegos - 31-03-2026
       * @public
       * @example
       * ```ts
       * // Este método realizará lo siguiente: En caso de que conteo no exista como objectivo, lo crea, luego, establece al jugador en concreto 1 en el objectivo y por último, devuelve dicho valor modificado.
       * const newScore = worldToolsSimplified.changePlyScoreInObj(player, 'conteo', 'set', 1, 'Conteo');
       * ```
       */
      changeScoreInObj(targetEntity, idObj, changeMode, newScore, nameDisplayObj) {
        const registrationTrace = new Error().stack;
        try {
          const scoreboard = mc3.world.scoreboard;
          let obj = scoreboard.getObjective(idObj);
          if (!obj) {
            obj = scoreboard.addObjective(idObj, nameDisplayObj);
          }
          if (changeMode == "set") {
            obj.setScore(targetEntity, newScore);
          } else {
            obj.addScore(targetEntity, newScore);
          }
          return obj.getScore(targetEntity) ?? 0;
        } catch (e) {
          CatLogHandler.handleError(e, "changePlyScore", registrationTrace);
          return;
        }
      }
      /**
       * Método auxiliar que muestra un objective creado en concreto, en caso de no estar creado, lo hará; A una zona de la pantalla, ya sea como sidebar o list de forma simplificada.
       * @param {string} idObj ID del objective en cuestión a obtener o crear.
       * @param {mc.DisplaySlotId} displaySlot Slot donde se establecerá el objectivo.
       * @param {?string} [nameDisplayObj] (Opcional) Nombre del objectivo que tendrá en caso de que no esté creado.
       * @param {?mc.ObjectiveSortOrder} [order] (Opcional) Orden del mismo objectivo.
       * @author HaJuegos - 31-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * // Esto mostrará a conteo en el sidebar de la pantalla de orden descendente. En caso de no estar creado, lo crea primero.
       * worldToolsSimplified.setObjInDisplay('conteo', mc.DisplaySlotId.Sidebar, 'Conteo', mc.ObjectiveSortOrder.Descending);
       * ```
       */
      setObjInDisplay(idObj, displaySlot, nameDisplayObj, order) {
        const registrationTrace = new Error().stack;
        try {
          const scoreboard = mc3.world.scoreboard;
          let obj = scoreboard.getObjective(idObj);
          if (!obj) {
            obj = scoreboard.addObjective(idObj, nameDisplayObj);
          }
          scoreboard.setObjectiveAtDisplaySlot(displaySlot, { objective: obj, sortOrder: order });
        } catch (e) {
          CatLogHandler.handleError(e, "setObjInDisplay", registrationTrace);
        }
      }
      /**
       * Método auxiliar que limpia los objectives asignados a una parte de la pantallas de forma simplificada.
       * @param {mc.DisplaySlotId} displaySlot El slot a limpiar en cuestión.
       * @author HaJuegos - 31-03-2026
       * @public
       * @afterEvent Método que detecta el evento después de que suceda. Obteniendo la información sin permitir modificarla en su mayoría.
       * @example
       * ```ts
       * // Se quita al objective que se mostraba en sidebar.
       * worldToolsSimplified.removeDisplaySlot(mc.DisplaySlotId.Sidebar);
       * ```
       */
      removeDisplaySlot(displaySlot) {
        const registrationTrace = new Error().stack;
        try {
          const scoreboard = mc3.world.scoreboard;
          scoreboard.clearObjectiveAtDisplaySlot(displaySlot);
        } catch (e) {
          CatLogHandler.handleError(e, "removeDisplayObj", registrationTrace);
        }
      }
      /**
       * Método auxiliar que convierte segundos a ticks de forma simple.
       * @public
       * @param {number} seconds Los segundos a convertir.
       * @returns {number} Los ticks convertidos.
       * @author HaJuegos - 12-03-2026
       * @example
       * ```ts
       * // 15 segundos son 300 ticks (20 ticks por segundo)
       * const ticks = worldToolsSimplified.convertSecondsToTicks(15); // 300
       * ```
       */
      convertSecondsToTicks(seconds) {
        return mc3.TicksPerSecond * seconds;
      }
      /**
       * Método auxiliar que convierte ticks a segundos de forma simple.
       * @public
       * @param {number} ticks Los ticks a convertir.
       * @returns {number} Los segundos convertidos.
       * @author HaJuegos - 12-03-2026
       * @example
       * ```ts
       * // 300 ticks son 15 segundos (20 ticks por segundo)
       * const seconds = worldToolsSimplified.convertTicksToSeconds(300); // 15
       * ```
       */
      convertTicksToSeconds(ticks) {
        return ticks / mc3.TicksPerSecond;
      }
      /**
       * Método auxiliar que convierte un color hexadecimal a RGB.
       * @param {string} hexcolor El color hexadecimal (ej. "#00000F").
       * @returns {mc.RGB} El objeto RGB correspondiente.
       * @author HaJuegos - 14-03-2026
       * @public
       * @example
       * ```ts
       * const rgb = worldToolsSimplified.convertHexToRGB("#FF0000"); // { red: 255, green: 0, blue: 0 }
       * ```
       */
      convertHexToRGB(hexcolor) {
        const hex = hexcolor.replace("#", "");
        if (hex.length != 6) {
          throw new Error("El color hexadecimal no debe ser mas de 6 digitos");
        }
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return { red: r, green: g, blue: b };
      }
      /**
       * Método auxiliar que convierte un color hexadecimal a RGBA.
       * @param {string} hexcolor El color hexadecimal (ej. "#00000FFF" para 8 dígitos, o "#00000F" asumiendo a=255).
       * @returns {mc.RGBA} El objeto RGBA correspondiente.
       * @author HaJuegos - 14-03-2026
       * @public
       * @example
       * ```ts
       * const rgba = worldToolsSimplified.convertHexToRGBA("#FF0000FF"); // { red: 255, green: 0, blue: 0, alpha: 255 }
       * const rgba2 = worldToolsSimplified.convertHexToRGBA("#FF0000"); // { red: 255, green: 0, blue: 0, alpha: 255 }
       * ```
       */
      convertHexToRGBA(hexcolor) {
        const hex = hexcolor.replace("#", "");
        let r, g, b, a;
        if (hex.length == 6) {
          r = parseInt(hex.substr(0, 2), 16);
          g = parseInt(hex.substr(2, 2), 16);
          b = parseInt(hex.substr(4, 2), 16);
          a = 255;
        } else if (hex.length == 8) {
          r = parseInt(hex.substr(0, 2), 16);
          g = parseInt(hex.substr(2, 2), 16);
          b = parseInt(hex.substr(4, 2), 16);
          a = parseInt(hex.substr(6, 2), 16);
        } else {
          throw new Error("El color hexadecimal alpha debe ser 6 o 8 digitos");
        }
        return { red: r, green: g, blue: b, alpha: a };
      }
      /**
       * Método auxiliar que obtiene los datos de una propiedad dinámica en concreto guardado en el mundo.
       * @param {string} idProperty ID de la propiedad en concreto.
       * @returns {(string | number | boolean | mc.Vector3 | undefined)} Los datos guardados en la propiedad, en caso de no estar creada, será undefined.
       * @remarks Este valor depende del UUID de tu add-on. Es decir, si hay dos add-ons en el mundo y los dos deciden guardar la misma propiedad, será diferente en ambos. Por ej: Add-on1 guarda la propiedad y Add-on2 lo consulta, será undefined porque solo existe en el Add-on1.
       * @author HaJuegos - 18-07-2026
       * @public
       * @example
       * ```ts
       * worldToolsSimplified.getWorldDynamicProperty('ha:property'); // "string" | undefined.
       * ```
       */
      getWorldDynamicProperty(idProperty) {
        return mc3.world.getDynamicProperty(idProperty);
      }
      /**
       * Método auxiliar que obtiene todos los IDs de propiedades dinámicas guardadas en el mundo.
       * @returns {string[]} El array de todos los IDs registrados, en caso de no haber ninguno, estará vacío.
       * @remarks Este valor depende del UUID de tu add-on. Es decir, si hay dos add-ons en el mundo y los dos deciden guardar la misma propiedad, será diferente en ambos. Por ej: Add-on1 guarda la propiedad y Add-on2 lo consulta, será undefined porque solo existe en el Add-on1.
       * @author HaJuegos - 18-07-2026
       * @public
       * @example
       * ```ts
       * worldToolsSimplified.getAllWorldDynamicPropertiesIDs(); // ['ha:test','ha:test2','ha:test3'].
       * ```
       */
      getAllWorldDynamicPropertiesIDs() {
        return mc3.world.getDynamicPropertyIds();
      }
      /**
       * Método auxiliar que obtiene los datos de una propiedad dinámica guardada en una entidad en concreto.
       * @param {(mc.Entity | mc.Player)} targetEntity Entidad en cuestión a consultar.
       * @param {string} idProperty ID en cuestión de la propiedad a consultar.
       * @returns {(string | number | boolean | mc.Vector3 | undefined)} Devuelve el tipo de dato guardado en la propiedad, en caso de no existir, será undefined.
       * @remarks Este valor depende del UUID de tu add-on. Es decir, si hay dos add-ons en el mundo y los dos deciden guardar la misma propiedad, será diferente en ambos. Por ej: Add-on1 guarda la propiedad y Add-on2 lo consulta, será undefined porque solo existe en el Add-on1.
       * @author HaJuegos - 18-07-2026
       * @public
       * @example
       * ```ts
       * worldToolsSimplified.getEntityDynamicProperty(entity, 'ha:test'); // "string" | undefined.
       * ```
       */
      getEntityDynamicProperty(targetEntity, idProperty) {
        return targetEntity.getDynamicProperty(idProperty);
      }
      /**
       * Método auxiliar que obtiene todos los IDs de propiedades dinámicas en una entidad en concreto.
       * @param {(mc.Entity | mc.Player)} targetEntity Entidad en concreto a consultar.
       * @returns {string[]} Devuelve un Array con todos los IDs, en caso de no haber ninguno, será vacío.
       * @remarks Este valor depende del UUID de tu add-on. Es decir, si hay dos add-ons en el mundo y los dos deciden guardar la misma propiedad, será diferente en ambos. Por ej: Add-on1 guarda la propiedad y Add-on2 lo consulta, será undefined porque solo existe en el Add-on1.
       * @author HaJuegos - 18-07-2026
       * @public
       * @example
       * ```ts
       * worldToolsSimplified.getEntityDynamicPropertiesIDs(entity); // ['ha:test1','ha:test2','ha:test3']
       * ```
       */
      getEntityDynamicPropertiesIDs(targetEntity) {
        return targetEntity.getDynamicPropertyIds();
      }
      /**
       * Método auxiliar que activa globalmente música para todos los jugadores.
       * @param {string} idMusic ID de la música a reproducir.
       * @param {?mc.MusicOptions} [options] (Opcional) Las condiciones para hacer sonar la música.
       * @returns {void}
       * @author HaJuegos - 18-07-2026
       * @public
       * @example
       * ```ts
       * worldToolsSimplified.startGlobalMusic('music.pigstep');
       * ```
       */
      startGlobalMusic(idMusic, options) {
        const registrationTrace = new Error().stack;
        try {
          mc3.world.playMusic(idMusic, options);
        } catch (e) {
          CatLogHandler.handleError(e, "startGlobalMusic", registrationTrace);
        }
      }
      /**
       * Método auxiliar que detiene la música global del mundo.
       * @returns {void}
       * @author HaJuegos - 18-07-2026
       * @public
       * @example
       * ```ts
       * worldToolsSimplified.stopGlobalMusic();
       * ```
       */
      stopGlobalMusic() {
        const registrationTrace = new Error().stack;
        try {
          mc3.world.stopMusic();
        } catch (e) {
          CatLogHandler.handleError(e, "stopGlobalMusic", registrationTrace);
        }
      }
      /**
       * Método auxiliar que obtiene o crea un area persistente en el mundo. Un /tickingarea, basado en las configuraciones de la misma, este es asíncrono debido a que debe esperar la carga de chunks requeridas y los cálculos que hace el juego para crear el radio.
       * @param {string} idArea ID del area a crear o obtener.
       * @param {mc.TickingAreaOptions} options Parametros para la creación del area en caso de no existir.
       * @returns {Promise<mc.TickingArea | undefined>} Si todo sale bien, devuelve el area correctamente en caso de modificarlo, sino, será undefined.
       * @author HaJuegos - 18-07-2026
       * @public
       * @async
       * @example
       * ```ts
       * // Esto crea una area persistente en el mundo y si todo sale bien, devuelve el tipo para modificarlo. En caso de ya existir, pues no se crea.
       * worldToolsSimplified.getOrCreateTickingArea('ha:area_persistente', {
       *     dimension: Dimension,
       *     to: { x: 0, y: 0, z: 0 },
       *     from: { x: 0, y: 10, z: -10 }
       * });
       * ```
       */
      async getOrCreateTickingArea(idArea, options) {
        const registrationTrace = new Error().stack;
        try {
          let area = mc3.world.tickingAreaManager.getTickingArea(idArea);
          if (!area) {
            await mc3.world.tickingAreaManager.createTickingArea(idArea, options);
            area = mc3.world.tickingAreaManager.getTickingArea(idArea);
          }
          return area;
        } catch (e) {
          CatLogHandler.handleError(e, "getOrCreateTickingArea", registrationTrace);
          return;
        }
      }
      /**
       * Método auxiliar que elimina un area persistente del mundo creado previamente.
       * @param {(string | mc.TickingArea)} idArea Area en concreto a eliminar o tambien su ID.
       * @returns {void}
       * @author HaJuegos - 18-07-2026
       * @public
       * @example
       * ```ts
       * // Esto elimina dicha area, si existe, sino, pues no hace nada.
       * worldToolsSimplified.deletedTickingArea('ha:area_persistente');
       * ```
       */
      deletedTickingArea(idArea) {
        const registrationTrace = new Error().stack;
        try {
          mc3.world.tickingAreaManager.removeTickingArea(idArea);
        } catch (e) {
          CatLogHandler.handleError(e, "deletedTickingArea", registrationTrace);
        }
      }
      /**
       * Método auxiliar que permite la creación de textos flotantes custom en el mundo, con mucha personalización.
       * @param {CustomFloatingTextParams} params Todos los parámetros requeridos para la creación de un texto flotante.
       * @returns {mc.TextPrimitive} Si todo sale bien, devuelve el mismo texto flotante previamente creado para su modificación.
       * @author HaJuegos - 18-07-2026
       * @public
       * @example
       * ```ts
       * // Esto crea un texto flotante llamado "Hola soy un texto".
       * const floatText: CustomFloatingTextParams = {
       *     text: { rawtext: [{ text: 'Hola soy un texto' }] },
       *     dimension: Dimension,
       *     alwaysVisible: true,  // Siempre será visible para todos a través de bloques.
       *     location: { x: 0, y: 0, z: 0 },
       *     rotation: { x: 0, y: 0, z: 0 },
       *     duration: 1000,
       *     scale: 1
       * };
       *
       * worldToolsSimplified.setAndGetFloatingText(floatText);
       * ```
       */
      setAndGetFloatingText(params) {
        const registrationTrace = new Error().stack;
        try {
          const floatTxt = new mc3.TextPrimitive(params.location, params.text);
          floatTxt.depthTest = !params.alwaysVisible;
          if (params.attachedTo) {
            floatTxt.attachedTo = params.attachedTo;
          }
          if (params.scale != void 0) {
            floatTxt.scale = params.scale;
          }
          if (params.duration != void 0) {
            floatTxt.timeLeft = params.duration;
          }
          if (params.rotation) {
            floatTxt.rotation = params.rotation;
            floatTxt.useRotation = true;
          }
          if (params.toPlys) {
            floatTxt.visibleTo = Array.isArray(params.toPlys) ? params.toPlys : [params.toPlys];
          }
          if (params.color) {
            const finalColor = typeof params.color == "string" ? worldToolsSimplified.convertHexToRGBA("finalColor") : params.color;
            floatTxt.color = finalColor;
          }
          if (params.backGroundColor) {
            const finalColor = typeof params.backGroundColor == "string" ? worldToolsSimplified.convertHexToRGBA("finalColor") : params.backGroundColor;
            floatTxt.backgroundColorOverride = finalColor;
          }
          mc3.world.primitiveShapesManager.addText(floatTxt, params.dimension);
          return floatTxt;
        } catch (e) {
          CatLogHandler.handleError(e, "setAndGetFloatingText", registrationTrace);
          return;
        }
      }
      /**
       * Método auxiliar que obtiene las dimensiones vanillas o custom por el método world.
       * @param {(vanilla.MinecraftDimensionTypes | string)} dimensionID El ID vanilla o custom en cuestión a obtener de la dimensión.
       * @returns {(mc.Dimension | undefined)} Si todo sale bien, devuelve la dimensión en concreto, sino, será undefined.
       * @public
       * @author HaJuegos - 06-08-2026
       * @example
       * ```ts
       * // Todas las formas de obtener dimensiones.
       * const over = worldToolsSimplified.getDimension(vanilla.MinecraftDimensionTypes.Overworld);
       * const end = worldToolsSimplified.getDimension(vanilla.MinecraftDimensionTypes.TheEnd);
       * const customDime = worldToolsSimplified.getDimension('ha:custom_dimension');
       * ```
       */
      getDimension(dimensionID) {
        const registrationTrace = new Error().stack;
        try {
          return mc3.world.getDimension(dimensionID);
        } catch (e) {
          CatLogHandler.handleError(e, "getDimension", registrationTrace);
          return;
        }
      }
      /**
       * Método auxiliar que obtiene todos los jugadores en el mundo independientemente de las dimensiones.
       * @returns {(mc.Player[] | undefined)} Si todo sale bien, devuelve de array de todos los jugadores, sino, será undefined.
       * @public
       * @author HaJuegos - 06-08-2026
       * @example
       * ```ts
       * // Obtiene todos los jugadores del mundo.
       * worldToolsSimplified.getAllPlysGlobal();
       * ```
       */
      getAllPlysGlobal() {
        const registrationTrace = new Error().stack;
        try {
          return mc3.world.getAllPlayers();
        } catch (e) {
          CatLogHandler.handleError(e, "getAllPlys", registrationTrace);
          return;
        }
      }
      /**
       * Método auxiliar que envía un evento script globalmente por medio de, scripts vaya.
       * @param {string} idScript ID del script en concreto a enviar.
       * @param {?string} [msg] (Opcional) Mensaje del script en concreto a enviar como argumento adicional.
       * @returns {void}
       * @public
       * @author HaJuegos - 06-08-2026
       * @example
       * ```ts
       * // Envía un script de prueba al addon de forma global.
       * worldToolsSimplified.sendScriptEventGlobal('ha:test_script');
       * ```
       */
      sendScriptEventGlobal(idScript, msg) {
        const registrationTrace = new Error().stack;
        try {
          mc3.system.sendScriptEvent(idScript, msg ? msg : "");
        } catch (e) {
          CatLogHandler.handleError(e, "sendScriptEventGlobal", registrationTrace);
          return;
        }
      }
      /**
       * Metodo auxiliar que cambia el estado de las trampas en el mundo. Pasando de false o true dependiendo el argumento asignado.
       * @param {boolean} state El nuevo estado que cambiara la opcion.
       * @returns {void}
       * @author HaJuegos - 30-08-2026
       * @public
       * @example
       * ```ts
       * // Ahora en el mundo si estara permitido las trampas de forzada.
       * worldToolsSimplified.changeWorldCheats(true);
       * ```
       */
      changeWorldCheats(state) {
        const registrationTrace = new Error().stack;
        try {
          mc3.world.allowCheats = state;
        } catch (e) {
          CatLogHandler.handleError(e, "changeWorldCheats", registrationTrace);
          return;
        }
      }
      /**
       * Metodo auxiliar que cambia el estado de la dificultad en el mundo, dependiendo el argumento asignado.
       * @param {boolean} state El nuevo estado que cambiara la opcion.
       * @returns {void}
       * @author HaJuegos - 30-08-2026
       * @public
       * @example
       * ```ts
       * // Ahora en el mundo estara en dificil de forma forzada.
       * worldToolsSimplified.changeWorldDifficulty(mc.Difficulty.Hard);
       * ```
       */
      changeWorldDifficulty(state) {
        const registrationTrace = new Error().stack;
        try {
          mc3.world.setDifficulty(state);
        } catch (e) {
          CatLogHandler.handleError(e, "changeWorldDifficulty", registrationTrace);
          return;
        }
      }
    };
    worldToolsSimplified = new WorldToolsSimplified();
  }
});

// node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/events/debugToolsSimplified.js
import * as mc4 from "@minecraft/server";
import * as debug from "@minecraft/debug-utilities";
var DebugToolsSimplified, debugToolsSimplified;
var init_debugToolsSimplified = __esm({
  "node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/events/debugToolsSimplified.js"() {
    init_worldToolsSimplifiedManager();
    DebugToolsSimplified = class {
      /**
       * Eventos iniciales de la clase cuando es llamada o inicializada.
       * @constructor
       */
      constructor() {
        this.playerHitboxLoops = /* @__PURE__ */ new Map();
        this.playerActiveBoxes = /* @__PURE__ */ new Map();
      }
      /**
       * Método auxiliar que activa las hitboxes de todas las entidades cercanas en un radio de 50 bloques a un jugador en concreto.
       * @param {mc.Player} ply Jugador en concreto a considerar.
       * @param {number} [maxRadiusHitboxs=50] (Opcional) El radio máximo a considerar para visualizar las hitboxes. Por defecto será 50.
       * @author HaJuegos - 14-03-2026
       * @public
       * @example
       * ```ts
       * const plys = world.getAllPlayers();
       *
       * debugToolsSimplified.showHitboxes(plys[0]); // Solo este jugador podrá ver las hitboxes.
       * ```
       */
      showHitboxes(ply, maxRadiusHitboxs = 50) {
        const plyId = ply.id;
        if (this.playerHitboxLoops.has(plyId)) {
          this.stopHitboxes(ply);
        }
        const activeBoxes = /* @__PURE__ */ new Map();
        this.playerActiveBoxes.set(plyId, activeBoxes);
        const loopId = worldToolsSimplified.setLoop(() => {
          if (!ply.isValid) {
            this.stopHitboxes(ply);
            return;
          }
          const nearbyMobs = ply.dimension.getEntities({
            location: ply.location,
            maxDistance: maxRadiusHitboxs
          }).slice(0, 30);
          for (const mob of nearbyMobs) {
            if (!activeBoxes.has(mob) && mob.isValid) {
              const bb = mob.getAABB();
              const box = new debug.DebugBox({ x: 0, y: 0, z: 0 });
              box.bound = { x: bb.extent.x * 2, y: bb.extent.y * 2, z: bb.extent.z * 2 };
              box.scale = 1;
              box.color = { red: 255, green: 255, blue: 255, alpha: 1 };
              box.visibleTo = [ply];
              box.attachedTo = mob;
              box.setLocation({ x: 0, y: bb.extent.y, z: 0 });
              debug.debugDrawer.addShape(box, ply.dimension);
              activeBoxes.set(mob, box);
            }
          }
          for (const [mob, box] of activeBoxes) {
            if (!mob.isValid) {
              box.remove();
              activeBoxes.delete(mob);
              continue;
            }
            const dx = mob.location.x - ply.location.x;
            const dy = mob.location.y - ply.location.y;
            const dz = mob.location.z - ply.location.z;
            if (Math.sqrt(dx * dx + dy * dy + dz * dz) > maxRadiusHitboxs) {
              box.remove();
              activeBoxes.delete(mob);
              continue;
            }
            const bb = mob.getAABB();
            box.bound = { x: bb.extent.x * 2, y: bb.extent.y * 2, z: bb.extent.z * 2 };
            box.setLocation({ x: 0, y: bb.extent.y, z: 0 });
          }
        }, worldToolsSimplified.convertSecondsToTicks(1));
        this.playerHitboxLoops.set(plyId, loopId);
      }
      /**
       * Método auxiliar que desactiva las hitboxes creadas en el mundo para todos los jugadores.
       * @author HaJuegos - 14-03-2026
       * @public
       * @example
       * ```ts
       * debugToolsSimplified.stopHitBoxes(); // Quita TODAS las hitboxes del mundo.
       * debugToolsSimplified.stopHitBoxes(ply); // Quita todas las hitboxes de ese jugador en concreto.
       * ```
       */
      stopHitboxes(ply) {
        if (ply) {
          const plyId = ply.id;
          const loopId = this.playerHitboxLoops.get(plyId);
          if (loopId != void 0) {
            worldToolsSimplified.stopLoop(loopId);
            this.playerHitboxLoops.delete(plyId);
          }
          const activeBoxes = this.playerActiveBoxes.get(plyId);
          if (activeBoxes) {
            for (const box of activeBoxes.values()) {
              box.remove();
            }
            this.playerActiveBoxes.delete(plyId);
          }
        } else {
          for (const loopId of this.playerHitboxLoops.values()) {
            worldToolsSimplified.stopLoop(loopId);
          }
          this.playerHitboxLoops.clear();
          for (const activeBoxes of this.playerActiveBoxes.values()) {
            for (const box of activeBoxes.values()) {
              box.remove();
            }
          }
          this.playerActiveBoxes.clear();
          debug.debugDrawer.removeAll();
        }
      }
      /**
       * Método que altera el estado de activo o desactivado del watchDogTerminate, en caso de lag spikes con scripts, para permitir el cierre o no del mundo o servidor cuando pase. Esto es solo recomendable usarlo en testeos, no se recomienda desactivarlo en mundos/servidores casuales o normales.
       * @param {boolean} newState El estado próximo a cambiar.
       * @author HaJuegos - 14-03-2026
       * @public
       * @example
       * ```ts
       * debugToolsSimplified.watchDogState(false) // ya no habrá cierre por lag spikes o problemas con scripts
       * ```
       */
      watchDogState(newState) {
        mc4.system.beforeEvents.watchdogTerminate.subscribe((arg) => {
          arg.cancel = newState;
        });
      }
    };
    debugToolsSimplified = new DebugToolsSimplified();
  }
});

// node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/events/fakePlysManagerSimplififed.js
import * as gametest from "@minecraft/server-gametest";
var FakePlysManager, fakePlysSimplified;
var init_fakePlysManagerSimplififed = __esm({
  "node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/events/fakePlysManagerSimplififed.js"() {
    init_errorHandler();
    init_worldToolsSimplifiedManager();
    FakePlysManager = class {
      /**
       * Eventos iniciales de la clase cuando es inicializada o llamada.
       * @constructor
       */
      constructor() {
        this.testCxt = void 0;
        this.isPlaced = false;
      }
      /**
       * Método auxiliar que registra primero el contexto necesario de los gametest para poder generar los simulated players.
       * @returns {void}
       * @author HaJuegos - 21-07-2026
       * @private
       */
      registerMainGametest() {
        const registrationTrace = new Error().stack;
        gametest.register("ha", "fakeplys", (args) => {
          try {
            this.testCxt = args;
          } catch (e) {
            CatLogHandler.handleError(e, "createFakePly", registrationTrace);
          }
        }).maxTicks(worldToolsSimplified.convertSecondsToTicks(99999)).structureName("ha:void");
      }
      /**
       * Método auxiliar que crea un nuevo tipo de jugador falso para métodos de pruebas.
       * @param {mc.Dimension} dimension Dimensión donde se generará el jugador de pruebas.
       * @param {string} namePly Nombre a asignar al jugador de pruebas.
       * @param {mc.GameMode} gamemodePly El modo de juego que tendrá el jugador de pruebas.
       * @param {?mc.Vector3} [defaultSpawnLocation] (Opcional) Coordenadas donde aparecerá el jugador de pruebas. Por defecto, irá a un jugador aleatorio
       * @returns {Promise<gametest.SimulatedPlayer | undefined>} Los datos del jugador falso generado en caso de que todo salga bien, sino será undefined.
       * @author HaJuegos - 13-03-2026
       * @public
       * @async Método asíncrono, por lo que este método necesita una ejecución principal y esperar esta misma para devolver el resultado final.
       * @gametestEvent Es un método gametest, usando estructuras de pruebas por medio del comando /gametest run.
       * @example
       * ```ts
       * // Esto genera un jugador de pruebas con sus respectivos datos para usar.
       * const fakePly = await fakePlysSimplified.createFakePly('Jugador Prueba', Dimension, mc.GameMode.Survival);
       * ```
       */
      async createFakePly(namePly, dimension, gamemodePly, defaultSpawnLocation) {
        const registrationTrace = new Error().stack;
        try {
          this.registerMainGametest();
          if (!this.isPlaced) {
            dimension.runCommand(`gametest run ha:fakeplys`);
            this.isPlaced = true;
          }
          return await new Promise((resolve, reject) => {
            worldToolsSimplified.setDelay(() => {
              try {
                if (!this.testCxt) {
                  throw new Error("No se pudo generar el jugador falso. No se cre\xF3 previamente el ambiente necesario para poderlo generar. Vuelve a intentarlo nuevamente. \xBFTienes guardado en tus estructuras el archivo 'void'?");
                }
                const fakePly = this.testCxt.spawnSimulatedPlayer({ x: 0, y: 1, z: 0 }, namePly, gamemodePly);
                if (defaultSpawnLocation) {
                  fakePly.tryTeleport(defaultSpawnLocation);
                } else {
                  fakePly.runCommand(`tp @r[name=!"${namePly}"]`);
                }
                resolve(fakePly);
              } catch (e) {
                reject(e);
              }
            }, worldToolsSimplified.convertSecondsToTicks(1));
          });
        } catch (e) {
          CatLogHandler.handleError(e, "createFakePly", registrationTrace);
          return;
        }
      }
    };
    fakePlysSimplified = new FakePlysManager();
  }
});

// node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/events/customToolsManager.js
import * as mc5 from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
var CustomEventsSimplified, customEventsManager;
var init_customToolsManager = __esm({
  "node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/events/customToolsManager.js"() {
    init_errorHandler();
    init_beforeEventsSimplifiedManager();
    init_worldToolsSimplifiedManager();
    CustomEventsSimplified = class {
      /**
       * Eventos principales de la clase cuando es llamada o inicializada.
       * @constructor
       */
      constructor() {
        this.activePlys = /* @__PURE__ */ new Map();
      }
      /**
       * Método auxiliar que simplifica la lógica de la creación de un formulario UI custom en cuestión.
       * @param {CustomFormParams} formParams Los parámetros del formulario en concreto necesarios para crear el formulario.
       * @returns {Promise<ui.ActionFormData | void>} Se devuelve el mismo formulario creado en caso de que todo esté bien.
       * @author HaJuegos - 16-04-2026
       * @async Este método es asíncrono debido a las acciones que puede realizar el usuario cuando se muestre o no el formulario. Principalmente para los eventos.
       * @public
       * @example
       * ```ts
       * // Esto crea el formulario y luego lo muestra al jugador. Y al momento de abrir el formulario en el jugador, se manda un log.
       * const form = this.createCustomClassicFormUI(
       *      {
       *          titleForm: 'Formulario de Prueba',
       *          showPly: {
       *              targetPly: player,
       *              onShow: (ply) => {
       *                  console.log(`${ply.name} abrió el formulario.`);
       *              }
       *          }
       *      }
       *  );
       * ```
       */
      async createCustomClassicFormUI(formParams) {
        const registrationTrace = new Error().stack;
        try {
          const baseForm = new ui.ActionFormData().title(formParams.titleForm);
          const buttonList = formParams.buttonsForm ? Array.isArray(formParams.buttonsForm) ? formParams.buttonsForm : [formParams.buttonsForm] : [];
          if (formParams.headerText) {
            baseForm.header(formParams.headerText);
          }
          if (formParams.bodyText) {
            baseForm.body(formParams.bodyText);
          }
          if (formParams.labelText) {
            baseForm.label(formParams.labelText);
          }
          buttonList.forEach((button) => {
            baseForm.button(button.buttomText, button.iconButtomUI);
          });
          if (formParams.showPly) {
            const targetInfo = formParams.showPly;
            const ply = targetInfo.targetPly;
            if (targetInfo.onCreate) {
              targetInfo.onCreate(ply);
            }
            try {
              const action = await baseForm.show(ply);
              if (action.canceled) {
                if (targetInfo.onClose) {
                  targetInfo.onClose(ply, action.cancelationReason);
                }
              } else {
                if (targetInfo.onClickBtn && action.selection != void 0) {
                  targetInfo.onClickBtn(ply, action.selection);
                }
              }
            } catch (e) {
              if (targetInfo.onErrForm) {
                targetInfo.onErrForm(ply, ui.FormCancelationReason.UserBusy);
              }
            }
          }
          return baseForm;
        } catch (e) {
          CatLogHandler.handleError(e, "createCustomClassicFormUI", registrationTrace);
        }
      }
      /**
       * Método auxiliar que simplifica la lógica de los fast items, cuando usas tu item con tu tecla de interacción, este cambiará a tu mano secundaria.
       * @param {(mc.ItemStack[] | string[])} listOfItems La lista de items a validar para este sistema.
       * @returns {void}
       * @author HaJuegos - 15-03-2026
       * @version 2 Cambio de obtención de items permitidos para hacerlo dinámico si es requerido.
       * @public
       * @example
       * ```ts
       * customEventsManager.fastItemsSystem(() => ['totem']); // Ahora el totem es considerado un fast item para cambiar a la mano secundaria con un click.
       * ```
       */
      fastItemsSystem(listOfItems) {
        beforeEventsSimplified.onUseItem((args) => {
          const ply = args.source;
          const item = args.itemStack;
          const currentSlot = ply.selectedSlotIndex;
          const currentList = listOfItems();
          const isItemValid = currentList.some((listItem) => {
            if (typeof listItem == "string") {
              return item.typeId.includes(listItem);
            } else {
              return item.typeId == listItem.typeId;
            }
          });
          if (isItemValid) {
            args.cancel = true;
            worldToolsSimplified.setRun(() => {
              const plyInv = ply.getComponent(mc5.EntityComponentTypes.Inventory)?.container;
              const plyArmor = ply.getComponent(mc5.EntityComponentTypes.Equippable);
              const itemCurrentlyInSlot = plyInv.getItem(currentSlot);
              if (!itemCurrentlyInSlot || itemCurrentlyInSlot.typeId != item.typeId) {
                return;
              }
              const itemOffhand = plyArmor.getEquipment(mc5.EquipmentSlot.Offhand);
              if (itemOffhand && itemOffhand.typeId == itemCurrentlyInSlot.typeId) {
                return;
              }
              if (itemOffhand) {
                plyArmor.setEquipment(mc5.EquipmentSlot.Offhand, itemCurrentlyInSlot);
                plyInv.setItem(currentSlot, itemOffhand);
              } else {
                plyArmor.setEquipment(mc5.EquipmentSlot.Offhand, itemCurrentlyInSlot);
                plyInv.setItem(currentSlot, void 0);
              }
              ply.playSound("armor.equip_generic");
            });
          }
        });
      }
      /**
       * Método auxiliar que simplifica la lógica de dañar un item o reducir un stack de items en un inventario de un jugador en concreto, dependiendo el caso.
       * @param {ManualDamageItemParams} params Los parámetros necesarios para este método.
       * @author HaJuegos - 17-03-2026
       * @public
       * @example
       * ```ts
       * // Esto hará que un item en la mano reduzca su stock o sea dañado bajando su durabilidad. Dependiendo el tipo de item.
       * customEventsManager.manualDamageItem({ ply: player, item: item });
       * ```
       */
      manualDamageItem(params) {
        const registrationTrace = new Error().stack;
        try {
          const { ply, item, specificInv = "inv", specificAmount = 1, specificDamageDurability = 1, specificSlot = ply.selectedSlotIndex } = params;
          const actualGm = ply.getGameMode();
          if (actualGm != mc5.GameMode.Adventure && actualGm != mc5.GameMode.Survival)
            return;
          const newItem = item.clone();
          let broke = false;
          if (!item.isStackable) {
            const durability = newItem.getComponent(mc5.ItemComponentTypes.Durability);
            if (durability) {
              const finalDurability = durability.damage + specificDamageDurability;
              if (finalDurability >= durability.maxDurability) {
                broke = true;
                ply.playSound("random.break");
              } else {
                durability.damage = finalDurability;
              }
            }
          } else {
            if (newItem.amount <= specificAmount) {
              broke = true;
            } else {
              newItem.amount -= specificAmount;
            }
          }
          if (specificInv == "armor") {
            const armorInv = ply.getComponent(mc5.EntityComponentTypes.Equippable);
            armorInv.setEquipment(specificSlot, broke ? void 0 : newItem);
          } else {
            const plyInv = ply.getComponent(mc5.EntityComponentTypes.Inventory)?.container;
            plyInv.setItem(specificSlot, broke ? void 0 : newItem);
          }
        } catch (e) {
          CatLogHandler.handleError(e, "manualDamageItem", registrationTrace);
        }
      }
      /**
       * Método auxiliar que simplifica la lógica de detectar en el inventario del jugador, si tiene uno o varios items en concreto de forma explícita o no.
       * @param {mc.Player} plySource Jugador en cuestión.
       * @param {(string | string[] | vanilla.MinecraftItemTypes | vanilla.MinecraftItemTypes[] )} itemsToDetect Item o items a buscar.
       * @param {boolean?} exactItems (Opcional) Busca explícitamente el nombre del item palabra por palabra. Por defecto está apagado, entonces buscará items sin importar si tienen diferencias. Por ej: Si se busca 'diamond'; minecraft:diamond y minecraft:diamond_sword serían true.
       * @returns {boolean} Devuelve true en caso de tener ese item, sino, será false.
       * @author HaJuegos - 18-03-2026
       * @public
       * @example
       * ```ts
       * // Esto es true si el jugador tiene un item llamado totem o más de forma no explícita.
       * customEventsManager.plyHasItems(player, 'totem');
       *
       * // Esto es true si el jugador tiene un totem de la inmortalidad de forma explícita.
       * customEventsManager.plyHasItems(player, vanilla.MinecraftItemTypes.TotemOfUndying, true);
       * ```
       */
      plyHasItems(plySource, itemsToDetect, exactItems = false) {
        const registrationTrace = new Error().stack;
        try {
          const invPly = plySource.getComponent(mc5.EntityComponentTypes.Inventory)?.container;
          const armorPly = plySource.getComponent(mc5.EntityComponentTypes.Equippable);
          const targetItems = Array.isArray(itemsToDetect) ? itemsToDetect : [itemsToDetect];
          if (invPly) {
            for (let i = 0; i < invPly.size; i++) {
              const item = invPly.getItem(i);
              if (item) {
                const itemFound = !exactItems ? targetItems.some((target) => item.typeId.includes(target)) : targetItems.some((target) => item.typeId == target);
                if (itemFound) {
                  return true;
                }
              }
            }
          }
          if (armorPly) {
            const equipmentSlots = [
              mc5.EquipmentSlot.Head,
              mc5.EquipmentSlot.Chest,
              mc5.EquipmentSlot.Legs,
              mc5.EquipmentSlot.Feet,
              mc5.EquipmentSlot.Offhand
            ];
            for (const slot of equipmentSlots) {
              const item = armorPly.getEquipment(slot);
              if (item) {
                const itemFound = !exactItems ? targetItems.some((target) => item.typeId.includes(target)) : targetItems.some((target) => item.typeId == target);
                if (itemFound) {
                  return true;
                }
              }
            }
          }
        } catch (e) {
          CatLogHandler.handleError(e, "plyHasItems", registrationTrace);
        }
        return false;
      }
      /**
       * Método auxiliar que simplifica la lógica al detectar el uso de un totem, ejecutando los eventos relacionados.
       * @param {(entity: mc.Entity | mc.Player) => void} callback Los eventos relacionados a ejecutar.
       * @returns {void}
       * @version 2 Ahora es un beforeEvent por uso de BeforeOnEntityHeal.
       * @author HaJuegos - 19-08-2026
       * @public
       * @beforeEvent Método que detecta el evento antes de que suceda. Permitiendo cancelar o personalizar el evento antes de que se vea en el juego.
       * @example
       * ```ts
       * // Este evento solo se va a ejecutar cuando una entidad o jugador usa un totem.
       * customEventsManager.onEntityUseTotem((entity) => {
       *     console.warn(`${entity.typeId} ha usado un totem.`);
       *     console.warn(`${entity.name} ha usado un totem.`);
       * });
       * ```
       */
      onEntityUseTotem(callback) {
        beforeEventsSimplified.onEntityHeal((args) => {
          const entity = args.healedEntity;
          const cause = args.healSource;
          if (cause.cause != mc5.EntityHealCause.TotemOfUndying)
            return;
          callback(entity);
        });
      }
      /**
       * Método auxiliar que simplifica la lógica de randomizar el inventario de un jugador, cambiando totalmente las ubicaciones de los items en el mismo inventario.
       * @param {mc.Player} ply Jugador en cuestión.
       * @author HaJuegos - 30-03-2026
       * @public
       * @example
       * ```ts
       * // Ahora el inventario estará totalmente desordenado. Solo el inventario, no armadura.
       * customEventsManager.randomizeInvPly(player);
       * ```
       */
      randomizeInvPly(ply) {
        const registrationTrace = new Error().stack;
        try {
          const inv = ply.getComponent(mc5.EntityComponentTypes.Inventory)?.container;
          const validItems = [];
          for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (item) {
              validItems.push(item);
              inv.setItem(i, void 0);
            }
          }
          if (validItems.length == 0)
            return;
          const randomSlots = Array.from({ length: inv.size }, (_, i) => i);
          for (let i = randomSlots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [randomSlots[i], randomSlots[j]] = [randomSlots[j], randomSlots[i]];
          }
          for (let i = 0; i < validItems.length; i++) {
            const targetSlot = randomSlots[i];
            inv.setItem(targetSlot, validItems[i]);
          }
        } catch (e) {
          CatLogHandler.handleError(e, "randomizeInvPly", registrationTrace);
        }
      }
      /**
       * Método auxiliar que genera un timer basado en tiempo real. Este consiste en minutos iniciales (también horas) iniciando el timer guardando los valores en tiempo real en el jugador asignado que va a ver el timer. Devolviendo y ejecutando código basado en el timer.
       * @param {CustomTimerParam} paramsTimer Los parámetros y eventos a ejecutar mientras el timer se ejecuta.
       * @author HaJuegos - 05-04-2026
       * @public
       * @example
       * ```ts
       * const paramsTimer: CustomTimerParam = {
       *     sourcePLy: player, // Jugador que tiene el timer
       *     timerID: 'ha:timer_unique', // Identificador único del timer, por si se usa en más de una ocasión
       *     initialMns: 2, // Los Minutos iniciales del timer o minutos a mostrar del timer.
       *     forceRestart: true, // (Opcional) Si es necesario en caso de cambio del valor, por ej, nuevos valores de minutos o segundos, pues hace que el timer se reinicie.
       *
       *     // (Opcional) Eventos relacionales cuando el timer pasa un segundo.
       *     onSecondPass: (ply, timer) => {
       *         console.log(`Ha pasado un segundo, el tiempo ahora está en ${timer}`);
       *     },
       * };
       *
       * // Inicia el timer para el jugador en concreto. NOTA: Es un timer interno, no tiene interfaz. Para mostrar el valor del timer, usar los eventos como: onSecondPass.
       * customEventsManager.startTimerLocal(paramsTimer);
       * ```
       */
      startTimerLocal(paramsTimer) {
        const registrationTrace = new Error().stack;
        try {
          const { sourcePly, timerId, initialScnds, initialMns, initialHrs, forceRestart, onTimerStarts, onSecondPass, onMinutePass, onHourPass, onTimerEnds } = paramsTimer;
          const mapKey = `${sourcePly.id}_${timerId}`;
          const propKey = timerId;
          let isnewTimer = false;
          if (this.activePlys.has(mapKey)) {
            if (forceRestart) {
              const oldID = this.activePlys.get(mapKey);
              worldToolsSimplified.stopLoop(oldID);
              this.activePlys.delete(mapKey);
              sourcePly.setDynamicProperty(timerId, void 0);
              isnewTimer = true;
            } else {
              return;
            }
          }
          const hrsMs = (initialHrs || 0) * 36e5;
          const mnsMs = (initialMns || 0) * 6e4;
          const scndsMs = (initialScnds || 0) * 1e3;
          const totalRequestedMs = hrsMs + mnsMs + scndsMs;
          let endTime = sourcePly.getDynamicProperty(propKey);
          if (endTime == void 0) {
            endTime = Date.now() + totalRequestedMs;
            sourcePly.setDynamicProperty(propKey, endTime);
            isnewTimer = true;
          } else {
            const remainSaved = Math.max(0, endTime - Date.now());
            const savedTotalSeconds = Math.floor(remainSaved / 1e3);
            const requestedTotalSeconds = Math.floor(totalRequestedMs / 1e3);
            if (Math.abs(savedTotalSeconds - requestedTotalSeconds) >= 2) {
              endTime = Date.now() + totalRequestedMs;
              sourcePly.setDynamicProperty(propKey, endTime);
            }
          }
          let lastSecond = -1;
          let lastMinute = -1;
          let lastHour = -1;
          const formatTime = (remainMs) => {
            if (remainMs < 0)
              remainMs = 0;
            const totalSeconds = Math.floor(remainMs / 1e3);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor(totalSeconds % 3600 / 60);
            const seconds = totalSeconds % 60;
            const mStr = minutes.toString().padStart(2, "0");
            const sSrt = seconds.toString().padStart(2, "0");
            let currentTime = `${mStr}:${sSrt}`;
            if (initialHrs != void 0 && initialHrs > 0 || hours > 0) {
              const hStr = hours.toString().padStart(2, "0");
              currentTime = `${hStr}:${mStr}:${sSrt}`;
            }
            if (lastSecond != -1) {
              if (seconds != lastSecond && onSecondPass) {
                onSecondPass(sourcePly, currentTime);
              }
              if (minutes != lastMinute && onMinutePass) {
                onMinutePass(sourcePly, currentTime);
              }
              if (hours != lastHour && onHourPass) {
                onHourPass(sourcePly, currentTime);
              }
            }
            lastSecond = seconds;
            lastMinute = minutes;
            lastHour = hours;
            return currentTime;
          };
          const initialRemaining = endTime - Date.now();
          const initialFormat = formatTime(initialRemaining);
          if (isnewTimer && onTimerStarts) {
            onTimerStarts(sourcePly);
          }
          if (onSecondPass) {
            onSecondPass(sourcePly, initialFormat);
          }
          ;
          const loopId = worldToolsSimplified.setLoop(() => {
            if (!sourcePly.isValid) {
              worldToolsSimplified.stopLoop(loopId);
              this.activePlys.delete(mapKey);
              return;
            }
            const currentRemaing = endTime - Date.now();
            if (currentRemaing <= 0) {
              sourcePly.setDynamicProperty(propKey, void 0);
              this.activePlys.delete(mapKey);
              worldToolsSimplified.stopLoop(loopId);
              if (onTimerEnds) {
                onTimerEnds(sourcePly);
              }
              ;
            } else {
              formatTime(currentRemaing);
            }
          }, worldToolsSimplified.convertSecondsToTicks(1));
          this.activePlys.set(mapKey, loopId);
        } catch (e) {
          CatLogHandler.handleError(e, "customStartTimerLocal", registrationTrace);
        }
      }
      /**
       * Método auxiliar que fuerza la eliminación y dropeo de un item en concreto de un slot del inventario de un jugador.
       * @param {mc.Player} ply Jugador en concreto a considerar.
       * @param {(number | number[])} slots El o los slots en concreto a cambiar eliminar.
       * @param {?mc.ItemStack} itemToRemplace (Opcional) Un item a poner en su lugar al item a dropear o eliminar.
       * @param {?(string[] | vanilla.MinecraftItemTypes[] | mc.ItemStack[])} whitelistItems (Opcional) Lista de items que no se pueden dropear o eliminar en este sistema.
       * @returns {void}
       * @author HaJuegos - 18-05-2026
       * @public
       * @example
       * ```ts
       * // Cuando este evento se ejecute, los items de los slots "0,1,2,3" seran dropeados y eliminados del jugador. (Si hay items en esos slots)
       * customEventsManager.dropItemsPly(ply, [0,1,2,3]);
       * ```
       */
      dropItemsPly(ply, slots, itemToRemplace, whitelistItems) {
        const registrationTrace = new Error().stack;
        try {
          const coords = ply.location;
          const dime = ply.dimension;
          const inv = ply.getComponent(mc5.EntityComponentTypes.Inventory)?.container;
          const finalSlots = Array.isArray(slots) ? slots : [slots];
          for (const slot of finalSlots) {
            const item = inv.getItem(slot);
            let whitelisted = false;
            if (item && whitelistItems) {
              whitelisted = whitelistItems.some((wItem) => {
                const id = typeof wItem == "string" ? wItem : wItem.typeId;
                return id == item.typeId;
              });
            }
            if (whitelisted)
              continue;
            if (item) {
              const spawnCoords = { x: coords.x, y: coords.y + 1, z: coords.z };
              const itemEntity = dime.spawnItem(item, spawnCoords);
              const force = 0.5;
              const randomX = (Math.random() - 0.5) * force;
              const randomZ = (Math.random() - 0.5) * force;
              itemEntity.applyImpulse({ x: randomX, y: force, z: randomZ });
            }
            if (itemToRemplace) {
              inv.setItem(slot, itemToRemplace);
            } else if (item) {
              inv.setItem(slot, void 0);
            }
          }
        } catch (e) {
          CatLogHandler.handleError(e, "dropItemsPly", registrationTrace);
        }
      }
      /**
       * Método auxiliar que fuerza la eliminación y dropeo de un item en concreto de un slot del equipamiento de un jugador.
       * @param {mc.Player} ply Jugador en concreto a considerar.
       * @param {(mc.EquipmentSlot | mc.EquipmentSlot[])} slots El o los slots en concreto a cambiar eliminar.
       * @param {?mc.ItemStack} itemToRemplace (Opcional) Un item a poner en su lugar al item a dropear o eliminar.
       * @param {?(string[] | vanilla.MinecraftItemTypes[] | mc.ItemStack[])} whitelistItems (Opcional) Lista de items que no se pueden dropear o eliminar en este sistema.
       * @returns {void}
       * @author HaJuegos - 18-05-2026
       * @public
       * @example
       * ```ts
       * // Cuando este evento se ejecute, los items de los slots "Helmet, Chestplate y Leggings" seran dropeados y eliminados del jugador. (Si hay items en esos slots)
       * customEventsManager.dropArmorsPly(ply, [mc.EquipmentSlot.Head, mc.EquipmentSlot.Chest, mc.EquipmentSlot.Legs]);
       * ```
       */
      dropArmorsPly(ply, slots, itemToRemplace, whitelistItems) {
        const registrationTrace = new Error().stack;
        try {
          const coords = ply.location;
          const dime = ply.dimension;
          const armorInv = ply.getComponent(mc5.EntityComponentTypes.Equippable);
          const finalSlots = Array.isArray(slots) ? slots : [slots];
          for (const slot of finalSlots) {
            const item = armorInv.getEquipment(slot);
            let whitelisted = false;
            if (item && whitelistItems) {
              whitelisted = whitelistItems.some((wItem) => {
                const id = typeof wItem == "string" ? wItem : wItem.typeId;
                return id == item.typeId;
              });
            }
            if (whitelisted)
              continue;
            if (item) {
              const spawnCoords = { x: coords.x, y: coords.y + 1, z: coords.z };
              const itemEntity = dime.spawnItem(item, spawnCoords);
              const force = 0.5;
              const randomX = (Math.random() - 0.5) * force;
              const randomZ = (Math.random() - 0.5) * force;
              itemEntity.applyImpulse({ x: randomX, y: force, z: randomZ });
            }
            if (itemToRemplace) {
              armorInv.setEquipment(slot, itemToRemplace);
            } else if (item) {
              armorInv.setEquipment(slot, void 0);
            }
          }
        } catch (e) {
          CatLogHandler.handleError(e, "dropArmorsPly", registrationTrace);
        }
      }
      /**
       * Método auxiliar que permite el cambio de estado y propiedades a uno o varios items de uno o varios inventarios a un jugador en concreto. Simplificando los lockMode de los items.
       * @param {LockItemsInvParams} params Los parámetros en concreto para integrar.
       * @returns {void}
       * @author HaJuegos - 19-05-2026
       * @public
       * @example
       * ```ts
       * const params: LockItemsInvParams = {
       *      ply: source, // Jugador en concreto
       *      invType: 'inv', // Inventario a cambiar
       *      lockMethod: mc.ItemLockMode.Inventory, // Tipo de bloqueo a realizar a los items
       *      keepInDeath: true, // Se asigna la propiedad 'keepInDeath' adicionalmente
       *      itemsSelection: {
       *          randomSlots: {
       *              minSlots: 1,
       *              maxSlots: 4
       *          }
       *      }
       *  }
       *
       * customEventsManager.lockItemsPly(params)
       * ```
       */
      lockItemsPly(params) {
        const registrationTrace = new Error().stack;
        try {
          const { ply, invType, lockMethod, keepInDeath, itemsSelection } = params;
          const inv = ply.getComponent(mc5.EntityComponentTypes.Inventory)?.container;
          const armorInv = ply.getComponent(mc5.EntityComponentTypes.Equippable);
          let selectItems = [];
          const validChange = (currentLock, targetLock) => {
            return currentLock != targetLock;
          };
          const checkWhitelist = (item) => {
            if (!itemsSelection.whitelistItems)
              return false;
            return itemsSelection.whitelistItems.some((wItem) => {
              const id = typeof wItem == "string" ? wItem : wItem.typeId;
              return id == item.typeId;
            });
          };
          if (invType == "inv" || invType == "both") {
            const slots = itemsSelection.specificSlots ? itemsSelection.specificSlots : Array.from({ length: inv.size }, (_, i) => i);
            for (const slot of slots) {
              const item = inv.getItem(slot);
              if (item && !checkWhitelist(item) && validChange(item.lockMode, lockMethod)) {
                selectItems.push({ type: "inv", slot, item });
              }
            }
          }
          if (invType == "armor" || invType == "both") {
            const allSlots = [mc5.EquipmentSlot.Head, mc5.EquipmentSlot.Chest, mc5.EquipmentSlot.Legs, mc5.EquipmentSlot.Feet, mc5.EquipmentSlot.Offhand];
            const slots = itemsSelection.specificSlots ? itemsSelection.specificSlots : allSlots;
            for (const slot of slots) {
              const item = armorInv.getEquipment(slot);
              if (item && !checkWhitelist(item) && validChange(item.lockMode, lockMethod)) {
                selectItems.push({ type: "armor", slot, item });
              }
            }
          }
          if (itemsSelection.randomSlots) {
            const { minSlots, maxSlots } = itemsSelection.randomSlots;
            const selecTotal = Math.floor(Math.random() * (maxSlots - minSlots + 1)) + minSlots;
            selectItems.sort(() => Math.random() - 0.5);
            selectItems = selectItems.slice(0, selecTotal);
          }
          for (const itemData of selectItems) {
            const { type, slot, item } = itemData;
            item.lockMode = lockMethod;
            if (keepInDeath != void 0) {
              item.keepOnDeath = keepInDeath;
            }
            if (type == "inv") {
              inv.setItem(slot, item);
            } else {
              armorInv.setEquipment(slot, item);
            }
          }
        } catch (e) {
          CatLogHandler.handleError(e, "lockItemsPly", registrationTrace);
        }
      }
      /**
       * Método auxiliar que simplifica y permite crear un nuevo punto de localización en el locator bar de forma custom con colores, formas y configuraciones personalizadas. Basado en jugador o jugadores que lo tengan visible.
       * @param {CustomWayPointsParams} params Parámetros necesarios para la creación del punto de localización para el locatorbar.
       * @returns {mc.LocationWaypoint} Devuelve el punto de localización custom creado si todo salió bien. Si no, será undefined.
       * @author HaJuegos - 03-08-2026
       * @public
       * @example
       * ```ts
       * const customWayPoint: CustomWayPointsParams = {
       *     targetPlys: ply,
       *     location: ply.location,
       *     dimension: ply.dimension,
       *     // Este parametro puede ser un icono con forma y colores vanilla o sino, una textura custom.
       *     iconTexture: {
       *         path: 'textura.png',
       *         iconWidth: 1,
       *         iconHeight: 1
       *     }
       * }
       *
       * customEventsManager.createCustomWayPoint(customWayPoint);
       * ```
       */
      createCustomWayPoint(params) {
        const registrationTrace = new Error().stack;
        try {
          const { targetPlys, location, dimension, iconTexture, color, visible } = params;
          const texture = "shape" in iconTexture ? iconTexture.shape : { path: iconTexture.path, iconWidth: iconTexture.iconWidth, iconHeight: iconTexture.iconHeight };
          const selectTexture = {
            textureBoundsList: [{ lowerBound: 0, texture }]
          };
          const point = new mc5.LocationWaypoint({ dimension, x: location.x, y: location.y, z: location.z }, selectTexture, color);
          if (visible == false) {
            point.isEnabled = false;
          }
          const plys = Array.isArray(targetPlys) ? targetPlys : [targetPlys];
          for (const ply of plys) {
            ply.locatorBar.addWaypoint(point);
          }
          return point;
        } catch (e) {
          CatLogHandler.handleError(e, "customWaypoint", registrationTrace);
        }
      }
    };
    customEventsManager = new CustomEventsSimplified();
  }
});

// node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/core/customTypes.js
var init_customTypes = __esm({
  "node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/core/customTypes.js"() {
  }
});

// node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/index.js
var init_dist = __esm({
  "node_modules/.pnpm/simplified-mojang-api@0.0.6_459a99ad59249620eb2cb8be39dfc2d8/node_modules/simplified-mojang-api/dist/index.js"() {
    init_eventsManager();
    init_afterEventsSimplifiedManager();
    init_beforeEventsSimplifiedManager();
    init_worldToolsSimplifiedManager();
    init_debugToolsSimplified();
    init_fakePlysManagerSimplififed();
    init_customToolsManager();
    init_customTypes();
  }
});

// node_modules/.pnpm/@minecraft+vanilla-data@1.26.40/node_modules/@minecraft/vanilla-data/lib/index.js
var MinecraftBiomeTypes, MinecraftBlockTypes, MinecraftCameraPresetsTypes, MinecraftCooldownCategoryTypes, MinecraftDimensionTypes, MinecraftEffectTypes, MinecraftEnchantmentTypes, MinecraftEntityTypes, MinecraftFeatureTypes, MinecraftItemTypes, MinecraftPotionDeliveryTypes, MinecraftPotionEffectTypes;
var init_lib = __esm({
  "node_modules/.pnpm/@minecraft+vanilla-data@1.26.40/node_modules/@minecraft/vanilla-data/lib/index.js"() {
    MinecraftBiomeTypes = ((MinecraftBiomeTypes2) => {
      MinecraftBiomeTypes2["BambooJungle"] = "minecraft:bamboo_jungle";
      MinecraftBiomeTypes2["BambooJungleHills"] = "minecraft:bamboo_jungle_hills";
      MinecraftBiomeTypes2["BasaltDeltas"] = "minecraft:basalt_deltas";
      MinecraftBiomeTypes2["Beach"] = "minecraft:beach";
      MinecraftBiomeTypes2["BirchForest"] = "minecraft:birch_forest";
      MinecraftBiomeTypes2["BirchForestHills"] = "minecraft:birch_forest_hills";
      MinecraftBiomeTypes2["BirchForestHillsMutated"] = "minecraft:birch_forest_hills_mutated";
      MinecraftBiomeTypes2["BirchForestMutated"] = "minecraft:birch_forest_mutated";
      MinecraftBiomeTypes2["CherryGrove"] = "minecraft:cherry_grove";
      MinecraftBiomeTypes2["ColdBeach"] = "minecraft:cold_beach";
      MinecraftBiomeTypes2["ColdOcean"] = "minecraft:cold_ocean";
      MinecraftBiomeTypes2["ColdTaiga"] = "minecraft:cold_taiga";
      MinecraftBiomeTypes2["ColdTaigaHills"] = "minecraft:cold_taiga_hills";
      MinecraftBiomeTypes2["ColdTaigaMutated"] = "minecraft:cold_taiga_mutated";
      MinecraftBiomeTypes2["CrimsonForest"] = "minecraft:crimson_forest";
      MinecraftBiomeTypes2["DappledForest"] = "minecraft:dappled_forest";
      MinecraftBiomeTypes2["DeepColdOcean"] = "minecraft:deep_cold_ocean";
      MinecraftBiomeTypes2["DeepDark"] = "minecraft:deep_dark";
      MinecraftBiomeTypes2["DeepFrozenOcean"] = "minecraft:deep_frozen_ocean";
      MinecraftBiomeTypes2["DeepLukewarmOcean"] = "minecraft:deep_lukewarm_ocean";
      MinecraftBiomeTypes2["DeepOcean"] = "minecraft:deep_ocean";
      MinecraftBiomeTypes2["DeepWarmOcean"] = "minecraft:deep_warm_ocean";
      MinecraftBiomeTypes2["Desert"] = "minecraft:desert";
      MinecraftBiomeTypes2["DesertHills"] = "minecraft:desert_hills";
      MinecraftBiomeTypes2["DesertMutated"] = "minecraft:desert_mutated";
      MinecraftBiomeTypes2["DripstoneCaves"] = "minecraft:dripstone_caves";
      MinecraftBiomeTypes2["ExtremeHills"] = "minecraft:extreme_hills";
      MinecraftBiomeTypes2["ExtremeHillsEdge"] = "minecraft:extreme_hills_edge";
      MinecraftBiomeTypes2["ExtremeHillsMutated"] = "minecraft:extreme_hills_mutated";
      MinecraftBiomeTypes2["ExtremeHillsPlusTrees"] = "minecraft:extreme_hills_plus_trees";
      MinecraftBiomeTypes2["ExtremeHillsPlusTreesMutated"] = "minecraft:extreme_hills_plus_trees_mutated";
      MinecraftBiomeTypes2["FlowerForest"] = "minecraft:flower_forest";
      MinecraftBiomeTypes2["Forest"] = "minecraft:forest";
      MinecraftBiomeTypes2["ForestHills"] = "minecraft:forest_hills";
      MinecraftBiomeTypes2["FrozenOcean"] = "minecraft:frozen_ocean";
      MinecraftBiomeTypes2["FrozenPeaks"] = "minecraft:frozen_peaks";
      MinecraftBiomeTypes2["FrozenRiver"] = "minecraft:frozen_river";
      MinecraftBiomeTypes2["Grove"] = "minecraft:grove";
      MinecraftBiomeTypes2["Hell"] = "minecraft:hell";
      MinecraftBiomeTypes2["IceMountains"] = "minecraft:ice_mountains";
      MinecraftBiomeTypes2["IcePlains"] = "minecraft:ice_plains";
      MinecraftBiomeTypes2["IcePlainsSpikes"] = "minecraft:ice_plains_spikes";
      MinecraftBiomeTypes2["JaggedPeaks"] = "minecraft:jagged_peaks";
      MinecraftBiomeTypes2["Jungle"] = "minecraft:jungle";
      MinecraftBiomeTypes2["JungleEdge"] = "minecraft:jungle_edge";
      MinecraftBiomeTypes2["JungleEdgeMutated"] = "minecraft:jungle_edge_mutated";
      MinecraftBiomeTypes2["JungleHills"] = "minecraft:jungle_hills";
      MinecraftBiomeTypes2["JungleMutated"] = "minecraft:jungle_mutated";
      MinecraftBiomeTypes2["LegacyFrozenOcean"] = "minecraft:legacy_frozen_ocean";
      MinecraftBiomeTypes2["LukewarmOcean"] = "minecraft:lukewarm_ocean";
      MinecraftBiomeTypes2["LushCaves"] = "minecraft:lush_caves";
      MinecraftBiomeTypes2["MangroveSwamp"] = "minecraft:mangrove_swamp";
      MinecraftBiomeTypes2["Meadow"] = "minecraft:meadow";
      MinecraftBiomeTypes2["MegaTaiga"] = "minecraft:mega_taiga";
      MinecraftBiomeTypes2["MegaTaigaHills"] = "minecraft:mega_taiga_hills";
      MinecraftBiomeTypes2["Mesa"] = "minecraft:mesa";
      MinecraftBiomeTypes2["MesaBryce"] = "minecraft:mesa_bryce";
      MinecraftBiomeTypes2["MesaPlateau"] = "minecraft:mesa_plateau";
      MinecraftBiomeTypes2["MesaPlateauMutated"] = "minecraft:mesa_plateau_mutated";
      MinecraftBiomeTypes2["MesaPlateauStone"] = "minecraft:mesa_plateau_stone";
      MinecraftBiomeTypes2["MesaPlateauStoneMutated"] = "minecraft:mesa_plateau_stone_mutated";
      MinecraftBiomeTypes2["MushroomIsland"] = "minecraft:mushroom_island";
      MinecraftBiomeTypes2["MushroomIslandShore"] = "minecraft:mushroom_island_shore";
      MinecraftBiomeTypes2["Ocean"] = "minecraft:ocean";
      MinecraftBiomeTypes2["PaleGarden"] = "minecraft:pale_garden";
      MinecraftBiomeTypes2["Plains"] = "minecraft:plains";
      MinecraftBiomeTypes2["RedwoodTaigaHillsMutated"] = "minecraft:redwood_taiga_hills_mutated";
      MinecraftBiomeTypes2["RedwoodTaigaMutated"] = "minecraft:redwood_taiga_mutated";
      MinecraftBiomeTypes2["River"] = "minecraft:river";
      MinecraftBiomeTypes2["RoofedForest"] = "minecraft:roofed_forest";
      MinecraftBiomeTypes2["RoofedForestMutated"] = "minecraft:roofed_forest_mutated";
      MinecraftBiomeTypes2["Savanna"] = "minecraft:savanna";
      MinecraftBiomeTypes2["SavannaMutated"] = "minecraft:savanna_mutated";
      MinecraftBiomeTypes2["SavannaPlateau"] = "minecraft:savanna_plateau";
      MinecraftBiomeTypes2["SavannaPlateauMutated"] = "minecraft:savanna_plateau_mutated";
      MinecraftBiomeTypes2["SnowySlopes"] = "minecraft:snowy_slopes";
      MinecraftBiomeTypes2["SoulsandValley"] = "minecraft:soulsand_valley";
      MinecraftBiomeTypes2["StoneBeach"] = "minecraft:stone_beach";
      MinecraftBiomeTypes2["StonyPeaks"] = "minecraft:stony_peaks";
      MinecraftBiomeTypes2["SulfurCaves"] = "minecraft:sulfur_caves";
      MinecraftBiomeTypes2["SunflowerPlains"] = "minecraft:sunflower_plains";
      MinecraftBiomeTypes2["Swampland"] = "minecraft:swampland";
      MinecraftBiomeTypes2["SwamplandMutated"] = "minecraft:swampland_mutated";
      MinecraftBiomeTypes2["Taiga"] = "minecraft:taiga";
      MinecraftBiomeTypes2["TaigaHills"] = "minecraft:taiga_hills";
      MinecraftBiomeTypes2["TaigaMutated"] = "minecraft:taiga_mutated";
      MinecraftBiomeTypes2["TheEnd"] = "minecraft:the_end";
      MinecraftBiomeTypes2["WarmOcean"] = "minecraft:warm_ocean";
      MinecraftBiomeTypes2["WarpedForest"] = "minecraft:warped_forest";
      return MinecraftBiomeTypes2;
    })(MinecraftBiomeTypes || {});
    MinecraftBlockTypes = ((MinecraftBlockTypes2) => {
      MinecraftBlockTypes2["AcaciaButton"] = "minecraft:acacia_button";
      MinecraftBlockTypes2["AcaciaDoor"] = "minecraft:acacia_door";
      MinecraftBlockTypes2["AcaciaDoubleSlab"] = "minecraft:acacia_double_slab";
      MinecraftBlockTypes2["AcaciaFence"] = "minecraft:acacia_fence";
      MinecraftBlockTypes2["AcaciaFenceGate"] = "minecraft:acacia_fence_gate";
      MinecraftBlockTypes2["AcaciaHangingSign"] = "minecraft:acacia_hanging_sign";
      MinecraftBlockTypes2["AcaciaLeaves"] = "minecraft:acacia_leaves";
      MinecraftBlockTypes2["AcaciaLog"] = "minecraft:acacia_log";
      MinecraftBlockTypes2["AcaciaPlanks"] = "minecraft:acacia_planks";
      MinecraftBlockTypes2["AcaciaPressurePlate"] = "minecraft:acacia_pressure_plate";
      MinecraftBlockTypes2["AcaciaSapling"] = "minecraft:acacia_sapling";
      MinecraftBlockTypes2["AcaciaShelf"] = "minecraft:acacia_shelf";
      MinecraftBlockTypes2["AcaciaSlab"] = "minecraft:acacia_slab";
      MinecraftBlockTypes2["AcaciaStairs"] = "minecraft:acacia_stairs";
      MinecraftBlockTypes2["AcaciaStandingSign"] = "minecraft:acacia_standing_sign";
      MinecraftBlockTypes2["AcaciaTrapdoor"] = "minecraft:acacia_trapdoor";
      MinecraftBlockTypes2["AcaciaWallSign"] = "minecraft:acacia_wall_sign";
      MinecraftBlockTypes2["AcaciaWood"] = "minecraft:acacia_wood";
      MinecraftBlockTypes2["ActivatorRail"] = "minecraft:activator_rail";
      MinecraftBlockTypes2["Air"] = "minecraft:air";
      MinecraftBlockTypes2["Allium"] = "minecraft:allium";
      MinecraftBlockTypes2["Allow"] = "minecraft:allow";
      MinecraftBlockTypes2["AmethystBlock"] = "minecraft:amethyst_block";
      MinecraftBlockTypes2["AmethystCluster"] = "minecraft:amethyst_cluster";
      MinecraftBlockTypes2["AncientDebris"] = "minecraft:ancient_debris";
      MinecraftBlockTypes2["Andesite"] = "minecraft:andesite";
      MinecraftBlockTypes2["AndesiteDoubleSlab"] = "minecraft:andesite_double_slab";
      MinecraftBlockTypes2["AndesiteSlab"] = "minecraft:andesite_slab";
      MinecraftBlockTypes2["AndesiteStairs"] = "minecraft:andesite_stairs";
      MinecraftBlockTypes2["AndesiteWall"] = "minecraft:andesite_wall";
      MinecraftBlockTypes2["Anvil"] = "minecraft:anvil";
      MinecraftBlockTypes2["Azalea"] = "minecraft:azalea";
      MinecraftBlockTypes2["AzaleaLeaves"] = "minecraft:azalea_leaves";
      MinecraftBlockTypes2["AzaleaLeavesFlowered"] = "minecraft:azalea_leaves_flowered";
      MinecraftBlockTypes2["AzureBluet"] = "minecraft:azure_bluet";
      MinecraftBlockTypes2["Bamboo"] = "minecraft:bamboo";
      MinecraftBlockTypes2["BambooBlock"] = "minecraft:bamboo_block";
      MinecraftBlockTypes2["BambooButton"] = "minecraft:bamboo_button";
      MinecraftBlockTypes2["BambooDoor"] = "minecraft:bamboo_door";
      MinecraftBlockTypes2["BambooDoubleSlab"] = "minecraft:bamboo_double_slab";
      MinecraftBlockTypes2["BambooFence"] = "minecraft:bamboo_fence";
      MinecraftBlockTypes2["BambooFenceGate"] = "minecraft:bamboo_fence_gate";
      MinecraftBlockTypes2["BambooHangingSign"] = "minecraft:bamboo_hanging_sign";
      MinecraftBlockTypes2["BambooMosaic"] = "minecraft:bamboo_mosaic";
      MinecraftBlockTypes2["BambooMosaicDoubleSlab"] = "minecraft:bamboo_mosaic_double_slab";
      MinecraftBlockTypes2["BambooMosaicSlab"] = "minecraft:bamboo_mosaic_slab";
      MinecraftBlockTypes2["BambooMosaicStairs"] = "minecraft:bamboo_mosaic_stairs";
      MinecraftBlockTypes2["BambooPlanks"] = "minecraft:bamboo_planks";
      MinecraftBlockTypes2["BambooPressurePlate"] = "minecraft:bamboo_pressure_plate";
      MinecraftBlockTypes2["BambooSapling"] = "minecraft:bamboo_sapling";
      MinecraftBlockTypes2["BambooShelf"] = "minecraft:bamboo_shelf";
      MinecraftBlockTypes2["BambooSlab"] = "minecraft:bamboo_slab";
      MinecraftBlockTypes2["BambooStairs"] = "minecraft:bamboo_stairs";
      MinecraftBlockTypes2["BambooStandingSign"] = "minecraft:bamboo_standing_sign";
      MinecraftBlockTypes2["BambooTrapdoor"] = "minecraft:bamboo_trapdoor";
      MinecraftBlockTypes2["BambooWallSign"] = "minecraft:bamboo_wall_sign";
      MinecraftBlockTypes2["Barrel"] = "minecraft:barrel";
      MinecraftBlockTypes2["Barrier"] = "minecraft:barrier";
      MinecraftBlockTypes2["Basalt"] = "minecraft:basalt";
      MinecraftBlockTypes2["Beacon"] = "minecraft:beacon";
      MinecraftBlockTypes2["Bed"] = "minecraft:bed";
      MinecraftBlockTypes2["Bedrock"] = "minecraft:bedrock";
      MinecraftBlockTypes2["BeeNest"] = "minecraft:bee_nest";
      MinecraftBlockTypes2["Beehive"] = "minecraft:beehive";
      MinecraftBlockTypes2["Beetroot"] = "minecraft:beetroot";
      MinecraftBlockTypes2["Bell"] = "minecraft:bell";
      MinecraftBlockTypes2["BigDripleaf"] = "minecraft:big_dripleaf";
      MinecraftBlockTypes2["BirchButton"] = "minecraft:birch_button";
      MinecraftBlockTypes2["BirchDoor"] = "minecraft:birch_door";
      MinecraftBlockTypes2["BirchDoubleSlab"] = "minecraft:birch_double_slab";
      MinecraftBlockTypes2["BirchFence"] = "minecraft:birch_fence";
      MinecraftBlockTypes2["BirchFenceGate"] = "minecraft:birch_fence_gate";
      MinecraftBlockTypes2["BirchHangingSign"] = "minecraft:birch_hanging_sign";
      MinecraftBlockTypes2["BirchLeaves"] = "minecraft:birch_leaves";
      MinecraftBlockTypes2["BirchLog"] = "minecraft:birch_log";
      MinecraftBlockTypes2["BirchPlanks"] = "minecraft:birch_planks";
      MinecraftBlockTypes2["BirchPressurePlate"] = "minecraft:birch_pressure_plate";
      MinecraftBlockTypes2["BirchSapling"] = "minecraft:birch_sapling";
      MinecraftBlockTypes2["BirchShelf"] = "minecraft:birch_shelf";
      MinecraftBlockTypes2["BirchSlab"] = "minecraft:birch_slab";
      MinecraftBlockTypes2["BirchStairs"] = "minecraft:birch_stairs";
      MinecraftBlockTypes2["BirchStandingSign"] = "minecraft:birch_standing_sign";
      MinecraftBlockTypes2["BirchTrapdoor"] = "minecraft:birch_trapdoor";
      MinecraftBlockTypes2["BirchWallSign"] = "minecraft:birch_wall_sign";
      MinecraftBlockTypes2["BirchWood"] = "minecraft:birch_wood";
      MinecraftBlockTypes2["BlackCandle"] = "minecraft:black_candle";
      MinecraftBlockTypes2["BlackCandleCake"] = "minecraft:black_candle_cake";
      MinecraftBlockTypes2["BlackCarpet"] = "minecraft:black_carpet";
      MinecraftBlockTypes2["BlackConcrete"] = "minecraft:black_concrete";
      MinecraftBlockTypes2["BlackConcretePowder"] = "minecraft:black_concrete_powder";
      MinecraftBlockTypes2["BlackGlazedTerracotta"] = "minecraft:black_glazed_terracotta";
      MinecraftBlockTypes2["BlackShulkerBox"] = "minecraft:black_shulker_box";
      MinecraftBlockTypes2["BlackStainedGlass"] = "minecraft:black_stained_glass";
      MinecraftBlockTypes2["BlackStainedGlassPane"] = "minecraft:black_stained_glass_pane";
      MinecraftBlockTypes2["BlackTerracotta"] = "minecraft:black_terracotta";
      MinecraftBlockTypes2["BlackWool"] = "minecraft:black_wool";
      MinecraftBlockTypes2["BlackWoolDoubleSlab"] = "minecraft:black_wool_double_slab";
      MinecraftBlockTypes2["BlackWoolSlab"] = "minecraft:black_wool_slab";
      MinecraftBlockTypes2["BlackWoolStairs"] = "minecraft:black_wool_stairs";
      MinecraftBlockTypes2["Blackstone"] = "minecraft:blackstone";
      MinecraftBlockTypes2["BlackstoneDoubleSlab"] = "minecraft:blackstone_double_slab";
      MinecraftBlockTypes2["BlackstoneSlab"] = "minecraft:blackstone_slab";
      MinecraftBlockTypes2["BlackstoneStairs"] = "minecraft:blackstone_stairs";
      MinecraftBlockTypes2["BlackstoneWall"] = "minecraft:blackstone_wall";
      MinecraftBlockTypes2["BlastFurnace"] = "minecraft:blast_furnace";
      MinecraftBlockTypes2["BlueCandle"] = "minecraft:blue_candle";
      MinecraftBlockTypes2["BlueCandleCake"] = "minecraft:blue_candle_cake";
      MinecraftBlockTypes2["BlueCarpet"] = "minecraft:blue_carpet";
      MinecraftBlockTypes2["BlueConcrete"] = "minecraft:blue_concrete";
      MinecraftBlockTypes2["BlueConcretePowder"] = "minecraft:blue_concrete_powder";
      MinecraftBlockTypes2["BlueGlazedTerracotta"] = "minecraft:blue_glazed_terracotta";
      MinecraftBlockTypes2["BlueIce"] = "minecraft:blue_ice";
      MinecraftBlockTypes2["BlueOrchid"] = "minecraft:blue_orchid";
      MinecraftBlockTypes2["BlueShulkerBox"] = "minecraft:blue_shulker_box";
      MinecraftBlockTypes2["BlueStainedGlass"] = "minecraft:blue_stained_glass";
      MinecraftBlockTypes2["BlueStainedGlassPane"] = "minecraft:blue_stained_glass_pane";
      MinecraftBlockTypes2["BlueTerracotta"] = "minecraft:blue_terracotta";
      MinecraftBlockTypes2["BlueWool"] = "minecraft:blue_wool";
      MinecraftBlockTypes2["BlueWoolDoubleSlab"] = "minecraft:blue_wool_double_slab";
      MinecraftBlockTypes2["BlueWoolSlab"] = "minecraft:blue_wool_slab";
      MinecraftBlockTypes2["BlueWoolStairs"] = "minecraft:blue_wool_stairs";
      MinecraftBlockTypes2["BoneBlock"] = "minecraft:bone_block";
      MinecraftBlockTypes2["Bookshelf"] = "minecraft:bookshelf";
      MinecraftBlockTypes2["BorderBlock"] = "minecraft:border_block";
      MinecraftBlockTypes2["BrainCoral"] = "minecraft:brain_coral";
      MinecraftBlockTypes2["BrainCoralBlock"] = "minecraft:brain_coral_block";
      MinecraftBlockTypes2["BrainCoralFan"] = "minecraft:brain_coral_fan";
      MinecraftBlockTypes2["BrainCoralWallFan"] = "minecraft:brain_coral_wall_fan";
      MinecraftBlockTypes2["BrewingStand"] = "minecraft:brewing_stand";
      MinecraftBlockTypes2["BrickBlock"] = "minecraft:brick_block";
      MinecraftBlockTypes2["BrickDoubleSlab"] = "minecraft:brick_double_slab";
      MinecraftBlockTypes2["BrickSlab"] = "minecraft:brick_slab";
      MinecraftBlockTypes2["BrickStairs"] = "minecraft:brick_stairs";
      MinecraftBlockTypes2["BrickWall"] = "minecraft:brick_wall";
      MinecraftBlockTypes2["BrownCandle"] = "minecraft:brown_candle";
      MinecraftBlockTypes2["BrownCandleCake"] = "minecraft:brown_candle_cake";
      MinecraftBlockTypes2["BrownCarpet"] = "minecraft:brown_carpet";
      MinecraftBlockTypes2["BrownConcrete"] = "minecraft:brown_concrete";
      MinecraftBlockTypes2["BrownConcretePowder"] = "minecraft:brown_concrete_powder";
      MinecraftBlockTypes2["BrownGlazedTerracotta"] = "minecraft:brown_glazed_terracotta";
      MinecraftBlockTypes2["BrownMushroom"] = "minecraft:brown_mushroom";
      MinecraftBlockTypes2["BrownMushroomBlock"] = "minecraft:brown_mushroom_block";
      MinecraftBlockTypes2["BrownShulkerBox"] = "minecraft:brown_shulker_box";
      MinecraftBlockTypes2["BrownStainedGlass"] = "minecraft:brown_stained_glass";
      MinecraftBlockTypes2["BrownStainedGlassPane"] = "minecraft:brown_stained_glass_pane";
      MinecraftBlockTypes2["BrownTerracotta"] = "minecraft:brown_terracotta";
      MinecraftBlockTypes2["BrownWool"] = "minecraft:brown_wool";
      MinecraftBlockTypes2["BrownWoolDoubleSlab"] = "minecraft:brown_wool_double_slab";
      MinecraftBlockTypes2["BrownWoolSlab"] = "minecraft:brown_wool_slab";
      MinecraftBlockTypes2["BrownWoolStairs"] = "minecraft:brown_wool_stairs";
      MinecraftBlockTypes2["BubbleColumn"] = "minecraft:bubble_column";
      MinecraftBlockTypes2["BubbleCoral"] = "minecraft:bubble_coral";
      MinecraftBlockTypes2["BubbleCoralBlock"] = "minecraft:bubble_coral_block";
      MinecraftBlockTypes2["BubbleCoralFan"] = "minecraft:bubble_coral_fan";
      MinecraftBlockTypes2["BubbleCoralWallFan"] = "minecraft:bubble_coral_wall_fan";
      MinecraftBlockTypes2["BuddingAmethyst"] = "minecraft:budding_amethyst";
      MinecraftBlockTypes2["Bush"] = "minecraft:bush";
      MinecraftBlockTypes2["Cactus"] = "minecraft:cactus";
      MinecraftBlockTypes2["CactusFlower"] = "minecraft:cactus_flower";
      MinecraftBlockTypes2["Cake"] = "minecraft:cake";
      MinecraftBlockTypes2["Calcite"] = "minecraft:calcite";
      MinecraftBlockTypes2["CalibratedSculkSensor"] = "minecraft:calibrated_sculk_sensor";
      MinecraftBlockTypes2["Camera"] = "minecraft:camera";
      MinecraftBlockTypes2["Campfire"] = "minecraft:campfire";
      MinecraftBlockTypes2["Candle"] = "minecraft:candle";
      MinecraftBlockTypes2["CandleCake"] = "minecraft:candle_cake";
      MinecraftBlockTypes2["Carrots"] = "minecraft:carrots";
      MinecraftBlockTypes2["CartographyTable"] = "minecraft:cartography_table";
      MinecraftBlockTypes2["CarvedPumpkin"] = "minecraft:carved_pumpkin";
      MinecraftBlockTypes2["Cauldron"] = "minecraft:cauldron";
      MinecraftBlockTypes2["CaveVines"] = "minecraft:cave_vines";
      MinecraftBlockTypes2["CaveVinesBodyWithBerries"] = "minecraft:cave_vines_body_with_berries";
      MinecraftBlockTypes2["CaveVinesHeadWithBerries"] = "minecraft:cave_vines_head_with_berries";
      MinecraftBlockTypes2["ChainCommandBlock"] = "minecraft:chain_command_block";
      MinecraftBlockTypes2["ChemicalHeat"] = "minecraft:chemical_heat";
      MinecraftBlockTypes2["CherryButton"] = "minecraft:cherry_button";
      MinecraftBlockTypes2["CherryDoor"] = "minecraft:cherry_door";
      MinecraftBlockTypes2["CherryDoubleSlab"] = "minecraft:cherry_double_slab";
      MinecraftBlockTypes2["CherryFence"] = "minecraft:cherry_fence";
      MinecraftBlockTypes2["CherryFenceGate"] = "minecraft:cherry_fence_gate";
      MinecraftBlockTypes2["CherryHangingSign"] = "minecraft:cherry_hanging_sign";
      MinecraftBlockTypes2["CherryLeaves"] = "minecraft:cherry_leaves";
      MinecraftBlockTypes2["CherryLog"] = "minecraft:cherry_log";
      MinecraftBlockTypes2["CherryPlanks"] = "minecraft:cherry_planks";
      MinecraftBlockTypes2["CherryPressurePlate"] = "minecraft:cherry_pressure_plate";
      MinecraftBlockTypes2["CherrySapling"] = "minecraft:cherry_sapling";
      MinecraftBlockTypes2["CherryShelf"] = "minecraft:cherry_shelf";
      MinecraftBlockTypes2["CherrySlab"] = "minecraft:cherry_slab";
      MinecraftBlockTypes2["CherryStairs"] = "minecraft:cherry_stairs";
      MinecraftBlockTypes2["CherryStandingSign"] = "minecraft:cherry_standing_sign";
      MinecraftBlockTypes2["CherryTrapdoor"] = "minecraft:cherry_trapdoor";
      MinecraftBlockTypes2["CherryWallSign"] = "minecraft:cherry_wall_sign";
      MinecraftBlockTypes2["CherryWood"] = "minecraft:cherry_wood";
      MinecraftBlockTypes2["Chest"] = "minecraft:chest";
      MinecraftBlockTypes2["ChippedAnvil"] = "minecraft:chipped_anvil";
      MinecraftBlockTypes2["ChiseledBookshelf"] = "minecraft:chiseled_bookshelf";
      MinecraftBlockTypes2["ChiseledCinnabar"] = "minecraft:chiseled_cinnabar";
      MinecraftBlockTypes2["ChiseledCopper"] = "minecraft:chiseled_copper";
      MinecraftBlockTypes2["ChiseledDeepslate"] = "minecraft:chiseled_deepslate";
      MinecraftBlockTypes2["ChiseledNetherBricks"] = "minecraft:chiseled_nether_bricks";
      MinecraftBlockTypes2["ChiseledPolishedBlackstone"] = "minecraft:chiseled_polished_blackstone";
      MinecraftBlockTypes2["ChiseledQuartzBlock"] = "minecraft:chiseled_quartz_block";
      MinecraftBlockTypes2["ChiseledRedSandstone"] = "minecraft:chiseled_red_sandstone";
      MinecraftBlockTypes2["ChiseledResinBricks"] = "minecraft:chiseled_resin_bricks";
      MinecraftBlockTypes2["ChiseledSandstone"] = "minecraft:chiseled_sandstone";
      MinecraftBlockTypes2["ChiseledStoneBricks"] = "minecraft:chiseled_stone_bricks";
      MinecraftBlockTypes2["ChiseledSulfur"] = "minecraft:chiseled_sulfur";
      MinecraftBlockTypes2["ChiseledTuff"] = "minecraft:chiseled_tuff";
      MinecraftBlockTypes2["ChiseledTuffBricks"] = "minecraft:chiseled_tuff_bricks";
      MinecraftBlockTypes2["ChorusFlower"] = "minecraft:chorus_flower";
      MinecraftBlockTypes2["ChorusPlant"] = "minecraft:chorus_plant";
      MinecraftBlockTypes2["Cinnabar"] = "minecraft:cinnabar";
      MinecraftBlockTypes2["CinnabarBrickDoubleSlab"] = "minecraft:cinnabar_brick_double_slab";
      MinecraftBlockTypes2["CinnabarBrickSlab"] = "minecraft:cinnabar_brick_slab";
      MinecraftBlockTypes2["CinnabarBrickStairs"] = "minecraft:cinnabar_brick_stairs";
      MinecraftBlockTypes2["CinnabarBrickWall"] = "minecraft:cinnabar_brick_wall";
      MinecraftBlockTypes2["CinnabarBricks"] = "minecraft:cinnabar_bricks";
      MinecraftBlockTypes2["CinnabarDoubleSlab"] = "minecraft:cinnabar_double_slab";
      MinecraftBlockTypes2["CinnabarSlab"] = "minecraft:cinnabar_slab";
      MinecraftBlockTypes2["CinnabarStairs"] = "minecraft:cinnabar_stairs";
      MinecraftBlockTypes2["CinnabarWall"] = "minecraft:cinnabar_wall";
      MinecraftBlockTypes2["Clay"] = "minecraft:clay";
      MinecraftBlockTypes2["ClosedEyeblossom"] = "minecraft:closed_eyeblossom";
      MinecraftBlockTypes2["CoalBlock"] = "minecraft:coal_block";
      MinecraftBlockTypes2["CoalOre"] = "minecraft:coal_ore";
      MinecraftBlockTypes2["CoarseDirt"] = "minecraft:coarse_dirt";
      MinecraftBlockTypes2["CobbledDeepslate"] = "minecraft:cobbled_deepslate";
      MinecraftBlockTypes2["CobbledDeepslateDoubleSlab"] = "minecraft:cobbled_deepslate_double_slab";
      MinecraftBlockTypes2["CobbledDeepslateSlab"] = "minecraft:cobbled_deepslate_slab";
      MinecraftBlockTypes2["CobbledDeepslateStairs"] = "minecraft:cobbled_deepslate_stairs";
      MinecraftBlockTypes2["CobbledDeepslateWall"] = "minecraft:cobbled_deepslate_wall";
      MinecraftBlockTypes2["Cobblestone"] = "minecraft:cobblestone";
      MinecraftBlockTypes2["CobblestoneDoubleSlab"] = "minecraft:cobblestone_double_slab";
      MinecraftBlockTypes2["CobblestoneSlab"] = "minecraft:cobblestone_slab";
      MinecraftBlockTypes2["CobblestoneWall"] = "minecraft:cobblestone_wall";
      MinecraftBlockTypes2["Cocoa"] = "minecraft:cocoa";
      MinecraftBlockTypes2["ColoredTorchBlue"] = "minecraft:colored_torch_blue";
      MinecraftBlockTypes2["ColoredTorchGreen"] = "minecraft:colored_torch_green";
      MinecraftBlockTypes2["ColoredTorchPurple"] = "minecraft:colored_torch_purple";
      MinecraftBlockTypes2["ColoredTorchRed"] = "minecraft:colored_torch_red";
      MinecraftBlockTypes2["CommandBlock"] = "minecraft:command_block";
      MinecraftBlockTypes2["Composter"] = "minecraft:composter";
      MinecraftBlockTypes2["CompoundCreator"] = "minecraft:compound_creator";
      MinecraftBlockTypes2["Conduit"] = "minecraft:conduit";
      MinecraftBlockTypes2["CopperBars"] = "minecraft:copper_bars";
      MinecraftBlockTypes2["CopperBlock"] = "minecraft:copper_block";
      MinecraftBlockTypes2["CopperBulb"] = "minecraft:copper_bulb";
      MinecraftBlockTypes2["CopperChain"] = "minecraft:copper_chain";
      MinecraftBlockTypes2["CopperChest"] = "minecraft:copper_chest";
      MinecraftBlockTypes2["CopperDoor"] = "minecraft:copper_door";
      MinecraftBlockTypes2["CopperGolemStatue"] = "minecraft:copper_golem_statue";
      MinecraftBlockTypes2["CopperGrate"] = "minecraft:copper_grate";
      MinecraftBlockTypes2["CopperLantern"] = "minecraft:copper_lantern";
      MinecraftBlockTypes2["CopperOre"] = "minecraft:copper_ore";
      MinecraftBlockTypes2["CopperTorch"] = "minecraft:copper_torch";
      MinecraftBlockTypes2["CopperTrapdoor"] = "minecraft:copper_trapdoor";
      MinecraftBlockTypes2["Cornflower"] = "minecraft:cornflower";
      MinecraftBlockTypes2["CrackedDeepslateBricks"] = "minecraft:cracked_deepslate_bricks";
      MinecraftBlockTypes2["CrackedDeepslateTiles"] = "minecraft:cracked_deepslate_tiles";
      MinecraftBlockTypes2["CrackedNetherBricks"] = "minecraft:cracked_nether_bricks";
      MinecraftBlockTypes2["CrackedPolishedBlackstoneBricks"] = "minecraft:cracked_polished_blackstone_bricks";
      MinecraftBlockTypes2["CrackedStoneBricks"] = "minecraft:cracked_stone_bricks";
      MinecraftBlockTypes2["Crafter"] = "minecraft:crafter";
      MinecraftBlockTypes2["CraftingTable"] = "minecraft:crafting_table";
      MinecraftBlockTypes2["CreakingHeart"] = "minecraft:creaking_heart";
      MinecraftBlockTypes2["CreeperHead"] = "minecraft:creeper_head";
      MinecraftBlockTypes2["CrimsonButton"] = "minecraft:crimson_button";
      MinecraftBlockTypes2["CrimsonDoor"] = "minecraft:crimson_door";
      MinecraftBlockTypes2["CrimsonDoubleSlab"] = "minecraft:crimson_double_slab";
      MinecraftBlockTypes2["CrimsonFence"] = "minecraft:crimson_fence";
      MinecraftBlockTypes2["CrimsonFenceGate"] = "minecraft:crimson_fence_gate";
      MinecraftBlockTypes2["CrimsonFungus"] = "minecraft:crimson_fungus";
      MinecraftBlockTypes2["CrimsonHangingSign"] = "minecraft:crimson_hanging_sign";
      MinecraftBlockTypes2["CrimsonHyphae"] = "minecraft:crimson_hyphae";
      MinecraftBlockTypes2["CrimsonNylium"] = "minecraft:crimson_nylium";
      MinecraftBlockTypes2["CrimsonPlanks"] = "minecraft:crimson_planks";
      MinecraftBlockTypes2["CrimsonPressurePlate"] = "minecraft:crimson_pressure_plate";
      MinecraftBlockTypes2["CrimsonRoots"] = "minecraft:crimson_roots";
      MinecraftBlockTypes2["CrimsonShelf"] = "minecraft:crimson_shelf";
      MinecraftBlockTypes2["CrimsonSlab"] = "minecraft:crimson_slab";
      MinecraftBlockTypes2["CrimsonStairs"] = "minecraft:crimson_stairs";
      MinecraftBlockTypes2["CrimsonStandingSign"] = "minecraft:crimson_standing_sign";
      MinecraftBlockTypes2["CrimsonStem"] = "minecraft:crimson_stem";
      MinecraftBlockTypes2["CrimsonTrapdoor"] = "minecraft:crimson_trapdoor";
      MinecraftBlockTypes2["CrimsonWallSign"] = "minecraft:crimson_wall_sign";
      MinecraftBlockTypes2["CryingObsidian"] = "minecraft:crying_obsidian";
      MinecraftBlockTypes2["CutCopper"] = "minecraft:cut_copper";
      MinecraftBlockTypes2["CutCopperSlab"] = "minecraft:cut_copper_slab";
      MinecraftBlockTypes2["CutCopperStairs"] = "minecraft:cut_copper_stairs";
      MinecraftBlockTypes2["CutRedSandstone"] = "minecraft:cut_red_sandstone";
      MinecraftBlockTypes2["CutRedSandstoneDoubleSlab"] = "minecraft:cut_red_sandstone_double_slab";
      MinecraftBlockTypes2["CutRedSandstoneSlab"] = "minecraft:cut_red_sandstone_slab";
      MinecraftBlockTypes2["CutSandstone"] = "minecraft:cut_sandstone";
      MinecraftBlockTypes2["CutSandstoneDoubleSlab"] = "minecraft:cut_sandstone_double_slab";
      MinecraftBlockTypes2["CutSandstoneSlab"] = "minecraft:cut_sandstone_slab";
      MinecraftBlockTypes2["CyanCandle"] = "minecraft:cyan_candle";
      MinecraftBlockTypes2["CyanCandleCake"] = "minecraft:cyan_candle_cake";
      MinecraftBlockTypes2["CyanCarpet"] = "minecraft:cyan_carpet";
      MinecraftBlockTypes2["CyanConcrete"] = "minecraft:cyan_concrete";
      MinecraftBlockTypes2["CyanConcretePowder"] = "minecraft:cyan_concrete_powder";
      MinecraftBlockTypes2["CyanGlazedTerracotta"] = "minecraft:cyan_glazed_terracotta";
      MinecraftBlockTypes2["CyanShulkerBox"] = "minecraft:cyan_shulker_box";
      MinecraftBlockTypes2["CyanStainedGlass"] = "minecraft:cyan_stained_glass";
      MinecraftBlockTypes2["CyanStainedGlassPane"] = "minecraft:cyan_stained_glass_pane";
      MinecraftBlockTypes2["CyanTerracotta"] = "minecraft:cyan_terracotta";
      MinecraftBlockTypes2["CyanWool"] = "minecraft:cyan_wool";
      MinecraftBlockTypes2["CyanWoolDoubleSlab"] = "minecraft:cyan_wool_double_slab";
      MinecraftBlockTypes2["CyanWoolSlab"] = "minecraft:cyan_wool_slab";
      MinecraftBlockTypes2["CyanWoolStairs"] = "minecraft:cyan_wool_stairs";
      MinecraftBlockTypes2["DamagedAnvil"] = "minecraft:damaged_anvil";
      MinecraftBlockTypes2["Dandelion"] = "minecraft:dandelion";
      MinecraftBlockTypes2["DarkOakButton"] = "minecraft:dark_oak_button";
      MinecraftBlockTypes2["DarkOakDoor"] = "minecraft:dark_oak_door";
      MinecraftBlockTypes2["DarkOakDoubleSlab"] = "minecraft:dark_oak_double_slab";
      MinecraftBlockTypes2["DarkOakFence"] = "minecraft:dark_oak_fence";
      MinecraftBlockTypes2["DarkOakFenceGate"] = "minecraft:dark_oak_fence_gate";
      MinecraftBlockTypes2["DarkOakHangingSign"] = "minecraft:dark_oak_hanging_sign";
      MinecraftBlockTypes2["DarkOakLeaves"] = "minecraft:dark_oak_leaves";
      MinecraftBlockTypes2["DarkOakLog"] = "minecraft:dark_oak_log";
      MinecraftBlockTypes2["DarkOakPlanks"] = "minecraft:dark_oak_planks";
      MinecraftBlockTypes2["DarkOakPressurePlate"] = "minecraft:dark_oak_pressure_plate";
      MinecraftBlockTypes2["DarkOakSapling"] = "minecraft:dark_oak_sapling";
      MinecraftBlockTypes2["DarkOakShelf"] = "minecraft:dark_oak_shelf";
      MinecraftBlockTypes2["DarkOakSlab"] = "minecraft:dark_oak_slab";
      MinecraftBlockTypes2["DarkOakStairs"] = "minecraft:dark_oak_stairs";
      MinecraftBlockTypes2["DarkOakTrapdoor"] = "minecraft:dark_oak_trapdoor";
      MinecraftBlockTypes2["DarkOakWood"] = "minecraft:dark_oak_wood";
      MinecraftBlockTypes2["DarkPrismarine"] = "minecraft:dark_prismarine";
      MinecraftBlockTypes2["DarkPrismarineDoubleSlab"] = "minecraft:dark_prismarine_double_slab";
      MinecraftBlockTypes2["DarkPrismarineSlab"] = "minecraft:dark_prismarine_slab";
      MinecraftBlockTypes2["DarkPrismarineStairs"] = "minecraft:dark_prismarine_stairs";
      MinecraftBlockTypes2["DarkoakStandingSign"] = "minecraft:darkoak_standing_sign";
      MinecraftBlockTypes2["DarkoakWallSign"] = "minecraft:darkoak_wall_sign";
      MinecraftBlockTypes2["DaylightDetector"] = "minecraft:daylight_detector";
      MinecraftBlockTypes2["DaylightDetectorInverted"] = "minecraft:daylight_detector_inverted";
      MinecraftBlockTypes2["DeadBrainCoral"] = "minecraft:dead_brain_coral";
      MinecraftBlockTypes2["DeadBrainCoralBlock"] = "minecraft:dead_brain_coral_block";
      MinecraftBlockTypes2["DeadBrainCoralFan"] = "minecraft:dead_brain_coral_fan";
      MinecraftBlockTypes2["DeadBrainCoralWallFan"] = "minecraft:dead_brain_coral_wall_fan";
      MinecraftBlockTypes2["DeadBubbleCoral"] = "minecraft:dead_bubble_coral";
      MinecraftBlockTypes2["DeadBubbleCoralBlock"] = "minecraft:dead_bubble_coral_block";
      MinecraftBlockTypes2["DeadBubbleCoralFan"] = "minecraft:dead_bubble_coral_fan";
      MinecraftBlockTypes2["DeadBubbleCoralWallFan"] = "minecraft:dead_bubble_coral_wall_fan";
      MinecraftBlockTypes2["DeadFireCoral"] = "minecraft:dead_fire_coral";
      MinecraftBlockTypes2["DeadFireCoralBlock"] = "minecraft:dead_fire_coral_block";
      MinecraftBlockTypes2["DeadFireCoralFan"] = "minecraft:dead_fire_coral_fan";
      MinecraftBlockTypes2["DeadFireCoralWallFan"] = "minecraft:dead_fire_coral_wall_fan";
      MinecraftBlockTypes2["DeadHornCoral"] = "minecraft:dead_horn_coral";
      MinecraftBlockTypes2["DeadHornCoralBlock"] = "minecraft:dead_horn_coral_block";
      MinecraftBlockTypes2["DeadHornCoralFan"] = "minecraft:dead_horn_coral_fan";
      MinecraftBlockTypes2["DeadHornCoralWallFan"] = "minecraft:dead_horn_coral_wall_fan";
      MinecraftBlockTypes2["DeadTubeCoral"] = "minecraft:dead_tube_coral";
      MinecraftBlockTypes2["DeadTubeCoralBlock"] = "minecraft:dead_tube_coral_block";
      MinecraftBlockTypes2["DeadTubeCoralFan"] = "minecraft:dead_tube_coral_fan";
      MinecraftBlockTypes2["DeadTubeCoralWallFan"] = "minecraft:dead_tube_coral_wall_fan";
      MinecraftBlockTypes2["Deadbush"] = "minecraft:deadbush";
      MinecraftBlockTypes2["DecoratedPot"] = "minecraft:decorated_pot";
      MinecraftBlockTypes2["Deepslate"] = "minecraft:deepslate";
      MinecraftBlockTypes2["DeepslateBrickDoubleSlab"] = "minecraft:deepslate_brick_double_slab";
      MinecraftBlockTypes2["DeepslateBrickSlab"] = "minecraft:deepslate_brick_slab";
      MinecraftBlockTypes2["DeepslateBrickStairs"] = "minecraft:deepslate_brick_stairs";
      MinecraftBlockTypes2["DeepslateBrickWall"] = "minecraft:deepslate_brick_wall";
      MinecraftBlockTypes2["DeepslateBricks"] = "minecraft:deepslate_bricks";
      MinecraftBlockTypes2["DeepslateCoalOre"] = "minecraft:deepslate_coal_ore";
      MinecraftBlockTypes2["DeepslateCopperOre"] = "minecraft:deepslate_copper_ore";
      MinecraftBlockTypes2["DeepslateDiamondOre"] = "minecraft:deepslate_diamond_ore";
      MinecraftBlockTypes2["DeepslateEmeraldOre"] = "minecraft:deepslate_emerald_ore";
      MinecraftBlockTypes2["DeepslateGoldOre"] = "minecraft:deepslate_gold_ore";
      MinecraftBlockTypes2["DeepslateIronOre"] = "minecraft:deepslate_iron_ore";
      MinecraftBlockTypes2["DeepslateLapisOre"] = "minecraft:deepslate_lapis_ore";
      MinecraftBlockTypes2["DeepslateRedstoneOre"] = "minecraft:deepslate_redstone_ore";
      MinecraftBlockTypes2["DeepslateTileDoubleSlab"] = "minecraft:deepslate_tile_double_slab";
      MinecraftBlockTypes2["DeepslateTileSlab"] = "minecraft:deepslate_tile_slab";
      MinecraftBlockTypes2["DeepslateTileStairs"] = "minecraft:deepslate_tile_stairs";
      MinecraftBlockTypes2["DeepslateTileWall"] = "minecraft:deepslate_tile_wall";
      MinecraftBlockTypes2["DeepslateTiles"] = "minecraft:deepslate_tiles";
      MinecraftBlockTypes2["Deny"] = "minecraft:deny";
      MinecraftBlockTypes2["DetectorRail"] = "minecraft:detector_rail";
      MinecraftBlockTypes2["DiamondBlock"] = "minecraft:diamond_block";
      MinecraftBlockTypes2["DiamondOre"] = "minecraft:diamond_ore";
      MinecraftBlockTypes2["Diorite"] = "minecraft:diorite";
      MinecraftBlockTypes2["DioriteDoubleSlab"] = "minecraft:diorite_double_slab";
      MinecraftBlockTypes2["DioriteSlab"] = "minecraft:diorite_slab";
      MinecraftBlockTypes2["DioriteStairs"] = "minecraft:diorite_stairs";
      MinecraftBlockTypes2["DioriteWall"] = "minecraft:diorite_wall";
      MinecraftBlockTypes2["Dirt"] = "minecraft:dirt";
      MinecraftBlockTypes2["DirtWithRoots"] = "minecraft:dirt_with_roots";
      MinecraftBlockTypes2["Dispenser"] = "minecraft:dispenser";
      MinecraftBlockTypes2["DoubleCutCopperSlab"] = "minecraft:double_cut_copper_slab";
      MinecraftBlockTypes2["DragonEgg"] = "minecraft:dragon_egg";
      MinecraftBlockTypes2["DragonHead"] = "minecraft:dragon_head";
      MinecraftBlockTypes2["DriedGhast"] = "minecraft:dried_ghast";
      MinecraftBlockTypes2["DriedKelpBlock"] = "minecraft:dried_kelp_block";
      MinecraftBlockTypes2["DripstoneBlock"] = "minecraft:dripstone_block";
      MinecraftBlockTypes2["Dropper"] = "minecraft:dropper";
      MinecraftBlockTypes2["Element0"] = "minecraft:element_0";
      MinecraftBlockTypes2["Element1"] = "minecraft:element_1";
      MinecraftBlockTypes2["Element10"] = "minecraft:element_10";
      MinecraftBlockTypes2["Element100"] = "minecraft:element_100";
      MinecraftBlockTypes2["Element101"] = "minecraft:element_101";
      MinecraftBlockTypes2["Element102"] = "minecraft:element_102";
      MinecraftBlockTypes2["Element103"] = "minecraft:element_103";
      MinecraftBlockTypes2["Element104"] = "minecraft:element_104";
      MinecraftBlockTypes2["Element105"] = "minecraft:element_105";
      MinecraftBlockTypes2["Element106"] = "minecraft:element_106";
      MinecraftBlockTypes2["Element107"] = "minecraft:element_107";
      MinecraftBlockTypes2["Element108"] = "minecraft:element_108";
      MinecraftBlockTypes2["Element109"] = "minecraft:element_109";
      MinecraftBlockTypes2["Element11"] = "minecraft:element_11";
      MinecraftBlockTypes2["Element110"] = "minecraft:element_110";
      MinecraftBlockTypes2["Element111"] = "minecraft:element_111";
      MinecraftBlockTypes2["Element112"] = "minecraft:element_112";
      MinecraftBlockTypes2["Element113"] = "minecraft:element_113";
      MinecraftBlockTypes2["Element114"] = "minecraft:element_114";
      MinecraftBlockTypes2["Element115"] = "minecraft:element_115";
      MinecraftBlockTypes2["Element116"] = "minecraft:element_116";
      MinecraftBlockTypes2["Element117"] = "minecraft:element_117";
      MinecraftBlockTypes2["Element118"] = "minecraft:element_118";
      MinecraftBlockTypes2["Element12"] = "minecraft:element_12";
      MinecraftBlockTypes2["Element13"] = "minecraft:element_13";
      MinecraftBlockTypes2["Element14"] = "minecraft:element_14";
      MinecraftBlockTypes2["Element15"] = "minecraft:element_15";
      MinecraftBlockTypes2["Element16"] = "minecraft:element_16";
      MinecraftBlockTypes2["Element17"] = "minecraft:element_17";
      MinecraftBlockTypes2["Element18"] = "minecraft:element_18";
      MinecraftBlockTypes2["Element19"] = "minecraft:element_19";
      MinecraftBlockTypes2["Element2"] = "minecraft:element_2";
      MinecraftBlockTypes2["Element20"] = "minecraft:element_20";
      MinecraftBlockTypes2["Element21"] = "minecraft:element_21";
      MinecraftBlockTypes2["Element22"] = "minecraft:element_22";
      MinecraftBlockTypes2["Element23"] = "minecraft:element_23";
      MinecraftBlockTypes2["Element24"] = "minecraft:element_24";
      MinecraftBlockTypes2["Element25"] = "minecraft:element_25";
      MinecraftBlockTypes2["Element26"] = "minecraft:element_26";
      MinecraftBlockTypes2["Element27"] = "minecraft:element_27";
      MinecraftBlockTypes2["Element28"] = "minecraft:element_28";
      MinecraftBlockTypes2["Element29"] = "minecraft:element_29";
      MinecraftBlockTypes2["Element3"] = "minecraft:element_3";
      MinecraftBlockTypes2["Element30"] = "minecraft:element_30";
      MinecraftBlockTypes2["Element31"] = "minecraft:element_31";
      MinecraftBlockTypes2["Element32"] = "minecraft:element_32";
      MinecraftBlockTypes2["Element33"] = "minecraft:element_33";
      MinecraftBlockTypes2["Element34"] = "minecraft:element_34";
      MinecraftBlockTypes2["Element35"] = "minecraft:element_35";
      MinecraftBlockTypes2["Element36"] = "minecraft:element_36";
      MinecraftBlockTypes2["Element37"] = "minecraft:element_37";
      MinecraftBlockTypes2["Element38"] = "minecraft:element_38";
      MinecraftBlockTypes2["Element39"] = "minecraft:element_39";
      MinecraftBlockTypes2["Element4"] = "minecraft:element_4";
      MinecraftBlockTypes2["Element40"] = "minecraft:element_40";
      MinecraftBlockTypes2["Element41"] = "minecraft:element_41";
      MinecraftBlockTypes2["Element42"] = "minecraft:element_42";
      MinecraftBlockTypes2["Element43"] = "minecraft:element_43";
      MinecraftBlockTypes2["Element44"] = "minecraft:element_44";
      MinecraftBlockTypes2["Element45"] = "minecraft:element_45";
      MinecraftBlockTypes2["Element46"] = "minecraft:element_46";
      MinecraftBlockTypes2["Element47"] = "minecraft:element_47";
      MinecraftBlockTypes2["Element48"] = "minecraft:element_48";
      MinecraftBlockTypes2["Element49"] = "minecraft:element_49";
      MinecraftBlockTypes2["Element5"] = "minecraft:element_5";
      MinecraftBlockTypes2["Element50"] = "minecraft:element_50";
      MinecraftBlockTypes2["Element51"] = "minecraft:element_51";
      MinecraftBlockTypes2["Element52"] = "minecraft:element_52";
      MinecraftBlockTypes2["Element53"] = "minecraft:element_53";
      MinecraftBlockTypes2["Element54"] = "minecraft:element_54";
      MinecraftBlockTypes2["Element55"] = "minecraft:element_55";
      MinecraftBlockTypes2["Element56"] = "minecraft:element_56";
      MinecraftBlockTypes2["Element57"] = "minecraft:element_57";
      MinecraftBlockTypes2["Element58"] = "minecraft:element_58";
      MinecraftBlockTypes2["Element59"] = "minecraft:element_59";
      MinecraftBlockTypes2["Element6"] = "minecraft:element_6";
      MinecraftBlockTypes2["Element60"] = "minecraft:element_60";
      MinecraftBlockTypes2["Element61"] = "minecraft:element_61";
      MinecraftBlockTypes2["Element62"] = "minecraft:element_62";
      MinecraftBlockTypes2["Element63"] = "minecraft:element_63";
      MinecraftBlockTypes2["Element64"] = "minecraft:element_64";
      MinecraftBlockTypes2["Element65"] = "minecraft:element_65";
      MinecraftBlockTypes2["Element66"] = "minecraft:element_66";
      MinecraftBlockTypes2["Element67"] = "minecraft:element_67";
      MinecraftBlockTypes2["Element68"] = "minecraft:element_68";
      MinecraftBlockTypes2["Element69"] = "minecraft:element_69";
      MinecraftBlockTypes2["Element7"] = "minecraft:element_7";
      MinecraftBlockTypes2["Element70"] = "minecraft:element_70";
      MinecraftBlockTypes2["Element71"] = "minecraft:element_71";
      MinecraftBlockTypes2["Element72"] = "minecraft:element_72";
      MinecraftBlockTypes2["Element73"] = "minecraft:element_73";
      MinecraftBlockTypes2["Element74"] = "minecraft:element_74";
      MinecraftBlockTypes2["Element75"] = "minecraft:element_75";
      MinecraftBlockTypes2["Element76"] = "minecraft:element_76";
      MinecraftBlockTypes2["Element77"] = "minecraft:element_77";
      MinecraftBlockTypes2["Element78"] = "minecraft:element_78";
      MinecraftBlockTypes2["Element79"] = "minecraft:element_79";
      MinecraftBlockTypes2["Element8"] = "minecraft:element_8";
      MinecraftBlockTypes2["Element80"] = "minecraft:element_80";
      MinecraftBlockTypes2["Element81"] = "minecraft:element_81";
      MinecraftBlockTypes2["Element82"] = "minecraft:element_82";
      MinecraftBlockTypes2["Element83"] = "minecraft:element_83";
      MinecraftBlockTypes2["Element84"] = "minecraft:element_84";
      MinecraftBlockTypes2["Element85"] = "minecraft:element_85";
      MinecraftBlockTypes2["Element86"] = "minecraft:element_86";
      MinecraftBlockTypes2["Element87"] = "minecraft:element_87";
      MinecraftBlockTypes2["Element88"] = "minecraft:element_88";
      MinecraftBlockTypes2["Element89"] = "minecraft:element_89";
      MinecraftBlockTypes2["Element9"] = "minecraft:element_9";
      MinecraftBlockTypes2["Element90"] = "minecraft:element_90";
      MinecraftBlockTypes2["Element91"] = "minecraft:element_91";
      MinecraftBlockTypes2["Element92"] = "minecraft:element_92";
      MinecraftBlockTypes2["Element93"] = "minecraft:element_93";
      MinecraftBlockTypes2["Element94"] = "minecraft:element_94";
      MinecraftBlockTypes2["Element95"] = "minecraft:element_95";
      MinecraftBlockTypes2["Element96"] = "minecraft:element_96";
      MinecraftBlockTypes2["Element97"] = "minecraft:element_97";
      MinecraftBlockTypes2["Element98"] = "minecraft:element_98";
      MinecraftBlockTypes2["Element99"] = "minecraft:element_99";
      MinecraftBlockTypes2["ElementConstructor"] = "minecraft:element_constructor";
      MinecraftBlockTypes2["EmeraldBlock"] = "minecraft:emerald_block";
      MinecraftBlockTypes2["EmeraldOre"] = "minecraft:emerald_ore";
      MinecraftBlockTypes2["EnchantingTable"] = "minecraft:enchanting_table";
      MinecraftBlockTypes2["EndBrickStairs"] = "minecraft:end_brick_stairs";
      MinecraftBlockTypes2["EndBricks"] = "minecraft:end_bricks";
      MinecraftBlockTypes2["EndPortal"] = "minecraft:end_portal";
      MinecraftBlockTypes2["EndPortalFrame"] = "minecraft:end_portal_frame";
      MinecraftBlockTypes2["EndRod"] = "minecraft:end_rod";
      MinecraftBlockTypes2["EndStone"] = "minecraft:end_stone";
      MinecraftBlockTypes2["EndStoneBrickDoubleSlab"] = "minecraft:end_stone_brick_double_slab";
      MinecraftBlockTypes2["EndStoneBrickSlab"] = "minecraft:end_stone_brick_slab";
      MinecraftBlockTypes2["EndStoneBrickWall"] = "minecraft:end_stone_brick_wall";
      MinecraftBlockTypes2["EnderChest"] = "minecraft:ender_chest";
      MinecraftBlockTypes2["ExposedChiseledCopper"] = "minecraft:exposed_chiseled_copper";
      MinecraftBlockTypes2["ExposedCopper"] = "minecraft:exposed_copper";
      MinecraftBlockTypes2["ExposedCopperBars"] = "minecraft:exposed_copper_bars";
      MinecraftBlockTypes2["ExposedCopperBulb"] = "minecraft:exposed_copper_bulb";
      MinecraftBlockTypes2["ExposedCopperChain"] = "minecraft:exposed_copper_chain";
      MinecraftBlockTypes2["ExposedCopperChest"] = "minecraft:exposed_copper_chest";
      MinecraftBlockTypes2["ExposedCopperDoor"] = "minecraft:exposed_copper_door";
      MinecraftBlockTypes2["ExposedCopperGolemStatue"] = "minecraft:exposed_copper_golem_statue";
      MinecraftBlockTypes2["ExposedCopperGrate"] = "minecraft:exposed_copper_grate";
      MinecraftBlockTypes2["ExposedCopperLantern"] = "minecraft:exposed_copper_lantern";
      MinecraftBlockTypes2["ExposedCopperTrapdoor"] = "minecraft:exposed_copper_trapdoor";
      MinecraftBlockTypes2["ExposedCutCopper"] = "minecraft:exposed_cut_copper";
      MinecraftBlockTypes2["ExposedCutCopperSlab"] = "minecraft:exposed_cut_copper_slab";
      MinecraftBlockTypes2["ExposedCutCopperStairs"] = "minecraft:exposed_cut_copper_stairs";
      MinecraftBlockTypes2["ExposedDoubleCutCopperSlab"] = "minecraft:exposed_double_cut_copper_slab";
      MinecraftBlockTypes2["ExposedLightningRod"] = "minecraft:exposed_lightning_rod";
      MinecraftBlockTypes2["Farmland"] = "minecraft:farmland";
      MinecraftBlockTypes2["FenceGate"] = "minecraft:fence_gate";
      MinecraftBlockTypes2["Fern"] = "minecraft:fern";
      MinecraftBlockTypes2["Fire"] = "minecraft:fire";
      MinecraftBlockTypes2["FireCoral"] = "minecraft:fire_coral";
      MinecraftBlockTypes2["FireCoralBlock"] = "minecraft:fire_coral_block";
      MinecraftBlockTypes2["FireCoralFan"] = "minecraft:fire_coral_fan";
      MinecraftBlockTypes2["FireCoralWallFan"] = "minecraft:fire_coral_wall_fan";
      MinecraftBlockTypes2["FireflyBush"] = "minecraft:firefly_bush";
      MinecraftBlockTypes2["FletchingTable"] = "minecraft:fletching_table";
      MinecraftBlockTypes2["FlowerPot"] = "minecraft:flower_pot";
      MinecraftBlockTypes2["FloweringAzalea"] = "minecraft:flowering_azalea";
      MinecraftBlockTypes2["FlowingLava"] = "minecraft:flowing_lava";
      MinecraftBlockTypes2["FlowingWater"] = "minecraft:flowing_water";
      MinecraftBlockTypes2["Frame"] = "minecraft:frame";
      MinecraftBlockTypes2["FrogSpawn"] = "minecraft:frog_spawn";
      MinecraftBlockTypes2["FrostedIce"] = "minecraft:frosted_ice";
      MinecraftBlockTypes2["Furnace"] = "minecraft:furnace";
      MinecraftBlockTypes2["GildedBlackstone"] = "minecraft:gilded_blackstone";
      MinecraftBlockTypes2["Glass"] = "minecraft:glass";
      MinecraftBlockTypes2["GlassPane"] = "minecraft:glass_pane";
      MinecraftBlockTypes2["GlowFrame"] = "minecraft:glow_frame";
      MinecraftBlockTypes2["GlowLichen"] = "minecraft:glow_lichen";
      MinecraftBlockTypes2["Glowstone"] = "minecraft:glowstone";
      MinecraftBlockTypes2["GoldBlock"] = "minecraft:gold_block";
      MinecraftBlockTypes2["GoldOre"] = "minecraft:gold_ore";
      MinecraftBlockTypes2["GoldenDandelion"] = "minecraft:golden_dandelion";
      MinecraftBlockTypes2["GoldenRail"] = "minecraft:golden_rail";
      MinecraftBlockTypes2["Granite"] = "minecraft:granite";
      MinecraftBlockTypes2["GraniteDoubleSlab"] = "minecraft:granite_double_slab";
      MinecraftBlockTypes2["GraniteSlab"] = "minecraft:granite_slab";
      MinecraftBlockTypes2["GraniteStairs"] = "minecraft:granite_stairs";
      MinecraftBlockTypes2["GraniteWall"] = "minecraft:granite_wall";
      MinecraftBlockTypes2["GrassBlock"] = "minecraft:grass_block";
      MinecraftBlockTypes2["GrassPath"] = "minecraft:grass_path";
      MinecraftBlockTypes2["Gravel"] = "minecraft:gravel";
      MinecraftBlockTypes2["GrayCandle"] = "minecraft:gray_candle";
      MinecraftBlockTypes2["GrayCandleCake"] = "minecraft:gray_candle_cake";
      MinecraftBlockTypes2["GrayCarpet"] = "minecraft:gray_carpet";
      MinecraftBlockTypes2["GrayConcrete"] = "minecraft:gray_concrete";
      MinecraftBlockTypes2["GrayConcretePowder"] = "minecraft:gray_concrete_powder";
      MinecraftBlockTypes2["GrayGlazedTerracotta"] = "minecraft:gray_glazed_terracotta";
      MinecraftBlockTypes2["GrayShulkerBox"] = "minecraft:gray_shulker_box";
      MinecraftBlockTypes2["GrayStainedGlass"] = "minecraft:gray_stained_glass";
      MinecraftBlockTypes2["GrayStainedGlassPane"] = "minecraft:gray_stained_glass_pane";
      MinecraftBlockTypes2["GrayTerracotta"] = "minecraft:gray_terracotta";
      MinecraftBlockTypes2["GrayWool"] = "minecraft:gray_wool";
      MinecraftBlockTypes2["GrayWoolDoubleSlab"] = "minecraft:gray_wool_double_slab";
      MinecraftBlockTypes2["GrayWoolSlab"] = "minecraft:gray_wool_slab";
      MinecraftBlockTypes2["GrayWoolStairs"] = "minecraft:gray_wool_stairs";
      MinecraftBlockTypes2["GreenCandle"] = "minecraft:green_candle";
      MinecraftBlockTypes2["GreenCandleCake"] = "minecraft:green_candle_cake";
      MinecraftBlockTypes2["GreenCarpet"] = "minecraft:green_carpet";
      MinecraftBlockTypes2["GreenConcrete"] = "minecraft:green_concrete";
      MinecraftBlockTypes2["GreenConcretePowder"] = "minecraft:green_concrete_powder";
      MinecraftBlockTypes2["GreenGlazedTerracotta"] = "minecraft:green_glazed_terracotta";
      MinecraftBlockTypes2["GreenShulkerBox"] = "minecraft:green_shulker_box";
      MinecraftBlockTypes2["GreenStainedGlass"] = "minecraft:green_stained_glass";
      MinecraftBlockTypes2["GreenStainedGlassPane"] = "minecraft:green_stained_glass_pane";
      MinecraftBlockTypes2["GreenTerracotta"] = "minecraft:green_terracotta";
      MinecraftBlockTypes2["GreenWool"] = "minecraft:green_wool";
      MinecraftBlockTypes2["GreenWoolDoubleSlab"] = "minecraft:green_wool_double_slab";
      MinecraftBlockTypes2["GreenWoolSlab"] = "minecraft:green_wool_slab";
      MinecraftBlockTypes2["GreenWoolStairs"] = "minecraft:green_wool_stairs";
      MinecraftBlockTypes2["Grindstone"] = "minecraft:grindstone";
      MinecraftBlockTypes2["HangingRoots"] = "minecraft:hanging_roots";
      MinecraftBlockTypes2["HardBlackStainedGlass"] = "minecraft:hard_black_stained_glass";
      MinecraftBlockTypes2["HardBlackStainedGlassPane"] = "minecraft:hard_black_stained_glass_pane";
      MinecraftBlockTypes2["HardBlueStainedGlass"] = "minecraft:hard_blue_stained_glass";
      MinecraftBlockTypes2["HardBlueStainedGlassPane"] = "minecraft:hard_blue_stained_glass_pane";
      MinecraftBlockTypes2["HardBrownStainedGlass"] = "minecraft:hard_brown_stained_glass";
      MinecraftBlockTypes2["HardBrownStainedGlassPane"] = "minecraft:hard_brown_stained_glass_pane";
      MinecraftBlockTypes2["HardCyanStainedGlass"] = "minecraft:hard_cyan_stained_glass";
      MinecraftBlockTypes2["HardCyanStainedGlassPane"] = "minecraft:hard_cyan_stained_glass_pane";
      MinecraftBlockTypes2["HardGlass"] = "minecraft:hard_glass";
      MinecraftBlockTypes2["HardGlassPane"] = "minecraft:hard_glass_pane";
      MinecraftBlockTypes2["HardGrayStainedGlass"] = "minecraft:hard_gray_stained_glass";
      MinecraftBlockTypes2["HardGrayStainedGlassPane"] = "minecraft:hard_gray_stained_glass_pane";
      MinecraftBlockTypes2["HardGreenStainedGlass"] = "minecraft:hard_green_stained_glass";
      MinecraftBlockTypes2["HardGreenStainedGlassPane"] = "minecraft:hard_green_stained_glass_pane";
      MinecraftBlockTypes2["HardLightBlueStainedGlass"] = "minecraft:hard_light_blue_stained_glass";
      MinecraftBlockTypes2["HardLightBlueStainedGlassPane"] = "minecraft:hard_light_blue_stained_glass_pane";
      MinecraftBlockTypes2["HardLightGrayStainedGlass"] = "minecraft:hard_light_gray_stained_glass";
      MinecraftBlockTypes2["HardLightGrayStainedGlassPane"] = "minecraft:hard_light_gray_stained_glass_pane";
      MinecraftBlockTypes2["HardLimeStainedGlass"] = "minecraft:hard_lime_stained_glass";
      MinecraftBlockTypes2["HardLimeStainedGlassPane"] = "minecraft:hard_lime_stained_glass_pane";
      MinecraftBlockTypes2["HardMagentaStainedGlass"] = "minecraft:hard_magenta_stained_glass";
      MinecraftBlockTypes2["HardMagentaStainedGlassPane"] = "minecraft:hard_magenta_stained_glass_pane";
      MinecraftBlockTypes2["HardOrangeStainedGlass"] = "minecraft:hard_orange_stained_glass";
      MinecraftBlockTypes2["HardOrangeStainedGlassPane"] = "minecraft:hard_orange_stained_glass_pane";
      MinecraftBlockTypes2["HardPinkStainedGlass"] = "minecraft:hard_pink_stained_glass";
      MinecraftBlockTypes2["HardPinkStainedGlassPane"] = "minecraft:hard_pink_stained_glass_pane";
      MinecraftBlockTypes2["HardPurpleStainedGlass"] = "minecraft:hard_purple_stained_glass";
      MinecraftBlockTypes2["HardPurpleStainedGlassPane"] = "minecraft:hard_purple_stained_glass_pane";
      MinecraftBlockTypes2["HardRedStainedGlass"] = "minecraft:hard_red_stained_glass";
      MinecraftBlockTypes2["HardRedStainedGlassPane"] = "minecraft:hard_red_stained_glass_pane";
      MinecraftBlockTypes2["HardWhiteStainedGlass"] = "minecraft:hard_white_stained_glass";
      MinecraftBlockTypes2["HardWhiteStainedGlassPane"] = "minecraft:hard_white_stained_glass_pane";
      MinecraftBlockTypes2["HardYellowStainedGlass"] = "minecraft:hard_yellow_stained_glass";
      MinecraftBlockTypes2["HardYellowStainedGlassPane"] = "minecraft:hard_yellow_stained_glass_pane";
      MinecraftBlockTypes2["HardenedClay"] = "minecraft:hardened_clay";
      MinecraftBlockTypes2["HayBlock"] = "minecraft:hay_block";
      MinecraftBlockTypes2["HeavyCore"] = "minecraft:heavy_core";
      MinecraftBlockTypes2["HeavyWeightedPressurePlate"] = "minecraft:heavy_weighted_pressure_plate";
      MinecraftBlockTypes2["HoneyBlock"] = "minecraft:honey_block";
      MinecraftBlockTypes2["HoneycombBlock"] = "minecraft:honeycomb_block";
      MinecraftBlockTypes2["Hopper"] = "minecraft:hopper";
      MinecraftBlockTypes2["HornCoral"] = "minecraft:horn_coral";
      MinecraftBlockTypes2["HornCoralBlock"] = "minecraft:horn_coral_block";
      MinecraftBlockTypes2["HornCoralFan"] = "minecraft:horn_coral_fan";
      MinecraftBlockTypes2["HornCoralWallFan"] = "minecraft:horn_coral_wall_fan";
      MinecraftBlockTypes2["Ice"] = "minecraft:ice";
      MinecraftBlockTypes2["InfestedChiseledStoneBricks"] = "minecraft:infested_chiseled_stone_bricks";
      MinecraftBlockTypes2["InfestedCobblestone"] = "minecraft:infested_cobblestone";
      MinecraftBlockTypes2["InfestedCrackedStoneBricks"] = "minecraft:infested_cracked_stone_bricks";
      MinecraftBlockTypes2["InfestedDeepslate"] = "minecraft:infested_deepslate";
      MinecraftBlockTypes2["InfestedMossyStoneBricks"] = "minecraft:infested_mossy_stone_bricks";
      MinecraftBlockTypes2["InfestedStone"] = "minecraft:infested_stone";
      MinecraftBlockTypes2["InfestedStoneBricks"] = "minecraft:infested_stone_bricks";
      MinecraftBlockTypes2["IronBars"] = "minecraft:iron_bars";
      MinecraftBlockTypes2["IronBlock"] = "minecraft:iron_block";
      MinecraftBlockTypes2["IronChain"] = "minecraft:iron_chain";
      MinecraftBlockTypes2["IronDoor"] = "minecraft:iron_door";
      MinecraftBlockTypes2["IronOre"] = "minecraft:iron_ore";
      MinecraftBlockTypes2["IronTrapdoor"] = "minecraft:iron_trapdoor";
      MinecraftBlockTypes2["Jigsaw"] = "minecraft:jigsaw";
      MinecraftBlockTypes2["Jukebox"] = "minecraft:jukebox";
      MinecraftBlockTypes2["JungleButton"] = "minecraft:jungle_button";
      MinecraftBlockTypes2["JungleDoor"] = "minecraft:jungle_door";
      MinecraftBlockTypes2["JungleDoubleSlab"] = "minecraft:jungle_double_slab";
      MinecraftBlockTypes2["JungleFence"] = "minecraft:jungle_fence";
      MinecraftBlockTypes2["JungleFenceGate"] = "minecraft:jungle_fence_gate";
      MinecraftBlockTypes2["JungleHangingSign"] = "minecraft:jungle_hanging_sign";
      MinecraftBlockTypes2["JungleLeaves"] = "minecraft:jungle_leaves";
      MinecraftBlockTypes2["JungleLog"] = "minecraft:jungle_log";
      MinecraftBlockTypes2["JunglePlanks"] = "minecraft:jungle_planks";
      MinecraftBlockTypes2["JunglePressurePlate"] = "minecraft:jungle_pressure_plate";
      MinecraftBlockTypes2["JungleSapling"] = "minecraft:jungle_sapling";
      MinecraftBlockTypes2["JungleShelf"] = "minecraft:jungle_shelf";
      MinecraftBlockTypes2["JungleSlab"] = "minecraft:jungle_slab";
      MinecraftBlockTypes2["JungleStairs"] = "minecraft:jungle_stairs";
      MinecraftBlockTypes2["JungleStandingSign"] = "minecraft:jungle_standing_sign";
      MinecraftBlockTypes2["JungleTrapdoor"] = "minecraft:jungle_trapdoor";
      MinecraftBlockTypes2["JungleWallSign"] = "minecraft:jungle_wall_sign";
      MinecraftBlockTypes2["JungleWood"] = "minecraft:jungle_wood";
      MinecraftBlockTypes2["Kelp"] = "minecraft:kelp";
      MinecraftBlockTypes2["LabTable"] = "minecraft:lab_table";
      MinecraftBlockTypes2["Ladder"] = "minecraft:ladder";
      MinecraftBlockTypes2["Lantern"] = "minecraft:lantern";
      MinecraftBlockTypes2["LapisBlock"] = "minecraft:lapis_block";
      MinecraftBlockTypes2["LapisOre"] = "minecraft:lapis_ore";
      MinecraftBlockTypes2["LargeAmethystBud"] = "minecraft:large_amethyst_bud";
      MinecraftBlockTypes2["LargeFern"] = "minecraft:large_fern";
      MinecraftBlockTypes2["Lava"] = "minecraft:lava";
      MinecraftBlockTypes2["LeafLitter"] = "minecraft:leaf_litter";
      MinecraftBlockTypes2["Lectern"] = "minecraft:lectern";
      MinecraftBlockTypes2["Lever"] = "minecraft:lever";
      MinecraftBlockTypes2["LightBlock0"] = "minecraft:light_block_0";
      MinecraftBlockTypes2["LightBlock1"] = "minecraft:light_block_1";
      MinecraftBlockTypes2["LightBlock10"] = "minecraft:light_block_10";
      MinecraftBlockTypes2["LightBlock11"] = "minecraft:light_block_11";
      MinecraftBlockTypes2["LightBlock12"] = "minecraft:light_block_12";
      MinecraftBlockTypes2["LightBlock13"] = "minecraft:light_block_13";
      MinecraftBlockTypes2["LightBlock14"] = "minecraft:light_block_14";
      MinecraftBlockTypes2["LightBlock15"] = "minecraft:light_block_15";
      MinecraftBlockTypes2["LightBlock2"] = "minecraft:light_block_2";
      MinecraftBlockTypes2["LightBlock3"] = "minecraft:light_block_3";
      MinecraftBlockTypes2["LightBlock4"] = "minecraft:light_block_4";
      MinecraftBlockTypes2["LightBlock5"] = "minecraft:light_block_5";
      MinecraftBlockTypes2["LightBlock6"] = "minecraft:light_block_6";
      MinecraftBlockTypes2["LightBlock7"] = "minecraft:light_block_7";
      MinecraftBlockTypes2["LightBlock8"] = "minecraft:light_block_8";
      MinecraftBlockTypes2["LightBlock9"] = "minecraft:light_block_9";
      MinecraftBlockTypes2["LightBlueCandle"] = "minecraft:light_blue_candle";
      MinecraftBlockTypes2["LightBlueCandleCake"] = "minecraft:light_blue_candle_cake";
      MinecraftBlockTypes2["LightBlueCarpet"] = "minecraft:light_blue_carpet";
      MinecraftBlockTypes2["LightBlueConcrete"] = "minecraft:light_blue_concrete";
      MinecraftBlockTypes2["LightBlueConcretePowder"] = "minecraft:light_blue_concrete_powder";
      MinecraftBlockTypes2["LightBlueGlazedTerracotta"] = "minecraft:light_blue_glazed_terracotta";
      MinecraftBlockTypes2["LightBlueShulkerBox"] = "minecraft:light_blue_shulker_box";
      MinecraftBlockTypes2["LightBlueStainedGlass"] = "minecraft:light_blue_stained_glass";
      MinecraftBlockTypes2["LightBlueStainedGlassPane"] = "minecraft:light_blue_stained_glass_pane";
      MinecraftBlockTypes2["LightBlueTerracotta"] = "minecraft:light_blue_terracotta";
      MinecraftBlockTypes2["LightBlueWool"] = "minecraft:light_blue_wool";
      MinecraftBlockTypes2["LightBlueWoolDoubleSlab"] = "minecraft:light_blue_wool_double_slab";
      MinecraftBlockTypes2["LightBlueWoolSlab"] = "minecraft:light_blue_wool_slab";
      MinecraftBlockTypes2["LightBlueWoolStairs"] = "minecraft:light_blue_wool_stairs";
      MinecraftBlockTypes2["LightGrayCandle"] = "minecraft:light_gray_candle";
      MinecraftBlockTypes2["LightGrayCandleCake"] = "minecraft:light_gray_candle_cake";
      MinecraftBlockTypes2["LightGrayCarpet"] = "minecraft:light_gray_carpet";
      MinecraftBlockTypes2["LightGrayConcrete"] = "minecraft:light_gray_concrete";
      MinecraftBlockTypes2["LightGrayConcretePowder"] = "minecraft:light_gray_concrete_powder";
      MinecraftBlockTypes2["LightGrayShulkerBox"] = "minecraft:light_gray_shulker_box";
      MinecraftBlockTypes2["LightGrayStainedGlass"] = "minecraft:light_gray_stained_glass";
      MinecraftBlockTypes2["LightGrayStainedGlassPane"] = "minecraft:light_gray_stained_glass_pane";
      MinecraftBlockTypes2["LightGrayTerracotta"] = "minecraft:light_gray_terracotta";
      MinecraftBlockTypes2["LightGrayWool"] = "minecraft:light_gray_wool";
      MinecraftBlockTypes2["LightGrayWoolDoubleSlab"] = "minecraft:light_gray_wool_double_slab";
      MinecraftBlockTypes2["LightGrayWoolSlab"] = "minecraft:light_gray_wool_slab";
      MinecraftBlockTypes2["LightGrayWoolStairs"] = "minecraft:light_gray_wool_stairs";
      MinecraftBlockTypes2["LightWeightedPressurePlate"] = "minecraft:light_weighted_pressure_plate";
      MinecraftBlockTypes2["LightningRod"] = "minecraft:lightning_rod";
      MinecraftBlockTypes2["Lilac"] = "minecraft:lilac";
      MinecraftBlockTypes2["LilyOfTheValley"] = "minecraft:lily_of_the_valley";
      MinecraftBlockTypes2["LimeCandle"] = "minecraft:lime_candle";
      MinecraftBlockTypes2["LimeCandleCake"] = "minecraft:lime_candle_cake";
      MinecraftBlockTypes2["LimeCarpet"] = "minecraft:lime_carpet";
      MinecraftBlockTypes2["LimeConcrete"] = "minecraft:lime_concrete";
      MinecraftBlockTypes2["LimeConcretePowder"] = "minecraft:lime_concrete_powder";
      MinecraftBlockTypes2["LimeGlazedTerracotta"] = "minecraft:lime_glazed_terracotta";
      MinecraftBlockTypes2["LimeShulkerBox"] = "minecraft:lime_shulker_box";
      MinecraftBlockTypes2["LimeStainedGlass"] = "minecraft:lime_stained_glass";
      MinecraftBlockTypes2["LimeStainedGlassPane"] = "minecraft:lime_stained_glass_pane";
      MinecraftBlockTypes2["LimeTerracotta"] = "minecraft:lime_terracotta";
      MinecraftBlockTypes2["LimeWool"] = "minecraft:lime_wool";
      MinecraftBlockTypes2["LimeWoolDoubleSlab"] = "minecraft:lime_wool_double_slab";
      MinecraftBlockTypes2["LimeWoolSlab"] = "minecraft:lime_wool_slab";
      MinecraftBlockTypes2["LimeWoolStairs"] = "minecraft:lime_wool_stairs";
      MinecraftBlockTypes2["LitBlastFurnace"] = "minecraft:lit_blast_furnace";
      MinecraftBlockTypes2["LitDeepslateRedstoneOre"] = "minecraft:lit_deepslate_redstone_ore";
      MinecraftBlockTypes2["LitFurnace"] = "minecraft:lit_furnace";
      MinecraftBlockTypes2["LitPumpkin"] = "minecraft:lit_pumpkin";
      MinecraftBlockTypes2["LitRedstoneLamp"] = "minecraft:lit_redstone_lamp";
      MinecraftBlockTypes2["LitRedstoneOre"] = "minecraft:lit_redstone_ore";
      MinecraftBlockTypes2["LitSmoker"] = "minecraft:lit_smoker";
      MinecraftBlockTypes2["Lodestone"] = "minecraft:lodestone";
      MinecraftBlockTypes2["Loom"] = "minecraft:loom";
      MinecraftBlockTypes2["MagentaCandle"] = "minecraft:magenta_candle";
      MinecraftBlockTypes2["MagentaCandleCake"] = "minecraft:magenta_candle_cake";
      MinecraftBlockTypes2["MagentaCarpet"] = "minecraft:magenta_carpet";
      MinecraftBlockTypes2["MagentaConcrete"] = "minecraft:magenta_concrete";
      MinecraftBlockTypes2["MagentaConcretePowder"] = "minecraft:magenta_concrete_powder";
      MinecraftBlockTypes2["MagentaGlazedTerracotta"] = "minecraft:magenta_glazed_terracotta";
      MinecraftBlockTypes2["MagentaShulkerBox"] = "minecraft:magenta_shulker_box";
      MinecraftBlockTypes2["MagentaStainedGlass"] = "minecraft:magenta_stained_glass";
      MinecraftBlockTypes2["MagentaStainedGlassPane"] = "minecraft:magenta_stained_glass_pane";
      MinecraftBlockTypes2["MagentaTerracotta"] = "minecraft:magenta_terracotta";
      MinecraftBlockTypes2["MagentaWool"] = "minecraft:magenta_wool";
      MinecraftBlockTypes2["MagentaWoolDoubleSlab"] = "minecraft:magenta_wool_double_slab";
      MinecraftBlockTypes2["MagentaWoolSlab"] = "minecraft:magenta_wool_slab";
      MinecraftBlockTypes2["MagentaWoolStairs"] = "minecraft:magenta_wool_stairs";
      MinecraftBlockTypes2["Magma"] = "minecraft:magma";
      MinecraftBlockTypes2["MangroveButton"] = "minecraft:mangrove_button";
      MinecraftBlockTypes2["MangroveDoor"] = "minecraft:mangrove_door";
      MinecraftBlockTypes2["MangroveDoubleSlab"] = "minecraft:mangrove_double_slab";
      MinecraftBlockTypes2["MangroveFence"] = "minecraft:mangrove_fence";
      MinecraftBlockTypes2["MangroveFenceGate"] = "minecraft:mangrove_fence_gate";
      MinecraftBlockTypes2["MangroveHangingSign"] = "minecraft:mangrove_hanging_sign";
      MinecraftBlockTypes2["MangroveLeaves"] = "minecraft:mangrove_leaves";
      MinecraftBlockTypes2["MangroveLog"] = "minecraft:mangrove_log";
      MinecraftBlockTypes2["MangrovePlanks"] = "minecraft:mangrove_planks";
      MinecraftBlockTypes2["MangrovePressurePlate"] = "minecraft:mangrove_pressure_plate";
      MinecraftBlockTypes2["MangrovePropagule"] = "minecraft:mangrove_propagule";
      MinecraftBlockTypes2["MangroveRoots"] = "minecraft:mangrove_roots";
      MinecraftBlockTypes2["MangroveShelf"] = "minecraft:mangrove_shelf";
      MinecraftBlockTypes2["MangroveSlab"] = "minecraft:mangrove_slab";
      MinecraftBlockTypes2["MangroveStairs"] = "minecraft:mangrove_stairs";
      MinecraftBlockTypes2["MangroveStandingSign"] = "minecraft:mangrove_standing_sign";
      MinecraftBlockTypes2["MangroveTrapdoor"] = "minecraft:mangrove_trapdoor";
      MinecraftBlockTypes2["MangroveWallSign"] = "minecraft:mangrove_wall_sign";
      MinecraftBlockTypes2["MangroveWood"] = "minecraft:mangrove_wood";
      MinecraftBlockTypes2["MaterialReducer"] = "minecraft:material_reducer";
      MinecraftBlockTypes2["MediumAmethystBud"] = "minecraft:medium_amethyst_bud";
      MinecraftBlockTypes2["MelonBlock"] = "minecraft:melon_block";
      MinecraftBlockTypes2["MelonStem"] = "minecraft:melon_stem";
      MinecraftBlockTypes2["MobSpawner"] = "minecraft:mob_spawner";
      MinecraftBlockTypes2["MossBlock"] = "minecraft:moss_block";
      MinecraftBlockTypes2["MossCarpet"] = "minecraft:moss_carpet";
      MinecraftBlockTypes2["MossyCobblestone"] = "minecraft:mossy_cobblestone";
      MinecraftBlockTypes2["MossyCobblestoneDoubleSlab"] = "minecraft:mossy_cobblestone_double_slab";
      MinecraftBlockTypes2["MossyCobblestoneSlab"] = "minecraft:mossy_cobblestone_slab";
      MinecraftBlockTypes2["MossyCobblestoneStairs"] = "minecraft:mossy_cobblestone_stairs";
      MinecraftBlockTypes2["MossyCobblestoneWall"] = "minecraft:mossy_cobblestone_wall";
      MinecraftBlockTypes2["MossyStoneBrickDoubleSlab"] = "minecraft:mossy_stone_brick_double_slab";
      MinecraftBlockTypes2["MossyStoneBrickSlab"] = "minecraft:mossy_stone_brick_slab";
      MinecraftBlockTypes2["MossyStoneBrickStairs"] = "minecraft:mossy_stone_brick_stairs";
      MinecraftBlockTypes2["MossyStoneBrickWall"] = "minecraft:mossy_stone_brick_wall";
      MinecraftBlockTypes2["MossyStoneBricks"] = "minecraft:mossy_stone_bricks";
      MinecraftBlockTypes2["Mud"] = "minecraft:mud";
      MinecraftBlockTypes2["MudBrickDoubleSlab"] = "minecraft:mud_brick_double_slab";
      MinecraftBlockTypes2["MudBrickSlab"] = "minecraft:mud_brick_slab";
      MinecraftBlockTypes2["MudBrickStairs"] = "minecraft:mud_brick_stairs";
      MinecraftBlockTypes2["MudBrickWall"] = "minecraft:mud_brick_wall";
      MinecraftBlockTypes2["MudBricks"] = "minecraft:mud_bricks";
      MinecraftBlockTypes2["MuddyMangroveRoots"] = "minecraft:muddy_mangrove_roots";
      MinecraftBlockTypes2["MushroomStem"] = "minecraft:mushroom_stem";
      MinecraftBlockTypes2["Mycelium"] = "minecraft:mycelium";
      MinecraftBlockTypes2["NetherBrick"] = "minecraft:nether_brick";
      MinecraftBlockTypes2["NetherBrickDoubleSlab"] = "minecraft:nether_brick_double_slab";
      MinecraftBlockTypes2["NetherBrickFence"] = "minecraft:nether_brick_fence";
      MinecraftBlockTypes2["NetherBrickSlab"] = "minecraft:nether_brick_slab";
      MinecraftBlockTypes2["NetherBrickStairs"] = "minecraft:nether_brick_stairs";
      MinecraftBlockTypes2["NetherBrickWall"] = "minecraft:nether_brick_wall";
      MinecraftBlockTypes2["NetherGoldOre"] = "minecraft:nether_gold_ore";
      MinecraftBlockTypes2["NetherSprouts"] = "minecraft:nether_sprouts";
      MinecraftBlockTypes2["NetherWart"] = "minecraft:nether_wart";
      MinecraftBlockTypes2["NetherWartBlock"] = "minecraft:nether_wart_block";
      MinecraftBlockTypes2["NetheriteBlock"] = "minecraft:netherite_block";
      MinecraftBlockTypes2["Netherrack"] = "minecraft:netherrack";
      MinecraftBlockTypes2["NormalStoneDoubleSlab"] = "minecraft:normal_stone_double_slab";
      MinecraftBlockTypes2["NormalStoneSlab"] = "minecraft:normal_stone_slab";
      MinecraftBlockTypes2["NormalStoneStairs"] = "minecraft:normal_stone_stairs";
      MinecraftBlockTypes2["Noteblock"] = "minecraft:noteblock";
      MinecraftBlockTypes2["OakDoubleSlab"] = "minecraft:oak_double_slab";
      MinecraftBlockTypes2["OakFence"] = "minecraft:oak_fence";
      MinecraftBlockTypes2["OakHangingSign"] = "minecraft:oak_hanging_sign";
      MinecraftBlockTypes2["OakLeaves"] = "minecraft:oak_leaves";
      MinecraftBlockTypes2["OakLog"] = "minecraft:oak_log";
      MinecraftBlockTypes2["OakPlanks"] = "minecraft:oak_planks";
      MinecraftBlockTypes2["OakSapling"] = "minecraft:oak_sapling";
      MinecraftBlockTypes2["OakShelf"] = "minecraft:oak_shelf";
      MinecraftBlockTypes2["OakSlab"] = "minecraft:oak_slab";
      MinecraftBlockTypes2["OakStairs"] = "minecraft:oak_stairs";
      MinecraftBlockTypes2["OakWood"] = "minecraft:oak_wood";
      MinecraftBlockTypes2["Observer"] = "minecraft:observer";
      MinecraftBlockTypes2["Obsidian"] = "minecraft:obsidian";
      MinecraftBlockTypes2["OchreFroglight"] = "minecraft:ochre_froglight";
      MinecraftBlockTypes2["OpenEyeblossom"] = "minecraft:open_eyeblossom";
      MinecraftBlockTypes2["OrangeCandle"] = "minecraft:orange_candle";
      MinecraftBlockTypes2["OrangeCandleCake"] = "minecraft:orange_candle_cake";
      MinecraftBlockTypes2["OrangeCarpet"] = "minecraft:orange_carpet";
      MinecraftBlockTypes2["OrangeConcrete"] = "minecraft:orange_concrete";
      MinecraftBlockTypes2["OrangeConcretePowder"] = "minecraft:orange_concrete_powder";
      MinecraftBlockTypes2["OrangeGlazedTerracotta"] = "minecraft:orange_glazed_terracotta";
      MinecraftBlockTypes2["OrangePoplarLeaves"] = "minecraft:orange_poplar_leaves";
      MinecraftBlockTypes2["OrangeShulkerBox"] = "minecraft:orange_shulker_box";
      MinecraftBlockTypes2["OrangeStainedGlass"] = "minecraft:orange_stained_glass";
      MinecraftBlockTypes2["OrangeStainedGlassPane"] = "minecraft:orange_stained_glass_pane";
      MinecraftBlockTypes2["OrangeTerracotta"] = "minecraft:orange_terracotta";
      MinecraftBlockTypes2["OrangeTulip"] = "minecraft:orange_tulip";
      MinecraftBlockTypes2["OrangeWool"] = "minecraft:orange_wool";
      MinecraftBlockTypes2["OrangeWoolDoubleSlab"] = "minecraft:orange_wool_double_slab";
      MinecraftBlockTypes2["OrangeWoolSlab"] = "minecraft:orange_wool_slab";
      MinecraftBlockTypes2["OrangeWoolStairs"] = "minecraft:orange_wool_stairs";
      MinecraftBlockTypes2["OxeyeDaisy"] = "minecraft:oxeye_daisy";
      MinecraftBlockTypes2["OxidizedChiseledCopper"] = "minecraft:oxidized_chiseled_copper";
      MinecraftBlockTypes2["OxidizedCopper"] = "minecraft:oxidized_copper";
      MinecraftBlockTypes2["OxidizedCopperBars"] = "minecraft:oxidized_copper_bars";
      MinecraftBlockTypes2["OxidizedCopperBulb"] = "minecraft:oxidized_copper_bulb";
      MinecraftBlockTypes2["OxidizedCopperChain"] = "minecraft:oxidized_copper_chain";
      MinecraftBlockTypes2["OxidizedCopperChest"] = "minecraft:oxidized_copper_chest";
      MinecraftBlockTypes2["OxidizedCopperDoor"] = "minecraft:oxidized_copper_door";
      MinecraftBlockTypes2["OxidizedCopperGolemStatue"] = "minecraft:oxidized_copper_golem_statue";
      MinecraftBlockTypes2["OxidizedCopperGrate"] = "minecraft:oxidized_copper_grate";
      MinecraftBlockTypes2["OxidizedCopperLantern"] = "minecraft:oxidized_copper_lantern";
      MinecraftBlockTypes2["OxidizedCopperTrapdoor"] = "minecraft:oxidized_copper_trapdoor";
      MinecraftBlockTypes2["OxidizedCutCopper"] = "minecraft:oxidized_cut_copper";
      MinecraftBlockTypes2["OxidizedCutCopperSlab"] = "minecraft:oxidized_cut_copper_slab";
      MinecraftBlockTypes2["OxidizedCutCopperStairs"] = "minecraft:oxidized_cut_copper_stairs";
      MinecraftBlockTypes2["OxidizedDoubleCutCopperSlab"] = "minecraft:oxidized_double_cut_copper_slab";
      MinecraftBlockTypes2["OxidizedLightningRod"] = "minecraft:oxidized_lightning_rod";
      MinecraftBlockTypes2["PackedIce"] = "minecraft:packed_ice";
      MinecraftBlockTypes2["PackedMud"] = "minecraft:packed_mud";
      MinecraftBlockTypes2["PaleHangingMoss"] = "minecraft:pale_hanging_moss";
      MinecraftBlockTypes2["PaleMossBlock"] = "minecraft:pale_moss_block";
      MinecraftBlockTypes2["PaleMossCarpet"] = "minecraft:pale_moss_carpet";
      MinecraftBlockTypes2["PaleOakButton"] = "minecraft:pale_oak_button";
      MinecraftBlockTypes2["PaleOakDoor"] = "minecraft:pale_oak_door";
      MinecraftBlockTypes2["PaleOakDoubleSlab"] = "minecraft:pale_oak_double_slab";
      MinecraftBlockTypes2["PaleOakFence"] = "minecraft:pale_oak_fence";
      MinecraftBlockTypes2["PaleOakFenceGate"] = "minecraft:pale_oak_fence_gate";
      MinecraftBlockTypes2["PaleOakHangingSign"] = "minecraft:pale_oak_hanging_sign";
      MinecraftBlockTypes2["PaleOakLeaves"] = "minecraft:pale_oak_leaves";
      MinecraftBlockTypes2["PaleOakLog"] = "minecraft:pale_oak_log";
      MinecraftBlockTypes2["PaleOakPlanks"] = "minecraft:pale_oak_planks";
      MinecraftBlockTypes2["PaleOakPressurePlate"] = "minecraft:pale_oak_pressure_plate";
      MinecraftBlockTypes2["PaleOakSapling"] = "minecraft:pale_oak_sapling";
      MinecraftBlockTypes2["PaleOakShelf"] = "minecraft:pale_oak_shelf";
      MinecraftBlockTypes2["PaleOakSlab"] = "minecraft:pale_oak_slab";
      MinecraftBlockTypes2["PaleOakStairs"] = "minecraft:pale_oak_stairs";
      MinecraftBlockTypes2["PaleOakStandingSign"] = "minecraft:pale_oak_standing_sign";
      MinecraftBlockTypes2["PaleOakTrapdoor"] = "minecraft:pale_oak_trapdoor";
      MinecraftBlockTypes2["PaleOakWallSign"] = "minecraft:pale_oak_wall_sign";
      MinecraftBlockTypes2["PaleOakWood"] = "minecraft:pale_oak_wood";
      MinecraftBlockTypes2["PearlescentFroglight"] = "minecraft:pearlescent_froglight";
      MinecraftBlockTypes2["Peony"] = "minecraft:peony";
      MinecraftBlockTypes2["PetrifiedOakDoubleSlab"] = "minecraft:petrified_oak_double_slab";
      MinecraftBlockTypes2["PetrifiedOakSlab"] = "minecraft:petrified_oak_slab";
      MinecraftBlockTypes2["PiglinHead"] = "minecraft:piglin_head";
      MinecraftBlockTypes2["PinkCandle"] = "minecraft:pink_candle";
      MinecraftBlockTypes2["PinkCandleCake"] = "minecraft:pink_candle_cake";
      MinecraftBlockTypes2["PinkCarpet"] = "minecraft:pink_carpet";
      MinecraftBlockTypes2["PinkConcrete"] = "minecraft:pink_concrete";
      MinecraftBlockTypes2["PinkConcretePowder"] = "minecraft:pink_concrete_powder";
      MinecraftBlockTypes2["PinkGlazedTerracotta"] = "minecraft:pink_glazed_terracotta";
      MinecraftBlockTypes2["PinkPetals"] = "minecraft:pink_petals";
      MinecraftBlockTypes2["PinkShulkerBox"] = "minecraft:pink_shulker_box";
      MinecraftBlockTypes2["PinkStainedGlass"] = "minecraft:pink_stained_glass";
      MinecraftBlockTypes2["PinkStainedGlassPane"] = "minecraft:pink_stained_glass_pane";
      MinecraftBlockTypes2["PinkTerracotta"] = "minecraft:pink_terracotta";
      MinecraftBlockTypes2["PinkTulip"] = "minecraft:pink_tulip";
      MinecraftBlockTypes2["PinkWool"] = "minecraft:pink_wool";
      MinecraftBlockTypes2["PinkWoolDoubleSlab"] = "minecraft:pink_wool_double_slab";
      MinecraftBlockTypes2["PinkWoolSlab"] = "minecraft:pink_wool_slab";
      MinecraftBlockTypes2["PinkWoolStairs"] = "minecraft:pink_wool_stairs";
      MinecraftBlockTypes2["Piston"] = "minecraft:piston";
      MinecraftBlockTypes2["PistonArmCollision"] = "minecraft:piston_arm_collision";
      MinecraftBlockTypes2["PitcherCrop"] = "minecraft:pitcher_crop";
      MinecraftBlockTypes2["PitcherPlant"] = "minecraft:pitcher_plant";
      MinecraftBlockTypes2["PlayerHead"] = "minecraft:player_head";
      MinecraftBlockTypes2["Podzol"] = "minecraft:podzol";
      MinecraftBlockTypes2["PointedDripstone"] = "minecraft:pointed_dripstone";
      MinecraftBlockTypes2["PolishedAndesite"] = "minecraft:polished_andesite";
      MinecraftBlockTypes2["PolishedAndesiteDoubleSlab"] = "minecraft:polished_andesite_double_slab";
      MinecraftBlockTypes2["PolishedAndesiteSlab"] = "minecraft:polished_andesite_slab";
      MinecraftBlockTypes2["PolishedAndesiteStairs"] = "minecraft:polished_andesite_stairs";
      MinecraftBlockTypes2["PolishedBasalt"] = "minecraft:polished_basalt";
      MinecraftBlockTypes2["PolishedBlackstone"] = "minecraft:polished_blackstone";
      MinecraftBlockTypes2["PolishedBlackstoneBrickDoubleSlab"] = "minecraft:polished_blackstone_brick_double_slab";
      MinecraftBlockTypes2["PolishedBlackstoneBrickSlab"] = "minecraft:polished_blackstone_brick_slab";
      MinecraftBlockTypes2["PolishedBlackstoneBrickStairs"] = "minecraft:polished_blackstone_brick_stairs";
      MinecraftBlockTypes2["PolishedBlackstoneBrickWall"] = "minecraft:polished_blackstone_brick_wall";
      MinecraftBlockTypes2["PolishedBlackstoneBricks"] = "minecraft:polished_blackstone_bricks";
      MinecraftBlockTypes2["PolishedBlackstoneButton"] = "minecraft:polished_blackstone_button";
      MinecraftBlockTypes2["PolishedBlackstoneDoubleSlab"] = "minecraft:polished_blackstone_double_slab";
      MinecraftBlockTypes2["PolishedBlackstonePressurePlate"] = "minecraft:polished_blackstone_pressure_plate";
      MinecraftBlockTypes2["PolishedBlackstoneSlab"] = "minecraft:polished_blackstone_slab";
      MinecraftBlockTypes2["PolishedBlackstoneStairs"] = "minecraft:polished_blackstone_stairs";
      MinecraftBlockTypes2["PolishedBlackstoneWall"] = "minecraft:polished_blackstone_wall";
      MinecraftBlockTypes2["PolishedCinnabar"] = "minecraft:polished_cinnabar";
      MinecraftBlockTypes2["PolishedCinnabarDoubleSlab"] = "minecraft:polished_cinnabar_double_slab";
      MinecraftBlockTypes2["PolishedCinnabarSlab"] = "minecraft:polished_cinnabar_slab";
      MinecraftBlockTypes2["PolishedCinnabarStairs"] = "minecraft:polished_cinnabar_stairs";
      MinecraftBlockTypes2["PolishedCinnabarWall"] = "minecraft:polished_cinnabar_wall";
      MinecraftBlockTypes2["PolishedDeepslate"] = "minecraft:polished_deepslate";
      MinecraftBlockTypes2["PolishedDeepslateDoubleSlab"] = "minecraft:polished_deepslate_double_slab";
      MinecraftBlockTypes2["PolishedDeepslateSlab"] = "minecraft:polished_deepslate_slab";
      MinecraftBlockTypes2["PolishedDeepslateStairs"] = "minecraft:polished_deepslate_stairs";
      MinecraftBlockTypes2["PolishedDeepslateWall"] = "minecraft:polished_deepslate_wall";
      MinecraftBlockTypes2["PolishedDiorite"] = "minecraft:polished_diorite";
      MinecraftBlockTypes2["PolishedDioriteDoubleSlab"] = "minecraft:polished_diorite_double_slab";
      MinecraftBlockTypes2["PolishedDioriteSlab"] = "minecraft:polished_diorite_slab";
      MinecraftBlockTypes2["PolishedDioriteStairs"] = "minecraft:polished_diorite_stairs";
      MinecraftBlockTypes2["PolishedGranite"] = "minecraft:polished_granite";
      MinecraftBlockTypes2["PolishedGraniteDoubleSlab"] = "minecraft:polished_granite_double_slab";
      MinecraftBlockTypes2["PolishedGraniteSlab"] = "minecraft:polished_granite_slab";
      MinecraftBlockTypes2["PolishedGraniteStairs"] = "minecraft:polished_granite_stairs";
      MinecraftBlockTypes2["PolishedSulfur"] = "minecraft:polished_sulfur";
      MinecraftBlockTypes2["PolishedSulfurDoubleSlab"] = "minecraft:polished_sulfur_double_slab";
      MinecraftBlockTypes2["PolishedSulfurSlab"] = "minecraft:polished_sulfur_slab";
      MinecraftBlockTypes2["PolishedSulfurStairs"] = "minecraft:polished_sulfur_stairs";
      MinecraftBlockTypes2["PolishedSulfurWall"] = "minecraft:polished_sulfur_wall";
      MinecraftBlockTypes2["PolishedTuff"] = "minecraft:polished_tuff";
      MinecraftBlockTypes2["PolishedTuffDoubleSlab"] = "minecraft:polished_tuff_double_slab";
      MinecraftBlockTypes2["PolishedTuffSlab"] = "minecraft:polished_tuff_slab";
      MinecraftBlockTypes2["PolishedTuffStairs"] = "minecraft:polished_tuff_stairs";
      MinecraftBlockTypes2["PolishedTuffWall"] = "minecraft:polished_tuff_wall";
      MinecraftBlockTypes2["PoplarButton"] = "minecraft:poplar_button";
      MinecraftBlockTypes2["PoplarDoor"] = "minecraft:poplar_door";
      MinecraftBlockTypes2["PoplarDoubleSlab"] = "minecraft:poplar_double_slab";
      MinecraftBlockTypes2["PoplarFence"] = "minecraft:poplar_fence";
      MinecraftBlockTypes2["PoplarFenceGate"] = "minecraft:poplar_fence_gate";
      MinecraftBlockTypes2["PoplarHangingSign"] = "minecraft:poplar_hanging_sign";
      MinecraftBlockTypes2["PoplarLog"] = "minecraft:poplar_log";
      MinecraftBlockTypes2["PoplarPlanks"] = "minecraft:poplar_planks";
      MinecraftBlockTypes2["PoplarPressurePlate"] = "minecraft:poplar_pressure_plate";
      MinecraftBlockTypes2["PoplarSapling"] = "minecraft:poplar_sapling";
      MinecraftBlockTypes2["PoplarShelf"] = "minecraft:poplar_shelf";
      MinecraftBlockTypes2["PoplarSlab"] = "minecraft:poplar_slab";
      MinecraftBlockTypes2["PoplarStairs"] = "minecraft:poplar_stairs";
      MinecraftBlockTypes2["PoplarStandingSign"] = "minecraft:poplar_standing_sign";
      MinecraftBlockTypes2["PoplarTrapdoor"] = "minecraft:poplar_trapdoor";
      MinecraftBlockTypes2["PoplarWallSign"] = "minecraft:poplar_wall_sign";
      MinecraftBlockTypes2["PoplarWood"] = "minecraft:poplar_wood";
      MinecraftBlockTypes2["Poppy"] = "minecraft:poppy";
      MinecraftBlockTypes2["Portal"] = "minecraft:portal";
      MinecraftBlockTypes2["Potatoes"] = "minecraft:potatoes";
      MinecraftBlockTypes2["PotentSulfur"] = "minecraft:potent_sulfur";
      MinecraftBlockTypes2["PowderSnow"] = "minecraft:powder_snow";
      MinecraftBlockTypes2["PoweredComparator"] = "minecraft:powered_comparator";
      MinecraftBlockTypes2["PoweredRepeater"] = "minecraft:powered_repeater";
      MinecraftBlockTypes2["Prismarine"] = "minecraft:prismarine";
      MinecraftBlockTypes2["PrismarineBrickDoubleSlab"] = "minecraft:prismarine_brick_double_slab";
      MinecraftBlockTypes2["PrismarineBrickSlab"] = "minecraft:prismarine_brick_slab";
      MinecraftBlockTypes2["PrismarineBricks"] = "minecraft:prismarine_bricks";
      MinecraftBlockTypes2["PrismarineBricksStairs"] = "minecraft:prismarine_bricks_stairs";
      MinecraftBlockTypes2["PrismarineDoubleSlab"] = "minecraft:prismarine_double_slab";
      MinecraftBlockTypes2["PrismarineSlab"] = "minecraft:prismarine_slab";
      MinecraftBlockTypes2["PrismarineStairs"] = "minecraft:prismarine_stairs";
      MinecraftBlockTypes2["PrismarineWall"] = "minecraft:prismarine_wall";
      MinecraftBlockTypes2["Pumpkin"] = "minecraft:pumpkin";
      MinecraftBlockTypes2["PumpkinStem"] = "minecraft:pumpkin_stem";
      MinecraftBlockTypes2["PurpleCandle"] = "minecraft:purple_candle";
      MinecraftBlockTypes2["PurpleCandleCake"] = "minecraft:purple_candle_cake";
      MinecraftBlockTypes2["PurpleCarpet"] = "minecraft:purple_carpet";
      MinecraftBlockTypes2["PurpleConcrete"] = "minecraft:purple_concrete";
      MinecraftBlockTypes2["PurpleConcretePowder"] = "minecraft:purple_concrete_powder";
      MinecraftBlockTypes2["PurpleGlazedTerracotta"] = "minecraft:purple_glazed_terracotta";
      MinecraftBlockTypes2["PurpleShulkerBox"] = "minecraft:purple_shulker_box";
      MinecraftBlockTypes2["PurpleStainedGlass"] = "minecraft:purple_stained_glass";
      MinecraftBlockTypes2["PurpleStainedGlassPane"] = "minecraft:purple_stained_glass_pane";
      MinecraftBlockTypes2["PurpleTerracotta"] = "minecraft:purple_terracotta";
      MinecraftBlockTypes2["PurpleWool"] = "minecraft:purple_wool";
      MinecraftBlockTypes2["PurpleWoolDoubleSlab"] = "minecraft:purple_wool_double_slab";
      MinecraftBlockTypes2["PurpleWoolSlab"] = "minecraft:purple_wool_slab";
      MinecraftBlockTypes2["PurpleWoolStairs"] = "minecraft:purple_wool_stairs";
      MinecraftBlockTypes2["PurpurBlock"] = "minecraft:purpur_block";
      MinecraftBlockTypes2["PurpurDoubleSlab"] = "minecraft:purpur_double_slab";
      MinecraftBlockTypes2["PurpurPillar"] = "minecraft:purpur_pillar";
      MinecraftBlockTypes2["PurpurSlab"] = "minecraft:purpur_slab";
      MinecraftBlockTypes2["PurpurStairs"] = "minecraft:purpur_stairs";
      MinecraftBlockTypes2["QuartzBlock"] = "minecraft:quartz_block";
      MinecraftBlockTypes2["QuartzBricks"] = "minecraft:quartz_bricks";
      MinecraftBlockTypes2["QuartzDoubleSlab"] = "minecraft:quartz_double_slab";
      MinecraftBlockTypes2["QuartzOre"] = "minecraft:quartz_ore";
      MinecraftBlockTypes2["QuartzPillar"] = "minecraft:quartz_pillar";
      MinecraftBlockTypes2["QuartzSlab"] = "minecraft:quartz_slab";
      MinecraftBlockTypes2["QuartzStairs"] = "minecraft:quartz_stairs";
      MinecraftBlockTypes2["Rail"] = "minecraft:rail";
      MinecraftBlockTypes2["RawCopperBlock"] = "minecraft:raw_copper_block";
      MinecraftBlockTypes2["RawGoldBlock"] = "minecraft:raw_gold_block";
      MinecraftBlockTypes2["RawIronBlock"] = "minecraft:raw_iron_block";
      MinecraftBlockTypes2["RedCandle"] = "minecraft:red_candle";
      MinecraftBlockTypes2["RedCandleCake"] = "minecraft:red_candle_cake";
      MinecraftBlockTypes2["RedCarpet"] = "minecraft:red_carpet";
      MinecraftBlockTypes2["RedConcrete"] = "minecraft:red_concrete";
      MinecraftBlockTypes2["RedConcretePowder"] = "minecraft:red_concrete_powder";
      MinecraftBlockTypes2["RedGlazedTerracotta"] = "minecraft:red_glazed_terracotta";
      MinecraftBlockTypes2["RedMushroom"] = "minecraft:red_mushroom";
      MinecraftBlockTypes2["RedMushroomBlock"] = "minecraft:red_mushroom_block";
      MinecraftBlockTypes2["RedNetherBrick"] = "minecraft:red_nether_brick";
      MinecraftBlockTypes2["RedNetherBrickDoubleSlab"] = "minecraft:red_nether_brick_double_slab";
      MinecraftBlockTypes2["RedNetherBrickSlab"] = "minecraft:red_nether_brick_slab";
      MinecraftBlockTypes2["RedNetherBrickStairs"] = "minecraft:red_nether_brick_stairs";
      MinecraftBlockTypes2["RedNetherBrickWall"] = "minecraft:red_nether_brick_wall";
      MinecraftBlockTypes2["RedPoplarLeaves"] = "minecraft:red_poplar_leaves";
      MinecraftBlockTypes2["RedSand"] = "minecraft:red_sand";
      MinecraftBlockTypes2["RedSandstone"] = "minecraft:red_sandstone";
      MinecraftBlockTypes2["RedSandstoneDoubleSlab"] = "minecraft:red_sandstone_double_slab";
      MinecraftBlockTypes2["RedSandstoneSlab"] = "minecraft:red_sandstone_slab";
      MinecraftBlockTypes2["RedSandstoneStairs"] = "minecraft:red_sandstone_stairs";
      MinecraftBlockTypes2["RedSandstoneWall"] = "minecraft:red_sandstone_wall";
      MinecraftBlockTypes2["RedShrub"] = "minecraft:red_shrub";
      MinecraftBlockTypes2["RedShulkerBox"] = "minecraft:red_shulker_box";
      MinecraftBlockTypes2["RedStainedGlass"] = "minecraft:red_stained_glass";
      MinecraftBlockTypes2["RedStainedGlassPane"] = "minecraft:red_stained_glass_pane";
      MinecraftBlockTypes2["RedTerracotta"] = "minecraft:red_terracotta";
      MinecraftBlockTypes2["RedTulip"] = "minecraft:red_tulip";
      MinecraftBlockTypes2["RedWool"] = "minecraft:red_wool";
      MinecraftBlockTypes2["RedWoolDoubleSlab"] = "minecraft:red_wool_double_slab";
      MinecraftBlockTypes2["RedWoolSlab"] = "minecraft:red_wool_slab";
      MinecraftBlockTypes2["RedWoolStairs"] = "minecraft:red_wool_stairs";
      MinecraftBlockTypes2["RedstoneBlock"] = "minecraft:redstone_block";
      MinecraftBlockTypes2["RedstoneLamp"] = "minecraft:redstone_lamp";
      MinecraftBlockTypes2["RedstoneOre"] = "minecraft:redstone_ore";
      MinecraftBlockTypes2["RedstoneTorch"] = "minecraft:redstone_torch";
      MinecraftBlockTypes2["RedstoneWire"] = "minecraft:redstone_wire";
      MinecraftBlockTypes2["Reeds"] = "minecraft:reeds";
      MinecraftBlockTypes2["ReinforcedDeepslate"] = "minecraft:reinforced_deepslate";
      MinecraftBlockTypes2["RepeatingCommandBlock"] = "minecraft:repeating_command_block";
      MinecraftBlockTypes2["ResinBlock"] = "minecraft:resin_block";
      MinecraftBlockTypes2["ResinBrickDoubleSlab"] = "minecraft:resin_brick_double_slab";
      MinecraftBlockTypes2["ResinBrickSlab"] = "minecraft:resin_brick_slab";
      MinecraftBlockTypes2["ResinBrickStairs"] = "minecraft:resin_brick_stairs";
      MinecraftBlockTypes2["ResinBrickWall"] = "minecraft:resin_brick_wall";
      MinecraftBlockTypes2["ResinBricks"] = "minecraft:resin_bricks";
      MinecraftBlockTypes2["ResinClump"] = "minecraft:resin_clump";
      MinecraftBlockTypes2["RespawnAnchor"] = "minecraft:respawn_anchor";
      MinecraftBlockTypes2["RoseBush"] = "minecraft:rose_bush";
      MinecraftBlockTypes2["Sand"] = "minecraft:sand";
      MinecraftBlockTypes2["Sandstone"] = "minecraft:sandstone";
      MinecraftBlockTypes2["SandstoneDoubleSlab"] = "minecraft:sandstone_double_slab";
      MinecraftBlockTypes2["SandstoneSlab"] = "minecraft:sandstone_slab";
      MinecraftBlockTypes2["SandstoneStairs"] = "minecraft:sandstone_stairs";
      MinecraftBlockTypes2["SandstoneWall"] = "minecraft:sandstone_wall";
      MinecraftBlockTypes2["Scaffolding"] = "minecraft:scaffolding";
      MinecraftBlockTypes2["Sculk"] = "minecraft:sculk";
      MinecraftBlockTypes2["SculkCatalyst"] = "minecraft:sculk_catalyst";
      MinecraftBlockTypes2["SculkSensor"] = "minecraft:sculk_sensor";
      MinecraftBlockTypes2["SculkShrieker"] = "minecraft:sculk_shrieker";
      MinecraftBlockTypes2["SculkVein"] = "minecraft:sculk_vein";
      MinecraftBlockTypes2["SeaLantern"] = "minecraft:sea_lantern";
      MinecraftBlockTypes2["SeaPickle"] = "minecraft:sea_pickle";
      MinecraftBlockTypes2["Seagrass"] = "minecraft:seagrass";
      MinecraftBlockTypes2["ShelfMushroom"] = "minecraft:shelf_mushroom";
      MinecraftBlockTypes2["ShortDryGrass"] = "minecraft:short_dry_grass";
      MinecraftBlockTypes2["ShortGrass"] = "minecraft:short_grass";
      MinecraftBlockTypes2["Shroomlight"] = "minecraft:shroomlight";
      MinecraftBlockTypes2["SilverGlazedTerracotta"] = "minecraft:silver_glazed_terracotta";
      MinecraftBlockTypes2["SkeletonSkull"] = "minecraft:skeleton_skull";
      MinecraftBlockTypes2["Slime"] = "minecraft:slime";
      MinecraftBlockTypes2["SmallAmethystBud"] = "minecraft:small_amethyst_bud";
      MinecraftBlockTypes2["SmallDripleafBlock"] = "minecraft:small_dripleaf_block";
      MinecraftBlockTypes2["SmithingTable"] = "minecraft:smithing_table";
      MinecraftBlockTypes2["Smoker"] = "minecraft:smoker";
      MinecraftBlockTypes2["SmoothBasalt"] = "minecraft:smooth_basalt";
      MinecraftBlockTypes2["SmoothQuartz"] = "minecraft:smooth_quartz";
      MinecraftBlockTypes2["SmoothQuartzDoubleSlab"] = "minecraft:smooth_quartz_double_slab";
      MinecraftBlockTypes2["SmoothQuartzSlab"] = "minecraft:smooth_quartz_slab";
      MinecraftBlockTypes2["SmoothQuartzStairs"] = "minecraft:smooth_quartz_stairs";
      MinecraftBlockTypes2["SmoothRedSandstone"] = "minecraft:smooth_red_sandstone";
      MinecraftBlockTypes2["SmoothRedSandstoneDoubleSlab"] = "minecraft:smooth_red_sandstone_double_slab";
      MinecraftBlockTypes2["SmoothRedSandstoneSlab"] = "minecraft:smooth_red_sandstone_slab";
      MinecraftBlockTypes2["SmoothRedSandstoneStairs"] = "minecraft:smooth_red_sandstone_stairs";
      MinecraftBlockTypes2["SmoothSandstone"] = "minecraft:smooth_sandstone";
      MinecraftBlockTypes2["SmoothSandstoneDoubleSlab"] = "minecraft:smooth_sandstone_double_slab";
      MinecraftBlockTypes2["SmoothSandstoneSlab"] = "minecraft:smooth_sandstone_slab";
      MinecraftBlockTypes2["SmoothSandstoneStairs"] = "minecraft:smooth_sandstone_stairs";
      MinecraftBlockTypes2["SmoothStone"] = "minecraft:smooth_stone";
      MinecraftBlockTypes2["SmoothStoneDoubleSlab"] = "minecraft:smooth_stone_double_slab";
      MinecraftBlockTypes2["SmoothStoneSlab"] = "minecraft:smooth_stone_slab";
      MinecraftBlockTypes2["SnifferEgg"] = "minecraft:sniffer_egg";
      MinecraftBlockTypes2["Snow"] = "minecraft:snow";
      MinecraftBlockTypes2["SnowLayer"] = "minecraft:snow_layer";
      MinecraftBlockTypes2["SoulCampfire"] = "minecraft:soul_campfire";
      MinecraftBlockTypes2["SoulFire"] = "minecraft:soul_fire";
      MinecraftBlockTypes2["SoulLantern"] = "minecraft:soul_lantern";
      MinecraftBlockTypes2["SoulSand"] = "minecraft:soul_sand";
      MinecraftBlockTypes2["SoulSoil"] = "minecraft:soul_soil";
      MinecraftBlockTypes2["SoulTorch"] = "minecraft:soul_torch";
      MinecraftBlockTypes2["Sponge"] = "minecraft:sponge";
      MinecraftBlockTypes2["SporeBlossom"] = "minecraft:spore_blossom";
      MinecraftBlockTypes2["SpruceButton"] = "minecraft:spruce_button";
      MinecraftBlockTypes2["SpruceDoor"] = "minecraft:spruce_door";
      MinecraftBlockTypes2["SpruceDoubleSlab"] = "minecraft:spruce_double_slab";
      MinecraftBlockTypes2["SpruceFence"] = "minecraft:spruce_fence";
      MinecraftBlockTypes2["SpruceFenceGate"] = "minecraft:spruce_fence_gate";
      MinecraftBlockTypes2["SpruceHangingSign"] = "minecraft:spruce_hanging_sign";
      MinecraftBlockTypes2["SpruceLeaves"] = "minecraft:spruce_leaves";
      MinecraftBlockTypes2["SpruceLog"] = "minecraft:spruce_log";
      MinecraftBlockTypes2["SprucePlanks"] = "minecraft:spruce_planks";
      MinecraftBlockTypes2["SprucePressurePlate"] = "minecraft:spruce_pressure_plate";
      MinecraftBlockTypes2["SpruceSapling"] = "minecraft:spruce_sapling";
      MinecraftBlockTypes2["SpruceShelf"] = "minecraft:spruce_shelf";
      MinecraftBlockTypes2["SpruceSlab"] = "minecraft:spruce_slab";
      MinecraftBlockTypes2["SpruceStairs"] = "minecraft:spruce_stairs";
      MinecraftBlockTypes2["SpruceStandingSign"] = "minecraft:spruce_standing_sign";
      MinecraftBlockTypes2["SpruceTrapdoor"] = "minecraft:spruce_trapdoor";
      MinecraftBlockTypes2["SpruceWallSign"] = "minecraft:spruce_wall_sign";
      MinecraftBlockTypes2["SpruceWood"] = "minecraft:spruce_wood";
      MinecraftBlockTypes2["StandingBanner"] = "minecraft:standing_banner";
      MinecraftBlockTypes2["StandingSign"] = "minecraft:standing_sign";
      MinecraftBlockTypes2["StickyPiston"] = "minecraft:sticky_piston";
      MinecraftBlockTypes2["StickyPistonArmCollision"] = "minecraft:sticky_piston_arm_collision";
      MinecraftBlockTypes2["Stone"] = "minecraft:stone";
      MinecraftBlockTypes2["StoneBrickDoubleSlab"] = "minecraft:stone_brick_double_slab";
      MinecraftBlockTypes2["StoneBrickSlab"] = "minecraft:stone_brick_slab";
      MinecraftBlockTypes2["StoneBrickStairs"] = "minecraft:stone_brick_stairs";
      MinecraftBlockTypes2["StoneBrickWall"] = "minecraft:stone_brick_wall";
      MinecraftBlockTypes2["StoneBricks"] = "minecraft:stone_bricks";
      MinecraftBlockTypes2["StoneButton"] = "minecraft:stone_button";
      MinecraftBlockTypes2["StonePressurePlate"] = "minecraft:stone_pressure_plate";
      MinecraftBlockTypes2["StoneStairs"] = "minecraft:stone_stairs";
      MinecraftBlockTypes2["StonecutterBlock"] = "minecraft:stonecutter_block";
      MinecraftBlockTypes2["StrawBed"] = "minecraft:straw_bed";
      MinecraftBlockTypes2["StrippedAcaciaLog"] = "minecraft:stripped_acacia_log";
      MinecraftBlockTypes2["StrippedAcaciaWood"] = "minecraft:stripped_acacia_wood";
      MinecraftBlockTypes2["StrippedBambooBlock"] = "minecraft:stripped_bamboo_block";
      MinecraftBlockTypes2["StrippedBirchLog"] = "minecraft:stripped_birch_log";
      MinecraftBlockTypes2["StrippedBirchWood"] = "minecraft:stripped_birch_wood";
      MinecraftBlockTypes2["StrippedCherryLog"] = "minecraft:stripped_cherry_log";
      MinecraftBlockTypes2["StrippedCherryWood"] = "minecraft:stripped_cherry_wood";
      MinecraftBlockTypes2["StrippedCrimsonHyphae"] = "minecraft:stripped_crimson_hyphae";
      MinecraftBlockTypes2["StrippedCrimsonStem"] = "minecraft:stripped_crimson_stem";
      MinecraftBlockTypes2["StrippedDarkOakLog"] = "minecraft:stripped_dark_oak_log";
      MinecraftBlockTypes2["StrippedDarkOakWood"] = "minecraft:stripped_dark_oak_wood";
      MinecraftBlockTypes2["StrippedJungleLog"] = "minecraft:stripped_jungle_log";
      MinecraftBlockTypes2["StrippedJungleWood"] = "minecraft:stripped_jungle_wood";
      MinecraftBlockTypes2["StrippedMangroveLog"] = "minecraft:stripped_mangrove_log";
      MinecraftBlockTypes2["StrippedMangroveWood"] = "minecraft:stripped_mangrove_wood";
      MinecraftBlockTypes2["StrippedOakLog"] = "minecraft:stripped_oak_log";
      MinecraftBlockTypes2["StrippedOakWood"] = "minecraft:stripped_oak_wood";
      MinecraftBlockTypes2["StrippedPaleOakLog"] = "minecraft:stripped_pale_oak_log";
      MinecraftBlockTypes2["StrippedPaleOakWood"] = "minecraft:stripped_pale_oak_wood";
      MinecraftBlockTypes2["StrippedPoplarLog"] = "minecraft:stripped_poplar_log";
      MinecraftBlockTypes2["StrippedPoplarWood"] = "minecraft:stripped_poplar_wood";
      MinecraftBlockTypes2["StrippedSpruceLog"] = "minecraft:stripped_spruce_log";
      MinecraftBlockTypes2["StrippedSpruceWood"] = "minecraft:stripped_spruce_wood";
      MinecraftBlockTypes2["StrippedWarpedHyphae"] = "minecraft:stripped_warped_hyphae";
      MinecraftBlockTypes2["StrippedWarpedStem"] = "minecraft:stripped_warped_stem";
      MinecraftBlockTypes2["StructureBlock"] = "minecraft:structure_block";
      MinecraftBlockTypes2["StructureVoid"] = "minecraft:structure_void";
      MinecraftBlockTypes2["Sulfur"] = "minecraft:sulfur";
      MinecraftBlockTypes2["SulfurBrickDoubleSlab"] = "minecraft:sulfur_brick_double_slab";
      MinecraftBlockTypes2["SulfurBrickSlab"] = "minecraft:sulfur_brick_slab";
      MinecraftBlockTypes2["SulfurBrickStairs"] = "minecraft:sulfur_brick_stairs";
      MinecraftBlockTypes2["SulfurBrickWall"] = "minecraft:sulfur_brick_wall";
      MinecraftBlockTypes2["SulfurBricks"] = "minecraft:sulfur_bricks";
      MinecraftBlockTypes2["SulfurDoubleSlab"] = "minecraft:sulfur_double_slab";
      MinecraftBlockTypes2["SulfurSlab"] = "minecraft:sulfur_slab";
      MinecraftBlockTypes2["SulfurSpike"] = "minecraft:sulfur_spike";
      MinecraftBlockTypes2["SulfurStairs"] = "minecraft:sulfur_stairs";
      MinecraftBlockTypes2["SulfurWall"] = "minecraft:sulfur_wall";
      MinecraftBlockTypes2["Sunflower"] = "minecraft:sunflower";
      MinecraftBlockTypes2["SuspiciousGravel"] = "minecraft:suspicious_gravel";
      MinecraftBlockTypes2["SuspiciousSand"] = "minecraft:suspicious_sand";
      MinecraftBlockTypes2["SweetBerryBush"] = "minecraft:sweet_berry_bush";
      MinecraftBlockTypes2["TallDryGrass"] = "minecraft:tall_dry_grass";
      MinecraftBlockTypes2["TallGrass"] = "minecraft:tall_grass";
      MinecraftBlockTypes2["Target"] = "minecraft:target";
      MinecraftBlockTypes2["TintedGlass"] = "minecraft:tinted_glass";
      MinecraftBlockTypes2["Tnt"] = "minecraft:tnt";
      MinecraftBlockTypes2["Torch"] = "minecraft:torch";
      MinecraftBlockTypes2["Torchflower"] = "minecraft:torchflower";
      MinecraftBlockTypes2["TorchflowerCrop"] = "minecraft:torchflower_crop";
      MinecraftBlockTypes2["Trapdoor"] = "minecraft:trapdoor";
      MinecraftBlockTypes2["TrappedChest"] = "minecraft:trapped_chest";
      MinecraftBlockTypes2["TrialSpawner"] = "minecraft:trial_spawner";
      MinecraftBlockTypes2["TripWire"] = "minecraft:trip_wire";
      MinecraftBlockTypes2["TripwireHook"] = "minecraft:tripwire_hook";
      MinecraftBlockTypes2["TubeCoral"] = "minecraft:tube_coral";
      MinecraftBlockTypes2["TubeCoralBlock"] = "minecraft:tube_coral_block";
      MinecraftBlockTypes2["TubeCoralFan"] = "minecraft:tube_coral_fan";
      MinecraftBlockTypes2["TubeCoralWallFan"] = "minecraft:tube_coral_wall_fan";
      MinecraftBlockTypes2["Tuff"] = "minecraft:tuff";
      MinecraftBlockTypes2["TuffBrickDoubleSlab"] = "minecraft:tuff_brick_double_slab";
      MinecraftBlockTypes2["TuffBrickSlab"] = "minecraft:tuff_brick_slab";
      MinecraftBlockTypes2["TuffBrickStairs"] = "minecraft:tuff_brick_stairs";
      MinecraftBlockTypes2["TuffBrickWall"] = "minecraft:tuff_brick_wall";
      MinecraftBlockTypes2["TuffBricks"] = "minecraft:tuff_bricks";
      MinecraftBlockTypes2["TuffDoubleSlab"] = "minecraft:tuff_double_slab";
      MinecraftBlockTypes2["TuffSlab"] = "minecraft:tuff_slab";
      MinecraftBlockTypes2["TuffStairs"] = "minecraft:tuff_stairs";
      MinecraftBlockTypes2["TuffWall"] = "minecraft:tuff_wall";
      MinecraftBlockTypes2["TurtleEgg"] = "minecraft:turtle_egg";
      MinecraftBlockTypes2["TwistingVines"] = "minecraft:twisting_vines";
      MinecraftBlockTypes2["UnderwaterTnt"] = "minecraft:underwater_tnt";
      MinecraftBlockTypes2["UnderwaterTorch"] = "minecraft:underwater_torch";
      MinecraftBlockTypes2["UndyedShulkerBox"] = "minecraft:undyed_shulker_box";
      MinecraftBlockTypes2["Unknown"] = "minecraft:unknown";
      MinecraftBlockTypes2["UnlitRedstoneTorch"] = "minecraft:unlit_redstone_torch";
      MinecraftBlockTypes2["UnpoweredComparator"] = "minecraft:unpowered_comparator";
      MinecraftBlockTypes2["UnpoweredRepeater"] = "minecraft:unpowered_repeater";
      MinecraftBlockTypes2["Vault"] = "minecraft:vault";
      MinecraftBlockTypes2["VerdantFroglight"] = "minecraft:verdant_froglight";
      MinecraftBlockTypes2["Vine"] = "minecraft:vine";
      MinecraftBlockTypes2["WallBanner"] = "minecraft:wall_banner";
      MinecraftBlockTypes2["WallSign"] = "minecraft:wall_sign";
      MinecraftBlockTypes2["WarpedButton"] = "minecraft:warped_button";
      MinecraftBlockTypes2["WarpedDoor"] = "minecraft:warped_door";
      MinecraftBlockTypes2["WarpedDoubleSlab"] = "minecraft:warped_double_slab";
      MinecraftBlockTypes2["WarpedFence"] = "minecraft:warped_fence";
      MinecraftBlockTypes2["WarpedFenceGate"] = "minecraft:warped_fence_gate";
      MinecraftBlockTypes2["WarpedFungus"] = "minecraft:warped_fungus";
      MinecraftBlockTypes2["WarpedHangingSign"] = "minecraft:warped_hanging_sign";
      MinecraftBlockTypes2["WarpedHyphae"] = "minecraft:warped_hyphae";
      MinecraftBlockTypes2["WarpedNylium"] = "minecraft:warped_nylium";
      MinecraftBlockTypes2["WarpedPlanks"] = "minecraft:warped_planks";
      MinecraftBlockTypes2["WarpedPressurePlate"] = "minecraft:warped_pressure_plate";
      MinecraftBlockTypes2["WarpedRoots"] = "minecraft:warped_roots";
      MinecraftBlockTypes2["WarpedShelf"] = "minecraft:warped_shelf";
      MinecraftBlockTypes2["WarpedSlab"] = "minecraft:warped_slab";
      MinecraftBlockTypes2["WarpedStairs"] = "minecraft:warped_stairs";
      MinecraftBlockTypes2["WarpedStandingSign"] = "minecraft:warped_standing_sign";
      MinecraftBlockTypes2["WarpedStem"] = "minecraft:warped_stem";
      MinecraftBlockTypes2["WarpedTrapdoor"] = "minecraft:warped_trapdoor";
      MinecraftBlockTypes2["WarpedWallSign"] = "minecraft:warped_wall_sign";
      MinecraftBlockTypes2["WarpedWartBlock"] = "minecraft:warped_wart_block";
      MinecraftBlockTypes2["Water"] = "minecraft:water";
      MinecraftBlockTypes2["Waterlily"] = "minecraft:waterlily";
      MinecraftBlockTypes2["WaxedChiseledCopper"] = "minecraft:waxed_chiseled_copper";
      MinecraftBlockTypes2["WaxedCopper"] = "minecraft:waxed_copper";
      MinecraftBlockTypes2["WaxedCopperBars"] = "minecraft:waxed_copper_bars";
      MinecraftBlockTypes2["WaxedCopperBulb"] = "minecraft:waxed_copper_bulb";
      MinecraftBlockTypes2["WaxedCopperChain"] = "minecraft:waxed_copper_chain";
      MinecraftBlockTypes2["WaxedCopperChest"] = "minecraft:waxed_copper_chest";
      MinecraftBlockTypes2["WaxedCopperDoor"] = "minecraft:waxed_copper_door";
      MinecraftBlockTypes2["WaxedCopperGolemStatue"] = "minecraft:waxed_copper_golem_statue";
      MinecraftBlockTypes2["WaxedCopperGrate"] = "minecraft:waxed_copper_grate";
      MinecraftBlockTypes2["WaxedCopperLantern"] = "minecraft:waxed_copper_lantern";
      MinecraftBlockTypes2["WaxedCopperTrapdoor"] = "minecraft:waxed_copper_trapdoor";
      MinecraftBlockTypes2["WaxedCutCopper"] = "minecraft:waxed_cut_copper";
      MinecraftBlockTypes2["WaxedCutCopperSlab"] = "minecraft:waxed_cut_copper_slab";
      MinecraftBlockTypes2["WaxedCutCopperStairs"] = "minecraft:waxed_cut_copper_stairs";
      MinecraftBlockTypes2["WaxedDoubleCutCopperSlab"] = "minecraft:waxed_double_cut_copper_slab";
      MinecraftBlockTypes2["WaxedExposedChiseledCopper"] = "minecraft:waxed_exposed_chiseled_copper";
      MinecraftBlockTypes2["WaxedExposedCopper"] = "minecraft:waxed_exposed_copper";
      MinecraftBlockTypes2["WaxedExposedCopperBars"] = "minecraft:waxed_exposed_copper_bars";
      MinecraftBlockTypes2["WaxedExposedCopperBulb"] = "minecraft:waxed_exposed_copper_bulb";
      MinecraftBlockTypes2["WaxedExposedCopperChain"] = "minecraft:waxed_exposed_copper_chain";
      MinecraftBlockTypes2["WaxedExposedCopperChest"] = "minecraft:waxed_exposed_copper_chest";
      MinecraftBlockTypes2["WaxedExposedCopperDoor"] = "minecraft:waxed_exposed_copper_door";
      MinecraftBlockTypes2["WaxedExposedCopperGolemStatue"] = "minecraft:waxed_exposed_copper_golem_statue";
      MinecraftBlockTypes2["WaxedExposedCopperGrate"] = "minecraft:waxed_exposed_copper_grate";
      MinecraftBlockTypes2["WaxedExposedCopperLantern"] = "minecraft:waxed_exposed_copper_lantern";
      MinecraftBlockTypes2["WaxedExposedCopperTrapdoor"] = "minecraft:waxed_exposed_copper_trapdoor";
      MinecraftBlockTypes2["WaxedExposedCutCopper"] = "minecraft:waxed_exposed_cut_copper";
      MinecraftBlockTypes2["WaxedExposedCutCopperSlab"] = "minecraft:waxed_exposed_cut_copper_slab";
      MinecraftBlockTypes2["WaxedExposedCutCopperStairs"] = "minecraft:waxed_exposed_cut_copper_stairs";
      MinecraftBlockTypes2["WaxedExposedDoubleCutCopperSlab"] = "minecraft:waxed_exposed_double_cut_copper_slab";
      MinecraftBlockTypes2["WaxedExposedLightningRod"] = "minecraft:waxed_exposed_lightning_rod";
      MinecraftBlockTypes2["WaxedLightningRod"] = "minecraft:waxed_lightning_rod";
      MinecraftBlockTypes2["WaxedOxidizedChiseledCopper"] = "minecraft:waxed_oxidized_chiseled_copper";
      MinecraftBlockTypes2["WaxedOxidizedCopper"] = "minecraft:waxed_oxidized_copper";
      MinecraftBlockTypes2["WaxedOxidizedCopperBars"] = "minecraft:waxed_oxidized_copper_bars";
      MinecraftBlockTypes2["WaxedOxidizedCopperBulb"] = "minecraft:waxed_oxidized_copper_bulb";
      MinecraftBlockTypes2["WaxedOxidizedCopperChain"] = "minecraft:waxed_oxidized_copper_chain";
      MinecraftBlockTypes2["WaxedOxidizedCopperChest"] = "minecraft:waxed_oxidized_copper_chest";
      MinecraftBlockTypes2["WaxedOxidizedCopperDoor"] = "minecraft:waxed_oxidized_copper_door";
      MinecraftBlockTypes2["WaxedOxidizedCopperGolemStatue"] = "minecraft:waxed_oxidized_copper_golem_statue";
      MinecraftBlockTypes2["WaxedOxidizedCopperGrate"] = "minecraft:waxed_oxidized_copper_grate";
      MinecraftBlockTypes2["WaxedOxidizedCopperLantern"] = "minecraft:waxed_oxidized_copper_lantern";
      MinecraftBlockTypes2["WaxedOxidizedCopperTrapdoor"] = "minecraft:waxed_oxidized_copper_trapdoor";
      MinecraftBlockTypes2["WaxedOxidizedCutCopper"] = "minecraft:waxed_oxidized_cut_copper";
      MinecraftBlockTypes2["WaxedOxidizedCutCopperSlab"] = "minecraft:waxed_oxidized_cut_copper_slab";
      MinecraftBlockTypes2["WaxedOxidizedCutCopperStairs"] = "minecraft:waxed_oxidized_cut_copper_stairs";
      MinecraftBlockTypes2["WaxedOxidizedDoubleCutCopperSlab"] = "minecraft:waxed_oxidized_double_cut_copper_slab";
      MinecraftBlockTypes2["WaxedOxidizedLightningRod"] = "minecraft:waxed_oxidized_lightning_rod";
      MinecraftBlockTypes2["WaxedWeatheredChiseledCopper"] = "minecraft:waxed_weathered_chiseled_copper";
      MinecraftBlockTypes2["WaxedWeatheredCopper"] = "minecraft:waxed_weathered_copper";
      MinecraftBlockTypes2["WaxedWeatheredCopperBars"] = "minecraft:waxed_weathered_copper_bars";
      MinecraftBlockTypes2["WaxedWeatheredCopperBulb"] = "minecraft:waxed_weathered_copper_bulb";
      MinecraftBlockTypes2["WaxedWeatheredCopperChain"] = "minecraft:waxed_weathered_copper_chain";
      MinecraftBlockTypes2["WaxedWeatheredCopperChest"] = "minecraft:waxed_weathered_copper_chest";
      MinecraftBlockTypes2["WaxedWeatheredCopperDoor"] = "minecraft:waxed_weathered_copper_door";
      MinecraftBlockTypes2["WaxedWeatheredCopperGolemStatue"] = "minecraft:waxed_weathered_copper_golem_statue";
      MinecraftBlockTypes2["WaxedWeatheredCopperGrate"] = "minecraft:waxed_weathered_copper_grate";
      MinecraftBlockTypes2["WaxedWeatheredCopperLantern"] = "minecraft:waxed_weathered_copper_lantern";
      MinecraftBlockTypes2["WaxedWeatheredCopperTrapdoor"] = "minecraft:waxed_weathered_copper_trapdoor";
      MinecraftBlockTypes2["WaxedWeatheredCutCopper"] = "minecraft:waxed_weathered_cut_copper";
      MinecraftBlockTypes2["WaxedWeatheredCutCopperSlab"] = "minecraft:waxed_weathered_cut_copper_slab";
      MinecraftBlockTypes2["WaxedWeatheredCutCopperStairs"] = "minecraft:waxed_weathered_cut_copper_stairs";
      MinecraftBlockTypes2["WaxedWeatheredDoubleCutCopperSlab"] = "minecraft:waxed_weathered_double_cut_copper_slab";
      MinecraftBlockTypes2["WaxedWeatheredLightningRod"] = "minecraft:waxed_weathered_lightning_rod";
      MinecraftBlockTypes2["WeatheredChiseledCopper"] = "minecraft:weathered_chiseled_copper";
      MinecraftBlockTypes2["WeatheredCopper"] = "minecraft:weathered_copper";
      MinecraftBlockTypes2["WeatheredCopperBars"] = "minecraft:weathered_copper_bars";
      MinecraftBlockTypes2["WeatheredCopperBulb"] = "minecraft:weathered_copper_bulb";
      MinecraftBlockTypes2["WeatheredCopperChain"] = "minecraft:weathered_copper_chain";
      MinecraftBlockTypes2["WeatheredCopperChest"] = "minecraft:weathered_copper_chest";
      MinecraftBlockTypes2["WeatheredCopperDoor"] = "minecraft:weathered_copper_door";
      MinecraftBlockTypes2["WeatheredCopperGolemStatue"] = "minecraft:weathered_copper_golem_statue";
      MinecraftBlockTypes2["WeatheredCopperGrate"] = "minecraft:weathered_copper_grate";
      MinecraftBlockTypes2["WeatheredCopperLantern"] = "minecraft:weathered_copper_lantern";
      MinecraftBlockTypes2["WeatheredCopperTrapdoor"] = "minecraft:weathered_copper_trapdoor";
      MinecraftBlockTypes2["WeatheredCutCopper"] = "minecraft:weathered_cut_copper";
      MinecraftBlockTypes2["WeatheredCutCopperSlab"] = "minecraft:weathered_cut_copper_slab";
      MinecraftBlockTypes2["WeatheredCutCopperStairs"] = "minecraft:weathered_cut_copper_stairs";
      MinecraftBlockTypes2["WeatheredDoubleCutCopperSlab"] = "minecraft:weathered_double_cut_copper_slab";
      MinecraftBlockTypes2["WeatheredLightningRod"] = "minecraft:weathered_lightning_rod";
      MinecraftBlockTypes2["Web"] = "minecraft:web";
      MinecraftBlockTypes2["WeepingVines"] = "minecraft:weeping_vines";
      MinecraftBlockTypes2["WetSponge"] = "minecraft:wet_sponge";
      MinecraftBlockTypes2["Wheat"] = "minecraft:wheat";
      MinecraftBlockTypes2["WhiteCandle"] = "minecraft:white_candle";
      MinecraftBlockTypes2["WhiteCandleCake"] = "minecraft:white_candle_cake";
      MinecraftBlockTypes2["WhiteCarpet"] = "minecraft:white_carpet";
      MinecraftBlockTypes2["WhiteConcrete"] = "minecraft:white_concrete";
      MinecraftBlockTypes2["WhiteConcretePowder"] = "minecraft:white_concrete_powder";
      MinecraftBlockTypes2["WhiteGlazedTerracotta"] = "minecraft:white_glazed_terracotta";
      MinecraftBlockTypes2["WhiteShulkerBox"] = "minecraft:white_shulker_box";
      MinecraftBlockTypes2["WhiteStainedGlass"] = "minecraft:white_stained_glass";
      MinecraftBlockTypes2["WhiteStainedGlassPane"] = "minecraft:white_stained_glass_pane";
      MinecraftBlockTypes2["WhiteTerracotta"] = "minecraft:white_terracotta";
      MinecraftBlockTypes2["WhiteTulip"] = "minecraft:white_tulip";
      MinecraftBlockTypes2["WhiteWool"] = "minecraft:white_wool";
      MinecraftBlockTypes2["WhiteWoolDoubleSlab"] = "minecraft:white_wool_double_slab";
      MinecraftBlockTypes2["WhiteWoolSlab"] = "minecraft:white_wool_slab";
      MinecraftBlockTypes2["WhiteWoolStairs"] = "minecraft:white_wool_stairs";
      MinecraftBlockTypes2["Wildflowers"] = "minecraft:wildflowers";
      MinecraftBlockTypes2["WitherRose"] = "minecraft:wither_rose";
      MinecraftBlockTypes2["WitherSkeletonSkull"] = "minecraft:wither_skeleton_skull";
      MinecraftBlockTypes2["WoodenButton"] = "minecraft:wooden_button";
      MinecraftBlockTypes2["WoodenDoor"] = "minecraft:wooden_door";
      MinecraftBlockTypes2["WoodenPressurePlate"] = "minecraft:wooden_pressure_plate";
      MinecraftBlockTypes2["YellowCandle"] = "minecraft:yellow_candle";
      MinecraftBlockTypes2["YellowCandleCake"] = "minecraft:yellow_candle_cake";
      MinecraftBlockTypes2["YellowCarpet"] = "minecraft:yellow_carpet";
      MinecraftBlockTypes2["YellowConcrete"] = "minecraft:yellow_concrete";
      MinecraftBlockTypes2["YellowConcretePowder"] = "minecraft:yellow_concrete_powder";
      MinecraftBlockTypes2["YellowGlazedTerracotta"] = "minecraft:yellow_glazed_terracotta";
      MinecraftBlockTypes2["YellowPoplarLeaves"] = "minecraft:yellow_poplar_leaves";
      MinecraftBlockTypes2["YellowShulkerBox"] = "minecraft:yellow_shulker_box";
      MinecraftBlockTypes2["YellowStainedGlass"] = "minecraft:yellow_stained_glass";
      MinecraftBlockTypes2["YellowStainedGlassPane"] = "minecraft:yellow_stained_glass_pane";
      MinecraftBlockTypes2["YellowTerracotta"] = "minecraft:yellow_terracotta";
      MinecraftBlockTypes2["YellowWool"] = "minecraft:yellow_wool";
      MinecraftBlockTypes2["YellowWoolDoubleSlab"] = "minecraft:yellow_wool_double_slab";
      MinecraftBlockTypes2["YellowWoolSlab"] = "minecraft:yellow_wool_slab";
      MinecraftBlockTypes2["YellowWoolStairs"] = "minecraft:yellow_wool_stairs";
      MinecraftBlockTypes2["ZombieHead"] = "minecraft:zombie_head";
      return MinecraftBlockTypes2;
    })(MinecraftBlockTypes || {});
    MinecraftCameraPresetsTypes = ((MinecraftCameraPresetsTypes2) => {
      MinecraftCameraPresetsTypes2["ControlSchemeCamera"] = "minecraft:control_scheme_camera";
      MinecraftCameraPresetsTypes2["FirstPerson"] = "minecraft:first_person";
      MinecraftCameraPresetsTypes2["FixedBoom"] = "minecraft:fixed_boom";
      MinecraftCameraPresetsTypes2["FollowOrbit"] = "minecraft:follow_orbit";
      MinecraftCameraPresetsTypes2["Free"] = "minecraft:free";
      MinecraftCameraPresetsTypes2["ThirdPerson"] = "minecraft:third_person";
      MinecraftCameraPresetsTypes2["ThirdPersonFront"] = "minecraft:third_person_front";
      return MinecraftCameraPresetsTypes2;
    })(MinecraftCameraPresetsTypes || {});
    MinecraftCooldownCategoryTypes = ((MinecraftCooldownCategoryTypes2) => {
      MinecraftCooldownCategoryTypes2["Chorusfruit"] = "minecraft:chorusfruit";
      MinecraftCooldownCategoryTypes2["EnderPearl"] = "minecraft:ender_pearl";
      MinecraftCooldownCategoryTypes2["GoatHorn"] = "minecraft:goat_horn";
      MinecraftCooldownCategoryTypes2["Shield"] = "minecraft:shield";
      MinecraftCooldownCategoryTypes2["Spear"] = "minecraft:spear";
      MinecraftCooldownCategoryTypes2["WindCharge"] = "minecraft:wind_charge";
      return MinecraftCooldownCategoryTypes2;
    })(MinecraftCooldownCategoryTypes || {});
    MinecraftDimensionTypes = ((MinecraftDimensionTypes2) => {
      MinecraftDimensionTypes2["Nether"] = "minecraft:nether";
      MinecraftDimensionTypes2["Overworld"] = "minecraft:overworld";
      MinecraftDimensionTypes2["TheEnd"] = "minecraft:the_end";
      return MinecraftDimensionTypes2;
    })(MinecraftDimensionTypes || {});
    MinecraftEffectTypes = ((MinecraftEffectTypes2) => {
      MinecraftEffectTypes2["Absorption"] = "minecraft:absorption";
      MinecraftEffectTypes2["BadOmen"] = "minecraft:bad_omen";
      MinecraftEffectTypes2["Blindness"] = "minecraft:blindness";
      MinecraftEffectTypes2["BreathOfTheNautilus"] = "minecraft:breath_of_the_nautilus";
      MinecraftEffectTypes2["ConduitPower"] = "minecraft:conduit_power";
      MinecraftEffectTypes2["Darkness"] = "minecraft:darkness";
      MinecraftEffectTypes2["FatalPoison"] = "minecraft:fatal_poison";
      MinecraftEffectTypes2["FireResistance"] = "minecraft:fire_resistance";
      MinecraftEffectTypes2["Haste"] = "minecraft:haste";
      MinecraftEffectTypes2["HealthBoost"] = "minecraft:health_boost";
      MinecraftEffectTypes2["Hunger"] = "minecraft:hunger";
      MinecraftEffectTypes2["Infested"] = "minecraft:infested";
      MinecraftEffectTypes2["InstantDamage"] = "minecraft:instant_damage";
      MinecraftEffectTypes2["InstantHealth"] = "minecraft:instant_health";
      MinecraftEffectTypes2["Invisibility"] = "minecraft:invisibility";
      MinecraftEffectTypes2["JumpBoost"] = "minecraft:jump_boost";
      MinecraftEffectTypes2["Levitation"] = "minecraft:levitation";
      MinecraftEffectTypes2["MiningFatigue"] = "minecraft:mining_fatigue";
      MinecraftEffectTypes2["Nausea"] = "minecraft:nausea";
      MinecraftEffectTypes2["NightVision"] = "minecraft:night_vision";
      MinecraftEffectTypes2["Oozing"] = "minecraft:oozing";
      MinecraftEffectTypes2["Poison"] = "minecraft:poison";
      MinecraftEffectTypes2["RaidOmen"] = "minecraft:raid_omen";
      MinecraftEffectTypes2["Regeneration"] = "minecraft:regeneration";
      MinecraftEffectTypes2["Resistance"] = "minecraft:resistance";
      MinecraftEffectTypes2["Saturation"] = "minecraft:saturation";
      MinecraftEffectTypes2["SlowFalling"] = "minecraft:slow_falling";
      MinecraftEffectTypes2["Slowness"] = "minecraft:slowness";
      MinecraftEffectTypes2["Speed"] = "minecraft:speed";
      MinecraftEffectTypes2["Strength"] = "minecraft:strength";
      MinecraftEffectTypes2["TrialOmen"] = "minecraft:trial_omen";
      MinecraftEffectTypes2["VillageHero"] = "minecraft:village_hero";
      MinecraftEffectTypes2["WaterBreathing"] = "minecraft:water_breathing";
      MinecraftEffectTypes2["Weakness"] = "minecraft:weakness";
      MinecraftEffectTypes2["Weaving"] = "minecraft:weaving";
      MinecraftEffectTypes2["WindCharged"] = "minecraft:wind_charged";
      MinecraftEffectTypes2["Wither"] = "minecraft:wither";
      return MinecraftEffectTypes2;
    })(MinecraftEffectTypes || {});
    MinecraftEnchantmentTypes = ((MinecraftEnchantmentTypes2) => {
      MinecraftEnchantmentTypes2["AquaAffinity"] = "minecraft:aqua_affinity";
      MinecraftEnchantmentTypes2["BaneOfArthropods"] = "minecraft:bane_of_arthropods";
      MinecraftEnchantmentTypes2["Binding"] = "minecraft:binding";
      MinecraftEnchantmentTypes2["BlastProtection"] = "minecraft:blast_protection";
      MinecraftEnchantmentTypes2["BowInfinity"] = "minecraft:infinity";
      MinecraftEnchantmentTypes2["Breach"] = "minecraft:breach";
      MinecraftEnchantmentTypes2["Channeling"] = "minecraft:channeling";
      MinecraftEnchantmentTypes2["Density"] = "minecraft:density";
      MinecraftEnchantmentTypes2["DepthStrider"] = "minecraft:depth_strider";
      MinecraftEnchantmentTypes2["Efficiency"] = "minecraft:efficiency";
      MinecraftEnchantmentTypes2["FeatherFalling"] = "minecraft:feather_falling";
      MinecraftEnchantmentTypes2["FireAspect"] = "minecraft:fire_aspect";
      MinecraftEnchantmentTypes2["FireProtection"] = "minecraft:fire_protection";
      MinecraftEnchantmentTypes2["Flame"] = "minecraft:flame";
      MinecraftEnchantmentTypes2["Fortune"] = "minecraft:fortune";
      MinecraftEnchantmentTypes2["FrostWalker"] = "minecraft:frost_walker";
      MinecraftEnchantmentTypes2["Impaling"] = "minecraft:impaling";
      MinecraftEnchantmentTypes2["Knockback"] = "minecraft:knockback";
      MinecraftEnchantmentTypes2["Looting"] = "minecraft:looting";
      MinecraftEnchantmentTypes2["Loyalty"] = "minecraft:loyalty";
      MinecraftEnchantmentTypes2["LuckOfTheSea"] = "minecraft:luck_of_the_sea";
      MinecraftEnchantmentTypes2["Lunge"] = "minecraft:lunge";
      MinecraftEnchantmentTypes2["Lure"] = "minecraft:lure";
      MinecraftEnchantmentTypes2["Mending"] = "minecraft:mending";
      MinecraftEnchantmentTypes2["Multishot"] = "minecraft:multishot";
      MinecraftEnchantmentTypes2["Piercing"] = "minecraft:piercing";
      MinecraftEnchantmentTypes2["Power"] = "minecraft:power";
      MinecraftEnchantmentTypes2["ProjectileProtection"] = "minecraft:projectile_protection";
      MinecraftEnchantmentTypes2["Protection"] = "minecraft:protection";
      MinecraftEnchantmentTypes2["Punch"] = "minecraft:punch";
      MinecraftEnchantmentTypes2["QuickCharge"] = "minecraft:quick_charge";
      MinecraftEnchantmentTypes2["Respiration"] = "minecraft:respiration";
      MinecraftEnchantmentTypes2["Riptide"] = "minecraft:riptide";
      MinecraftEnchantmentTypes2["Sharpness"] = "minecraft:sharpness";
      MinecraftEnchantmentTypes2["SilkTouch"] = "minecraft:silk_touch";
      MinecraftEnchantmentTypes2["Smite"] = "minecraft:smite";
      MinecraftEnchantmentTypes2["SoulSpeed"] = "minecraft:soul_speed";
      MinecraftEnchantmentTypes2["SwiftSneak"] = "minecraft:swift_sneak";
      MinecraftEnchantmentTypes2["Thorns"] = "minecraft:thorns";
      MinecraftEnchantmentTypes2["Unbreaking"] = "minecraft:unbreaking";
      MinecraftEnchantmentTypes2["Vanishing"] = "minecraft:vanishing";
      MinecraftEnchantmentTypes2["WindBurst"] = "minecraft:wind_burst";
      return MinecraftEnchantmentTypes2;
    })(MinecraftEnchantmentTypes || {});
    MinecraftEntityTypes = ((MinecraftEntityTypes2) => {
      MinecraftEntityTypes2["Agent"] = "minecraft:agent";
      MinecraftEntityTypes2["Allay"] = "minecraft:allay";
      MinecraftEntityTypes2["AreaEffectCloud"] = "minecraft:area_effect_cloud";
      MinecraftEntityTypes2["Armadillo"] = "minecraft:armadillo";
      MinecraftEntityTypes2["ArmorStand"] = "minecraft:armor_stand";
      MinecraftEntityTypes2["Arrow"] = "minecraft:arrow";
      MinecraftEntityTypes2["Axolotl"] = "minecraft:axolotl";
      MinecraftEntityTypes2["Bat"] = "minecraft:bat";
      MinecraftEntityTypes2["Bee"] = "minecraft:bee";
      MinecraftEntityTypes2["Blaze"] = "minecraft:blaze";
      MinecraftEntityTypes2["Boat"] = "minecraft:boat";
      MinecraftEntityTypes2["Bogged"] = "minecraft:bogged";
      MinecraftEntityTypes2["Breeze"] = "minecraft:breeze";
      MinecraftEntityTypes2["BreezeWindChargeProjectile"] = "minecraft:breeze_wind_charge_projectile";
      MinecraftEntityTypes2["Camel"] = "minecraft:camel";
      MinecraftEntityTypes2["CamelHusk"] = "minecraft:camel_husk";
      MinecraftEntityTypes2["Cat"] = "minecraft:cat";
      MinecraftEntityTypes2["CaveSpider"] = "minecraft:cave_spider";
      MinecraftEntityTypes2["ChestBoat"] = "minecraft:chest_boat";
      MinecraftEntityTypes2["ChestMinecart"] = "minecraft:chest_minecart";
      MinecraftEntityTypes2["Chicken"] = "minecraft:chicken";
      MinecraftEntityTypes2["Cod"] = "minecraft:cod";
      MinecraftEntityTypes2["CommandBlockMinecart"] = "minecraft:command_block_minecart";
      MinecraftEntityTypes2["CopperGolem"] = "minecraft:copper_golem";
      MinecraftEntityTypes2["Cow"] = "minecraft:cow";
      MinecraftEntityTypes2["Creaking"] = "minecraft:creaking";
      MinecraftEntityTypes2["Creeper"] = "minecraft:creeper";
      MinecraftEntityTypes2["Cushion"] = "minecraft:cushion";
      MinecraftEntityTypes2["Dolphin"] = "minecraft:dolphin";
      MinecraftEntityTypes2["Donkey"] = "minecraft:donkey";
      MinecraftEntityTypes2["DragonFireball"] = "minecraft:dragon_fireball";
      MinecraftEntityTypes2["Drowned"] = "minecraft:drowned";
      MinecraftEntityTypes2["Egg"] = "minecraft:egg";
      MinecraftEntityTypes2["ElderGuardian"] = "minecraft:elder_guardian";
      MinecraftEntityTypes2["EnderCrystal"] = "minecraft:ender_crystal";
      MinecraftEntityTypes2["EnderDragon"] = "minecraft:ender_dragon";
      MinecraftEntityTypes2["EnderPearl"] = "minecraft:ender_pearl";
      MinecraftEntityTypes2["Enderman"] = "minecraft:enderman";
      MinecraftEntityTypes2["Endermite"] = "minecraft:endermite";
      MinecraftEntityTypes2["EvocationIllager"] = "minecraft:evocation_illager";
      MinecraftEntityTypes2["EyeOfEnderSignal"] = "minecraft:eye_of_ender_signal";
      MinecraftEntityTypes2["Fireball"] = "minecraft:fireball";
      MinecraftEntityTypes2["FireworksRocket"] = "minecraft:fireworks_rocket";
      MinecraftEntityTypes2["FishingHook"] = "minecraft:fishing_hook";
      MinecraftEntityTypes2["Fox"] = "minecraft:fox";
      MinecraftEntityTypes2["Frog"] = "minecraft:frog";
      MinecraftEntityTypes2["Ghast"] = "minecraft:ghast";
      MinecraftEntityTypes2["GlowSquid"] = "minecraft:glow_squid";
      MinecraftEntityTypes2["Goat"] = "minecraft:goat";
      MinecraftEntityTypes2["Guardian"] = "minecraft:guardian";
      MinecraftEntityTypes2["HappyGhast"] = "minecraft:happy_ghast";
      MinecraftEntityTypes2["Hoglin"] = "minecraft:hoglin";
      MinecraftEntityTypes2["HopperMinecart"] = "minecraft:hopper_minecart";
      MinecraftEntityTypes2["Horse"] = "minecraft:horse";
      MinecraftEntityTypes2["Husk"] = "minecraft:husk";
      MinecraftEntityTypes2["IronGolem"] = "minecraft:iron_golem";
      MinecraftEntityTypes2["LightningBolt"] = "minecraft:lightning_bolt";
      MinecraftEntityTypes2["LingeringPotion"] = "minecraft:lingering_potion";
      MinecraftEntityTypes2["Llama"] = "minecraft:llama";
      MinecraftEntityTypes2["LlamaSpit"] = "minecraft:llama_spit";
      MinecraftEntityTypes2["MagmaCube"] = "minecraft:magma_cube";
      MinecraftEntityTypes2["Minecart"] = "minecraft:minecart";
      MinecraftEntityTypes2["Mooshroom"] = "minecraft:mooshroom";
      MinecraftEntityTypes2["Mule"] = "minecraft:mule";
      MinecraftEntityTypes2["Nautilus"] = "minecraft:nautilus";
      MinecraftEntityTypes2["Npc"] = "minecraft:npc";
      MinecraftEntityTypes2["Ocelot"] = "minecraft:ocelot";
      MinecraftEntityTypes2["OminousItemSpawner"] = "minecraft:ominous_item_spawner";
      MinecraftEntityTypes2["Panda"] = "minecraft:panda";
      MinecraftEntityTypes2["Parched"] = "minecraft:parched";
      MinecraftEntityTypes2["Parrot"] = "minecraft:parrot";
      MinecraftEntityTypes2["Phantom"] = "minecraft:phantom";
      MinecraftEntityTypes2["Pig"] = "minecraft:pig";
      MinecraftEntityTypes2["Piglin"] = "minecraft:piglin";
      MinecraftEntityTypes2["PiglinBrute"] = "minecraft:piglin_brute";
      MinecraftEntityTypes2["Pillager"] = "minecraft:pillager";
      MinecraftEntityTypes2["Player"] = "minecraft:player";
      MinecraftEntityTypes2["PolarBear"] = "minecraft:polar_bear";
      MinecraftEntityTypes2["Pufferfish"] = "minecraft:pufferfish";
      MinecraftEntityTypes2["Rabbit"] = "minecraft:rabbit";
      MinecraftEntityTypes2["Ravager"] = "minecraft:ravager";
      MinecraftEntityTypes2["Salmon"] = "minecraft:salmon";
      MinecraftEntityTypes2["Sheep"] = "minecraft:sheep";
      MinecraftEntityTypes2["Shulker"] = "minecraft:shulker";
      MinecraftEntityTypes2["ShulkerBullet"] = "minecraft:shulker_bullet";
      MinecraftEntityTypes2["Silverfish"] = "minecraft:silverfish";
      MinecraftEntityTypes2["Skeleton"] = "minecraft:skeleton";
      MinecraftEntityTypes2["SkeletonHorse"] = "minecraft:skeleton_horse";
      MinecraftEntityTypes2["Slime"] = "minecraft:slime";
      MinecraftEntityTypes2["SmallFireball"] = "minecraft:small_fireball";
      MinecraftEntityTypes2["Sniffer"] = "minecraft:sniffer";
      MinecraftEntityTypes2["SnowGolem"] = "minecraft:snow_golem";
      MinecraftEntityTypes2["Snowball"] = "minecraft:snowball";
      MinecraftEntityTypes2["Spider"] = "minecraft:spider";
      MinecraftEntityTypes2["SplashPotion"] = "minecraft:splash_potion";
      MinecraftEntityTypes2["Squid"] = "minecraft:squid";
      MinecraftEntityTypes2["Stray"] = "minecraft:stray";
      MinecraftEntityTypes2["Strider"] = "minecraft:strider";
      MinecraftEntityTypes2["SulfurCube"] = "minecraft:sulfur_cube";
      MinecraftEntityTypes2["Tadpole"] = "minecraft:tadpole";
      MinecraftEntityTypes2["ThrownTrident"] = "minecraft:thrown_trident";
      MinecraftEntityTypes2["Tnt"] = "minecraft:tnt";
      MinecraftEntityTypes2["TntMinecart"] = "minecraft:tnt_minecart";
      MinecraftEntityTypes2["TraderLlama"] = "minecraft:trader_llama";
      MinecraftEntityTypes2["TripodCamera"] = "minecraft:tripod_camera";
      MinecraftEntityTypes2["Tropicalfish"] = "minecraft:tropicalfish";
      MinecraftEntityTypes2["Turtle"] = "minecraft:turtle";
      MinecraftEntityTypes2["Vex"] = "minecraft:vex";
      MinecraftEntityTypes2["Villager"] = "minecraft:villager";
      MinecraftEntityTypes2["VillagerV2"] = "minecraft:villager_v2";
      MinecraftEntityTypes2["Vindicator"] = "minecraft:vindicator";
      MinecraftEntityTypes2["WanderingTrader"] = "minecraft:wandering_trader";
      MinecraftEntityTypes2["Warden"] = "minecraft:warden";
      MinecraftEntityTypes2["WindChargeProjectile"] = "minecraft:wind_charge_projectile";
      MinecraftEntityTypes2["Witch"] = "minecraft:witch";
      MinecraftEntityTypes2["Wither"] = "minecraft:wither";
      MinecraftEntityTypes2["WitherSkeleton"] = "minecraft:wither_skeleton";
      MinecraftEntityTypes2["WitherSkull"] = "minecraft:wither_skull";
      MinecraftEntityTypes2["WitherSkullDangerous"] = "minecraft:wither_skull_dangerous";
      MinecraftEntityTypes2["Wolf"] = "minecraft:wolf";
      MinecraftEntityTypes2["XpBottle"] = "minecraft:xp_bottle";
      MinecraftEntityTypes2["XpOrb"] = "minecraft:xp_orb";
      MinecraftEntityTypes2["Zoglin"] = "minecraft:zoglin";
      MinecraftEntityTypes2["Zombie"] = "minecraft:zombie";
      MinecraftEntityTypes2["ZombieHorse"] = "minecraft:zombie_horse";
      MinecraftEntityTypes2["ZombieNautilus"] = "minecraft:zombie_nautilus";
      MinecraftEntityTypes2["ZombiePigman"] = "minecraft:zombie_pigman";
      MinecraftEntityTypes2["ZombieVillager"] = "minecraft:zombie_villager";
      MinecraftEntityTypes2["ZombieVillagerV2"] = "minecraft:zombie_villager_v2";
      return MinecraftEntityTypes2;
    })(MinecraftEntityTypes || {});
    MinecraftFeatureTypes = ((MinecraftFeatureTypes2) => {
      MinecraftFeatureTypes2["AncientCity"] = "minecraft:ancient_city";
      MinecraftFeatureTypes2["BastionRemnant"] = "minecraft:bastion_remnant";
      MinecraftFeatureTypes2["BuriedTreasure"] = "minecraft:buried_treasure";
      MinecraftFeatureTypes2["EndCity"] = "minecraft:end_city";
      MinecraftFeatureTypes2["Fortress"] = "minecraft:fortress";
      MinecraftFeatureTypes2["Mansion"] = "minecraft:mansion";
      MinecraftFeatureTypes2["Mineshaft"] = "minecraft:mineshaft";
      MinecraftFeatureTypes2["Monument"] = "minecraft:monument";
      MinecraftFeatureTypes2["PillagerOutpost"] = "minecraft:pillager_outpost";
      MinecraftFeatureTypes2["RuinedPortal"] = "minecraft:ruined_portal";
      MinecraftFeatureTypes2["Ruins"] = "minecraft:ruins";
      MinecraftFeatureTypes2["Shipwreck"] = "minecraft:shipwreck";
      MinecraftFeatureTypes2["Stronghold"] = "minecraft:stronghold";
      MinecraftFeatureTypes2["Temple"] = "minecraft:temple";
      MinecraftFeatureTypes2["TrailRuins"] = "minecraft:trail_ruins";
      MinecraftFeatureTypes2["TrialChambers"] = "minecraft:trial_chambers";
      MinecraftFeatureTypes2["Village"] = "minecraft:village";
      return MinecraftFeatureTypes2;
    })(MinecraftFeatureTypes || {});
    MinecraftItemTypes = ((MinecraftItemTypes2) => {
      MinecraftItemTypes2["AcaciaBoat"] = "minecraft:acacia_boat";
      MinecraftItemTypes2["AcaciaButton"] = "minecraft:acacia_button";
      MinecraftItemTypes2["AcaciaChestBoat"] = "minecraft:acacia_chest_boat";
      MinecraftItemTypes2["AcaciaDoor"] = "minecraft:acacia_door";
      MinecraftItemTypes2["AcaciaFence"] = "minecraft:acacia_fence";
      MinecraftItemTypes2["AcaciaFenceGate"] = "minecraft:acacia_fence_gate";
      MinecraftItemTypes2["AcaciaHangingSign"] = "minecraft:acacia_hanging_sign";
      MinecraftItemTypes2["AcaciaLeaves"] = "minecraft:acacia_leaves";
      MinecraftItemTypes2["AcaciaLog"] = "minecraft:acacia_log";
      MinecraftItemTypes2["AcaciaPlanks"] = "minecraft:acacia_planks";
      MinecraftItemTypes2["AcaciaPressurePlate"] = "minecraft:acacia_pressure_plate";
      MinecraftItemTypes2["AcaciaSapling"] = "minecraft:acacia_sapling";
      MinecraftItemTypes2["AcaciaShelf"] = "minecraft:acacia_shelf";
      MinecraftItemTypes2["AcaciaSign"] = "minecraft:acacia_sign";
      MinecraftItemTypes2["AcaciaSlab"] = "minecraft:acacia_slab";
      MinecraftItemTypes2["AcaciaStairs"] = "minecraft:acacia_stairs";
      MinecraftItemTypes2["AcaciaTrapdoor"] = "minecraft:acacia_trapdoor";
      MinecraftItemTypes2["AcaciaWood"] = "minecraft:acacia_wood";
      MinecraftItemTypes2["ActivatorRail"] = "minecraft:activator_rail";
      MinecraftItemTypes2["AllaySpawnEgg"] = "minecraft:allay_spawn_egg";
      MinecraftItemTypes2["Allium"] = "minecraft:allium";
      MinecraftItemTypes2["Allow"] = "minecraft:allow";
      MinecraftItemTypes2["AmethystBlock"] = "minecraft:amethyst_block";
      MinecraftItemTypes2["AmethystCluster"] = "minecraft:amethyst_cluster";
      MinecraftItemTypes2["AmethystShard"] = "minecraft:amethyst_shard";
      MinecraftItemTypes2["AncientDebris"] = "minecraft:ancient_debris";
      MinecraftItemTypes2["Andesite"] = "minecraft:andesite";
      MinecraftItemTypes2["AndesiteSlab"] = "minecraft:andesite_slab";
      MinecraftItemTypes2["AndesiteStairs"] = "minecraft:andesite_stairs";
      MinecraftItemTypes2["AndesiteWall"] = "minecraft:andesite_wall";
      MinecraftItemTypes2["AnglerPotterySherd"] = "minecraft:angler_pottery_sherd";
      MinecraftItemTypes2["Anvil"] = "minecraft:anvil";
      MinecraftItemTypes2["Apple"] = "minecraft:apple";
      MinecraftItemTypes2["ArcherPotterySherd"] = "minecraft:archer_pottery_sherd";
      MinecraftItemTypes2["ArmadilloScute"] = "minecraft:armadillo_scute";
      MinecraftItemTypes2["ArmadilloSpawnEgg"] = "minecraft:armadillo_spawn_egg";
      MinecraftItemTypes2["ArmorStand"] = "minecraft:armor_stand";
      MinecraftItemTypes2["ArmsUpPotterySherd"] = "minecraft:arms_up_pottery_sherd";
      MinecraftItemTypes2["Arrow"] = "minecraft:arrow";
      MinecraftItemTypes2["AxolotlBucket"] = "minecraft:axolotl_bucket";
      MinecraftItemTypes2["AxolotlSpawnEgg"] = "minecraft:axolotl_spawn_egg";
      MinecraftItemTypes2["Azalea"] = "minecraft:azalea";
      MinecraftItemTypes2["AzaleaLeaves"] = "minecraft:azalea_leaves";
      MinecraftItemTypes2["AzaleaLeavesFlowered"] = "minecraft:azalea_leaves_flowered";
      MinecraftItemTypes2["AzureBluet"] = "minecraft:azure_bluet";
      MinecraftItemTypes2["BakedPotato"] = "minecraft:baked_potato";
      MinecraftItemTypes2["Bamboo"] = "minecraft:bamboo";
      MinecraftItemTypes2["BambooBlock"] = "minecraft:bamboo_block";
      MinecraftItemTypes2["BambooButton"] = "minecraft:bamboo_button";
      MinecraftItemTypes2["BambooChestRaft"] = "minecraft:bamboo_chest_raft";
      MinecraftItemTypes2["BambooDoor"] = "minecraft:bamboo_door";
      MinecraftItemTypes2["BambooFence"] = "minecraft:bamboo_fence";
      MinecraftItemTypes2["BambooFenceGate"] = "minecraft:bamboo_fence_gate";
      MinecraftItemTypes2["BambooHangingSign"] = "minecraft:bamboo_hanging_sign";
      MinecraftItemTypes2["BambooMosaic"] = "minecraft:bamboo_mosaic";
      MinecraftItemTypes2["BambooMosaicSlab"] = "minecraft:bamboo_mosaic_slab";
      MinecraftItemTypes2["BambooMosaicStairs"] = "minecraft:bamboo_mosaic_stairs";
      MinecraftItemTypes2["BambooPlanks"] = "minecraft:bamboo_planks";
      MinecraftItemTypes2["BambooPressurePlate"] = "minecraft:bamboo_pressure_plate";
      MinecraftItemTypes2["BambooRaft"] = "minecraft:bamboo_raft";
      MinecraftItemTypes2["BambooShelf"] = "minecraft:bamboo_shelf";
      MinecraftItemTypes2["BambooSign"] = "minecraft:bamboo_sign";
      MinecraftItemTypes2["BambooSlab"] = "minecraft:bamboo_slab";
      MinecraftItemTypes2["BambooStairs"] = "minecraft:bamboo_stairs";
      MinecraftItemTypes2["BambooTrapdoor"] = "minecraft:bamboo_trapdoor";
      MinecraftItemTypes2["Banner"] = "minecraft:banner";
      MinecraftItemTypes2["Barrel"] = "minecraft:barrel";
      MinecraftItemTypes2["Barrier"] = "minecraft:barrier";
      MinecraftItemTypes2["Basalt"] = "minecraft:basalt";
      MinecraftItemTypes2["BatSpawnEgg"] = "minecraft:bat_spawn_egg";
      MinecraftItemTypes2["Beacon"] = "minecraft:beacon";
      MinecraftItemTypes2["Bed"] = "minecraft:bed";
      MinecraftItemTypes2["Bedrock"] = "minecraft:bedrock";
      MinecraftItemTypes2["BeeNest"] = "minecraft:bee_nest";
      MinecraftItemTypes2["BeeSpawnEgg"] = "minecraft:bee_spawn_egg";
      MinecraftItemTypes2["Beef"] = "minecraft:beef";
      MinecraftItemTypes2["Beehive"] = "minecraft:beehive";
      MinecraftItemTypes2["Beetroot"] = "minecraft:beetroot";
      MinecraftItemTypes2["BeetrootSeeds"] = "minecraft:beetroot_seeds";
      MinecraftItemTypes2["BeetrootSoup"] = "minecraft:beetroot_soup";
      MinecraftItemTypes2["Bell"] = "minecraft:bell";
      MinecraftItemTypes2["BigDripleaf"] = "minecraft:big_dripleaf";
      MinecraftItemTypes2["BirchBoat"] = "minecraft:birch_boat";
      MinecraftItemTypes2["BirchButton"] = "minecraft:birch_button";
      MinecraftItemTypes2["BirchChestBoat"] = "minecraft:birch_chest_boat";
      MinecraftItemTypes2["BirchDoor"] = "minecraft:birch_door";
      MinecraftItemTypes2["BirchFence"] = "minecraft:birch_fence";
      MinecraftItemTypes2["BirchFenceGate"] = "minecraft:birch_fence_gate";
      MinecraftItemTypes2["BirchHangingSign"] = "minecraft:birch_hanging_sign";
      MinecraftItemTypes2["BirchLeaves"] = "minecraft:birch_leaves";
      MinecraftItemTypes2["BirchLog"] = "minecraft:birch_log";
      MinecraftItemTypes2["BirchPlanks"] = "minecraft:birch_planks";
      MinecraftItemTypes2["BirchPressurePlate"] = "minecraft:birch_pressure_plate";
      MinecraftItemTypes2["BirchSapling"] = "minecraft:birch_sapling";
      MinecraftItemTypes2["BirchShelf"] = "minecraft:birch_shelf";
      MinecraftItemTypes2["BirchSign"] = "minecraft:birch_sign";
      MinecraftItemTypes2["BirchSlab"] = "minecraft:birch_slab";
      MinecraftItemTypes2["BirchStairs"] = "minecraft:birch_stairs";
      MinecraftItemTypes2["BirchTrapdoor"] = "minecraft:birch_trapdoor";
      MinecraftItemTypes2["BirchWood"] = "minecraft:birch_wood";
      MinecraftItemTypes2["BlackBundle"] = "minecraft:black_bundle";
      MinecraftItemTypes2["BlackCandle"] = "minecraft:black_candle";
      MinecraftItemTypes2["BlackCarpet"] = "minecraft:black_carpet";
      MinecraftItemTypes2["BlackConcrete"] = "minecraft:black_concrete";
      MinecraftItemTypes2["BlackConcretePowder"] = "minecraft:black_concrete_powder";
      MinecraftItemTypes2["BlackCushion"] = "minecraft:black_cushion";
      MinecraftItemTypes2["BlackDye"] = "minecraft:black_dye";
      MinecraftItemTypes2["BlackGlazedTerracotta"] = "minecraft:black_glazed_terracotta";
      MinecraftItemTypes2["BlackHarness"] = "minecraft:black_harness";
      MinecraftItemTypes2["BlackShulkerBox"] = "minecraft:black_shulker_box";
      MinecraftItemTypes2["BlackStainedGlass"] = "minecraft:black_stained_glass";
      MinecraftItemTypes2["BlackStainedGlassPane"] = "minecraft:black_stained_glass_pane";
      MinecraftItemTypes2["BlackTerracotta"] = "minecraft:black_terracotta";
      MinecraftItemTypes2["BlackWool"] = "minecraft:black_wool";
      MinecraftItemTypes2["BlackWoolDoubleSlab"] = "minecraft:black_wool_double_slab";
      MinecraftItemTypes2["BlackWoolSlab"] = "minecraft:black_wool_slab";
      MinecraftItemTypes2["BlackWoolStairs"] = "minecraft:black_wool_stairs";
      MinecraftItemTypes2["Blackstone"] = "minecraft:blackstone";
      MinecraftItemTypes2["BlackstoneSlab"] = "minecraft:blackstone_slab";
      MinecraftItemTypes2["BlackstoneStairs"] = "minecraft:blackstone_stairs";
      MinecraftItemTypes2["BlackstoneWall"] = "minecraft:blackstone_wall";
      MinecraftItemTypes2["BladePotterySherd"] = "minecraft:blade_pottery_sherd";
      MinecraftItemTypes2["BlastFurnace"] = "minecraft:blast_furnace";
      MinecraftItemTypes2["BlazePowder"] = "minecraft:blaze_powder";
      MinecraftItemTypes2["BlazeRod"] = "minecraft:blaze_rod";
      MinecraftItemTypes2["BlazeSpawnEgg"] = "minecraft:blaze_spawn_egg";
      MinecraftItemTypes2["BlueBundle"] = "minecraft:blue_bundle";
      MinecraftItemTypes2["BlueCandle"] = "minecraft:blue_candle";
      MinecraftItemTypes2["BlueCarpet"] = "minecraft:blue_carpet";
      MinecraftItemTypes2["BlueConcrete"] = "minecraft:blue_concrete";
      MinecraftItemTypes2["BlueConcretePowder"] = "minecraft:blue_concrete_powder";
      MinecraftItemTypes2["BlueCushion"] = "minecraft:blue_cushion";
      MinecraftItemTypes2["BlueDye"] = "minecraft:blue_dye";
      MinecraftItemTypes2["BlueEgg"] = "minecraft:blue_egg";
      MinecraftItemTypes2["BlueGlazedTerracotta"] = "minecraft:blue_glazed_terracotta";
      MinecraftItemTypes2["BlueHarness"] = "minecraft:blue_harness";
      MinecraftItemTypes2["BlueIce"] = "minecraft:blue_ice";
      MinecraftItemTypes2["BlueOrchid"] = "minecraft:blue_orchid";
      MinecraftItemTypes2["BlueShulkerBox"] = "minecraft:blue_shulker_box";
      MinecraftItemTypes2["BlueStainedGlass"] = "minecraft:blue_stained_glass";
      MinecraftItemTypes2["BlueStainedGlassPane"] = "minecraft:blue_stained_glass_pane";
      MinecraftItemTypes2["BlueTerracotta"] = "minecraft:blue_terracotta";
      MinecraftItemTypes2["BlueWool"] = "minecraft:blue_wool";
      MinecraftItemTypes2["BlueWoolDoubleSlab"] = "minecraft:blue_wool_double_slab";
      MinecraftItemTypes2["BlueWoolSlab"] = "minecraft:blue_wool_slab";
      MinecraftItemTypes2["BlueWoolStairs"] = "minecraft:blue_wool_stairs";
      MinecraftItemTypes2["BoggedSpawnEgg"] = "minecraft:bogged_spawn_egg";
      MinecraftItemTypes2["BoltArmorTrimSmithingTemplate"] = "minecraft:bolt_armor_trim_smithing_template";
      MinecraftItemTypes2["Bone"] = "minecraft:bone";
      MinecraftItemTypes2["BoneBlock"] = "minecraft:bone_block";
      MinecraftItemTypes2["BoneMeal"] = "minecraft:bone_meal";
      MinecraftItemTypes2["Book"] = "minecraft:book";
      MinecraftItemTypes2["Bookshelf"] = "minecraft:bookshelf";
      MinecraftItemTypes2["BorderBlock"] = "minecraft:border_block";
      MinecraftItemTypes2["BordureIndentedBannerPattern"] = "minecraft:bordure_indented_banner_pattern";
      MinecraftItemTypes2["Bow"] = "minecraft:bow";
      MinecraftItemTypes2["Bowl"] = "minecraft:bowl";
      MinecraftItemTypes2["BrainCoral"] = "minecraft:brain_coral";
      MinecraftItemTypes2["BrainCoralBlock"] = "minecraft:brain_coral_block";
      MinecraftItemTypes2["BrainCoralFan"] = "minecraft:brain_coral_fan";
      MinecraftItemTypes2["Bread"] = "minecraft:bread";
      MinecraftItemTypes2["BreezeRod"] = "minecraft:breeze_rod";
      MinecraftItemTypes2["BreezeSpawnEgg"] = "minecraft:breeze_spawn_egg";
      MinecraftItemTypes2["BrewerPotterySherd"] = "minecraft:brewer_pottery_sherd";
      MinecraftItemTypes2["BrewingStand"] = "minecraft:brewing_stand";
      MinecraftItemTypes2["Brick"] = "minecraft:brick";
      MinecraftItemTypes2["BrickBlock"] = "minecraft:brick_block";
      MinecraftItemTypes2["BrickSlab"] = "minecraft:brick_slab";
      MinecraftItemTypes2["BrickStairs"] = "minecraft:brick_stairs";
      MinecraftItemTypes2["BrickWall"] = "minecraft:brick_wall";
      MinecraftItemTypes2["BrownBundle"] = "minecraft:brown_bundle";
      MinecraftItemTypes2["BrownCandle"] = "minecraft:brown_candle";
      MinecraftItemTypes2["BrownCarpet"] = "minecraft:brown_carpet";
      MinecraftItemTypes2["BrownConcrete"] = "minecraft:brown_concrete";
      MinecraftItemTypes2["BrownConcretePowder"] = "minecraft:brown_concrete_powder";
      MinecraftItemTypes2["BrownCushion"] = "minecraft:brown_cushion";
      MinecraftItemTypes2["BrownDye"] = "minecraft:brown_dye";
      MinecraftItemTypes2["BrownEgg"] = "minecraft:brown_egg";
      MinecraftItemTypes2["BrownGlazedTerracotta"] = "minecraft:brown_glazed_terracotta";
      MinecraftItemTypes2["BrownHarness"] = "minecraft:brown_harness";
      MinecraftItemTypes2["BrownMushroom"] = "minecraft:brown_mushroom";
      MinecraftItemTypes2["BrownMushroomBlock"] = "minecraft:brown_mushroom_block";
      MinecraftItemTypes2["BrownShulkerBox"] = "minecraft:brown_shulker_box";
      MinecraftItemTypes2["BrownStainedGlass"] = "minecraft:brown_stained_glass";
      MinecraftItemTypes2["BrownStainedGlassPane"] = "minecraft:brown_stained_glass_pane";
      MinecraftItemTypes2["BrownTerracotta"] = "minecraft:brown_terracotta";
      MinecraftItemTypes2["BrownWool"] = "minecraft:brown_wool";
      MinecraftItemTypes2["BrownWoolDoubleSlab"] = "minecraft:brown_wool_double_slab";
      MinecraftItemTypes2["BrownWoolSlab"] = "minecraft:brown_wool_slab";
      MinecraftItemTypes2["BrownWoolStairs"] = "minecraft:brown_wool_stairs";
      MinecraftItemTypes2["Brush"] = "minecraft:brush";
      MinecraftItemTypes2["BubbleCoral"] = "minecraft:bubble_coral";
      MinecraftItemTypes2["BubbleCoralBlock"] = "minecraft:bubble_coral_block";
      MinecraftItemTypes2["BubbleCoralFan"] = "minecraft:bubble_coral_fan";
      MinecraftItemTypes2["Bucket"] = "minecraft:bucket";
      MinecraftItemTypes2["BuddingAmethyst"] = "minecraft:budding_amethyst";
      MinecraftItemTypes2["Bundle"] = "minecraft:bundle";
      MinecraftItemTypes2["BurnPotterySherd"] = "minecraft:burn_pottery_sherd";
      MinecraftItemTypes2["Bush"] = "minecraft:bush";
      MinecraftItemTypes2["Cactus"] = "minecraft:cactus";
      MinecraftItemTypes2["CactusFlower"] = "minecraft:cactus_flower";
      MinecraftItemTypes2["Cake"] = "minecraft:cake";
      MinecraftItemTypes2["Calcite"] = "minecraft:calcite";
      MinecraftItemTypes2["CalibratedSculkSensor"] = "minecraft:calibrated_sculk_sensor";
      MinecraftItemTypes2["CamelHuskSpawnEgg"] = "minecraft:camel_husk_spawn_egg";
      MinecraftItemTypes2["CamelSpawnEgg"] = "minecraft:camel_spawn_egg";
      MinecraftItemTypes2["Campfire"] = "minecraft:campfire";
      MinecraftItemTypes2["Candle"] = "minecraft:candle";
      MinecraftItemTypes2["Carrot"] = "minecraft:carrot";
      MinecraftItemTypes2["CarrotOnAStick"] = "minecraft:carrot_on_a_stick";
      MinecraftItemTypes2["CartographyTable"] = "minecraft:cartography_table";
      MinecraftItemTypes2["CarvedPumpkin"] = "minecraft:carved_pumpkin";
      MinecraftItemTypes2["CatSpawnEgg"] = "minecraft:cat_spawn_egg";
      MinecraftItemTypes2["Cauldron"] = "minecraft:cauldron";
      MinecraftItemTypes2["CaveSpiderSpawnEgg"] = "minecraft:cave_spider_spawn_egg";
      MinecraftItemTypes2["ChainCommandBlock"] = "minecraft:chain_command_block";
      MinecraftItemTypes2["ChainmailBoots"] = "minecraft:chainmail_boots";
      MinecraftItemTypes2["ChainmailChestplate"] = "minecraft:chainmail_chestplate";
      MinecraftItemTypes2["ChainmailHelmet"] = "minecraft:chainmail_helmet";
      MinecraftItemTypes2["ChainmailLeggings"] = "minecraft:chainmail_leggings";
      MinecraftItemTypes2["Charcoal"] = "minecraft:charcoal";
      MinecraftItemTypes2["CherryBoat"] = "minecraft:cherry_boat";
      MinecraftItemTypes2["CherryButton"] = "minecraft:cherry_button";
      MinecraftItemTypes2["CherryChestBoat"] = "minecraft:cherry_chest_boat";
      MinecraftItemTypes2["CherryDoor"] = "minecraft:cherry_door";
      MinecraftItemTypes2["CherryFence"] = "minecraft:cherry_fence";
      MinecraftItemTypes2["CherryFenceGate"] = "minecraft:cherry_fence_gate";
      MinecraftItemTypes2["CherryHangingSign"] = "minecraft:cherry_hanging_sign";
      MinecraftItemTypes2["CherryLeaves"] = "minecraft:cherry_leaves";
      MinecraftItemTypes2["CherryLog"] = "minecraft:cherry_log";
      MinecraftItemTypes2["CherryPlanks"] = "minecraft:cherry_planks";
      MinecraftItemTypes2["CherryPressurePlate"] = "minecraft:cherry_pressure_plate";
      MinecraftItemTypes2["CherrySapling"] = "minecraft:cherry_sapling";
      MinecraftItemTypes2["CherryShelf"] = "minecraft:cherry_shelf";
      MinecraftItemTypes2["CherrySign"] = "minecraft:cherry_sign";
      MinecraftItemTypes2["CherrySlab"] = "minecraft:cherry_slab";
      MinecraftItemTypes2["CherryStairs"] = "minecraft:cherry_stairs";
      MinecraftItemTypes2["CherryTrapdoor"] = "minecraft:cherry_trapdoor";
      MinecraftItemTypes2["CherryWood"] = "minecraft:cherry_wood";
      MinecraftItemTypes2["Chest"] = "minecraft:chest";
      MinecraftItemTypes2["ChestMinecart"] = "minecraft:chest_minecart";
      MinecraftItemTypes2["Chicken"] = "minecraft:chicken";
      MinecraftItemTypes2["ChickenSpawnEgg"] = "minecraft:chicken_spawn_egg";
      MinecraftItemTypes2["ChippedAnvil"] = "minecraft:chipped_anvil";
      MinecraftItemTypes2["ChiseledBookshelf"] = "minecraft:chiseled_bookshelf";
      MinecraftItemTypes2["ChiseledCinnabar"] = "minecraft:chiseled_cinnabar";
      MinecraftItemTypes2["ChiseledCopper"] = "minecraft:chiseled_copper";
      MinecraftItemTypes2["ChiseledDeepslate"] = "minecraft:chiseled_deepslate";
      MinecraftItemTypes2["ChiseledNetherBricks"] = "minecraft:chiseled_nether_bricks";
      MinecraftItemTypes2["ChiseledPolishedBlackstone"] = "minecraft:chiseled_polished_blackstone";
      MinecraftItemTypes2["ChiseledQuartzBlock"] = "minecraft:chiseled_quartz_block";
      MinecraftItemTypes2["ChiseledRedSandstone"] = "minecraft:chiseled_red_sandstone";
      MinecraftItemTypes2["ChiseledResinBricks"] = "minecraft:chiseled_resin_bricks";
      MinecraftItemTypes2["ChiseledSandstone"] = "minecraft:chiseled_sandstone";
      MinecraftItemTypes2["ChiseledStoneBricks"] = "minecraft:chiseled_stone_bricks";
      MinecraftItemTypes2["ChiseledSulfur"] = "minecraft:chiseled_sulfur";
      MinecraftItemTypes2["ChiseledTuff"] = "minecraft:chiseled_tuff";
      MinecraftItemTypes2["ChiseledTuffBricks"] = "minecraft:chiseled_tuff_bricks";
      MinecraftItemTypes2["ChorusFlower"] = "minecraft:chorus_flower";
      MinecraftItemTypes2["ChorusFruit"] = "minecraft:chorus_fruit";
      MinecraftItemTypes2["ChorusPlant"] = "minecraft:chorus_plant";
      MinecraftItemTypes2["Cinnabar"] = "minecraft:cinnabar";
      MinecraftItemTypes2["CinnabarBrickSlab"] = "minecraft:cinnabar_brick_slab";
      MinecraftItemTypes2["CinnabarBrickStairs"] = "minecraft:cinnabar_brick_stairs";
      MinecraftItemTypes2["CinnabarBrickWall"] = "minecraft:cinnabar_brick_wall";
      MinecraftItemTypes2["CinnabarBricks"] = "minecraft:cinnabar_bricks";
      MinecraftItemTypes2["CinnabarSlab"] = "minecraft:cinnabar_slab";
      MinecraftItemTypes2["CinnabarStairs"] = "minecraft:cinnabar_stairs";
      MinecraftItemTypes2["CinnabarWall"] = "minecraft:cinnabar_wall";
      MinecraftItemTypes2["Clay"] = "minecraft:clay";
      MinecraftItemTypes2["ClayBall"] = "minecraft:clay_ball";
      MinecraftItemTypes2["Clock"] = "minecraft:clock";
      MinecraftItemTypes2["ClosedEyeblossom"] = "minecraft:closed_eyeblossom";
      MinecraftItemTypes2["Coal"] = "minecraft:coal";
      MinecraftItemTypes2["CoalBlock"] = "minecraft:coal_block";
      MinecraftItemTypes2["CoalOre"] = "minecraft:coal_ore";
      MinecraftItemTypes2["CoarseDirt"] = "minecraft:coarse_dirt";
      MinecraftItemTypes2["CoastArmorTrimSmithingTemplate"] = "minecraft:coast_armor_trim_smithing_template";
      MinecraftItemTypes2["CobbledDeepslate"] = "minecraft:cobbled_deepslate";
      MinecraftItemTypes2["CobbledDeepslateSlab"] = "minecraft:cobbled_deepslate_slab";
      MinecraftItemTypes2["CobbledDeepslateStairs"] = "minecraft:cobbled_deepslate_stairs";
      MinecraftItemTypes2["CobbledDeepslateWall"] = "minecraft:cobbled_deepslate_wall";
      MinecraftItemTypes2["Cobblestone"] = "minecraft:cobblestone";
      MinecraftItemTypes2["CobblestoneSlab"] = "minecraft:cobblestone_slab";
      MinecraftItemTypes2["CobblestoneWall"] = "minecraft:cobblestone_wall";
      MinecraftItemTypes2["CocoaBeans"] = "minecraft:cocoa_beans";
      MinecraftItemTypes2["Cod"] = "minecraft:cod";
      MinecraftItemTypes2["CodBucket"] = "minecraft:cod_bucket";
      MinecraftItemTypes2["CodSpawnEgg"] = "minecraft:cod_spawn_egg";
      MinecraftItemTypes2["CommandBlock"] = "minecraft:command_block";
      MinecraftItemTypes2["CommandBlockMinecart"] = "minecraft:command_block_minecart";
      MinecraftItemTypes2["Comparator"] = "minecraft:comparator";
      MinecraftItemTypes2["Compass"] = "minecraft:compass";
      MinecraftItemTypes2["Composter"] = "minecraft:composter";
      MinecraftItemTypes2["Conduit"] = "minecraft:conduit";
      MinecraftItemTypes2["CookedBeef"] = "minecraft:cooked_beef";
      MinecraftItemTypes2["CookedChicken"] = "minecraft:cooked_chicken";
      MinecraftItemTypes2["CookedCod"] = "minecraft:cooked_cod";
      MinecraftItemTypes2["CookedMutton"] = "minecraft:cooked_mutton";
      MinecraftItemTypes2["CookedPorkchop"] = "minecraft:cooked_porkchop";
      MinecraftItemTypes2["CookedRabbit"] = "minecraft:cooked_rabbit";
      MinecraftItemTypes2["CookedSalmon"] = "minecraft:cooked_salmon";
      MinecraftItemTypes2["Cookie"] = "minecraft:cookie";
      MinecraftItemTypes2["CopperAxe"] = "minecraft:copper_axe";
      MinecraftItemTypes2["CopperBars"] = "minecraft:copper_bars";
      MinecraftItemTypes2["CopperBlock"] = "minecraft:copper_block";
      MinecraftItemTypes2["CopperBoots"] = "minecraft:copper_boots";
      MinecraftItemTypes2["CopperBulb"] = "minecraft:copper_bulb";
      MinecraftItemTypes2["CopperChain"] = "minecraft:copper_chain";
      MinecraftItemTypes2["CopperChest"] = "minecraft:copper_chest";
      MinecraftItemTypes2["CopperChestplate"] = "minecraft:copper_chestplate";
      MinecraftItemTypes2["CopperDoor"] = "minecraft:copper_door";
      MinecraftItemTypes2["CopperGolemSpawnEgg"] = "minecraft:copper_golem_spawn_egg";
      MinecraftItemTypes2["CopperGolemStatue"] = "minecraft:copper_golem_statue";
      MinecraftItemTypes2["CopperGrate"] = "minecraft:copper_grate";
      MinecraftItemTypes2["CopperHelmet"] = "minecraft:copper_helmet";
      MinecraftItemTypes2["CopperHoe"] = "minecraft:copper_hoe";
      MinecraftItemTypes2["CopperHorseArmor"] = "minecraft:copper_horse_armor";
      MinecraftItemTypes2["CopperIngot"] = "minecraft:copper_ingot";
      MinecraftItemTypes2["CopperLantern"] = "minecraft:copper_lantern";
      MinecraftItemTypes2["CopperLeggings"] = "minecraft:copper_leggings";
      MinecraftItemTypes2["CopperNautilusArmor"] = "minecraft:copper_nautilus_armor";
      MinecraftItemTypes2["CopperNugget"] = "minecraft:copper_nugget";
      MinecraftItemTypes2["CopperOre"] = "minecraft:copper_ore";
      MinecraftItemTypes2["CopperPickaxe"] = "minecraft:copper_pickaxe";
      MinecraftItemTypes2["CopperShovel"] = "minecraft:copper_shovel";
      MinecraftItemTypes2["CopperSpear"] = "minecraft:copper_spear";
      MinecraftItemTypes2["CopperSword"] = "minecraft:copper_sword";
      MinecraftItemTypes2["CopperTorch"] = "minecraft:copper_torch";
      MinecraftItemTypes2["CopperTrapdoor"] = "minecraft:copper_trapdoor";
      MinecraftItemTypes2["Cornflower"] = "minecraft:cornflower";
      MinecraftItemTypes2["CowSpawnEgg"] = "minecraft:cow_spawn_egg";
      MinecraftItemTypes2["CrackedDeepslateBricks"] = "minecraft:cracked_deepslate_bricks";
      MinecraftItemTypes2["CrackedDeepslateTiles"] = "minecraft:cracked_deepslate_tiles";
      MinecraftItemTypes2["CrackedNetherBricks"] = "minecraft:cracked_nether_bricks";
      MinecraftItemTypes2["CrackedPolishedBlackstoneBricks"] = "minecraft:cracked_polished_blackstone_bricks";
      MinecraftItemTypes2["CrackedStoneBricks"] = "minecraft:cracked_stone_bricks";
      MinecraftItemTypes2["Crafter"] = "minecraft:crafter";
      MinecraftItemTypes2["CraftingTable"] = "minecraft:crafting_table";
      MinecraftItemTypes2["CreakingHeart"] = "minecraft:creaking_heart";
      MinecraftItemTypes2["CreakingSpawnEgg"] = "minecraft:creaking_spawn_egg";
      MinecraftItemTypes2["CreeperBannerPattern"] = "minecraft:creeper_banner_pattern";
      MinecraftItemTypes2["CreeperHead"] = "minecraft:creeper_head";
      MinecraftItemTypes2["CreeperSpawnEgg"] = "minecraft:creeper_spawn_egg";
      MinecraftItemTypes2["CrimsonButton"] = "minecraft:crimson_button";
      MinecraftItemTypes2["CrimsonDoor"] = "minecraft:crimson_door";
      MinecraftItemTypes2["CrimsonFence"] = "minecraft:crimson_fence";
      MinecraftItemTypes2["CrimsonFenceGate"] = "minecraft:crimson_fence_gate";
      MinecraftItemTypes2["CrimsonFungus"] = "minecraft:crimson_fungus";
      MinecraftItemTypes2["CrimsonHangingSign"] = "minecraft:crimson_hanging_sign";
      MinecraftItemTypes2["CrimsonHyphae"] = "minecraft:crimson_hyphae";
      MinecraftItemTypes2["CrimsonNylium"] = "minecraft:crimson_nylium";
      MinecraftItemTypes2["CrimsonPlanks"] = "minecraft:crimson_planks";
      MinecraftItemTypes2["CrimsonPressurePlate"] = "minecraft:crimson_pressure_plate";
      MinecraftItemTypes2["CrimsonRoots"] = "minecraft:crimson_roots";
      MinecraftItemTypes2["CrimsonShelf"] = "minecraft:crimson_shelf";
      MinecraftItemTypes2["CrimsonSign"] = "minecraft:crimson_sign";
      MinecraftItemTypes2["CrimsonSlab"] = "minecraft:crimson_slab";
      MinecraftItemTypes2["CrimsonStairs"] = "minecraft:crimson_stairs";
      MinecraftItemTypes2["CrimsonStem"] = "minecraft:crimson_stem";
      MinecraftItemTypes2["CrimsonTrapdoor"] = "minecraft:crimson_trapdoor";
      MinecraftItemTypes2["Crossbow"] = "minecraft:crossbow";
      MinecraftItemTypes2["CryingObsidian"] = "minecraft:crying_obsidian";
      MinecraftItemTypes2["CutCopper"] = "minecraft:cut_copper";
      MinecraftItemTypes2["CutCopperSlab"] = "minecraft:cut_copper_slab";
      MinecraftItemTypes2["CutCopperStairs"] = "minecraft:cut_copper_stairs";
      MinecraftItemTypes2["CutRedSandstone"] = "minecraft:cut_red_sandstone";
      MinecraftItemTypes2["CutRedSandstoneSlab"] = "minecraft:cut_red_sandstone_slab";
      MinecraftItemTypes2["CutSandstone"] = "minecraft:cut_sandstone";
      MinecraftItemTypes2["CutSandstoneSlab"] = "minecraft:cut_sandstone_slab";
      MinecraftItemTypes2["CyanBundle"] = "minecraft:cyan_bundle";
      MinecraftItemTypes2["CyanCandle"] = "minecraft:cyan_candle";
      MinecraftItemTypes2["CyanCarpet"] = "minecraft:cyan_carpet";
      MinecraftItemTypes2["CyanConcrete"] = "minecraft:cyan_concrete";
      MinecraftItemTypes2["CyanConcretePowder"] = "minecraft:cyan_concrete_powder";
      MinecraftItemTypes2["CyanCushion"] = "minecraft:cyan_cushion";
      MinecraftItemTypes2["CyanDye"] = "minecraft:cyan_dye";
      MinecraftItemTypes2["CyanGlazedTerracotta"] = "minecraft:cyan_glazed_terracotta";
      MinecraftItemTypes2["CyanHarness"] = "minecraft:cyan_harness";
      MinecraftItemTypes2["CyanShulkerBox"] = "minecraft:cyan_shulker_box";
      MinecraftItemTypes2["CyanStainedGlass"] = "minecraft:cyan_stained_glass";
      MinecraftItemTypes2["CyanStainedGlassPane"] = "minecraft:cyan_stained_glass_pane";
      MinecraftItemTypes2["CyanTerracotta"] = "minecraft:cyan_terracotta";
      MinecraftItemTypes2["CyanWool"] = "minecraft:cyan_wool";
      MinecraftItemTypes2["CyanWoolDoubleSlab"] = "minecraft:cyan_wool_double_slab";
      MinecraftItemTypes2["CyanWoolSlab"] = "minecraft:cyan_wool_slab";
      MinecraftItemTypes2["CyanWoolStairs"] = "minecraft:cyan_wool_stairs";
      MinecraftItemTypes2["DamagedAnvil"] = "minecraft:damaged_anvil";
      MinecraftItemTypes2["Dandelion"] = "minecraft:dandelion";
      MinecraftItemTypes2["DangerPotterySherd"] = "minecraft:danger_pottery_sherd";
      MinecraftItemTypes2["DarkOakBoat"] = "minecraft:dark_oak_boat";
      MinecraftItemTypes2["DarkOakButton"] = "minecraft:dark_oak_button";
      MinecraftItemTypes2["DarkOakChestBoat"] = "minecraft:dark_oak_chest_boat";
      MinecraftItemTypes2["DarkOakDoor"] = "minecraft:dark_oak_door";
      MinecraftItemTypes2["DarkOakFence"] = "minecraft:dark_oak_fence";
      MinecraftItemTypes2["DarkOakFenceGate"] = "minecraft:dark_oak_fence_gate";
      MinecraftItemTypes2["DarkOakHangingSign"] = "minecraft:dark_oak_hanging_sign";
      MinecraftItemTypes2["DarkOakLeaves"] = "minecraft:dark_oak_leaves";
      MinecraftItemTypes2["DarkOakLog"] = "minecraft:dark_oak_log";
      MinecraftItemTypes2["DarkOakPlanks"] = "minecraft:dark_oak_planks";
      MinecraftItemTypes2["DarkOakPressurePlate"] = "minecraft:dark_oak_pressure_plate";
      MinecraftItemTypes2["DarkOakSapling"] = "minecraft:dark_oak_sapling";
      MinecraftItemTypes2["DarkOakShelf"] = "minecraft:dark_oak_shelf";
      MinecraftItemTypes2["DarkOakSign"] = "minecraft:dark_oak_sign";
      MinecraftItemTypes2["DarkOakSlab"] = "minecraft:dark_oak_slab";
      MinecraftItemTypes2["DarkOakStairs"] = "minecraft:dark_oak_stairs";
      MinecraftItemTypes2["DarkOakTrapdoor"] = "minecraft:dark_oak_trapdoor";
      MinecraftItemTypes2["DarkOakWood"] = "minecraft:dark_oak_wood";
      MinecraftItemTypes2["DarkPrismarine"] = "minecraft:dark_prismarine";
      MinecraftItemTypes2["DarkPrismarineSlab"] = "minecraft:dark_prismarine_slab";
      MinecraftItemTypes2["DarkPrismarineStairs"] = "minecraft:dark_prismarine_stairs";
      MinecraftItemTypes2["DaylightDetector"] = "minecraft:daylight_detector";
      MinecraftItemTypes2["DeadBrainCoral"] = "minecraft:dead_brain_coral";
      MinecraftItemTypes2["DeadBrainCoralBlock"] = "minecraft:dead_brain_coral_block";
      MinecraftItemTypes2["DeadBrainCoralFan"] = "minecraft:dead_brain_coral_fan";
      MinecraftItemTypes2["DeadBubbleCoral"] = "minecraft:dead_bubble_coral";
      MinecraftItemTypes2["DeadBubbleCoralBlock"] = "minecraft:dead_bubble_coral_block";
      MinecraftItemTypes2["DeadBubbleCoralFan"] = "minecraft:dead_bubble_coral_fan";
      MinecraftItemTypes2["DeadFireCoral"] = "minecraft:dead_fire_coral";
      MinecraftItemTypes2["DeadFireCoralBlock"] = "minecraft:dead_fire_coral_block";
      MinecraftItemTypes2["DeadFireCoralFan"] = "minecraft:dead_fire_coral_fan";
      MinecraftItemTypes2["DeadHornCoral"] = "minecraft:dead_horn_coral";
      MinecraftItemTypes2["DeadHornCoralBlock"] = "minecraft:dead_horn_coral_block";
      MinecraftItemTypes2["DeadHornCoralFan"] = "minecraft:dead_horn_coral_fan";
      MinecraftItemTypes2["DeadTubeCoral"] = "minecraft:dead_tube_coral";
      MinecraftItemTypes2["DeadTubeCoralBlock"] = "minecraft:dead_tube_coral_block";
      MinecraftItemTypes2["DeadTubeCoralFan"] = "minecraft:dead_tube_coral_fan";
      MinecraftItemTypes2["Deadbush"] = "minecraft:deadbush";
      MinecraftItemTypes2["DecoratedPot"] = "minecraft:decorated_pot";
      MinecraftItemTypes2["Deepslate"] = "minecraft:deepslate";
      MinecraftItemTypes2["DeepslateBrickSlab"] = "minecraft:deepslate_brick_slab";
      MinecraftItemTypes2["DeepslateBrickStairs"] = "minecraft:deepslate_brick_stairs";
      MinecraftItemTypes2["DeepslateBrickWall"] = "minecraft:deepslate_brick_wall";
      MinecraftItemTypes2["DeepslateBricks"] = "minecraft:deepslate_bricks";
      MinecraftItemTypes2["DeepslateCoalOre"] = "minecraft:deepslate_coal_ore";
      MinecraftItemTypes2["DeepslateCopperOre"] = "minecraft:deepslate_copper_ore";
      MinecraftItemTypes2["DeepslateDiamondOre"] = "minecraft:deepslate_diamond_ore";
      MinecraftItemTypes2["DeepslateEmeraldOre"] = "minecraft:deepslate_emerald_ore";
      MinecraftItemTypes2["DeepslateGoldOre"] = "minecraft:deepslate_gold_ore";
      MinecraftItemTypes2["DeepslateIronOre"] = "minecraft:deepslate_iron_ore";
      MinecraftItemTypes2["DeepslateLapisOre"] = "minecraft:deepslate_lapis_ore";
      MinecraftItemTypes2["DeepslateRedstoneOre"] = "minecraft:deepslate_redstone_ore";
      MinecraftItemTypes2["DeepslateTileSlab"] = "minecraft:deepslate_tile_slab";
      MinecraftItemTypes2["DeepslateTileStairs"] = "minecraft:deepslate_tile_stairs";
      MinecraftItemTypes2["DeepslateTileWall"] = "minecraft:deepslate_tile_wall";
      MinecraftItemTypes2["DeepslateTiles"] = "minecraft:deepslate_tiles";
      MinecraftItemTypes2["Deny"] = "minecraft:deny";
      MinecraftItemTypes2["DetectorRail"] = "minecraft:detector_rail";
      MinecraftItemTypes2["Diamond"] = "minecraft:diamond";
      MinecraftItemTypes2["DiamondAxe"] = "minecraft:diamond_axe";
      MinecraftItemTypes2["DiamondBlock"] = "minecraft:diamond_block";
      MinecraftItemTypes2["DiamondBoots"] = "minecraft:diamond_boots";
      MinecraftItemTypes2["DiamondChestplate"] = "minecraft:diamond_chestplate";
      MinecraftItemTypes2["DiamondHelmet"] = "minecraft:diamond_helmet";
      MinecraftItemTypes2["DiamondHoe"] = "minecraft:diamond_hoe";
      MinecraftItemTypes2["DiamondHorseArmor"] = "minecraft:diamond_horse_armor";
      MinecraftItemTypes2["DiamondLeggings"] = "minecraft:diamond_leggings";
      MinecraftItemTypes2["DiamondNautilusArmor"] = "minecraft:diamond_nautilus_armor";
      MinecraftItemTypes2["DiamondOre"] = "minecraft:diamond_ore";
      MinecraftItemTypes2["DiamondPickaxe"] = "minecraft:diamond_pickaxe";
      MinecraftItemTypes2["DiamondShovel"] = "minecraft:diamond_shovel";
      MinecraftItemTypes2["DiamondSpear"] = "minecraft:diamond_spear";
      MinecraftItemTypes2["DiamondSword"] = "minecraft:diamond_sword";
      MinecraftItemTypes2["Diorite"] = "minecraft:diorite";
      MinecraftItemTypes2["DioriteSlab"] = "minecraft:diorite_slab";
      MinecraftItemTypes2["DioriteStairs"] = "minecraft:diorite_stairs";
      MinecraftItemTypes2["DioriteWall"] = "minecraft:diorite_wall";
      MinecraftItemTypes2["Dirt"] = "minecraft:dirt";
      MinecraftItemTypes2["DirtWithRoots"] = "minecraft:dirt_with_roots";
      MinecraftItemTypes2["DiscFragment5"] = "minecraft:disc_fragment_5";
      MinecraftItemTypes2["Dispenser"] = "minecraft:dispenser";
      MinecraftItemTypes2["DolphinSpawnEgg"] = "minecraft:dolphin_spawn_egg";
      MinecraftItemTypes2["DonkeySpawnEgg"] = "minecraft:donkey_spawn_egg";
      MinecraftItemTypes2["DragonBreath"] = "minecraft:dragon_breath";
      MinecraftItemTypes2["DragonEgg"] = "minecraft:dragon_egg";
      MinecraftItemTypes2["DragonHead"] = "minecraft:dragon_head";
      MinecraftItemTypes2["DriedGhast"] = "minecraft:dried_ghast";
      MinecraftItemTypes2["DriedKelp"] = "minecraft:dried_kelp";
      MinecraftItemTypes2["DriedKelpBlock"] = "minecraft:dried_kelp_block";
      MinecraftItemTypes2["DripstoneBlock"] = "minecraft:dripstone_block";
      MinecraftItemTypes2["Dropper"] = "minecraft:dropper";
      MinecraftItemTypes2["DrownedSpawnEgg"] = "minecraft:drowned_spawn_egg";
      MinecraftItemTypes2["DuneArmorTrimSmithingTemplate"] = "minecraft:dune_armor_trim_smithing_template";
      MinecraftItemTypes2["EchoShard"] = "minecraft:echo_shard";
      MinecraftItemTypes2["Egg"] = "minecraft:egg";
      MinecraftItemTypes2["ElderGuardianSpawnEgg"] = "minecraft:elder_guardian_spawn_egg";
      MinecraftItemTypes2["Elytra"] = "minecraft:elytra";
      MinecraftItemTypes2["Emerald"] = "minecraft:emerald";
      MinecraftItemTypes2["EmeraldBlock"] = "minecraft:emerald_block";
      MinecraftItemTypes2["EmeraldOre"] = "minecraft:emerald_ore";
      MinecraftItemTypes2["EmptyMap"] = "minecraft:empty_map";
      MinecraftItemTypes2["EnchantedBook"] = "minecraft:enchanted_book";
      MinecraftItemTypes2["EnchantedGoldenApple"] = "minecraft:enchanted_golden_apple";
      MinecraftItemTypes2["EnchantingTable"] = "minecraft:enchanting_table";
      MinecraftItemTypes2["EndBrickStairs"] = "minecraft:end_brick_stairs";
      MinecraftItemTypes2["EndBricks"] = "minecraft:end_bricks";
      MinecraftItemTypes2["EndCrystal"] = "minecraft:end_crystal";
      MinecraftItemTypes2["EndPortalFrame"] = "minecraft:end_portal_frame";
      MinecraftItemTypes2["EndRod"] = "minecraft:end_rod";
      MinecraftItemTypes2["EndStone"] = "minecraft:end_stone";
      MinecraftItemTypes2["EndStoneBrickSlab"] = "minecraft:end_stone_brick_slab";
      MinecraftItemTypes2["EndStoneBrickWall"] = "minecraft:end_stone_brick_wall";
      MinecraftItemTypes2["EnderChest"] = "minecraft:ender_chest";
      MinecraftItemTypes2["EnderDragonSpawnEgg"] = "minecraft:ender_dragon_spawn_egg";
      MinecraftItemTypes2["EnderEye"] = "minecraft:ender_eye";
      MinecraftItemTypes2["EnderPearl"] = "minecraft:ender_pearl";
      MinecraftItemTypes2["EndermanSpawnEgg"] = "minecraft:enderman_spawn_egg";
      MinecraftItemTypes2["EndermiteSpawnEgg"] = "minecraft:endermite_spawn_egg";
      MinecraftItemTypes2["EvokerSpawnEgg"] = "minecraft:evoker_spawn_egg";
      MinecraftItemTypes2["ExperienceBottle"] = "minecraft:experience_bottle";
      MinecraftItemTypes2["ExplorerPotterySherd"] = "minecraft:explorer_pottery_sherd";
      MinecraftItemTypes2["ExposedChiseledCopper"] = "minecraft:exposed_chiseled_copper";
      MinecraftItemTypes2["ExposedCopper"] = "minecraft:exposed_copper";
      MinecraftItemTypes2["ExposedCopperBars"] = "minecraft:exposed_copper_bars";
      MinecraftItemTypes2["ExposedCopperBulb"] = "minecraft:exposed_copper_bulb";
      MinecraftItemTypes2["ExposedCopperChain"] = "minecraft:exposed_copper_chain";
      MinecraftItemTypes2["ExposedCopperChest"] = "minecraft:exposed_copper_chest";
      MinecraftItemTypes2["ExposedCopperDoor"] = "minecraft:exposed_copper_door";
      MinecraftItemTypes2["ExposedCopperGolemStatue"] = "minecraft:exposed_copper_golem_statue";
      MinecraftItemTypes2["ExposedCopperGrate"] = "minecraft:exposed_copper_grate";
      MinecraftItemTypes2["ExposedCopperLantern"] = "minecraft:exposed_copper_lantern";
      MinecraftItemTypes2["ExposedCopperTrapdoor"] = "minecraft:exposed_copper_trapdoor";
      MinecraftItemTypes2["ExposedCutCopper"] = "minecraft:exposed_cut_copper";
      MinecraftItemTypes2["ExposedCutCopperSlab"] = "minecraft:exposed_cut_copper_slab";
      MinecraftItemTypes2["ExposedCutCopperStairs"] = "minecraft:exposed_cut_copper_stairs";
      MinecraftItemTypes2["ExposedLightningRod"] = "minecraft:exposed_lightning_rod";
      MinecraftItemTypes2["EyeArmorTrimSmithingTemplate"] = "minecraft:eye_armor_trim_smithing_template";
      MinecraftItemTypes2["Farmland"] = "minecraft:farmland";
      MinecraftItemTypes2["Feather"] = "minecraft:feather";
      MinecraftItemTypes2["FenceGate"] = "minecraft:fence_gate";
      MinecraftItemTypes2["FermentedSpiderEye"] = "minecraft:fermented_spider_eye";
      MinecraftItemTypes2["Fern"] = "minecraft:fern";
      MinecraftItemTypes2["FieldMasonedBannerPattern"] = "minecraft:field_masoned_banner_pattern";
      MinecraftItemTypes2["FilledMap"] = "minecraft:filled_map";
      MinecraftItemTypes2["FireCharge"] = "minecraft:fire_charge";
      MinecraftItemTypes2["FireCoral"] = "minecraft:fire_coral";
      MinecraftItemTypes2["FireCoralBlock"] = "minecraft:fire_coral_block";
      MinecraftItemTypes2["FireCoralFan"] = "minecraft:fire_coral_fan";
      MinecraftItemTypes2["FireflyBush"] = "minecraft:firefly_bush";
      MinecraftItemTypes2["FireworkRocket"] = "minecraft:firework_rocket";
      MinecraftItemTypes2["FireworkStar"] = "minecraft:firework_star";
      MinecraftItemTypes2["FishingRod"] = "minecraft:fishing_rod";
      MinecraftItemTypes2["FletchingTable"] = "minecraft:fletching_table";
      MinecraftItemTypes2["Flint"] = "minecraft:flint";
      MinecraftItemTypes2["FlintAndSteel"] = "minecraft:flint_and_steel";
      MinecraftItemTypes2["FlowArmorTrimSmithingTemplate"] = "minecraft:flow_armor_trim_smithing_template";
      MinecraftItemTypes2["FlowBannerPattern"] = "minecraft:flow_banner_pattern";
      MinecraftItemTypes2["FlowPotterySherd"] = "minecraft:flow_pottery_sherd";
      MinecraftItemTypes2["FlowerBannerPattern"] = "minecraft:flower_banner_pattern";
      MinecraftItemTypes2["FlowerPot"] = "minecraft:flower_pot";
      MinecraftItemTypes2["FloweringAzalea"] = "minecraft:flowering_azalea";
      MinecraftItemTypes2["FoxSpawnEgg"] = "minecraft:fox_spawn_egg";
      MinecraftItemTypes2["Frame"] = "minecraft:frame";
      MinecraftItemTypes2["FriendPotterySherd"] = "minecraft:friend_pottery_sherd";
      MinecraftItemTypes2["FrogSpawn"] = "minecraft:frog_spawn";
      MinecraftItemTypes2["FrogSpawnEgg"] = "minecraft:frog_spawn_egg";
      MinecraftItemTypes2["FrostedIce"] = "minecraft:frosted_ice";
      MinecraftItemTypes2["Furnace"] = "minecraft:furnace";
      MinecraftItemTypes2["GhastSpawnEgg"] = "minecraft:ghast_spawn_egg";
      MinecraftItemTypes2["GhastTear"] = "minecraft:ghast_tear";
      MinecraftItemTypes2["GildedBlackstone"] = "minecraft:gilded_blackstone";
      MinecraftItemTypes2["Glass"] = "minecraft:glass";
      MinecraftItemTypes2["GlassBottle"] = "minecraft:glass_bottle";
      MinecraftItemTypes2["GlassPane"] = "minecraft:glass_pane";
      MinecraftItemTypes2["GlisteringMelonSlice"] = "minecraft:glistering_melon_slice";
      MinecraftItemTypes2["GlobeBannerPattern"] = "minecraft:globe_banner_pattern";
      MinecraftItemTypes2["GlowBerries"] = "minecraft:glow_berries";
      MinecraftItemTypes2["GlowFrame"] = "minecraft:glow_frame";
      MinecraftItemTypes2["GlowInkSac"] = "minecraft:glow_ink_sac";
      MinecraftItemTypes2["GlowLichen"] = "minecraft:glow_lichen";
      MinecraftItemTypes2["GlowSquidSpawnEgg"] = "minecraft:glow_squid_spawn_egg";
      MinecraftItemTypes2["Glowstone"] = "minecraft:glowstone";
      MinecraftItemTypes2["GlowstoneDust"] = "minecraft:glowstone_dust";
      MinecraftItemTypes2["GoatHorn"] = "minecraft:goat_horn";
      MinecraftItemTypes2["GoatSpawnEgg"] = "minecraft:goat_spawn_egg";
      MinecraftItemTypes2["GoldBlock"] = "minecraft:gold_block";
      MinecraftItemTypes2["GoldIngot"] = "minecraft:gold_ingot";
      MinecraftItemTypes2["GoldNugget"] = "minecraft:gold_nugget";
      MinecraftItemTypes2["GoldOre"] = "minecraft:gold_ore";
      MinecraftItemTypes2["GoldenApple"] = "minecraft:golden_apple";
      MinecraftItemTypes2["GoldenAxe"] = "minecraft:golden_axe";
      MinecraftItemTypes2["GoldenBoots"] = "minecraft:golden_boots";
      MinecraftItemTypes2["GoldenCarrot"] = "minecraft:golden_carrot";
      MinecraftItemTypes2["GoldenChestplate"] = "minecraft:golden_chestplate";
      MinecraftItemTypes2["GoldenDandelion"] = "minecraft:golden_dandelion";
      MinecraftItemTypes2["GoldenHelmet"] = "minecraft:golden_helmet";
      MinecraftItemTypes2["GoldenHoe"] = "minecraft:golden_hoe";
      MinecraftItemTypes2["GoldenHorseArmor"] = "minecraft:golden_horse_armor";
      MinecraftItemTypes2["GoldenLeggings"] = "minecraft:golden_leggings";
      MinecraftItemTypes2["GoldenNautilusArmor"] = "minecraft:golden_nautilus_armor";
      MinecraftItemTypes2["GoldenPickaxe"] = "minecraft:golden_pickaxe";
      MinecraftItemTypes2["GoldenRail"] = "minecraft:golden_rail";
      MinecraftItemTypes2["GoldenShovel"] = "minecraft:golden_shovel";
      MinecraftItemTypes2["GoldenSpear"] = "minecraft:golden_spear";
      MinecraftItemTypes2["GoldenSword"] = "minecraft:golden_sword";
      MinecraftItemTypes2["Granite"] = "minecraft:granite";
      MinecraftItemTypes2["GraniteSlab"] = "minecraft:granite_slab";
      MinecraftItemTypes2["GraniteStairs"] = "minecraft:granite_stairs";
      MinecraftItemTypes2["GraniteWall"] = "minecraft:granite_wall";
      MinecraftItemTypes2["GrassBlock"] = "minecraft:grass_block";
      MinecraftItemTypes2["GrassPath"] = "minecraft:grass_path";
      MinecraftItemTypes2["Gravel"] = "minecraft:gravel";
      MinecraftItemTypes2["GrayBundle"] = "minecraft:gray_bundle";
      MinecraftItemTypes2["GrayCandle"] = "minecraft:gray_candle";
      MinecraftItemTypes2["GrayCarpet"] = "minecraft:gray_carpet";
      MinecraftItemTypes2["GrayConcrete"] = "minecraft:gray_concrete";
      MinecraftItemTypes2["GrayConcretePowder"] = "minecraft:gray_concrete_powder";
      MinecraftItemTypes2["GrayCushion"] = "minecraft:gray_cushion";
      MinecraftItemTypes2["GrayDye"] = "minecraft:gray_dye";
      MinecraftItemTypes2["GrayGlazedTerracotta"] = "minecraft:gray_glazed_terracotta";
      MinecraftItemTypes2["GrayHarness"] = "minecraft:gray_harness";
      MinecraftItemTypes2["GrayShulkerBox"] = "minecraft:gray_shulker_box";
      MinecraftItemTypes2["GrayStainedGlass"] = "minecraft:gray_stained_glass";
      MinecraftItemTypes2["GrayStainedGlassPane"] = "minecraft:gray_stained_glass_pane";
      MinecraftItemTypes2["GrayTerracotta"] = "minecraft:gray_terracotta";
      MinecraftItemTypes2["GrayWool"] = "minecraft:gray_wool";
      MinecraftItemTypes2["GrayWoolDoubleSlab"] = "minecraft:gray_wool_double_slab";
      MinecraftItemTypes2["GrayWoolSlab"] = "minecraft:gray_wool_slab";
      MinecraftItemTypes2["GrayWoolStairs"] = "minecraft:gray_wool_stairs";
      MinecraftItemTypes2["GreenBundle"] = "minecraft:green_bundle";
      MinecraftItemTypes2["GreenCandle"] = "minecraft:green_candle";
      MinecraftItemTypes2["GreenCarpet"] = "minecraft:green_carpet";
      MinecraftItemTypes2["GreenConcrete"] = "minecraft:green_concrete";
      MinecraftItemTypes2["GreenConcretePowder"] = "minecraft:green_concrete_powder";
      MinecraftItemTypes2["GreenCushion"] = "minecraft:green_cushion";
      MinecraftItemTypes2["GreenDye"] = "minecraft:green_dye";
      MinecraftItemTypes2["GreenGlazedTerracotta"] = "minecraft:green_glazed_terracotta";
      MinecraftItemTypes2["GreenHarness"] = "minecraft:green_harness";
      MinecraftItemTypes2["GreenShulkerBox"] = "minecraft:green_shulker_box";
      MinecraftItemTypes2["GreenStainedGlass"] = "minecraft:green_stained_glass";
      MinecraftItemTypes2["GreenStainedGlassPane"] = "minecraft:green_stained_glass_pane";
      MinecraftItemTypes2["GreenTerracotta"] = "minecraft:green_terracotta";
      MinecraftItemTypes2["GreenWool"] = "minecraft:green_wool";
      MinecraftItemTypes2["GreenWoolDoubleSlab"] = "minecraft:green_wool_double_slab";
      MinecraftItemTypes2["GreenWoolSlab"] = "minecraft:green_wool_slab";
      MinecraftItemTypes2["GreenWoolStairs"] = "minecraft:green_wool_stairs";
      MinecraftItemTypes2["Grindstone"] = "minecraft:grindstone";
      MinecraftItemTypes2["GuardianSpawnEgg"] = "minecraft:guardian_spawn_egg";
      MinecraftItemTypes2["Gunpowder"] = "minecraft:gunpowder";
      MinecraftItemTypes2["GusterBannerPattern"] = "minecraft:guster_banner_pattern";
      MinecraftItemTypes2["GusterPotterySherd"] = "minecraft:guster_pottery_sherd";
      MinecraftItemTypes2["HangingRoots"] = "minecraft:hanging_roots";
      MinecraftItemTypes2["HappyGhastSpawnEgg"] = "minecraft:happy_ghast_spawn_egg";
      MinecraftItemTypes2["HardenedClay"] = "minecraft:hardened_clay";
      MinecraftItemTypes2["HayBlock"] = "minecraft:hay_block";
      MinecraftItemTypes2["HeartOfTheSea"] = "minecraft:heart_of_the_sea";
      MinecraftItemTypes2["HeartPotterySherd"] = "minecraft:heart_pottery_sherd";
      MinecraftItemTypes2["HeartbreakPotterySherd"] = "minecraft:heartbreak_pottery_sherd";
      MinecraftItemTypes2["HeavyCore"] = "minecraft:heavy_core";
      MinecraftItemTypes2["HeavyWeightedPressurePlate"] = "minecraft:heavy_weighted_pressure_plate";
      MinecraftItemTypes2["HoglinSpawnEgg"] = "minecraft:hoglin_spawn_egg";
      MinecraftItemTypes2["HoneyBlock"] = "minecraft:honey_block";
      MinecraftItemTypes2["HoneyBottle"] = "minecraft:honey_bottle";
      MinecraftItemTypes2["Honeycomb"] = "minecraft:honeycomb";
      MinecraftItemTypes2["HoneycombBlock"] = "minecraft:honeycomb_block";
      MinecraftItemTypes2["Hopper"] = "minecraft:hopper";
      MinecraftItemTypes2["HopperMinecart"] = "minecraft:hopper_minecart";
      MinecraftItemTypes2["HornCoral"] = "minecraft:horn_coral";
      MinecraftItemTypes2["HornCoralBlock"] = "minecraft:horn_coral_block";
      MinecraftItemTypes2["HornCoralFan"] = "minecraft:horn_coral_fan";
      MinecraftItemTypes2["HorseSpawnEgg"] = "minecraft:horse_spawn_egg";
      MinecraftItemTypes2["HostArmorTrimSmithingTemplate"] = "minecraft:host_armor_trim_smithing_template";
      MinecraftItemTypes2["HowlPotterySherd"] = "minecraft:howl_pottery_sherd";
      MinecraftItemTypes2["HuskSpawnEgg"] = "minecraft:husk_spawn_egg";
      MinecraftItemTypes2["Ice"] = "minecraft:ice";
      MinecraftItemTypes2["InfestedChiseledStoneBricks"] = "minecraft:infested_chiseled_stone_bricks";
      MinecraftItemTypes2["InfestedCobblestone"] = "minecraft:infested_cobblestone";
      MinecraftItemTypes2["InfestedCrackedStoneBricks"] = "minecraft:infested_cracked_stone_bricks";
      MinecraftItemTypes2["InfestedDeepslate"] = "minecraft:infested_deepslate";
      MinecraftItemTypes2["InfestedMossyStoneBricks"] = "minecraft:infested_mossy_stone_bricks";
      MinecraftItemTypes2["InfestedStone"] = "minecraft:infested_stone";
      MinecraftItemTypes2["InfestedStoneBricks"] = "minecraft:infested_stone_bricks";
      MinecraftItemTypes2["InkSac"] = "minecraft:ink_sac";
      MinecraftItemTypes2["IronAxe"] = "minecraft:iron_axe";
      MinecraftItemTypes2["IronBars"] = "minecraft:iron_bars";
      MinecraftItemTypes2["IronBlock"] = "minecraft:iron_block";
      MinecraftItemTypes2["IronBoots"] = "minecraft:iron_boots";
      MinecraftItemTypes2["IronChain"] = "minecraft:iron_chain";
      MinecraftItemTypes2["IronChestplate"] = "minecraft:iron_chestplate";
      MinecraftItemTypes2["IronDoor"] = "minecraft:iron_door";
      MinecraftItemTypes2["IronGolemSpawnEgg"] = "minecraft:iron_golem_spawn_egg";
      MinecraftItemTypes2["IronHelmet"] = "minecraft:iron_helmet";
      MinecraftItemTypes2["IronHoe"] = "minecraft:iron_hoe";
      MinecraftItemTypes2["IronHorseArmor"] = "minecraft:iron_horse_armor";
      MinecraftItemTypes2["IronIngot"] = "minecraft:iron_ingot";
      MinecraftItemTypes2["IronLeggings"] = "minecraft:iron_leggings";
      MinecraftItemTypes2["IronNautilusArmor"] = "minecraft:iron_nautilus_armor";
      MinecraftItemTypes2["IronNugget"] = "minecraft:iron_nugget";
      MinecraftItemTypes2["IronOre"] = "minecraft:iron_ore";
      MinecraftItemTypes2["IronPickaxe"] = "minecraft:iron_pickaxe";
      MinecraftItemTypes2["IronShovel"] = "minecraft:iron_shovel";
      MinecraftItemTypes2["IronSpear"] = "minecraft:iron_spear";
      MinecraftItemTypes2["IronSword"] = "minecraft:iron_sword";
      MinecraftItemTypes2["IronTrapdoor"] = "minecraft:iron_trapdoor";
      MinecraftItemTypes2["Jigsaw"] = "minecraft:jigsaw";
      MinecraftItemTypes2["Jukebox"] = "minecraft:jukebox";
      MinecraftItemTypes2["JungleBoat"] = "minecraft:jungle_boat";
      MinecraftItemTypes2["JungleButton"] = "minecraft:jungle_button";
      MinecraftItemTypes2["JungleChestBoat"] = "minecraft:jungle_chest_boat";
      MinecraftItemTypes2["JungleDoor"] = "minecraft:jungle_door";
      MinecraftItemTypes2["JungleFence"] = "minecraft:jungle_fence";
      MinecraftItemTypes2["JungleFenceGate"] = "minecraft:jungle_fence_gate";
      MinecraftItemTypes2["JungleHangingSign"] = "minecraft:jungle_hanging_sign";
      MinecraftItemTypes2["JungleLeaves"] = "minecraft:jungle_leaves";
      MinecraftItemTypes2["JungleLog"] = "minecraft:jungle_log";
      MinecraftItemTypes2["JunglePlanks"] = "minecraft:jungle_planks";
      MinecraftItemTypes2["JunglePressurePlate"] = "minecraft:jungle_pressure_plate";
      MinecraftItemTypes2["JungleSapling"] = "minecraft:jungle_sapling";
      MinecraftItemTypes2["JungleShelf"] = "minecraft:jungle_shelf";
      MinecraftItemTypes2["JungleSign"] = "minecraft:jungle_sign";
      MinecraftItemTypes2["JungleSlab"] = "minecraft:jungle_slab";
      MinecraftItemTypes2["JungleStairs"] = "minecraft:jungle_stairs";
      MinecraftItemTypes2["JungleTrapdoor"] = "minecraft:jungle_trapdoor";
      MinecraftItemTypes2["JungleWood"] = "minecraft:jungle_wood";
      MinecraftItemTypes2["Kelp"] = "minecraft:kelp";
      MinecraftItemTypes2["Ladder"] = "minecraft:ladder";
      MinecraftItemTypes2["Lantern"] = "minecraft:lantern";
      MinecraftItemTypes2["LapisBlock"] = "minecraft:lapis_block";
      MinecraftItemTypes2["LapisLazuli"] = "minecraft:lapis_lazuli";
      MinecraftItemTypes2["LapisOre"] = "minecraft:lapis_ore";
      MinecraftItemTypes2["LargeAmethystBud"] = "minecraft:large_amethyst_bud";
      MinecraftItemTypes2["LargeFern"] = "minecraft:large_fern";
      MinecraftItemTypes2["LavaBucket"] = "minecraft:lava_bucket";
      MinecraftItemTypes2["Lead"] = "minecraft:lead";
      MinecraftItemTypes2["LeafLitter"] = "minecraft:leaf_litter";
      MinecraftItemTypes2["Leather"] = "minecraft:leather";
      MinecraftItemTypes2["LeatherBoots"] = "minecraft:leather_boots";
      MinecraftItemTypes2["LeatherChestplate"] = "minecraft:leather_chestplate";
      MinecraftItemTypes2["LeatherHelmet"] = "minecraft:leather_helmet";
      MinecraftItemTypes2["LeatherHorseArmor"] = "minecraft:leather_horse_armor";
      MinecraftItemTypes2["LeatherLeggings"] = "minecraft:leather_leggings";
      MinecraftItemTypes2["Lectern"] = "minecraft:lectern";
      MinecraftItemTypes2["Lever"] = "minecraft:lever";
      MinecraftItemTypes2["LightBlock0"] = "minecraft:light_block_0";
      MinecraftItemTypes2["LightBlock1"] = "minecraft:light_block_1";
      MinecraftItemTypes2["LightBlock10"] = "minecraft:light_block_10";
      MinecraftItemTypes2["LightBlock11"] = "minecraft:light_block_11";
      MinecraftItemTypes2["LightBlock12"] = "minecraft:light_block_12";
      MinecraftItemTypes2["LightBlock13"] = "minecraft:light_block_13";
      MinecraftItemTypes2["LightBlock14"] = "minecraft:light_block_14";
      MinecraftItemTypes2["LightBlock15"] = "minecraft:light_block_15";
      MinecraftItemTypes2["LightBlock2"] = "minecraft:light_block_2";
      MinecraftItemTypes2["LightBlock3"] = "minecraft:light_block_3";
      MinecraftItemTypes2["LightBlock4"] = "minecraft:light_block_4";
      MinecraftItemTypes2["LightBlock5"] = "minecraft:light_block_5";
      MinecraftItemTypes2["LightBlock6"] = "minecraft:light_block_6";
      MinecraftItemTypes2["LightBlock7"] = "minecraft:light_block_7";
      MinecraftItemTypes2["LightBlock8"] = "minecraft:light_block_8";
      MinecraftItemTypes2["LightBlock9"] = "minecraft:light_block_9";
      MinecraftItemTypes2["LightBlueBundle"] = "minecraft:light_blue_bundle";
      MinecraftItemTypes2["LightBlueCandle"] = "minecraft:light_blue_candle";
      MinecraftItemTypes2["LightBlueCarpet"] = "minecraft:light_blue_carpet";
      MinecraftItemTypes2["LightBlueConcrete"] = "minecraft:light_blue_concrete";
      MinecraftItemTypes2["LightBlueConcretePowder"] = "minecraft:light_blue_concrete_powder";
      MinecraftItemTypes2["LightBlueCushion"] = "minecraft:light_blue_cushion";
      MinecraftItemTypes2["LightBlueDye"] = "minecraft:light_blue_dye";
      MinecraftItemTypes2["LightBlueGlazedTerracotta"] = "minecraft:light_blue_glazed_terracotta";
      MinecraftItemTypes2["LightBlueHarness"] = "minecraft:light_blue_harness";
      MinecraftItemTypes2["LightBlueShulkerBox"] = "minecraft:light_blue_shulker_box";
      MinecraftItemTypes2["LightBlueStainedGlass"] = "minecraft:light_blue_stained_glass";
      MinecraftItemTypes2["LightBlueStainedGlassPane"] = "minecraft:light_blue_stained_glass_pane";
      MinecraftItemTypes2["LightBlueTerracotta"] = "minecraft:light_blue_terracotta";
      MinecraftItemTypes2["LightBlueWool"] = "minecraft:light_blue_wool";
      MinecraftItemTypes2["LightBlueWoolDoubleSlab"] = "minecraft:light_blue_wool_double_slab";
      MinecraftItemTypes2["LightBlueWoolSlab"] = "minecraft:light_blue_wool_slab";
      MinecraftItemTypes2["LightBlueWoolStairs"] = "minecraft:light_blue_wool_stairs";
      MinecraftItemTypes2["LightGrayBundle"] = "minecraft:light_gray_bundle";
      MinecraftItemTypes2["LightGrayCandle"] = "minecraft:light_gray_candle";
      MinecraftItemTypes2["LightGrayCarpet"] = "minecraft:light_gray_carpet";
      MinecraftItemTypes2["LightGrayConcrete"] = "minecraft:light_gray_concrete";
      MinecraftItemTypes2["LightGrayConcretePowder"] = "minecraft:light_gray_concrete_powder";
      MinecraftItemTypes2["LightGrayCushion"] = "minecraft:light_gray_cushion";
      MinecraftItemTypes2["LightGrayDye"] = "minecraft:light_gray_dye";
      MinecraftItemTypes2["LightGrayHarness"] = "minecraft:light_gray_harness";
      MinecraftItemTypes2["LightGrayShulkerBox"] = "minecraft:light_gray_shulker_box";
      MinecraftItemTypes2["LightGrayStainedGlass"] = "minecraft:light_gray_stained_glass";
      MinecraftItemTypes2["LightGrayStainedGlassPane"] = "minecraft:light_gray_stained_glass_pane";
      MinecraftItemTypes2["LightGrayTerracotta"] = "minecraft:light_gray_terracotta";
      MinecraftItemTypes2["LightGrayWool"] = "minecraft:light_gray_wool";
      MinecraftItemTypes2["LightGrayWoolDoubleSlab"] = "minecraft:light_gray_wool_double_slab";
      MinecraftItemTypes2["LightGrayWoolSlab"] = "minecraft:light_gray_wool_slab";
      MinecraftItemTypes2["LightGrayWoolStairs"] = "minecraft:light_gray_wool_stairs";
      MinecraftItemTypes2["LightWeightedPressurePlate"] = "minecraft:light_weighted_pressure_plate";
      MinecraftItemTypes2["LightningRod"] = "minecraft:lightning_rod";
      MinecraftItemTypes2["Lilac"] = "minecraft:lilac";
      MinecraftItemTypes2["LilyOfTheValley"] = "minecraft:lily_of_the_valley";
      MinecraftItemTypes2["LimeBundle"] = "minecraft:lime_bundle";
      MinecraftItemTypes2["LimeCandle"] = "minecraft:lime_candle";
      MinecraftItemTypes2["LimeCarpet"] = "minecraft:lime_carpet";
      MinecraftItemTypes2["LimeConcrete"] = "minecraft:lime_concrete";
      MinecraftItemTypes2["LimeConcretePowder"] = "minecraft:lime_concrete_powder";
      MinecraftItemTypes2["LimeCushion"] = "minecraft:lime_cushion";
      MinecraftItemTypes2["LimeDye"] = "minecraft:lime_dye";
      MinecraftItemTypes2["LimeGlazedTerracotta"] = "minecraft:lime_glazed_terracotta";
      MinecraftItemTypes2["LimeHarness"] = "minecraft:lime_harness";
      MinecraftItemTypes2["LimeShulkerBox"] = "minecraft:lime_shulker_box";
      MinecraftItemTypes2["LimeStainedGlass"] = "minecraft:lime_stained_glass";
      MinecraftItemTypes2["LimeStainedGlassPane"] = "minecraft:lime_stained_glass_pane";
      MinecraftItemTypes2["LimeTerracotta"] = "minecraft:lime_terracotta";
      MinecraftItemTypes2["LimeWool"] = "minecraft:lime_wool";
      MinecraftItemTypes2["LimeWoolDoubleSlab"] = "minecraft:lime_wool_double_slab";
      MinecraftItemTypes2["LimeWoolSlab"] = "minecraft:lime_wool_slab";
      MinecraftItemTypes2["LimeWoolStairs"] = "minecraft:lime_wool_stairs";
      MinecraftItemTypes2["LingeringPotion"] = "minecraft:lingering_potion";
      MinecraftItemTypes2["LitPumpkin"] = "minecraft:lit_pumpkin";
      MinecraftItemTypes2["LlamaSpawnEgg"] = "minecraft:llama_spawn_egg";
      MinecraftItemTypes2["Lodestone"] = "minecraft:lodestone";
      MinecraftItemTypes2["LodestoneCompass"] = "minecraft:lodestone_compass";
      MinecraftItemTypes2["Loom"] = "minecraft:loom";
      MinecraftItemTypes2["Mace"] = "minecraft:mace";
      MinecraftItemTypes2["MagentaBundle"] = "minecraft:magenta_bundle";
      MinecraftItemTypes2["MagentaCandle"] = "minecraft:magenta_candle";
      MinecraftItemTypes2["MagentaCarpet"] = "minecraft:magenta_carpet";
      MinecraftItemTypes2["MagentaConcrete"] = "minecraft:magenta_concrete";
      MinecraftItemTypes2["MagentaConcretePowder"] = "minecraft:magenta_concrete_powder";
      MinecraftItemTypes2["MagentaCushion"] = "minecraft:magenta_cushion";
      MinecraftItemTypes2["MagentaDye"] = "minecraft:magenta_dye";
      MinecraftItemTypes2["MagentaGlazedTerracotta"] = "minecraft:magenta_glazed_terracotta";
      MinecraftItemTypes2["MagentaHarness"] = "minecraft:magenta_harness";
      MinecraftItemTypes2["MagentaShulkerBox"] = "minecraft:magenta_shulker_box";
      MinecraftItemTypes2["MagentaStainedGlass"] = "minecraft:magenta_stained_glass";
      MinecraftItemTypes2["MagentaStainedGlassPane"] = "minecraft:magenta_stained_glass_pane";
      MinecraftItemTypes2["MagentaTerracotta"] = "minecraft:magenta_terracotta";
      MinecraftItemTypes2["MagentaWool"] = "minecraft:magenta_wool";
      MinecraftItemTypes2["MagentaWoolDoubleSlab"] = "minecraft:magenta_wool_double_slab";
      MinecraftItemTypes2["MagentaWoolSlab"] = "minecraft:magenta_wool_slab";
      MinecraftItemTypes2["MagentaWoolStairs"] = "minecraft:magenta_wool_stairs";
      MinecraftItemTypes2["Magma"] = "minecraft:magma";
      MinecraftItemTypes2["MagmaCream"] = "minecraft:magma_cream";
      MinecraftItemTypes2["MagmaCubeSpawnEgg"] = "minecraft:magma_cube_spawn_egg";
      MinecraftItemTypes2["MangroveBoat"] = "minecraft:mangrove_boat";
      MinecraftItemTypes2["MangroveButton"] = "minecraft:mangrove_button";
      MinecraftItemTypes2["MangroveChestBoat"] = "minecraft:mangrove_chest_boat";
      MinecraftItemTypes2["MangroveDoor"] = "minecraft:mangrove_door";
      MinecraftItemTypes2["MangroveFence"] = "minecraft:mangrove_fence";
      MinecraftItemTypes2["MangroveFenceGate"] = "minecraft:mangrove_fence_gate";
      MinecraftItemTypes2["MangroveHangingSign"] = "minecraft:mangrove_hanging_sign";
      MinecraftItemTypes2["MangroveLeaves"] = "minecraft:mangrove_leaves";
      MinecraftItemTypes2["MangroveLog"] = "minecraft:mangrove_log";
      MinecraftItemTypes2["MangrovePlanks"] = "minecraft:mangrove_planks";
      MinecraftItemTypes2["MangrovePressurePlate"] = "minecraft:mangrove_pressure_plate";
      MinecraftItemTypes2["MangrovePropagule"] = "minecraft:mangrove_propagule";
      MinecraftItemTypes2["MangroveRoots"] = "minecraft:mangrove_roots";
      MinecraftItemTypes2["MangroveShelf"] = "minecraft:mangrove_shelf";
      MinecraftItemTypes2["MangroveSign"] = "minecraft:mangrove_sign";
      MinecraftItemTypes2["MangroveSlab"] = "minecraft:mangrove_slab";
      MinecraftItemTypes2["MangroveStairs"] = "minecraft:mangrove_stairs";
      MinecraftItemTypes2["MangroveTrapdoor"] = "minecraft:mangrove_trapdoor";
      MinecraftItemTypes2["MangroveWood"] = "minecraft:mangrove_wood";
      MinecraftItemTypes2["MediumAmethystBud"] = "minecraft:medium_amethyst_bud";
      MinecraftItemTypes2["MelonBlock"] = "minecraft:melon_block";
      MinecraftItemTypes2["MelonSeeds"] = "minecraft:melon_seeds";
      MinecraftItemTypes2["MelonSlice"] = "minecraft:melon_slice";
      MinecraftItemTypes2["MilkBucket"] = "minecraft:milk_bucket";
      MinecraftItemTypes2["Minecart"] = "minecraft:minecart";
      MinecraftItemTypes2["MinerPotterySherd"] = "minecraft:miner_pottery_sherd";
      MinecraftItemTypes2["MobSpawner"] = "minecraft:mob_spawner";
      MinecraftItemTypes2["MojangBannerPattern"] = "minecraft:mojang_banner_pattern";
      MinecraftItemTypes2["MooshroomSpawnEgg"] = "minecraft:mooshroom_spawn_egg";
      MinecraftItemTypes2["MossBlock"] = "minecraft:moss_block";
      MinecraftItemTypes2["MossCarpet"] = "minecraft:moss_carpet";
      MinecraftItemTypes2["MossyCobblestone"] = "minecraft:mossy_cobblestone";
      MinecraftItemTypes2["MossyCobblestoneSlab"] = "minecraft:mossy_cobblestone_slab";
      MinecraftItemTypes2["MossyCobblestoneStairs"] = "minecraft:mossy_cobblestone_stairs";
      MinecraftItemTypes2["MossyCobblestoneWall"] = "minecraft:mossy_cobblestone_wall";
      MinecraftItemTypes2["MossyStoneBrickSlab"] = "minecraft:mossy_stone_brick_slab";
      MinecraftItemTypes2["MossyStoneBrickStairs"] = "minecraft:mossy_stone_brick_stairs";
      MinecraftItemTypes2["MossyStoneBrickWall"] = "minecraft:mossy_stone_brick_wall";
      MinecraftItemTypes2["MossyStoneBricks"] = "minecraft:mossy_stone_bricks";
      MinecraftItemTypes2["MournerPotterySherd"] = "minecraft:mourner_pottery_sherd";
      MinecraftItemTypes2["Mud"] = "minecraft:mud";
      MinecraftItemTypes2["MudBrickSlab"] = "minecraft:mud_brick_slab";
      MinecraftItemTypes2["MudBrickStairs"] = "minecraft:mud_brick_stairs";
      MinecraftItemTypes2["MudBrickWall"] = "minecraft:mud_brick_wall";
      MinecraftItemTypes2["MudBricks"] = "minecraft:mud_bricks";
      MinecraftItemTypes2["MuddyMangroveRoots"] = "minecraft:muddy_mangrove_roots";
      MinecraftItemTypes2["MuleSpawnEgg"] = "minecraft:mule_spawn_egg";
      MinecraftItemTypes2["MushroomStem"] = "minecraft:mushroom_stem";
      MinecraftItemTypes2["MushroomStew"] = "minecraft:mushroom_stew";
      MinecraftItemTypes2["MusicDisc11"] = "minecraft:music_disc_11";
      MinecraftItemTypes2["MusicDisc13"] = "minecraft:music_disc_13";
      MinecraftItemTypes2["MusicDisc5"] = "minecraft:music_disc_5";
      MinecraftItemTypes2["MusicDiscBlocks"] = "minecraft:music_disc_blocks";
      MinecraftItemTypes2["MusicDiscBounce"] = "minecraft:music_disc_bounce";
      MinecraftItemTypes2["MusicDiscCat"] = "minecraft:music_disc_cat";
      MinecraftItemTypes2["MusicDiscChirp"] = "minecraft:music_disc_chirp";
      MinecraftItemTypes2["MusicDiscCreator"] = "minecraft:music_disc_creator";
      MinecraftItemTypes2["MusicDiscCreatorMusicBox"] = "minecraft:music_disc_creator_music_box";
      MinecraftItemTypes2["MusicDiscFar"] = "minecraft:music_disc_far";
      MinecraftItemTypes2["MusicDiscLavaChicken"] = "minecraft:music_disc_lava_chicken";
      MinecraftItemTypes2["MusicDiscMall"] = "minecraft:music_disc_mall";
      MinecraftItemTypes2["MusicDiscMellohi"] = "minecraft:music_disc_mellohi";
      MinecraftItemTypes2["MusicDiscOtherside"] = "minecraft:music_disc_otherside";
      MinecraftItemTypes2["MusicDiscPigstep"] = "minecraft:music_disc_pigstep";
      MinecraftItemTypes2["MusicDiscPrecipice"] = "minecraft:music_disc_precipice";
      MinecraftItemTypes2["MusicDiscRelic"] = "minecraft:music_disc_relic";
      MinecraftItemTypes2["MusicDiscStal"] = "minecraft:music_disc_stal";
      MinecraftItemTypes2["MusicDiscStrad"] = "minecraft:music_disc_strad";
      MinecraftItemTypes2["MusicDiscTears"] = "minecraft:music_disc_tears";
      MinecraftItemTypes2["MusicDiscWait"] = "minecraft:music_disc_wait";
      MinecraftItemTypes2["MusicDiscWard"] = "minecraft:music_disc_ward";
      MinecraftItemTypes2["Mutton"] = "minecraft:mutton";
      MinecraftItemTypes2["Mycelium"] = "minecraft:mycelium";
      MinecraftItemTypes2["NameTag"] = "minecraft:name_tag";
      MinecraftItemTypes2["NautilusShell"] = "minecraft:nautilus_shell";
      MinecraftItemTypes2["NautilusSpawnEgg"] = "minecraft:nautilus_spawn_egg";
      MinecraftItemTypes2["NetherBrick"] = "minecraft:nether_brick";
      MinecraftItemTypes2["NetherBrickFence"] = "minecraft:nether_brick_fence";
      MinecraftItemTypes2["NetherBrickSlab"] = "minecraft:nether_brick_slab";
      MinecraftItemTypes2["NetherBrickStairs"] = "minecraft:nether_brick_stairs";
      MinecraftItemTypes2["NetherBrickWall"] = "minecraft:nether_brick_wall";
      MinecraftItemTypes2["NetherGoldOre"] = "minecraft:nether_gold_ore";
      MinecraftItemTypes2["NetherSprouts"] = "minecraft:nether_sprouts";
      MinecraftItemTypes2["NetherStar"] = "minecraft:nether_star";
      MinecraftItemTypes2["NetherWart"] = "minecraft:nether_wart";
      MinecraftItemTypes2["NetherWartBlock"] = "minecraft:nether_wart_block";
      MinecraftItemTypes2["Netherbrick"] = "minecraft:netherbrick";
      MinecraftItemTypes2["NetheriteAxe"] = "minecraft:netherite_axe";
      MinecraftItemTypes2["NetheriteBlock"] = "minecraft:netherite_block";
      MinecraftItemTypes2["NetheriteBoots"] = "minecraft:netherite_boots";
      MinecraftItemTypes2["NetheriteChestplate"] = "minecraft:netherite_chestplate";
      MinecraftItemTypes2["NetheriteHelmet"] = "minecraft:netherite_helmet";
      MinecraftItemTypes2["NetheriteHoe"] = "minecraft:netherite_hoe";
      MinecraftItemTypes2["NetheriteHorseArmor"] = "minecraft:netherite_horse_armor";
      MinecraftItemTypes2["NetheriteIngot"] = "minecraft:netherite_ingot";
      MinecraftItemTypes2["NetheriteLeggings"] = "minecraft:netherite_leggings";
      MinecraftItemTypes2["NetheriteNautilusArmor"] = "minecraft:netherite_nautilus_armor";
      MinecraftItemTypes2["NetheritePickaxe"] = "minecraft:netherite_pickaxe";
      MinecraftItemTypes2["NetheriteScrap"] = "minecraft:netherite_scrap";
      MinecraftItemTypes2["NetheriteShovel"] = "minecraft:netherite_shovel";
      MinecraftItemTypes2["NetheriteSpear"] = "minecraft:netherite_spear";
      MinecraftItemTypes2["NetheriteSword"] = "minecraft:netherite_sword";
      MinecraftItemTypes2["NetheriteUpgradeSmithingTemplate"] = "minecraft:netherite_upgrade_smithing_template";
      MinecraftItemTypes2["Netherrack"] = "minecraft:netherrack";
      MinecraftItemTypes2["NormalStoneSlab"] = "minecraft:normal_stone_slab";
      MinecraftItemTypes2["NormalStoneStairs"] = "minecraft:normal_stone_stairs";
      MinecraftItemTypes2["Noteblock"] = "minecraft:noteblock";
      MinecraftItemTypes2["OakBoat"] = "minecraft:oak_boat";
      MinecraftItemTypes2["OakChestBoat"] = "minecraft:oak_chest_boat";
      MinecraftItemTypes2["OakFence"] = "minecraft:oak_fence";
      MinecraftItemTypes2["OakHangingSign"] = "minecraft:oak_hanging_sign";
      MinecraftItemTypes2["OakLeaves"] = "minecraft:oak_leaves";
      MinecraftItemTypes2["OakLog"] = "minecraft:oak_log";
      MinecraftItemTypes2["OakPlanks"] = "minecraft:oak_planks";
      MinecraftItemTypes2["OakSapling"] = "minecraft:oak_sapling";
      MinecraftItemTypes2["OakShelf"] = "minecraft:oak_shelf";
      MinecraftItemTypes2["OakSign"] = "minecraft:oak_sign";
      MinecraftItemTypes2["OakSlab"] = "minecraft:oak_slab";
      MinecraftItemTypes2["OakStairs"] = "minecraft:oak_stairs";
      MinecraftItemTypes2["OakWood"] = "minecraft:oak_wood";
      MinecraftItemTypes2["Observer"] = "minecraft:observer";
      MinecraftItemTypes2["Obsidian"] = "minecraft:obsidian";
      MinecraftItemTypes2["OcelotSpawnEgg"] = "minecraft:ocelot_spawn_egg";
      MinecraftItemTypes2["OchreFroglight"] = "minecraft:ochre_froglight";
      MinecraftItemTypes2["OminousBottle"] = "minecraft:ominous_bottle";
      MinecraftItemTypes2["OminousTrialKey"] = "minecraft:ominous_trial_key";
      MinecraftItemTypes2["OpenEyeblossom"] = "minecraft:open_eyeblossom";
      MinecraftItemTypes2["OrangeBundle"] = "minecraft:orange_bundle";
      MinecraftItemTypes2["OrangeCandle"] = "minecraft:orange_candle";
      MinecraftItemTypes2["OrangeCarpet"] = "minecraft:orange_carpet";
      MinecraftItemTypes2["OrangeConcrete"] = "minecraft:orange_concrete";
      MinecraftItemTypes2["OrangeConcretePowder"] = "minecraft:orange_concrete_powder";
      MinecraftItemTypes2["OrangeCushion"] = "minecraft:orange_cushion";
      MinecraftItemTypes2["OrangeDye"] = "minecraft:orange_dye";
      MinecraftItemTypes2["OrangeGlazedTerracotta"] = "minecraft:orange_glazed_terracotta";
      MinecraftItemTypes2["OrangeHarness"] = "minecraft:orange_harness";
      MinecraftItemTypes2["OrangePoplarLeaves"] = "minecraft:orange_poplar_leaves";
      MinecraftItemTypes2["OrangeShulkerBox"] = "minecraft:orange_shulker_box";
      MinecraftItemTypes2["OrangeStainedGlass"] = "minecraft:orange_stained_glass";
      MinecraftItemTypes2["OrangeStainedGlassPane"] = "minecraft:orange_stained_glass_pane";
      MinecraftItemTypes2["OrangeTerracotta"] = "minecraft:orange_terracotta";
      MinecraftItemTypes2["OrangeTulip"] = "minecraft:orange_tulip";
      MinecraftItemTypes2["OrangeWool"] = "minecraft:orange_wool";
      MinecraftItemTypes2["OrangeWoolDoubleSlab"] = "minecraft:orange_wool_double_slab";
      MinecraftItemTypes2["OrangeWoolSlab"] = "minecraft:orange_wool_slab";
      MinecraftItemTypes2["OrangeWoolStairs"] = "minecraft:orange_wool_stairs";
      MinecraftItemTypes2["OxeyeDaisy"] = "minecraft:oxeye_daisy";
      MinecraftItemTypes2["OxidizedChiseledCopper"] = "minecraft:oxidized_chiseled_copper";
      MinecraftItemTypes2["OxidizedCopper"] = "minecraft:oxidized_copper";
      MinecraftItemTypes2["OxidizedCopperBars"] = "minecraft:oxidized_copper_bars";
      MinecraftItemTypes2["OxidizedCopperBulb"] = "minecraft:oxidized_copper_bulb";
      MinecraftItemTypes2["OxidizedCopperChain"] = "minecraft:oxidized_copper_chain";
      MinecraftItemTypes2["OxidizedCopperChest"] = "minecraft:oxidized_copper_chest";
      MinecraftItemTypes2["OxidizedCopperDoor"] = "minecraft:oxidized_copper_door";
      MinecraftItemTypes2["OxidizedCopperGolemStatue"] = "minecraft:oxidized_copper_golem_statue";
      MinecraftItemTypes2["OxidizedCopperGrate"] = "minecraft:oxidized_copper_grate";
      MinecraftItemTypes2["OxidizedCopperLantern"] = "minecraft:oxidized_copper_lantern";
      MinecraftItemTypes2["OxidizedCopperTrapdoor"] = "minecraft:oxidized_copper_trapdoor";
      MinecraftItemTypes2["OxidizedCutCopper"] = "minecraft:oxidized_cut_copper";
      MinecraftItemTypes2["OxidizedCutCopperSlab"] = "minecraft:oxidized_cut_copper_slab";
      MinecraftItemTypes2["OxidizedCutCopperStairs"] = "minecraft:oxidized_cut_copper_stairs";
      MinecraftItemTypes2["OxidizedLightningRod"] = "minecraft:oxidized_lightning_rod";
      MinecraftItemTypes2["PackedIce"] = "minecraft:packed_ice";
      MinecraftItemTypes2["PackedMud"] = "minecraft:packed_mud";
      MinecraftItemTypes2["Painting"] = "minecraft:painting";
      MinecraftItemTypes2["PaleHangingMoss"] = "minecraft:pale_hanging_moss";
      MinecraftItemTypes2["PaleMossBlock"] = "minecraft:pale_moss_block";
      MinecraftItemTypes2["PaleMossCarpet"] = "minecraft:pale_moss_carpet";
      MinecraftItemTypes2["PaleOakBoat"] = "minecraft:pale_oak_boat";
      MinecraftItemTypes2["PaleOakButton"] = "minecraft:pale_oak_button";
      MinecraftItemTypes2["PaleOakChestBoat"] = "minecraft:pale_oak_chest_boat";
      MinecraftItemTypes2["PaleOakDoor"] = "minecraft:pale_oak_door";
      MinecraftItemTypes2["PaleOakFence"] = "minecraft:pale_oak_fence";
      MinecraftItemTypes2["PaleOakFenceGate"] = "minecraft:pale_oak_fence_gate";
      MinecraftItemTypes2["PaleOakHangingSign"] = "minecraft:pale_oak_hanging_sign";
      MinecraftItemTypes2["PaleOakLeaves"] = "minecraft:pale_oak_leaves";
      MinecraftItemTypes2["PaleOakLog"] = "minecraft:pale_oak_log";
      MinecraftItemTypes2["PaleOakPlanks"] = "minecraft:pale_oak_planks";
      MinecraftItemTypes2["PaleOakPressurePlate"] = "minecraft:pale_oak_pressure_plate";
      MinecraftItemTypes2["PaleOakSapling"] = "minecraft:pale_oak_sapling";
      MinecraftItemTypes2["PaleOakShelf"] = "minecraft:pale_oak_shelf";
      MinecraftItemTypes2["PaleOakSign"] = "minecraft:pale_oak_sign";
      MinecraftItemTypes2["PaleOakSlab"] = "minecraft:pale_oak_slab";
      MinecraftItemTypes2["PaleOakStairs"] = "minecraft:pale_oak_stairs";
      MinecraftItemTypes2["PaleOakTrapdoor"] = "minecraft:pale_oak_trapdoor";
      MinecraftItemTypes2["PaleOakWood"] = "minecraft:pale_oak_wood";
      MinecraftItemTypes2["PandaSpawnEgg"] = "minecraft:panda_spawn_egg";
      MinecraftItemTypes2["Paper"] = "minecraft:paper";
      MinecraftItemTypes2["ParchedSpawnEgg"] = "minecraft:parched_spawn_egg";
      MinecraftItemTypes2["ParrotSpawnEgg"] = "minecraft:parrot_spawn_egg";
      MinecraftItemTypes2["PearlescentFroglight"] = "minecraft:pearlescent_froglight";
      MinecraftItemTypes2["Peony"] = "minecraft:peony";
      MinecraftItemTypes2["PetrifiedOakSlab"] = "minecraft:petrified_oak_slab";
      MinecraftItemTypes2["PhantomMembrane"] = "minecraft:phantom_membrane";
      MinecraftItemTypes2["PhantomSpawnEgg"] = "minecraft:phantom_spawn_egg";
      MinecraftItemTypes2["PigSpawnEgg"] = "minecraft:pig_spawn_egg";
      MinecraftItemTypes2["PiglinBannerPattern"] = "minecraft:piglin_banner_pattern";
      MinecraftItemTypes2["PiglinBruteSpawnEgg"] = "minecraft:piglin_brute_spawn_egg";
      MinecraftItemTypes2["PiglinHead"] = "minecraft:piglin_head";
      MinecraftItemTypes2["PiglinSpawnEgg"] = "minecraft:piglin_spawn_egg";
      MinecraftItemTypes2["PillagerSpawnEgg"] = "minecraft:pillager_spawn_egg";
      MinecraftItemTypes2["PinkBundle"] = "minecraft:pink_bundle";
      MinecraftItemTypes2["PinkCandle"] = "minecraft:pink_candle";
      MinecraftItemTypes2["PinkCarpet"] = "minecraft:pink_carpet";
      MinecraftItemTypes2["PinkConcrete"] = "minecraft:pink_concrete";
      MinecraftItemTypes2["PinkConcretePowder"] = "minecraft:pink_concrete_powder";
      MinecraftItemTypes2["PinkCushion"] = "minecraft:pink_cushion";
      MinecraftItemTypes2["PinkDye"] = "minecraft:pink_dye";
      MinecraftItemTypes2["PinkGlazedTerracotta"] = "minecraft:pink_glazed_terracotta";
      MinecraftItemTypes2["PinkHarness"] = "minecraft:pink_harness";
      MinecraftItemTypes2["PinkPetals"] = "minecraft:pink_petals";
      MinecraftItemTypes2["PinkShulkerBox"] = "minecraft:pink_shulker_box";
      MinecraftItemTypes2["PinkStainedGlass"] = "minecraft:pink_stained_glass";
      MinecraftItemTypes2["PinkStainedGlassPane"] = "minecraft:pink_stained_glass_pane";
      MinecraftItemTypes2["PinkTerracotta"] = "minecraft:pink_terracotta";
      MinecraftItemTypes2["PinkTulip"] = "minecraft:pink_tulip";
      MinecraftItemTypes2["PinkWool"] = "minecraft:pink_wool";
      MinecraftItemTypes2["PinkWoolDoubleSlab"] = "minecraft:pink_wool_double_slab";
      MinecraftItemTypes2["PinkWoolSlab"] = "minecraft:pink_wool_slab";
      MinecraftItemTypes2["PinkWoolStairs"] = "minecraft:pink_wool_stairs";
      MinecraftItemTypes2["Piston"] = "minecraft:piston";
      MinecraftItemTypes2["PitcherPlant"] = "minecraft:pitcher_plant";
      MinecraftItemTypes2["PitcherPod"] = "minecraft:pitcher_pod";
      MinecraftItemTypes2["PlayerHead"] = "minecraft:player_head";
      MinecraftItemTypes2["PlentyPotterySherd"] = "minecraft:plenty_pottery_sherd";
      MinecraftItemTypes2["Podzol"] = "minecraft:podzol";
      MinecraftItemTypes2["PointedDripstone"] = "minecraft:pointed_dripstone";
      MinecraftItemTypes2["PoisonousPotato"] = "minecraft:poisonous_potato";
      MinecraftItemTypes2["PolarBearSpawnEgg"] = "minecraft:polar_bear_spawn_egg";
      MinecraftItemTypes2["PolishedAndesite"] = "minecraft:polished_andesite";
      MinecraftItemTypes2["PolishedAndesiteSlab"] = "minecraft:polished_andesite_slab";
      MinecraftItemTypes2["PolishedAndesiteStairs"] = "minecraft:polished_andesite_stairs";
      MinecraftItemTypes2["PolishedBasalt"] = "minecraft:polished_basalt";
      MinecraftItemTypes2["PolishedBlackstone"] = "minecraft:polished_blackstone";
      MinecraftItemTypes2["PolishedBlackstoneBrickSlab"] = "minecraft:polished_blackstone_brick_slab";
      MinecraftItemTypes2["PolishedBlackstoneBrickStairs"] = "minecraft:polished_blackstone_brick_stairs";
      MinecraftItemTypes2["PolishedBlackstoneBrickWall"] = "minecraft:polished_blackstone_brick_wall";
      MinecraftItemTypes2["PolishedBlackstoneBricks"] = "minecraft:polished_blackstone_bricks";
      MinecraftItemTypes2["PolishedBlackstoneButton"] = "minecraft:polished_blackstone_button";
      MinecraftItemTypes2["PolishedBlackstonePressurePlate"] = "minecraft:polished_blackstone_pressure_plate";
      MinecraftItemTypes2["PolishedBlackstoneSlab"] = "minecraft:polished_blackstone_slab";
      MinecraftItemTypes2["PolishedBlackstoneStairs"] = "minecraft:polished_blackstone_stairs";
      MinecraftItemTypes2["PolishedBlackstoneWall"] = "minecraft:polished_blackstone_wall";
      MinecraftItemTypes2["PolishedCinnabar"] = "minecraft:polished_cinnabar";
      MinecraftItemTypes2["PolishedCinnabarSlab"] = "minecraft:polished_cinnabar_slab";
      MinecraftItemTypes2["PolishedCinnabarStairs"] = "minecraft:polished_cinnabar_stairs";
      MinecraftItemTypes2["PolishedCinnabarWall"] = "minecraft:polished_cinnabar_wall";
      MinecraftItemTypes2["PolishedDeepslate"] = "minecraft:polished_deepslate";
      MinecraftItemTypes2["PolishedDeepslateSlab"] = "minecraft:polished_deepslate_slab";
      MinecraftItemTypes2["PolishedDeepslateStairs"] = "minecraft:polished_deepslate_stairs";
      MinecraftItemTypes2["PolishedDeepslateWall"] = "minecraft:polished_deepslate_wall";
      MinecraftItemTypes2["PolishedDiorite"] = "minecraft:polished_diorite";
      MinecraftItemTypes2["PolishedDioriteSlab"] = "minecraft:polished_diorite_slab";
      MinecraftItemTypes2["PolishedDioriteStairs"] = "minecraft:polished_diorite_stairs";
      MinecraftItemTypes2["PolishedGranite"] = "minecraft:polished_granite";
      MinecraftItemTypes2["PolishedGraniteSlab"] = "minecraft:polished_granite_slab";
      MinecraftItemTypes2["PolishedGraniteStairs"] = "minecraft:polished_granite_stairs";
      MinecraftItemTypes2["PolishedSulfur"] = "minecraft:polished_sulfur";
      MinecraftItemTypes2["PolishedSulfurSlab"] = "minecraft:polished_sulfur_slab";
      MinecraftItemTypes2["PolishedSulfurStairs"] = "minecraft:polished_sulfur_stairs";
      MinecraftItemTypes2["PolishedSulfurWall"] = "minecraft:polished_sulfur_wall";
      MinecraftItemTypes2["PolishedTuff"] = "minecraft:polished_tuff";
      MinecraftItemTypes2["PolishedTuffSlab"] = "minecraft:polished_tuff_slab";
      MinecraftItemTypes2["PolishedTuffStairs"] = "minecraft:polished_tuff_stairs";
      MinecraftItemTypes2["PolishedTuffWall"] = "minecraft:polished_tuff_wall";
      MinecraftItemTypes2["PoplarBoat"] = "minecraft:poplar_boat";
      MinecraftItemTypes2["PoplarButton"] = "minecraft:poplar_button";
      MinecraftItemTypes2["PoplarChestBoat"] = "minecraft:poplar_chest_boat";
      MinecraftItemTypes2["PoplarDoor"] = "minecraft:poplar_door";
      MinecraftItemTypes2["PoplarFence"] = "minecraft:poplar_fence";
      MinecraftItemTypes2["PoplarFenceGate"] = "minecraft:poplar_fence_gate";
      MinecraftItemTypes2["PoplarHangingSign"] = "minecraft:poplar_hanging_sign";
      MinecraftItemTypes2["PoplarLog"] = "minecraft:poplar_log";
      MinecraftItemTypes2["PoplarPlanks"] = "minecraft:poplar_planks";
      MinecraftItemTypes2["PoplarPressurePlate"] = "minecraft:poplar_pressure_plate";
      MinecraftItemTypes2["PoplarSapling"] = "minecraft:poplar_sapling";
      MinecraftItemTypes2["PoplarShelf"] = "minecraft:poplar_shelf";
      MinecraftItemTypes2["PoplarSign"] = "minecraft:poplar_sign";
      MinecraftItemTypes2["PoplarSlab"] = "minecraft:poplar_slab";
      MinecraftItemTypes2["PoplarStairs"] = "minecraft:poplar_stairs";
      MinecraftItemTypes2["PoplarTrapdoor"] = "minecraft:poplar_trapdoor";
      MinecraftItemTypes2["PoplarWood"] = "minecraft:poplar_wood";
      MinecraftItemTypes2["PoppedChorusFruit"] = "minecraft:popped_chorus_fruit";
      MinecraftItemTypes2["Poppy"] = "minecraft:poppy";
      MinecraftItemTypes2["Porkchop"] = "minecraft:porkchop";
      MinecraftItemTypes2["Potato"] = "minecraft:potato";
      MinecraftItemTypes2["PotentSulfur"] = "minecraft:potent_sulfur";
      MinecraftItemTypes2["Potion"] = "minecraft:potion";
      MinecraftItemTypes2["PowderSnowBucket"] = "minecraft:powder_snow_bucket";
      MinecraftItemTypes2["Prismarine"] = "minecraft:prismarine";
      MinecraftItemTypes2["PrismarineBrickSlab"] = "minecraft:prismarine_brick_slab";
      MinecraftItemTypes2["PrismarineBricks"] = "minecraft:prismarine_bricks";
      MinecraftItemTypes2["PrismarineBricksStairs"] = "minecraft:prismarine_bricks_stairs";
      MinecraftItemTypes2["PrismarineCrystals"] = "minecraft:prismarine_crystals";
      MinecraftItemTypes2["PrismarineShard"] = "minecraft:prismarine_shard";
      MinecraftItemTypes2["PrismarineSlab"] = "minecraft:prismarine_slab";
      MinecraftItemTypes2["PrismarineStairs"] = "minecraft:prismarine_stairs";
      MinecraftItemTypes2["PrismarineWall"] = "minecraft:prismarine_wall";
      MinecraftItemTypes2["PrizePotterySherd"] = "minecraft:prize_pottery_sherd";
      MinecraftItemTypes2["Pufferfish"] = "minecraft:pufferfish";
      MinecraftItemTypes2["PufferfishBucket"] = "minecraft:pufferfish_bucket";
      MinecraftItemTypes2["PufferfishSpawnEgg"] = "minecraft:pufferfish_spawn_egg";
      MinecraftItemTypes2["Pumpkin"] = "minecraft:pumpkin";
      MinecraftItemTypes2["PumpkinPie"] = "minecraft:pumpkin_pie";
      MinecraftItemTypes2["PumpkinSeeds"] = "minecraft:pumpkin_seeds";
      MinecraftItemTypes2["PurpleBundle"] = "minecraft:purple_bundle";
      MinecraftItemTypes2["PurpleCandle"] = "minecraft:purple_candle";
      MinecraftItemTypes2["PurpleCarpet"] = "minecraft:purple_carpet";
      MinecraftItemTypes2["PurpleConcrete"] = "minecraft:purple_concrete";
      MinecraftItemTypes2["PurpleConcretePowder"] = "minecraft:purple_concrete_powder";
      MinecraftItemTypes2["PurpleCushion"] = "minecraft:purple_cushion";
      MinecraftItemTypes2["PurpleDye"] = "minecraft:purple_dye";
      MinecraftItemTypes2["PurpleGlazedTerracotta"] = "minecraft:purple_glazed_terracotta";
      MinecraftItemTypes2["PurpleHarness"] = "minecraft:purple_harness";
      MinecraftItemTypes2["PurpleShulkerBox"] = "minecraft:purple_shulker_box";
      MinecraftItemTypes2["PurpleStainedGlass"] = "minecraft:purple_stained_glass";
      MinecraftItemTypes2["PurpleStainedGlassPane"] = "minecraft:purple_stained_glass_pane";
      MinecraftItemTypes2["PurpleTerracotta"] = "minecraft:purple_terracotta";
      MinecraftItemTypes2["PurpleWool"] = "minecraft:purple_wool";
      MinecraftItemTypes2["PurpleWoolDoubleSlab"] = "minecraft:purple_wool_double_slab";
      MinecraftItemTypes2["PurpleWoolSlab"] = "minecraft:purple_wool_slab";
      MinecraftItemTypes2["PurpleWoolStairs"] = "minecraft:purple_wool_stairs";
      MinecraftItemTypes2["PurpurBlock"] = "minecraft:purpur_block";
      MinecraftItemTypes2["PurpurPillar"] = "minecraft:purpur_pillar";
      MinecraftItemTypes2["PurpurSlab"] = "minecraft:purpur_slab";
      MinecraftItemTypes2["PurpurStairs"] = "minecraft:purpur_stairs";
      MinecraftItemTypes2["Quartz"] = "minecraft:quartz";
      MinecraftItemTypes2["QuartzBlock"] = "minecraft:quartz_block";
      MinecraftItemTypes2["QuartzBricks"] = "minecraft:quartz_bricks";
      MinecraftItemTypes2["QuartzOre"] = "minecraft:quartz_ore";
      MinecraftItemTypes2["QuartzPillar"] = "minecraft:quartz_pillar";
      MinecraftItemTypes2["QuartzSlab"] = "minecraft:quartz_slab";
      MinecraftItemTypes2["QuartzStairs"] = "minecraft:quartz_stairs";
      MinecraftItemTypes2["Rabbit"] = "minecraft:rabbit";
      MinecraftItemTypes2["RabbitFoot"] = "minecraft:rabbit_foot";
      MinecraftItemTypes2["RabbitHide"] = "minecraft:rabbit_hide";
      MinecraftItemTypes2["RabbitSpawnEgg"] = "minecraft:rabbit_spawn_egg";
      MinecraftItemTypes2["RabbitStew"] = "minecraft:rabbit_stew";
      MinecraftItemTypes2["Rail"] = "minecraft:rail";
      MinecraftItemTypes2["RaiserArmorTrimSmithingTemplate"] = "minecraft:raiser_armor_trim_smithing_template";
      MinecraftItemTypes2["RavagerSpawnEgg"] = "minecraft:ravager_spawn_egg";
      MinecraftItemTypes2["RawCopper"] = "minecraft:raw_copper";
      MinecraftItemTypes2["RawCopperBlock"] = "minecraft:raw_copper_block";
      MinecraftItemTypes2["RawGold"] = "minecraft:raw_gold";
      MinecraftItemTypes2["RawGoldBlock"] = "minecraft:raw_gold_block";
      MinecraftItemTypes2["RawIron"] = "minecraft:raw_iron";
      MinecraftItemTypes2["RawIronBlock"] = "minecraft:raw_iron_block";
      MinecraftItemTypes2["RecoveryCompass"] = "minecraft:recovery_compass";
      MinecraftItemTypes2["RedBundle"] = "minecraft:red_bundle";
      MinecraftItemTypes2["RedCandle"] = "minecraft:red_candle";
      MinecraftItemTypes2["RedCarpet"] = "minecraft:red_carpet";
      MinecraftItemTypes2["RedConcrete"] = "minecraft:red_concrete";
      MinecraftItemTypes2["RedConcretePowder"] = "minecraft:red_concrete_powder";
      MinecraftItemTypes2["RedCushion"] = "minecraft:red_cushion";
      MinecraftItemTypes2["RedDye"] = "minecraft:red_dye";
      MinecraftItemTypes2["RedGlazedTerracotta"] = "minecraft:red_glazed_terracotta";
      MinecraftItemTypes2["RedHarness"] = "minecraft:red_harness";
      MinecraftItemTypes2["RedMushroom"] = "minecraft:red_mushroom";
      MinecraftItemTypes2["RedMushroomBlock"] = "minecraft:red_mushroom_block";
      MinecraftItemTypes2["RedNetherBrick"] = "minecraft:red_nether_brick";
      MinecraftItemTypes2["RedNetherBrickSlab"] = "minecraft:red_nether_brick_slab";
      MinecraftItemTypes2["RedNetherBrickStairs"] = "minecraft:red_nether_brick_stairs";
      MinecraftItemTypes2["RedNetherBrickWall"] = "minecraft:red_nether_brick_wall";
      MinecraftItemTypes2["RedPoplarLeaves"] = "minecraft:red_poplar_leaves";
      MinecraftItemTypes2["RedSand"] = "minecraft:red_sand";
      MinecraftItemTypes2["RedSandstone"] = "minecraft:red_sandstone";
      MinecraftItemTypes2["RedSandstoneSlab"] = "minecraft:red_sandstone_slab";
      MinecraftItemTypes2["RedSandstoneStairs"] = "minecraft:red_sandstone_stairs";
      MinecraftItemTypes2["RedSandstoneWall"] = "minecraft:red_sandstone_wall";
      MinecraftItemTypes2["RedShrub"] = "minecraft:red_shrub";
      MinecraftItemTypes2["RedShulkerBox"] = "minecraft:red_shulker_box";
      MinecraftItemTypes2["RedStainedGlass"] = "minecraft:red_stained_glass";
      MinecraftItemTypes2["RedStainedGlassPane"] = "minecraft:red_stained_glass_pane";
      MinecraftItemTypes2["RedTerracotta"] = "minecraft:red_terracotta";
      MinecraftItemTypes2["RedTulip"] = "minecraft:red_tulip";
      MinecraftItemTypes2["RedWool"] = "minecraft:red_wool";
      MinecraftItemTypes2["RedWoolDoubleSlab"] = "minecraft:red_wool_double_slab";
      MinecraftItemTypes2["RedWoolSlab"] = "minecraft:red_wool_slab";
      MinecraftItemTypes2["RedWoolStairs"] = "minecraft:red_wool_stairs";
      MinecraftItemTypes2["Redstone"] = "minecraft:redstone";
      MinecraftItemTypes2["RedstoneBlock"] = "minecraft:redstone_block";
      MinecraftItemTypes2["RedstoneLamp"] = "minecraft:redstone_lamp";
      MinecraftItemTypes2["RedstoneOre"] = "minecraft:redstone_ore";
      MinecraftItemTypes2["RedstoneTorch"] = "minecraft:redstone_torch";
      MinecraftItemTypes2["ReinforcedDeepslate"] = "minecraft:reinforced_deepslate";
      MinecraftItemTypes2["Repeater"] = "minecraft:repeater";
      MinecraftItemTypes2["RepeatingCommandBlock"] = "minecraft:repeating_command_block";
      MinecraftItemTypes2["ResinBlock"] = "minecraft:resin_block";
      MinecraftItemTypes2["ResinBrick"] = "minecraft:resin_brick";
      MinecraftItemTypes2["ResinBrickSlab"] = "minecraft:resin_brick_slab";
      MinecraftItemTypes2["ResinBrickStairs"] = "minecraft:resin_brick_stairs";
      MinecraftItemTypes2["ResinBrickWall"] = "minecraft:resin_brick_wall";
      MinecraftItemTypes2["ResinBricks"] = "minecraft:resin_bricks";
      MinecraftItemTypes2["ResinClump"] = "minecraft:resin_clump";
      MinecraftItemTypes2["RespawnAnchor"] = "minecraft:respawn_anchor";
      MinecraftItemTypes2["RibArmorTrimSmithingTemplate"] = "minecraft:rib_armor_trim_smithing_template";
      MinecraftItemTypes2["RoseBush"] = "minecraft:rose_bush";
      MinecraftItemTypes2["RottenFlesh"] = "minecraft:rotten_flesh";
      MinecraftItemTypes2["Saddle"] = "minecraft:saddle";
      MinecraftItemTypes2["Salmon"] = "minecraft:salmon";
      MinecraftItemTypes2["SalmonBucket"] = "minecraft:salmon_bucket";
      MinecraftItemTypes2["SalmonSpawnEgg"] = "minecraft:salmon_spawn_egg";
      MinecraftItemTypes2["Sand"] = "minecraft:sand";
      MinecraftItemTypes2["Sandstone"] = "minecraft:sandstone";
      MinecraftItemTypes2["SandstoneSlab"] = "minecraft:sandstone_slab";
      MinecraftItemTypes2["SandstoneStairs"] = "minecraft:sandstone_stairs";
      MinecraftItemTypes2["SandstoneWall"] = "minecraft:sandstone_wall";
      MinecraftItemTypes2["Scaffolding"] = "minecraft:scaffolding";
      MinecraftItemTypes2["ScrapePotterySherd"] = "minecraft:scrape_pottery_sherd";
      MinecraftItemTypes2["Sculk"] = "minecraft:sculk";
      MinecraftItemTypes2["SculkCatalyst"] = "minecraft:sculk_catalyst";
      MinecraftItemTypes2["SculkSensor"] = "minecraft:sculk_sensor";
      MinecraftItemTypes2["SculkShrieker"] = "minecraft:sculk_shrieker";
      MinecraftItemTypes2["SculkVein"] = "minecraft:sculk_vein";
      MinecraftItemTypes2["SeaLantern"] = "minecraft:sea_lantern";
      MinecraftItemTypes2["SeaPickle"] = "minecraft:sea_pickle";
      MinecraftItemTypes2["Seagrass"] = "minecraft:seagrass";
      MinecraftItemTypes2["SentryArmorTrimSmithingTemplate"] = "minecraft:sentry_armor_trim_smithing_template";
      MinecraftItemTypes2["ShaperArmorTrimSmithingTemplate"] = "minecraft:shaper_armor_trim_smithing_template";
      MinecraftItemTypes2["SheafPotterySherd"] = "minecraft:sheaf_pottery_sherd";
      MinecraftItemTypes2["Shears"] = "minecraft:shears";
      MinecraftItemTypes2["SheepSpawnEgg"] = "minecraft:sheep_spawn_egg";
      MinecraftItemTypes2["ShelfMushroom"] = "minecraft:shelf_mushroom";
      MinecraftItemTypes2["ShelterPotterySherd"] = "minecraft:shelter_pottery_sherd";
      MinecraftItemTypes2["Shield"] = "minecraft:shield";
      MinecraftItemTypes2["ShortDryGrass"] = "minecraft:short_dry_grass";
      MinecraftItemTypes2["ShortGrass"] = "minecraft:short_grass";
      MinecraftItemTypes2["Shroomlight"] = "minecraft:shroomlight";
      MinecraftItemTypes2["ShulkerShell"] = "minecraft:shulker_shell";
      MinecraftItemTypes2["ShulkerSpawnEgg"] = "minecraft:shulker_spawn_egg";
      MinecraftItemTypes2["SilenceArmorTrimSmithingTemplate"] = "minecraft:silence_armor_trim_smithing_template";
      MinecraftItemTypes2["SilverGlazedTerracotta"] = "minecraft:silver_glazed_terracotta";
      MinecraftItemTypes2["SilverfishSpawnEgg"] = "minecraft:silverfish_spawn_egg";
      MinecraftItemTypes2["SkeletonHorseSpawnEgg"] = "minecraft:skeleton_horse_spawn_egg";
      MinecraftItemTypes2["SkeletonSkull"] = "minecraft:skeleton_skull";
      MinecraftItemTypes2["SkeletonSpawnEgg"] = "minecraft:skeleton_spawn_egg";
      MinecraftItemTypes2["SkullBannerPattern"] = "minecraft:skull_banner_pattern";
      MinecraftItemTypes2["SkullPotterySherd"] = "minecraft:skull_pottery_sherd";
      MinecraftItemTypes2["Slime"] = "minecraft:slime";
      MinecraftItemTypes2["SlimeBall"] = "minecraft:slime_ball";
      MinecraftItemTypes2["SlimeSpawnEgg"] = "minecraft:slime_spawn_egg";
      MinecraftItemTypes2["SmallAmethystBud"] = "minecraft:small_amethyst_bud";
      MinecraftItemTypes2["SmallDripleafBlock"] = "minecraft:small_dripleaf_block";
      MinecraftItemTypes2["SmithingTable"] = "minecraft:smithing_table";
      MinecraftItemTypes2["Smoker"] = "minecraft:smoker";
      MinecraftItemTypes2["SmoothBasalt"] = "minecraft:smooth_basalt";
      MinecraftItemTypes2["SmoothQuartz"] = "minecraft:smooth_quartz";
      MinecraftItemTypes2["SmoothQuartzSlab"] = "minecraft:smooth_quartz_slab";
      MinecraftItemTypes2["SmoothQuartzStairs"] = "minecraft:smooth_quartz_stairs";
      MinecraftItemTypes2["SmoothRedSandstone"] = "minecraft:smooth_red_sandstone";
      MinecraftItemTypes2["SmoothRedSandstoneSlab"] = "minecraft:smooth_red_sandstone_slab";
      MinecraftItemTypes2["SmoothRedSandstoneStairs"] = "minecraft:smooth_red_sandstone_stairs";
      MinecraftItemTypes2["SmoothSandstone"] = "minecraft:smooth_sandstone";
      MinecraftItemTypes2["SmoothSandstoneSlab"] = "minecraft:smooth_sandstone_slab";
      MinecraftItemTypes2["SmoothSandstoneStairs"] = "minecraft:smooth_sandstone_stairs";
      MinecraftItemTypes2["SmoothStone"] = "minecraft:smooth_stone";
      MinecraftItemTypes2["SmoothStoneSlab"] = "minecraft:smooth_stone_slab";
      MinecraftItemTypes2["SnifferEgg"] = "minecraft:sniffer_egg";
      MinecraftItemTypes2["SnifferSpawnEgg"] = "minecraft:sniffer_spawn_egg";
      MinecraftItemTypes2["SnortPotterySherd"] = "minecraft:snort_pottery_sherd";
      MinecraftItemTypes2["SnoutArmorTrimSmithingTemplate"] = "minecraft:snout_armor_trim_smithing_template";
      MinecraftItemTypes2["Snow"] = "minecraft:snow";
      MinecraftItemTypes2["SnowGolemSpawnEgg"] = "minecraft:snow_golem_spawn_egg";
      MinecraftItemTypes2["SnowLayer"] = "minecraft:snow_layer";
      MinecraftItemTypes2["Snowball"] = "minecraft:snowball";
      MinecraftItemTypes2["SoulCampfire"] = "minecraft:soul_campfire";
      MinecraftItemTypes2["SoulLantern"] = "minecraft:soul_lantern";
      MinecraftItemTypes2["SoulSand"] = "minecraft:soul_sand";
      MinecraftItemTypes2["SoulSoil"] = "minecraft:soul_soil";
      MinecraftItemTypes2["SoulTorch"] = "minecraft:soul_torch";
      MinecraftItemTypes2["SpiderEye"] = "minecraft:spider_eye";
      MinecraftItemTypes2["SpiderSpawnEgg"] = "minecraft:spider_spawn_egg";
      MinecraftItemTypes2["SpireArmorTrimSmithingTemplate"] = "minecraft:spire_armor_trim_smithing_template";
      MinecraftItemTypes2["SplashPotion"] = "minecraft:splash_potion";
      MinecraftItemTypes2["Sponge"] = "minecraft:sponge";
      MinecraftItemTypes2["SporeBlossom"] = "minecraft:spore_blossom";
      MinecraftItemTypes2["SpruceBoat"] = "minecraft:spruce_boat";
      MinecraftItemTypes2["SpruceButton"] = "minecraft:spruce_button";
      MinecraftItemTypes2["SpruceChestBoat"] = "minecraft:spruce_chest_boat";
      MinecraftItemTypes2["SpruceDoor"] = "minecraft:spruce_door";
      MinecraftItemTypes2["SpruceFence"] = "minecraft:spruce_fence";
      MinecraftItemTypes2["SpruceFenceGate"] = "minecraft:spruce_fence_gate";
      MinecraftItemTypes2["SpruceHangingSign"] = "minecraft:spruce_hanging_sign";
      MinecraftItemTypes2["SpruceLeaves"] = "minecraft:spruce_leaves";
      MinecraftItemTypes2["SpruceLog"] = "minecraft:spruce_log";
      MinecraftItemTypes2["SprucePlanks"] = "minecraft:spruce_planks";
      MinecraftItemTypes2["SprucePressurePlate"] = "minecraft:spruce_pressure_plate";
      MinecraftItemTypes2["SpruceSapling"] = "minecraft:spruce_sapling";
      MinecraftItemTypes2["SpruceShelf"] = "minecraft:spruce_shelf";
      MinecraftItemTypes2["SpruceSign"] = "minecraft:spruce_sign";
      MinecraftItemTypes2["SpruceSlab"] = "minecraft:spruce_slab";
      MinecraftItemTypes2["SpruceStairs"] = "minecraft:spruce_stairs";
      MinecraftItemTypes2["SpruceTrapdoor"] = "minecraft:spruce_trapdoor";
      MinecraftItemTypes2["SpruceWood"] = "minecraft:spruce_wood";
      MinecraftItemTypes2["Spyglass"] = "minecraft:spyglass";
      MinecraftItemTypes2["SquidSpawnEgg"] = "minecraft:squid_spawn_egg";
      MinecraftItemTypes2["Stick"] = "minecraft:stick";
      MinecraftItemTypes2["StickyPiston"] = "minecraft:sticky_piston";
      MinecraftItemTypes2["Stone"] = "minecraft:stone";
      MinecraftItemTypes2["StoneAxe"] = "minecraft:stone_axe";
      MinecraftItemTypes2["StoneBrickSlab"] = "minecraft:stone_brick_slab";
      MinecraftItemTypes2["StoneBrickStairs"] = "minecraft:stone_brick_stairs";
      MinecraftItemTypes2["StoneBrickWall"] = "minecraft:stone_brick_wall";
      MinecraftItemTypes2["StoneBricks"] = "minecraft:stone_bricks";
      MinecraftItemTypes2["StoneButton"] = "minecraft:stone_button";
      MinecraftItemTypes2["StoneHoe"] = "minecraft:stone_hoe";
      MinecraftItemTypes2["StonePickaxe"] = "minecraft:stone_pickaxe";
      MinecraftItemTypes2["StonePressurePlate"] = "minecraft:stone_pressure_plate";
      MinecraftItemTypes2["StoneShovel"] = "minecraft:stone_shovel";
      MinecraftItemTypes2["StoneSpear"] = "minecraft:stone_spear";
      MinecraftItemTypes2["StoneStairs"] = "minecraft:stone_stairs";
      MinecraftItemTypes2["StoneSword"] = "minecraft:stone_sword";
      MinecraftItemTypes2["StonecutterBlock"] = "minecraft:stonecutter_block";
      MinecraftItemTypes2["StrawBed"] = "minecraft:straw_bed";
      MinecraftItemTypes2["StraySpawnEgg"] = "minecraft:stray_spawn_egg";
      MinecraftItemTypes2["StriderSpawnEgg"] = "minecraft:strider_spawn_egg";
      MinecraftItemTypes2["String"] = "minecraft:string";
      MinecraftItemTypes2["StrippedAcaciaLog"] = "minecraft:stripped_acacia_log";
      MinecraftItemTypes2["StrippedAcaciaWood"] = "minecraft:stripped_acacia_wood";
      MinecraftItemTypes2["StrippedBambooBlock"] = "minecraft:stripped_bamboo_block";
      MinecraftItemTypes2["StrippedBirchLog"] = "minecraft:stripped_birch_log";
      MinecraftItemTypes2["StrippedBirchWood"] = "minecraft:stripped_birch_wood";
      MinecraftItemTypes2["StrippedCherryLog"] = "minecraft:stripped_cherry_log";
      MinecraftItemTypes2["StrippedCherryWood"] = "minecraft:stripped_cherry_wood";
      MinecraftItemTypes2["StrippedCrimsonHyphae"] = "minecraft:stripped_crimson_hyphae";
      MinecraftItemTypes2["StrippedCrimsonStem"] = "minecraft:stripped_crimson_stem";
      MinecraftItemTypes2["StrippedDarkOakLog"] = "minecraft:stripped_dark_oak_log";
      MinecraftItemTypes2["StrippedDarkOakWood"] = "minecraft:stripped_dark_oak_wood";
      MinecraftItemTypes2["StrippedJungleLog"] = "minecraft:stripped_jungle_log";
      MinecraftItemTypes2["StrippedJungleWood"] = "minecraft:stripped_jungle_wood";
      MinecraftItemTypes2["StrippedMangroveLog"] = "minecraft:stripped_mangrove_log";
      MinecraftItemTypes2["StrippedMangroveWood"] = "minecraft:stripped_mangrove_wood";
      MinecraftItemTypes2["StrippedOakLog"] = "minecraft:stripped_oak_log";
      MinecraftItemTypes2["StrippedOakWood"] = "minecraft:stripped_oak_wood";
      MinecraftItemTypes2["StrippedPaleOakLog"] = "minecraft:stripped_pale_oak_log";
      MinecraftItemTypes2["StrippedPaleOakWood"] = "minecraft:stripped_pale_oak_wood";
      MinecraftItemTypes2["StrippedPoplarLog"] = "minecraft:stripped_poplar_log";
      MinecraftItemTypes2["StrippedPoplarWood"] = "minecraft:stripped_poplar_wood";
      MinecraftItemTypes2["StrippedSpruceLog"] = "minecraft:stripped_spruce_log";
      MinecraftItemTypes2["StrippedSpruceWood"] = "minecraft:stripped_spruce_wood";
      MinecraftItemTypes2["StrippedWarpedHyphae"] = "minecraft:stripped_warped_hyphae";
      MinecraftItemTypes2["StrippedWarpedStem"] = "minecraft:stripped_warped_stem";
      MinecraftItemTypes2["StructureBlock"] = "minecraft:structure_block";
      MinecraftItemTypes2["StructureVoid"] = "minecraft:structure_void";
      MinecraftItemTypes2["Sugar"] = "minecraft:sugar";
      MinecraftItemTypes2["SugarCane"] = "minecraft:sugar_cane";
      MinecraftItemTypes2["Sulfur"] = "minecraft:sulfur";
      MinecraftItemTypes2["SulfurBrickSlab"] = "minecraft:sulfur_brick_slab";
      MinecraftItemTypes2["SulfurBrickStairs"] = "minecraft:sulfur_brick_stairs";
      MinecraftItemTypes2["SulfurBrickWall"] = "minecraft:sulfur_brick_wall";
      MinecraftItemTypes2["SulfurBricks"] = "minecraft:sulfur_bricks";
      MinecraftItemTypes2["SulfurCubeBucket"] = "minecraft:sulfur_cube_bucket";
      MinecraftItemTypes2["SulfurCubeSpawnEgg"] = "minecraft:sulfur_cube_spawn_egg";
      MinecraftItemTypes2["SulfurSlab"] = "minecraft:sulfur_slab";
      MinecraftItemTypes2["SulfurSpike"] = "minecraft:sulfur_spike";
      MinecraftItemTypes2["SulfurStairs"] = "minecraft:sulfur_stairs";
      MinecraftItemTypes2["SulfurWall"] = "minecraft:sulfur_wall";
      MinecraftItemTypes2["Sunflower"] = "minecraft:sunflower";
      MinecraftItemTypes2["SuspiciousGravel"] = "minecraft:suspicious_gravel";
      MinecraftItemTypes2["SuspiciousSand"] = "minecraft:suspicious_sand";
      MinecraftItemTypes2["SuspiciousStew"] = "minecraft:suspicious_stew";
      MinecraftItemTypes2["SweetBerries"] = "minecraft:sweet_berries";
      MinecraftItemTypes2["TadpoleBucket"] = "minecraft:tadpole_bucket";
      MinecraftItemTypes2["TadpoleSpawnEgg"] = "minecraft:tadpole_spawn_egg";
      MinecraftItemTypes2["TallDryGrass"] = "minecraft:tall_dry_grass";
      MinecraftItemTypes2["TallGrass"] = "minecraft:tall_grass";
      MinecraftItemTypes2["Target"] = "minecraft:target";
      MinecraftItemTypes2["TideArmorTrimSmithingTemplate"] = "minecraft:tide_armor_trim_smithing_template";
      MinecraftItemTypes2["TintedGlass"] = "minecraft:tinted_glass";
      MinecraftItemTypes2["Tnt"] = "minecraft:tnt";
      MinecraftItemTypes2["TntMinecart"] = "minecraft:tnt_minecart";
      MinecraftItemTypes2["Torch"] = "minecraft:torch";
      MinecraftItemTypes2["Torchflower"] = "minecraft:torchflower";
      MinecraftItemTypes2["TorchflowerSeeds"] = "minecraft:torchflower_seeds";
      MinecraftItemTypes2["TotemOfUndying"] = "minecraft:totem_of_undying";
      MinecraftItemTypes2["TraderLlamaSpawnEgg"] = "minecraft:trader_llama_spawn_egg";
      MinecraftItemTypes2["Trapdoor"] = "minecraft:trapdoor";
      MinecraftItemTypes2["TrappedChest"] = "minecraft:trapped_chest";
      MinecraftItemTypes2["TrialKey"] = "minecraft:trial_key";
      MinecraftItemTypes2["TrialSpawner"] = "minecraft:trial_spawner";
      MinecraftItemTypes2["Trident"] = "minecraft:trident";
      MinecraftItemTypes2["TripwireHook"] = "minecraft:tripwire_hook";
      MinecraftItemTypes2["TropicalFish"] = "minecraft:tropical_fish";
      MinecraftItemTypes2["TropicalFishBucket"] = "minecraft:tropical_fish_bucket";
      MinecraftItemTypes2["TropicalFishSpawnEgg"] = "minecraft:tropical_fish_spawn_egg";
      MinecraftItemTypes2["TubeCoral"] = "minecraft:tube_coral";
      MinecraftItemTypes2["TubeCoralBlock"] = "minecraft:tube_coral_block";
      MinecraftItemTypes2["TubeCoralFan"] = "minecraft:tube_coral_fan";
      MinecraftItemTypes2["Tuff"] = "minecraft:tuff";
      MinecraftItemTypes2["TuffBrickSlab"] = "minecraft:tuff_brick_slab";
      MinecraftItemTypes2["TuffBrickStairs"] = "minecraft:tuff_brick_stairs";
      MinecraftItemTypes2["TuffBrickWall"] = "minecraft:tuff_brick_wall";
      MinecraftItemTypes2["TuffBricks"] = "minecraft:tuff_bricks";
      MinecraftItemTypes2["TuffSlab"] = "minecraft:tuff_slab";
      MinecraftItemTypes2["TuffStairs"] = "minecraft:tuff_stairs";
      MinecraftItemTypes2["TuffWall"] = "minecraft:tuff_wall";
      MinecraftItemTypes2["TurtleEgg"] = "minecraft:turtle_egg";
      MinecraftItemTypes2["TurtleHelmet"] = "minecraft:turtle_helmet";
      MinecraftItemTypes2["TurtleScute"] = "minecraft:turtle_scute";
      MinecraftItemTypes2["TurtleSpawnEgg"] = "minecraft:turtle_spawn_egg";
      MinecraftItemTypes2["TwistingVines"] = "minecraft:twisting_vines";
      MinecraftItemTypes2["UndyedShulkerBox"] = "minecraft:undyed_shulker_box";
      MinecraftItemTypes2["Vault"] = "minecraft:vault";
      MinecraftItemTypes2["VerdantFroglight"] = "minecraft:verdant_froglight";
      MinecraftItemTypes2["VexArmorTrimSmithingTemplate"] = "minecraft:vex_armor_trim_smithing_template";
      MinecraftItemTypes2["VexSpawnEgg"] = "minecraft:vex_spawn_egg";
      MinecraftItemTypes2["VillagerSpawnEgg"] = "minecraft:villager_spawn_egg";
      MinecraftItemTypes2["VindicatorSpawnEgg"] = "minecraft:vindicator_spawn_egg";
      MinecraftItemTypes2["Vine"] = "minecraft:vine";
      MinecraftItemTypes2["WanderingTraderSpawnEgg"] = "minecraft:wandering_trader_spawn_egg";
      MinecraftItemTypes2["WardArmorTrimSmithingTemplate"] = "minecraft:ward_armor_trim_smithing_template";
      MinecraftItemTypes2["WardenSpawnEgg"] = "minecraft:warden_spawn_egg";
      MinecraftItemTypes2["WarpedButton"] = "minecraft:warped_button";
      MinecraftItemTypes2["WarpedDoor"] = "minecraft:warped_door";
      MinecraftItemTypes2["WarpedFence"] = "minecraft:warped_fence";
      MinecraftItemTypes2["WarpedFenceGate"] = "minecraft:warped_fence_gate";
      MinecraftItemTypes2["WarpedFungus"] = "minecraft:warped_fungus";
      MinecraftItemTypes2["WarpedFungusOnAStick"] = "minecraft:warped_fungus_on_a_stick";
      MinecraftItemTypes2["WarpedHangingSign"] = "minecraft:warped_hanging_sign";
      MinecraftItemTypes2["WarpedHyphae"] = "minecraft:warped_hyphae";
      MinecraftItemTypes2["WarpedNylium"] = "minecraft:warped_nylium";
      MinecraftItemTypes2["WarpedPlanks"] = "minecraft:warped_planks";
      MinecraftItemTypes2["WarpedPressurePlate"] = "minecraft:warped_pressure_plate";
      MinecraftItemTypes2["WarpedRoots"] = "minecraft:warped_roots";
      MinecraftItemTypes2["WarpedShelf"] = "minecraft:warped_shelf";
      MinecraftItemTypes2["WarpedSign"] = "minecraft:warped_sign";
      MinecraftItemTypes2["WarpedSlab"] = "minecraft:warped_slab";
      MinecraftItemTypes2["WarpedStairs"] = "minecraft:warped_stairs";
      MinecraftItemTypes2["WarpedStem"] = "minecraft:warped_stem";
      MinecraftItemTypes2["WarpedTrapdoor"] = "minecraft:warped_trapdoor";
      MinecraftItemTypes2["WarpedWartBlock"] = "minecraft:warped_wart_block";
      MinecraftItemTypes2["WaterBucket"] = "minecraft:water_bucket";
      MinecraftItemTypes2["Waterlily"] = "minecraft:waterlily";
      MinecraftItemTypes2["WaxedChiseledCopper"] = "minecraft:waxed_chiseled_copper";
      MinecraftItemTypes2["WaxedCopper"] = "minecraft:waxed_copper";
      MinecraftItemTypes2["WaxedCopperBars"] = "minecraft:waxed_copper_bars";
      MinecraftItemTypes2["WaxedCopperBulb"] = "minecraft:waxed_copper_bulb";
      MinecraftItemTypes2["WaxedCopperChain"] = "minecraft:waxed_copper_chain";
      MinecraftItemTypes2["WaxedCopperChest"] = "minecraft:waxed_copper_chest";
      MinecraftItemTypes2["WaxedCopperDoor"] = "minecraft:waxed_copper_door";
      MinecraftItemTypes2["WaxedCopperGolemStatue"] = "minecraft:waxed_copper_golem_statue";
      MinecraftItemTypes2["WaxedCopperGrate"] = "minecraft:waxed_copper_grate";
      MinecraftItemTypes2["WaxedCopperLantern"] = "minecraft:waxed_copper_lantern";
      MinecraftItemTypes2["WaxedCopperTrapdoor"] = "minecraft:waxed_copper_trapdoor";
      MinecraftItemTypes2["WaxedCutCopper"] = "minecraft:waxed_cut_copper";
      MinecraftItemTypes2["WaxedCutCopperSlab"] = "minecraft:waxed_cut_copper_slab";
      MinecraftItemTypes2["WaxedCutCopperStairs"] = "minecraft:waxed_cut_copper_stairs";
      MinecraftItemTypes2["WaxedExposedChiseledCopper"] = "minecraft:waxed_exposed_chiseled_copper";
      MinecraftItemTypes2["WaxedExposedCopper"] = "minecraft:waxed_exposed_copper";
      MinecraftItemTypes2["WaxedExposedCopperBars"] = "minecraft:waxed_exposed_copper_bars";
      MinecraftItemTypes2["WaxedExposedCopperBulb"] = "minecraft:waxed_exposed_copper_bulb";
      MinecraftItemTypes2["WaxedExposedCopperChain"] = "minecraft:waxed_exposed_copper_chain";
      MinecraftItemTypes2["WaxedExposedCopperChest"] = "minecraft:waxed_exposed_copper_chest";
      MinecraftItemTypes2["WaxedExposedCopperDoor"] = "minecraft:waxed_exposed_copper_door";
      MinecraftItemTypes2["WaxedExposedCopperGolemStatue"] = "minecraft:waxed_exposed_copper_golem_statue";
      MinecraftItemTypes2["WaxedExposedCopperGrate"] = "minecraft:waxed_exposed_copper_grate";
      MinecraftItemTypes2["WaxedExposedCopperLantern"] = "minecraft:waxed_exposed_copper_lantern";
      MinecraftItemTypes2["WaxedExposedCopperTrapdoor"] = "minecraft:waxed_exposed_copper_trapdoor";
      MinecraftItemTypes2["WaxedExposedCutCopper"] = "minecraft:waxed_exposed_cut_copper";
      MinecraftItemTypes2["WaxedExposedCutCopperSlab"] = "minecraft:waxed_exposed_cut_copper_slab";
      MinecraftItemTypes2["WaxedExposedCutCopperStairs"] = "minecraft:waxed_exposed_cut_copper_stairs";
      MinecraftItemTypes2["WaxedExposedLightningRod"] = "minecraft:waxed_exposed_lightning_rod";
      MinecraftItemTypes2["WaxedLightningRod"] = "minecraft:waxed_lightning_rod";
      MinecraftItemTypes2["WaxedOxidizedChiseledCopper"] = "minecraft:waxed_oxidized_chiseled_copper";
      MinecraftItemTypes2["WaxedOxidizedCopper"] = "minecraft:waxed_oxidized_copper";
      MinecraftItemTypes2["WaxedOxidizedCopperBars"] = "minecraft:waxed_oxidized_copper_bars";
      MinecraftItemTypes2["WaxedOxidizedCopperBulb"] = "minecraft:waxed_oxidized_copper_bulb";
      MinecraftItemTypes2["WaxedOxidizedCopperChain"] = "minecraft:waxed_oxidized_copper_chain";
      MinecraftItemTypes2["WaxedOxidizedCopperChest"] = "minecraft:waxed_oxidized_copper_chest";
      MinecraftItemTypes2["WaxedOxidizedCopperDoor"] = "minecraft:waxed_oxidized_copper_door";
      MinecraftItemTypes2["WaxedOxidizedCopperGolemStatue"] = "minecraft:waxed_oxidized_copper_golem_statue";
      MinecraftItemTypes2["WaxedOxidizedCopperGrate"] = "minecraft:waxed_oxidized_copper_grate";
      MinecraftItemTypes2["WaxedOxidizedCopperLantern"] = "minecraft:waxed_oxidized_copper_lantern";
      MinecraftItemTypes2["WaxedOxidizedCopperTrapdoor"] = "minecraft:waxed_oxidized_copper_trapdoor";
      MinecraftItemTypes2["WaxedOxidizedCutCopper"] = "minecraft:waxed_oxidized_cut_copper";
      MinecraftItemTypes2["WaxedOxidizedCutCopperSlab"] = "minecraft:waxed_oxidized_cut_copper_slab";
      MinecraftItemTypes2["WaxedOxidizedCutCopperStairs"] = "minecraft:waxed_oxidized_cut_copper_stairs";
      MinecraftItemTypes2["WaxedOxidizedLightningRod"] = "minecraft:waxed_oxidized_lightning_rod";
      MinecraftItemTypes2["WaxedWeatheredChiseledCopper"] = "minecraft:waxed_weathered_chiseled_copper";
      MinecraftItemTypes2["WaxedWeatheredCopper"] = "minecraft:waxed_weathered_copper";
      MinecraftItemTypes2["WaxedWeatheredCopperBars"] = "minecraft:waxed_weathered_copper_bars";
      MinecraftItemTypes2["WaxedWeatheredCopperBulb"] = "minecraft:waxed_weathered_copper_bulb";
      MinecraftItemTypes2["WaxedWeatheredCopperChain"] = "minecraft:waxed_weathered_copper_chain";
      MinecraftItemTypes2["WaxedWeatheredCopperChest"] = "minecraft:waxed_weathered_copper_chest";
      MinecraftItemTypes2["WaxedWeatheredCopperDoor"] = "minecraft:waxed_weathered_copper_door";
      MinecraftItemTypes2["WaxedWeatheredCopperGolemStatue"] = "minecraft:waxed_weathered_copper_golem_statue";
      MinecraftItemTypes2["WaxedWeatheredCopperGrate"] = "minecraft:waxed_weathered_copper_grate";
      MinecraftItemTypes2["WaxedWeatheredCopperLantern"] = "minecraft:waxed_weathered_copper_lantern";
      MinecraftItemTypes2["WaxedWeatheredCopperTrapdoor"] = "minecraft:waxed_weathered_copper_trapdoor";
      MinecraftItemTypes2["WaxedWeatheredCutCopper"] = "minecraft:waxed_weathered_cut_copper";
      MinecraftItemTypes2["WaxedWeatheredCutCopperSlab"] = "minecraft:waxed_weathered_cut_copper_slab";
      MinecraftItemTypes2["WaxedWeatheredCutCopperStairs"] = "minecraft:waxed_weathered_cut_copper_stairs";
      MinecraftItemTypes2["WaxedWeatheredLightningRod"] = "minecraft:waxed_weathered_lightning_rod";
      MinecraftItemTypes2["WayfinderArmorTrimSmithingTemplate"] = "minecraft:wayfinder_armor_trim_smithing_template";
      MinecraftItemTypes2["WeatheredChiseledCopper"] = "minecraft:weathered_chiseled_copper";
      MinecraftItemTypes2["WeatheredCopper"] = "minecraft:weathered_copper";
      MinecraftItemTypes2["WeatheredCopperBars"] = "minecraft:weathered_copper_bars";
      MinecraftItemTypes2["WeatheredCopperBulb"] = "minecraft:weathered_copper_bulb";
      MinecraftItemTypes2["WeatheredCopperChain"] = "minecraft:weathered_copper_chain";
      MinecraftItemTypes2["WeatheredCopperChest"] = "minecraft:weathered_copper_chest";
      MinecraftItemTypes2["WeatheredCopperDoor"] = "minecraft:weathered_copper_door";
      MinecraftItemTypes2["WeatheredCopperGolemStatue"] = "minecraft:weathered_copper_golem_statue";
      MinecraftItemTypes2["WeatheredCopperGrate"] = "minecraft:weathered_copper_grate";
      MinecraftItemTypes2["WeatheredCopperLantern"] = "minecraft:weathered_copper_lantern";
      MinecraftItemTypes2["WeatheredCopperTrapdoor"] = "minecraft:weathered_copper_trapdoor";
      MinecraftItemTypes2["WeatheredCutCopper"] = "minecraft:weathered_cut_copper";
      MinecraftItemTypes2["WeatheredCutCopperSlab"] = "minecraft:weathered_cut_copper_slab";
      MinecraftItemTypes2["WeatheredCutCopperStairs"] = "minecraft:weathered_cut_copper_stairs";
      MinecraftItemTypes2["WeatheredLightningRod"] = "minecraft:weathered_lightning_rod";
      MinecraftItemTypes2["Web"] = "minecraft:web";
      MinecraftItemTypes2["WeepingVines"] = "minecraft:weeping_vines";
      MinecraftItemTypes2["WetSponge"] = "minecraft:wet_sponge";
      MinecraftItemTypes2["Wheat"] = "minecraft:wheat";
      MinecraftItemTypes2["WheatSeeds"] = "minecraft:wheat_seeds";
      MinecraftItemTypes2["WhiteBundle"] = "minecraft:white_bundle";
      MinecraftItemTypes2["WhiteCandle"] = "minecraft:white_candle";
      MinecraftItemTypes2["WhiteCarpet"] = "minecraft:white_carpet";
      MinecraftItemTypes2["WhiteConcrete"] = "minecraft:white_concrete";
      MinecraftItemTypes2["WhiteConcretePowder"] = "minecraft:white_concrete_powder";
      MinecraftItemTypes2["WhiteCushion"] = "minecraft:white_cushion";
      MinecraftItemTypes2["WhiteDye"] = "minecraft:white_dye";
      MinecraftItemTypes2["WhiteGlazedTerracotta"] = "minecraft:white_glazed_terracotta";
      MinecraftItemTypes2["WhiteHarness"] = "minecraft:white_harness";
      MinecraftItemTypes2["WhiteShulkerBox"] = "minecraft:white_shulker_box";
      MinecraftItemTypes2["WhiteStainedGlass"] = "minecraft:white_stained_glass";
      MinecraftItemTypes2["WhiteStainedGlassPane"] = "minecraft:white_stained_glass_pane";
      MinecraftItemTypes2["WhiteTerracotta"] = "minecraft:white_terracotta";
      MinecraftItemTypes2["WhiteTulip"] = "minecraft:white_tulip";
      MinecraftItemTypes2["WhiteWool"] = "minecraft:white_wool";
      MinecraftItemTypes2["WhiteWoolDoubleSlab"] = "minecraft:white_wool_double_slab";
      MinecraftItemTypes2["WhiteWoolSlab"] = "minecraft:white_wool_slab";
      MinecraftItemTypes2["WhiteWoolStairs"] = "minecraft:white_wool_stairs";
      MinecraftItemTypes2["WildArmorTrimSmithingTemplate"] = "minecraft:wild_armor_trim_smithing_template";
      MinecraftItemTypes2["Wildflowers"] = "minecraft:wildflowers";
      MinecraftItemTypes2["WindCharge"] = "minecraft:wind_charge";
      MinecraftItemTypes2["WitchSpawnEgg"] = "minecraft:witch_spawn_egg";
      MinecraftItemTypes2["WitherRose"] = "minecraft:wither_rose";
      MinecraftItemTypes2["WitherSkeletonSkull"] = "minecraft:wither_skeleton_skull";
      MinecraftItemTypes2["WitherSkeletonSpawnEgg"] = "minecraft:wither_skeleton_spawn_egg";
      MinecraftItemTypes2["WitherSpawnEgg"] = "minecraft:wither_spawn_egg";
      MinecraftItemTypes2["WolfArmor"] = "minecraft:wolf_armor";
      MinecraftItemTypes2["WolfSpawnEgg"] = "minecraft:wolf_spawn_egg";
      MinecraftItemTypes2["WoodenAxe"] = "minecraft:wooden_axe";
      MinecraftItemTypes2["WoodenButton"] = "minecraft:wooden_button";
      MinecraftItemTypes2["WoodenDoor"] = "minecraft:wooden_door";
      MinecraftItemTypes2["WoodenHoe"] = "minecraft:wooden_hoe";
      MinecraftItemTypes2["WoodenPickaxe"] = "minecraft:wooden_pickaxe";
      MinecraftItemTypes2["WoodenPressurePlate"] = "minecraft:wooden_pressure_plate";
      MinecraftItemTypes2["WoodenShovel"] = "minecraft:wooden_shovel";
      MinecraftItemTypes2["WoodenSpear"] = "minecraft:wooden_spear";
      MinecraftItemTypes2["WoodenSword"] = "minecraft:wooden_sword";
      MinecraftItemTypes2["WritableBook"] = "minecraft:writable_book";
      MinecraftItemTypes2["YellowBundle"] = "minecraft:yellow_bundle";
      MinecraftItemTypes2["YellowCandle"] = "minecraft:yellow_candle";
      MinecraftItemTypes2["YellowCarpet"] = "minecraft:yellow_carpet";
      MinecraftItemTypes2["YellowConcrete"] = "minecraft:yellow_concrete";
      MinecraftItemTypes2["YellowConcretePowder"] = "minecraft:yellow_concrete_powder";
      MinecraftItemTypes2["YellowCushion"] = "minecraft:yellow_cushion";
      MinecraftItemTypes2["YellowDye"] = "minecraft:yellow_dye";
      MinecraftItemTypes2["YellowGlazedTerracotta"] = "minecraft:yellow_glazed_terracotta";
      MinecraftItemTypes2["YellowHarness"] = "minecraft:yellow_harness";
      MinecraftItemTypes2["YellowPoplarLeaves"] = "minecraft:yellow_poplar_leaves";
      MinecraftItemTypes2["YellowShulkerBox"] = "minecraft:yellow_shulker_box";
      MinecraftItemTypes2["YellowStainedGlass"] = "minecraft:yellow_stained_glass";
      MinecraftItemTypes2["YellowStainedGlassPane"] = "minecraft:yellow_stained_glass_pane";
      MinecraftItemTypes2["YellowTerracotta"] = "minecraft:yellow_terracotta";
      MinecraftItemTypes2["YellowWool"] = "minecraft:yellow_wool";
      MinecraftItemTypes2["YellowWoolDoubleSlab"] = "minecraft:yellow_wool_double_slab";
      MinecraftItemTypes2["YellowWoolSlab"] = "minecraft:yellow_wool_slab";
      MinecraftItemTypes2["YellowWoolStairs"] = "minecraft:yellow_wool_stairs";
      MinecraftItemTypes2["ZoglinSpawnEgg"] = "minecraft:zoglin_spawn_egg";
      MinecraftItemTypes2["ZombieHead"] = "minecraft:zombie_head";
      MinecraftItemTypes2["ZombieHorseSpawnEgg"] = "minecraft:zombie_horse_spawn_egg";
      MinecraftItemTypes2["ZombieNautilusSpawnEgg"] = "minecraft:zombie_nautilus_spawn_egg";
      MinecraftItemTypes2["ZombiePigmanSpawnEgg"] = "minecraft:zombie_pigman_spawn_egg";
      MinecraftItemTypes2["ZombieSpawnEgg"] = "minecraft:zombie_spawn_egg";
      MinecraftItemTypes2["ZombieVillagerSpawnEgg"] = "minecraft:zombie_villager_spawn_egg";
      return MinecraftItemTypes2;
    })(MinecraftItemTypes || {});
    MinecraftPotionDeliveryTypes = ((MinecraftPotionDeliveryTypes2) => {
      MinecraftPotionDeliveryTypes2["Consume"] = "Consume";
      MinecraftPotionDeliveryTypes2["ThrownLingering"] = "ThrownLingering";
      MinecraftPotionDeliveryTypes2["ThrownSplash"] = "ThrownSplash";
      return MinecraftPotionDeliveryTypes2;
    })(MinecraftPotionDeliveryTypes || {});
    MinecraftPotionEffectTypes = ((MinecraftPotionEffectTypes2) => {
      MinecraftPotionEffectTypes2["Awkward"] = "minecraft:awkward";
      MinecraftPotionEffectTypes2["FireResistance"] = "minecraft:fire_resistance";
      MinecraftPotionEffectTypes2["Harming"] = "minecraft:harming";
      MinecraftPotionEffectTypes2["Healing"] = "minecraft:healing";
      MinecraftPotionEffectTypes2["Infested"] = "minecraft:infested";
      MinecraftPotionEffectTypes2["Invisibility"] = "minecraft:invisibility";
      MinecraftPotionEffectTypes2["Leaping"] = "minecraft:leaping";
      MinecraftPotionEffectTypes2["LongFireResistance"] = "minecraft:long_fire_resistance";
      MinecraftPotionEffectTypes2["LongInvisibility"] = "minecraft:long_invisibility";
      MinecraftPotionEffectTypes2["LongLeaping"] = "minecraft:long_leaping";
      MinecraftPotionEffectTypes2["LongMundane"] = "minecraft:long_mundane";
      MinecraftPotionEffectTypes2["LongNightvision"] = "minecraft:long_nightvision";
      MinecraftPotionEffectTypes2["LongPoison"] = "minecraft:long_poison";
      MinecraftPotionEffectTypes2["LongRegeneration"] = "minecraft:long_regeneration";
      MinecraftPotionEffectTypes2["LongSlowFalling"] = "minecraft:long_slow_falling";
      MinecraftPotionEffectTypes2["LongSlowness"] = "minecraft:long_slowness";
      MinecraftPotionEffectTypes2["LongStrength"] = "minecraft:long_strength";
      MinecraftPotionEffectTypes2["LongSwiftness"] = "minecraft:long_swiftness";
      MinecraftPotionEffectTypes2["LongTurtleMaster"] = "minecraft:long_turtle_master";
      MinecraftPotionEffectTypes2["LongWaterBreathing"] = "minecraft:long_water_breathing";
      MinecraftPotionEffectTypes2["LongWeakness"] = "minecraft:long_weakness";
      MinecraftPotionEffectTypes2["Mundane"] = "minecraft:mundane";
      MinecraftPotionEffectTypes2["Nightvision"] = "minecraft:nightvision";
      MinecraftPotionEffectTypes2["Oozing"] = "minecraft:oozing";
      MinecraftPotionEffectTypes2["Poison"] = "minecraft:poison";
      MinecraftPotionEffectTypes2["Regeneration"] = "minecraft:regeneration";
      MinecraftPotionEffectTypes2["SlowFalling"] = "minecraft:slow_falling";
      MinecraftPotionEffectTypes2["Slowness"] = "minecraft:slowness";
      MinecraftPotionEffectTypes2["Strength"] = "minecraft:strength";
      MinecraftPotionEffectTypes2["StrongHarming"] = "minecraft:strong_harming";
      MinecraftPotionEffectTypes2["StrongHealing"] = "minecraft:strong_healing";
      MinecraftPotionEffectTypes2["StrongLeaping"] = "minecraft:strong_leaping";
      MinecraftPotionEffectTypes2["StrongPoison"] = "minecraft:strong_poison";
      MinecraftPotionEffectTypes2["StrongRegeneration"] = "minecraft:strong_regeneration";
      MinecraftPotionEffectTypes2["StrongSlowness"] = "minecraft:strong_slowness";
      MinecraftPotionEffectTypes2["StrongStrength"] = "minecraft:strong_strength";
      MinecraftPotionEffectTypes2["StrongSwiftness"] = "minecraft:strong_swiftness";
      MinecraftPotionEffectTypes2["StrongTurtleMaster"] = "minecraft:strong_turtle_master";
      MinecraftPotionEffectTypes2["Swiftness"] = "minecraft:swiftness";
      MinecraftPotionEffectTypes2["Thick"] = "minecraft:thick";
      MinecraftPotionEffectTypes2["TurtleMaster"] = "minecraft:turtle_master";
      MinecraftPotionEffectTypes2["Water"] = "minecraft:water";
      MinecraftPotionEffectTypes2["WaterBreathing"] = "minecraft:water_breathing";
      MinecraftPotionEffectTypes2["Weakness"] = "minecraft:weakness";
      MinecraftPotionEffectTypes2["Weaving"] = "minecraft:weaving";
      MinecraftPotionEffectTypes2["WindCharged"] = "minecraft:wind_charged";
      MinecraftPotionEffectTypes2["Wither"] = "minecraft:wither";
      return MinecraftPotionEffectTypes2;
    })(MinecraftPotionEffectTypes || {});
  }
});

// behaviors/Stackeable Totems/src/totem/logic.ts
import {
  EntityComponentTypes as EntityComponentTypes2,
  EntityHealCause as EntityHealCause2,
  Player,
  world as world4
} from "@minecraft/server";
var TotemLogic, Totems;
var init_logic = __esm({
  "behaviors/Stackeable Totems/src/totem/logic.ts"() {
    "use strict";
    init_utils();
    TotemLogic = class {
      constructor() {
        this.TotemDetect();
      }
      /**
       * Metodo que detecta el uso de un Totem
       * @method
       * @private
       * @author Emiliocrack1355 - 23/11/26 <06:25 pm>
       */
      TotemDetect() {
        world4.beforeEvents.entityHeal.subscribe((ev) => {
          const { healSource, healedEntity } = ev;
          if (!(healedEntity instanceof Player)) return;
          if (healSource.cause !== EntityHealCause2.TotemOfUndying) return;
          const data = utils.getHandTotem(healedEntity);
          if (!data) return;
          this.onUseTotem(healedEntity, data, ev);
        });
      }
      /**
       * Metodo de logica al confirmar el uso del Totem
       * @param player Jugador que uso el totem
       * @param data Informacion respecto al Item y Mano donde se encuentra el totem
       * @method
       * @private
       * @author Emiliocrack1355 - 23/11/26 <06:33 pm>
       */
      onUseTotem(player, data, ev) {
        const raw = world4.getDynamicProperty(utils.WorldDynamicID);
        let config = { prob: 0, cost: 1 };
        if (typeof raw === "string") {
          try {
            config = { ...config, ...JSON.parse(raw) };
          } catch {
            console.warn("Error on Load World Dynamic Config, Default Values");
          }
        }
        const amount = data.item.amount;
        const totemData = utils.getTotemData(
          player,
          data.hand,
          data.item,
          amount,
          config.cost
        );
        if (!totemData.hasStack) {
          utils.failedTotem(player, totemData, ev);
          return;
        }
        let probData;
        if (config.prob < 100) {
          const random = Math.floor(Math.random() * 100) + 1;
          probData = {
            hasFailed: random >= config.prob,
            rand: random,
            prob: config.prob
          };
        }
        if (probData?.hasFailed) utils.failedTotem(player, totemData, ev, probData);
        else utils.successTotem(player, totemData, probData);
      }
      /**
       * Metodo que maneja la logica para consumir los
       * totems de la mano y del inventario
       * @param player
       * @param totemData
       * @method
       * @public
       * @author Emiliocrack1355 - 23/11/26 <06:48 pm>
       */
      onConsumeTotem(player, totemData) {
        const equip = player.getComponent(EntityComponentTypes2.Equippable);
        if (!equip) return;
        if (totemData.hasStack) {
          if (totemData.handAmount > 0) {
            const newHandItem = totemData.handItem.clone();
            newHandItem.amount = totemData.handAmount;
            equip.setEquipment(totemData.hand, newHandItem);
          } else {
            equip.setEquipment(totemData.hand, void 0);
          }
          if (totemData.inv) {
            const inv = player.getComponent(
              EntityComponentTypes2.Inventory
            )?.container;
            if (!inv) return;
            for (const { slot, amount } of totemData.inv) {
              const it = inv.getItem(slot);
              if (!it) return;
              const remaining = it.amount - amount;
              if (remaining > 0) {
                const newItem = it.clone();
                newItem.amount = remaining;
                inv.setItem(slot, newItem);
              } else {
                inv.setItem(slot, void 0);
              }
            }
          }
        }
      }
    };
    Totems = new TotemLogic();
  }
});

// behaviors/Stackeable Totems/src/system/utils.ts
import {
  EntityComponentTypes as EntityComponentTypes3,
  EquipmentSlot as EquipmentSlot2,
  system as system4,
  world as world5
} from "@minecraft/server";
var Utils, utils;
var init_utils = __esm({
  "behaviors/Stackeable Totems/src/system/utils.ts"() {
    "use strict";
    init_lib();
    init_logic();
    Utils = class {
      constructor() {
        /**
         * Variable que almacena el World Dynamic ID
         * @readonly
         * @method
         * @public
         * @author Emiliocrack1355 - 23/11/26 <06:05 pm>
         */
        this.WorldDynamicID = "emi:TotemVanilaConfig";
        /**
         * Variable que almacena el ID del Totem
         * @readonly
         * @method
         * @public
         * @author Emiliocrack1355 - 23/11/26 <06:28 pm>
         */
        this.totem = MinecraftItemTypes.TotemOfUndying;
      }
      /**
       * Metodo para formatear el texto de una forma bonita
       * @param text Texto a ser formateado
       * @param title Si se desea con mayusculas por palabra
       * @returns texto formateado
       * @method
       * @public
       * @author Emiliocrack1355 - 23/11/26 <11:10 am>
       */
      formatText(text, title = false) {
        if (!text) return "";
        let outText = text.replaceAll("minecraft:", "").replaceAll("emi:", "");
        if (title) {
          outText = outText.replaceAll("_", " ").split(" ").map(
            (word) => word ? word.charAt(0).toUpperCase() + word.slice(1) : word
          ).join("");
        }
        return outText;
      }
      /**
       * Metodo para obtener la mano principal donde se posea el totem
       * @param player Jugador a analizar
       * @returns mano en donde se encuentra el totem
       * @method
       * @public
       * @author Emiliocrack1355 - 23/11/26 <06:30 pm>
       */
      getHandTotem(player) {
        const comp = player.getComponent(EntityComponentTypes3.Equippable);
        if (!comp) return;
        const main = comp.getEquipment(EquipmentSlot2.Mainhand);
        const off = comp.getEquipment(EquipmentSlot2.Offhand);
        let data = void 0;
        if (!main && off && off.typeId === this.totem) {
          data = { hand: EquipmentSlot2.Offhand, item: off };
        } else if (main && !off && main.typeId === this.totem) {
          data = { hand: EquipmentSlot2.Mainhand, item: main };
        } else if (main && off && main.typeId === this.totem && off.typeId === this.totem) {
          data = { hand: EquipmentSlot2.Offhand, item: off };
        }
        if (!data) return;
        return data;
      }
      /**
       * Metodo auxiliar para obtener toda la data del Totem
       * @param player Jugador que posee el totem
       * @param slot Slot de mano en donde se encuentra el totem
       * @param item Item de la mano
       * @param amount Cantidad de totem en la mano
       * @param cost Costo por el uso del totem
       * @param lore Lore del totem para su ID
       * @returns
       * @method
       * @public
       * @author Emiliocrack1355 - 23/11/26 <06:35 pm>
       */
      getTotemData(player, slot, item, amount, cost) {
        if (amount >= cost) {
          return {
            hasStack: true,
            hand: slot,
            handItem: item,
            handAmount: amount - cost
          };
        }
        const inv = player.getComponent(EntityComponentTypes3.Inventory)?.container;
        if (!inv) return { hasStack: false };
        let reqs = cost - amount;
        const itemsInv = [];
        for (let i = 0; i < inv.size; i++) {
          if (reqs <= 0) break;
          const it = inv.getItem(i);
          if (!it || it.typeId !== this.totem) continue;
          if (it.amount < reqs) {
            reqs -= it.amount;
            itemsInv.push({ slot: i, amount: it.amount });
          } else {
            itemsInv.push({ slot: i, amount: reqs });
            reqs = 0;
            break;
          }
        }
        return reqs <= 0 ? {
          hasStack: true,
          hand: slot,
          handItem: item,
          handAmount: amount,
          inv: itemsInv
        } : { hasStack: false };
      }
      /**
       * Metodo auxiliar que anuncia por el chat cuyando al
       * usar un totem este falla
       * @param player Jugador que usa el totem
       * @param lore Lore para identificar el ID
       * @param totemData Informacion respecto al Totem
       * @param probData Informacion respecto a la probabilidad de uso
       * @method
       * @public
       * @author Emiliocrack1355 - 23/11/26 <06:40 pm>
       */
      failedTotem(player, totemData, ev, probData) {
        ev.cancel = true;
        if (!totemData.hasStack) {
          world5.sendMessage({
            translate: "emi.totems.useTotem.notEnought",
            with: [player.name]
          });
          return;
        }
        if (probData) {
          world5.sendMessage({
            translate: "emi.totems.useTotem.fail",
            with: [player.name, String(probData.rand), String(probData.prob)]
          });
          return;
        }
      }
      /**
       * Metodo auxiliar que anuncia por el chat cuando alguien
       * utiliza un totem
       * @param player Jugador que usa el totem
       * @param variant Variante del totem
       * @param totemData Informacion respecto al Totem
       * @param probData Informacion respecto a la probabilidad de uso
       * @method
       * @public
       * @author Emiliocrack1355 - 23/11/26 <06:42 pm>
       */
      successTotem(player, totemData, probData) {
        if (probData) {
          world5.sendMessage({
            translate: "emi.totems.useTotem.prob",
            with: [player.name, String(probData.rand), String(probData.prob)]
          });
        } else {
          world5.sendMessage({
            translate: "emi.totems.useTotem",
            with: [player.name]
          });
        }
        system4.run(() => {
          Totems.onConsumeTotem(player, totemData);
        });
      }
    };
    utils = new Utils();
  }
});

// behaviors/Stackeable Totems/src/world/init.ts
import {
  CommandPermissionLevel,
  CustomCommandParamType,
  Player as Player3,
  system as system5,
  world as world6
} from "@minecraft/server";
var require_init = __commonJS({
  "behaviors/Stackeable Totems/src/world/init.ts"() {
    "use strict";
    init_dist();
    init_utils();
    var WorldInit = class {
      constructor() {
        /**
         * Variable que almacena la version del addon
         * @readonly
         * @method
         * @private
         * @author Emiliocrack1355 - 23/11/26 <06:00 pm>
         */
        this.AddonVer = "1.0";
        /**
         * Variable que almacena el estado del addon
         * @readonly
         * @method
         * @private
         * @author Emiliocrack1355 - 23/11/26 <06:00 pm>
         */
        this.AddonBeta = true;
        this.onWorldInit();
        this.onPlayerSpawn();
        this.loadCustomCommands();
      }
      /**
       * Metodo que ejecuta todo lo necesario para inicializar el mundo
       * @method
       * @private
       * @author Emiliocrack1355 - 23/11/26 <06:02 pm>
       */
      onWorldInit() {
        afterEventsSimplified.onWorldReady(() => {
          const dynamic = world6.getDynamicProperty(utils.WorldDynamicID);
          if (typeof dynamic === "undefined") {
            world6.setDynamicProperty(
              utils.WorldDynamicID,
              JSON.stringify({ prob: 0, cost: 1 })
            );
            console.warn(`Creating World Dynamic Values of Config`);
          } else {
            console.warn(`Load World Dynamic Values of Config`);
          }
        });
      }
      /**
       * Metodo que carga lo necesario cuando el jugador spawnea
       * @method
       * @private
       * @author Emiliocrack1355 - 23/11/26 <06:10 pm>
       */
      onPlayerSpawn() {
        afterEventsSimplified.onPlayerSpawns((args) => {
          const { initialSpawn, player } = args;
          if (initialSpawn) {
            system5.runTimeout(() => {
              player.sendMessage({
                translate: "emi.totems.system.welcome",
                with: [this.AddonVer, this.AddonBeta ? "-beta" : ""]
              });
            }, worldToolsSimplified.convertSecondsToTicks(30));
          }
        });
      }
      /**
       * Metodo que carga los comandos personalizados del addon
       * @method
       * @private
       * @author Emiliocrack1355 - 23/11/26 <06:15 pm>
       * @LastModified 24/11/26 <06:30 pm>
       */
      loadCustomCommands() {
        beforeEventsSimplified.createCustomCommand(
          {
            name: "emi:totem",
            description: "emi.customT.cmd.totem",
            cheatsRequired: false,
            permissionLevel: CommandPermissionLevel.Any,
            mandatoryParameters: [
              { name: "emi:totem_options", type: CustomCommandParamType.Enum },
              { name: "value", type: CustomCommandParamType.Integer }
            ]
          },
          (origin, option, value) => {
            const player = origin.initiator ?? origin.sourceEntity;
            if (!(player instanceof Player3)) return;
            if (!player.hasTag("admin")) {
              player.sendMessage({ translate: "emi.totems.cmd.notAdmin" });
              return;
            }
            const raw = world6.getDynamicProperty(utils.WorldDynamicID);
            let config = { prob: 0, cost: 1 };
            if (typeof raw === "string") {
              try {
                config = { ...config, ...JSON.parse(raw) };
              } catch {
                console.warn("Error on Load World Dynamic Config");
              }
            }
            system5.run(() => {
              switch (option) {
                case "prob":
                  if (value < 0 || value > 100) {
                    world6.sendMessage({
                      translate: "emi.totems.cmd.notValidProb",
                      with: [String(value)]
                    });
                    return;
                  }
                  config.prob = value;
                  world6.setDynamicProperty(
                    utils.WorldDynamicID,
                    JSON.stringify(config)
                  );
                  world6.sendMessage({
                    translate: "emi.totems.cmd.setProb",
                    with: [String(value)]
                  });
                  break;
                case "cost":
                  if (value < 1) {
                    world6.sendMessage({
                      translate: "emi.totems.cmd.notValidCost",
                      with: [String(value)]
                    });
                    return;
                  }
                  config.cost = value;
                  world6.setDynamicProperty(
                    utils.WorldDynamicID,
                    JSON.stringify(config)
                  );
                  world6.sendMessage({
                    translate: "emi.totems.cmd.setCost",
                    with: [String(value)]
                  });
                  break;
              }
            });
          },
          { "emi:totem_options": ["prob", "cost"] }
        );
      }
    };
    new WorldInit();
  }
});

// behaviors/Stackeable Totems/src/world/events.ts
import { system as system6 } from "@minecraft/server";
var require_events = __commonJS({
  "behaviors/Stackeable Totems/src/world/events.ts"() {
    "use strict";
    init_lib();
    init_dist();
    init_utils();
    var WorldEvents = class {
      constructor() {
        this.onPlayerUseTotem();
      }
      /**
       * Metodo que detecta cuando se usa una cama
       * @method
       * @private
       * @author Emiliocrack1355 - 23/11/26 <06:20 pm>
       */
      onPlayerUseTotem() {
        beforeEventsSimplified.onInteractBlock((args) => {
          const { player, block } = args;
          if (!block || block.typeId !== MinecraftBlockTypes.Bed) return;
          if (!player.isSneaking) return;
          args.cancel = true;
          system6.run(() => {
            const tag = player.getTags().find((t) => t.startsWith("SpawnPoint:"));
            if (tag) player.removeTag(tag);
            const { x, y, z } = block.location;
            const dim = block.dimension.id.split(":")[1];
            player.sendMessage({
              translate: "emi.totems.system.saveSpawn",
              with: [String(x), String(y), String(z), utils.formatText(dim, true)]
            });
            player.addTag(`SpawnPoint:${x},${y},${z};${dim}`);
          });
        });
      }
    };
    new WorldEvents();
  }
});

// behaviors/Stackeable Totems/src/main.ts
var require_main = __commonJS({
  "behaviors/Stackeable Totems/src/main.ts"() {
    var import_init = __toESM(require_init());
    var import_events = __toESM(require_events());
    init_logic();
  }
});
export default require_main();
//# sourceMappingURL=main.js.map
