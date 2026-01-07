import { MatchingEngine } from "../core/matchingEngine";
import type { Event, Order } from "../core/types";
import { nextId, randomBetween } from "./utils";

/**
 * Configuration for the order generator.
 */
type GeneratorConfig = {
  symbol: string;
  basePrice: number;
  spread: number;
  intervalMs: number;
};

/**
 * Starts a periodic random order generator for demo/testing.
 *
 * Generates random BUY/SELL orders around a base price and injects them into the matching engine.
 *
 * @param engine - The matching engine instance to receive generated orders.
 * @param config - Generator configuration (symbol, basePrice, spread, intervalMs).
 * @example
 * ```typescript
 * startOrderGenerator(engine, { symbol: "DEMO", basePrice: 100, spread: 5, intervalMs: 1000 });
 * ```
 */
export function startOrderGenerator(
  engine: MatchingEngine,
  config: GeneratorConfig
) {
  const { symbol, basePrice, spread, intervalMs } = config;

  setInterval(() => {
    const side = Math.random() > 0.5 ? "BUY" : "SELL";
    const priceOffset = randomBetween(0, spread);
    const price =
      side === "BUY" ? basePrice - priceOffset : basePrice + priceOffset;

    const order: Order = {
      id: nextId(side),
      side,
      price,
      qty: randomBetween(1, 5),
      ts: Date.now(),
      symbol,
    };

    const event: Event = {
      type: "NEW_ORDER",
      order,
    };

    engine.process(event);
  }, intervalMs);
}
