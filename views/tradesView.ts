import type { Event, TradeEvent } from "../core/types";

/**
 * Read model for executed trades.
 *
 * Stores TRADE events for querying/debugging. This is a projection (eventually
 * consistent when fed from EventBus).
 */
export class TradesView {
  private trades: TradeEvent[] = [];

  /**
   * Applies a canonical event to this view.
   * @param event - The event to apply.
   */
  apply(event: Event) {
    if (event.type !== "TRADE") return;
    this.trades.push(event);
  }

  /**
   * Applies a batch of events to this view.
   * @param events - Events to apply.
   */
  applyAll(events: Event[]) {
    for (const event of events) {
      this.apply(event);
    }
  }

  /**
   * Lists all trades in the order they were applied.
   * @returns Array of trade events.
   */
  list(): TradeEvent[] {
    return [...this.trades];
  }

  /**
   * Returns the number of trades.
   * @returns Number of trades.
   */
  size(): number {
    return this.trades.length;
  }

  /**
   * Returns a snapshot of the trades view.
   * @returns Object with count and trades.
   */
  snapshot() {
    return {
      count: this.trades.length,
      trades: this.list(),
    };
  }
}
