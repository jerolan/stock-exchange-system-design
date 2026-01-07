import type { Order, Side } from "../core/types";

/**
 * Filters for querying open orders.
 */
type Filters = {
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

  // -------- Queries --------

  /**
   * Lists open orders, optionally filtered by side and/or symbol.
   * Sorted by logical timestamp (presentation only).
   * @param filters - Optional filters for side and symbol.
   * @returns Array of open orders.
   */
  list(filters?: Filters): Order[] {
    let result = Array.from(this.orders.values());
    if (filters?.side) {
      result = result.filter((o) => o.side === filters.side);
    }
    if (filters?.symbol) {
      result = result.filter((o) => o.symbol === filters.symbol);
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
