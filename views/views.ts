import { EventBus } from "../infra/eventBus";
import { OpenOrdersView } from "./openOrdersView";
import type { Event } from "../core/types";

/**
 * Dependencies required to create views/projections.
 */
type ViewsDeps = {
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
  eventBus,
  applyIntervalMs = 500,
  batchSize = 1,
}: ViewsDeps) {
  const openOrdersView = new OpenOrdersView();

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
   * Applies a single event to the openOrdersView.
   * @param event - The event to apply.
   */
  function applyEvent(event: Event) {
    switch (event.type) {
      case "NEW_ORDER":
        openOrdersView.onNewOrder(event.order);
        console.log(`[VIEW] new order ${event.order.id}`);
        break;
      case "CANCEL_ORDER":
        openOrdersView.onCancel(event.orderId);
        console.log(`[VIEW] cancel ${event.orderId}`);
        break;
      case "TRADE":
        openOrdersView.onFill(event.buyId, 0);
        openOrdersView.onFill(event.sellId, 0);
        console.log(`[VIEW] trade applied ${event.buyId} <-> ${event.sellId}`);
        break;
    }
  }

  return {
    openOrdersView,
    start,
  };
}
