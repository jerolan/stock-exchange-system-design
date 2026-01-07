import type { Event, Order, Side } from "../core/types";

/**
 * Filters for querying open orders.
 */
export type OpenOrdersFilters = {
  id?: string;
  side?: Side;
  symbol?: string;
};

/**
 * Read model for open orders, updated via event handlers.
 * Maintains a derived state: orderId → Order.
 * Provides queries for UI and debugging.
 */
export class OpenOrdersView {
  /** Derived state: orderId → Order. */
  private orders = new Map<string, Order>();

  // -------- Event handlers --------

  /**
   * Handles new order event.
   * Defensive copy: view must not mutate core order.
   * @param order - The new order to add.
   */
  onNewOrder(order: Order) {
    this.orders.set(order.id, { ...order });
  }

  /**
   * Handles order cancellation event.
   * @param orderId - The ID of the order to cancel.
   */
  onCancel(orderId: string) {
    this.orders.delete(orderId);
  }

  /**
   * Handles order fill event (partial or full).
   * Removes order if fully filled, updates qty otherwise.
   * @param orderId - The ID of the order filled.
   * @param remainingQty - Remaining quantity after fill.
   */
  onFill(orderId: string, remainingQty: number) {
    const order = this.orders.get(orderId);
    if (!order) return;
    if (remainingQty <= 0) {
      this.orders.delete(orderId);
    } else {
      order.qty = remainingQty;
    }
  }

  /**
   * Applies a canonical event to this view.
   * Centralizes event → projection logic (used by both bootstrap and live projection).
   *
   * @param event - The event to apply.
   */
  apply(event: Event) {
    switch (event.type) {
      case "NEW_ORDER":
        console.log(`[VIEW] new order ${event.order.id}`);
        this.onNewOrder(event.order);
        return;
      case "CANCEL_ORDER":
        console.log(`[VIEW] cancel ${event.orderId}`);
        this.onCancel(event.orderId);
        return;
      case "TRADE": {
        console.log(`[VIEW] trade applied ${event.buyId} <-> ${event.sellId}`);
        const applyFillQty = (orderId: string, fillQty: number) => {
          const order = this.orders.get(orderId);
          if (!order) return;
          const remainingQty = order.qty - fillQty;
          this.onFill(orderId, remainingQty);
        };

        applyFillQty(event.buyId, event.qty);
        applyFillQty(event.sellId, event.qty);
        return;
      }
    }
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

  // -------- Queries --------

  /**
   * Lists open orders, optionally filtered by side and/or symbol.
   * Sorted by logical timestamp (presentation only).
   * @param filters - Optional filters for side and symbol.
   * @returns Array of open orders.
   */
  list(filters?: OpenOrdersFilters): Order[] {
    let result = Array.from(this.orders.values());
    if (filters?.side) {
      result = result.filter((o) => o.side === filters.side);
    }
    if (filters?.symbol) {
      result = result.filter((o) => o.symbol === filters.symbol);
    }
    if (filters?.id) {
      result = result.filter((o) => o.id === filters.id);
    }
    // Sort for presentation (not market priority)
    return result.sort((a, b) => a.ts - b.ts);
  }

  /**
   * Gets a defensive copy of an order by ID.
   * @param orderId - The order ID to retrieve.
   * @returns The order or undefined if not found.
   */
  get(orderId: string): Order | undefined {
    const order = this.orders.get(orderId);
    return order ? { ...order } : undefined;
  }

  /**
   * Returns the number of open orders.
   * @returns Number of open orders.
   */
  size(): number {
    return this.orders.size;
  }

  // -------- Debug / Demo --------

  /**
   * Returns a snapshot of the current open orders state.
   * @returns Object with count and array of orders.
   */
  snapshot() {
    return {
      count: this.orders.size,
      orders: this.list(),
    };
  }
}
