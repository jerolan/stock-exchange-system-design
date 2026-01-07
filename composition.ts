import { createWAL } from "./infra/wal";
import { EventBus } from "./infra/eventBus";
import { MatchingEngine } from "./core/matchingEngine";
import { createViews } from "./views/views";
import { createServer } from "./api/server";
import type { Event } from "./core/types";
import { startOrderGenerator } from "./generator/orderGenerator";

/**
 * Composition Root for Stock Exchange Matching Engine.
 *
 * Wires together all infrastructure, core, views, and server components.
 * No other file should instantiate or compose dependencies.
 *
 * @returns {object} The composed application dependencies and server instance.
 * @remarks
 * - WAL is replayed to restore state before starting projections and server.
 * - Views are not updated during replay; only live events update projections.
 * @example
 * ```typescript
 * const app = composeApp();
 * app.server.listen();
 * ```
 */
export function composeApp() {
  // ---- Infrastructure ----
  const wal = createWAL({ filePath: "./data/wal.log" });
  const eventBus = new EventBus();

  // ---- Core ----
  const engine = new MatchingEngine({
    wal,
    eventBus,
  });

  // ---- Replay (bootstrap WAL) ----
  const history: Event[] = wal.replay();
  console.log(`🔁 Replaying ${history.length} events from WAL`);
  for (const event of history) {
    engine.process(event, { mode: "replay" });
  }

  // ---- Views / Projections ----
  const views = createViews({
    initialEvents: history,
    eventBus,
    applyIntervalMs: 500, // Simulated lag for eventual consistency demo
    batchSize: 1,
  });

  // ---- Start projections ----
  views.start();

  // ---- Start order generator (demo) ----
  startOrderGenerator(engine, {
    symbol: "DEMO",
    basePrice: 100,
    spread: 5,
    intervalMs: 100, // ← ajusta para más o menos ruido
  });

  // ---- Server ----
  const server = createServer({
    engine,
    openOrdersView: views.openOrdersView,
    tradesView: views.tradesView,
    eventBus,
    port: 3000,
  });

  return {
    wal,
    eventBus,
    engine,
    views,
    server,
  };
}
