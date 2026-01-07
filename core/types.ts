/**
 * Side of an order: BUY or SELL.
 */
export type Side = "BUY" | "SELL";

/**
 * Represents a single order in the order book.
 * @property id - Unique order identifier.
 * @property side - BUY or SELL.
 * @property price - Limit price.
 * @property qty - Quantity remaining.
 * @property ts - Logical timestamp (arrival order).
 * @property symbol - Optional symbol for demo (e.g., "DEMO").
 */
export interface Order {
  id: string;
  side: Side;
  price: number;
  qty: number;
  ts: number;
  symbol?: string;
}

/**
 * Event: New order entered into the market.
 * @property type - "NEW_ORDER"
 * @property order - The order details.
 */
export type NewOrderEvent = {
  type: "NEW_ORDER";
  order: Order;
};

/**
 * Event: Order cancellation.
 * @property type - "CANCEL_ORDER"
 * @property orderId - ID of the order to cancel.
 */
export type CancelOrderEvent = {
  type: "CANCEL_ORDER";
  orderId: string;
};

/**
 * Event: Trade execution between two orders.
 * @property type - "TRADE"
 * @property buyId - ID of the buy order.
 * @property sellId - ID of the sell order.
 * @property qty - Quantity traded.
 * @property price - Trade price.
 */
export type TradeEvent = {
  type: "TRADE";
  buyId: string;
  sellId: string;
  qty: number;
  price: number;
};

/**
 * Canonical event union for the system.
 * This contract:
 * - Is written to the WAL
 * - Is replayed for crash recovery
 * - Flows through the EventBus
 */
export type Event = NewOrderEvent | CancelOrderEvent | TradeEvent;
