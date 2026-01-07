import { EventBus } from "../infra/eventBus";
import { OpenOrdersView } from "./openOrdersView";
import { TradesView } from "./tradesView";
import type { Event } from "../core/types";

/**
 * Dependencies required to create views/projections.
 */
type ViewsDeps = {
  initialEvents: Event[];
  eventBus: EventBus;
  /** Artificial latency in ms between event applications. */
  applyIntervalMs?: number;
  /** Number of events to apply per tick. */
  batchSize?: number;
};

/**
 * Creates the views/projections layer for the stock exchange demo.
 *
 * Applies events from the EventBus to read models with artificial lag,
 * simulating DB/network latency and eventual consistency.
 *
 * @param initialEvents - Initial event history to bootstrap views.
 * @param eventBus - The event bus to drain events from.
 * @param applyIntervalMs - Artificial latency in ms (default: 500).
 * @param batchSize - Number of events per tick (default: 1).
 * @returns Object containing the openOrdersView and a start() method.
 * @example
 * ```typescript
 * const views = createViews({ eventBus });
 * views.start();
 * ```
 */
export function createViews({
  initialEvents,
  eventBus,
  applyIntervalMs = 500,
  batchSize = 1,
}: ViewsDeps) {
  const openOrdersView = new OpenOrdersView();
  const tradesView = new TradesView();
  openOrdersView.applyAll(initialEvents);
  tradesView.applyAll(initialEvents);

  /**
   * Starts the projector loop, applying events from the EventBus to views.
   * Simulates slow DB/IO/network by applying events in batches with delay.
   */
  function start() {
    setInterval(() => {
      const events = eventBus.drain(batchSize);
      for (const event of events) {
        applyEvent(event);
      }
    }, applyIntervalMs);
  }

  /**
   * Applies a single event to the projections.
   * @param event - The event to apply.
   */
  function applyEvent(event: Event) {
    openOrdersView.apply(event);
    tradesView.apply(event);
  }

  return {
    openOrdersView,
    tradesView,
    start,
  };
}
