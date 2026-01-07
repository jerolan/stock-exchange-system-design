import type { Event } from "../core/types";

/**
 * In-memory EventBus for decoupling core matching from views/projections.
 *
 * Represents:
 * - Queue of events already executed (output from core)
 * - Decoupling between matching engine and views
 *
 * Not a source of truth. Truth is in the WAL.
 */
export class EventBus {
  private queue: Event[] = [];

  /**
   * Publishes an event to the bus (called by matching engine).
   * Should be fast and non-blocking.
   * @param event - The event to publish.
   */
  publish(event: Event) {
    this.queue.push(event);
  }

  /**
   * Drains up to max events from the bus (called by views).
   * Simulates lag and backpressure for projections.
   * @param max - Maximum number of events to drain.
   * @returns Array of drained events.
   */
  drain(max: number): Event[] {
    if (max <= 0) return [];
    return this.queue.splice(0, max);
  }

  /**
   * Returns the current event backlog size (for metrics/demo).
   * @returns Number of events in the queue.
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Returns a snapshot of the current event queue (for debug/demo).
   * @returns Array of events currently in the queue.
   */
  snapshot(): Event[] {
    return [...this.queue];
  }
}
