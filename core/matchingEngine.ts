import { OrderBook } from "./orderBook";
import type { Event } from "./types";
import { EventBus } from "../infra/eventBus";

/**
 * Write-Ahead Log (WAL) contract for event durability.
 */
type WAL = {
  append(event: Event): void;
};

/**
 * Dependencies required by the MatchingEngine.
 */
type MatchingEngineDeps = {
  wal: WAL;
  eventBus: EventBus;
};

/**
 * Core matching engine for the stock exchange demo.
 *
 * Implements deterministic price-time matching, crash recovery via WAL,
 * and event publication via EventBus. Single-threaded, synchronous, no I/O in hot path.
 */
export class MatchingEngine {
  private book = new OrderBook();
  private wal: WAL;
  private eventBus: EventBus;

  /**
   * Constructs a new MatchingEngine instance.
   * @param wal - Write-Ahead Log for event durability.
   * @param eventBus - EventBus for decoupled event publication.
   */
  constructor({ wal, eventBus }: MatchingEngineDeps) {
    this.wal = wal;
    this.eventBus = eventBus;
  }

  /**
   * Single entry point for processing events.
   * Handles both replay and live events.
   *
   * @param event - The event to process.
   * @remarks
   * - Ignores TRADE events (they are outputs, not inputs).
   * - NEW_ORDER triggers matching; CANCEL_ORDER removes order.
   */
  process(event: Event) {
    switch (event.type) {
      case "NEW_ORDER":
        this.book.add(event.order);
        this.match();
        break;
      case "CANCEL_ORDER":
        this.book.cancel(event.orderId);
        break;
      default:
        break;
    }
  }

  /**
   * Deterministic price-time matching loop.
   * Synchronous, single-thread, no async or I/O.
   *
   * @remarks
   * - Executes trades in memory, emits TRADE events to WAL and EventBus.
   * - Removes fully filled orders from the book.
   */
  private match() {
    while (true) {
      const buy = this.book.bestBuy();
      const sell = this.book.bestSell();
      if (!buy || !sell) return;
      if (buy.price < sell.price) return;

      const qty = Math.min(buy.qty, sell.qty);
      const price = sell.price;

      // Execute trade in memory
      buy.qty -= qty;
      sell.qty -= qty;

      console.log(
        `[MATCH] BUY ${buy.id} @${buy.price} x${qty} <-> SELL ${sell.id} @${sell.price} x${qty}`
      );

      // Emit official TRADE event
      const trade: Event = {
        type: "TRADE",
        buyId: buy.id,
        sellId: sell.id,
        qty,
        price,
      };

      // WAL = truth
      this.wal.append(trade);

      // EventBus = decoupling
      this.eventBus.publish(trade);

      // Remove fully filled orders
      if (buy.qty === 0) {
        this.book.cancel(buy.id);
      }
      if (sell.qty === 0) {
        this.book.cancel(sell.id);
      }
    }
  }
}
