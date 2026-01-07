import type { Order } from "./types";
import { DoublyLinkedList, ListNode } from "./dll";

/**
 * Represents a price level in the order book (FIFO queue).
 */
type PriceLevel = DoublyLinkedList<Order>;

/**
 * Direct reference to an order and its node in the linked list.
 */
type OrderRef = {
  order: Order;
  node: ListNode<Order>;
};

/**
 * In-memory order book with O(1) cancellation and price-time priority.
 *
 * Maintains separate price levels for BUY and SELL sides, each as a FIFO queue.
 * Provides fast queries for best price and efficient order management.
 */
export class OrderBook {
  private buys = new Map<number, PriceLevel>();
  private sells = new Map<number, PriceLevel>();
  /** Critical index: orderId → direct reference for O(1) cancel. */
  private index = new Map<string, OrderRef>();

  // ---------- Commands ----------

  /**
   * Adds a new order to the book at its price level.
   * @param order - The order to add.
   */
  add(order: Order) {
    const book = order.side === "BUY" ? this.buys : this.sells;
    let level = book.get(order.price);
    if (!level) {
      level = new DoublyLinkedList<Order>();
      book.set(order.price, level);
    }
    const node = level.append(order);
    this.index.set(order.id, { order, node });
  }

  /**
   * Cancels an order by its ID, removing it from the book and index.
   * @param orderId - The ID of the order to cancel.
   */
  cancel(orderId: string) {
    const ref = this.index.get(orderId);
    if (!ref) return;
    const { order, node } = ref;
    const book = order.side === "BUY" ? this.buys : this.sells;
    const level = book.get(order.price);
    if (!level) return;
    level.remove(node);
    this.index.delete(orderId);
    if (level.isEmpty()) {
      book.delete(order.price);
    }
  }

  // ---------- Internal queries (hot path) ----------

  /**
   * Returns the best BUY order (highest price, FIFO).
   * @returns The best BUY order or null if none.
   */
  bestBuy(): Order | null {
    if (this.buys.size === 0) return null;
    const price = Math.max(...this.buys.keys());
    return this.buys.get(price)?.peek() ?? null;
  }

  /**
   * Returns the best SELL order (lowest price, FIFO).
   * @returns The best SELL order or null if none.
   */
  bestSell(): Order | null {
    if (this.sells.size === 0) return null;
    const price = Math.min(...this.sells.keys());
    return this.sells.get(price)?.peek() ?? null;
  }
}
