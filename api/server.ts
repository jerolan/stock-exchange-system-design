import { OpenOrdersView } from "../views/openOrdersView";
import { EventBus } from "../infra/eventBus";
import { MatchingEngine } from "../core/matchingEngine";

/**
 * Dependencies required to create the HTTP server.
 */
type ServerDeps = {
  engine: MatchingEngine;
  openOrdersView: OpenOrdersView;
  eventBus: EventBus;
  port?: number;
};

/**
 * Creates and starts the Bun HTTP server for the stock exchange API.
 *
 * Exposes endpoints for querying open orders, health status, and simulating a crash.
 *
 * @param engine - The matching engine instance.
 * @param openOrdersView - The view for open orders (read model).
 * @param eventBus - The event bus for event backlog visibility.
 * @param port - The port to listen on (default: 3000).
 * @returns The Bun server instance.
 * @example
 * ```typescript
 * const server = createServer({ engine, openOrdersView, eventBus });
 * // Server is now running
 * ```
 */
export function createServer({
  engine,
  openOrdersView,
  eventBus,
  port = 3000,
}: ServerDeps) {
  const server = Bun.serve({
    port,
    fetch(req) {
      const url = new URL(req.url);

      // ---- READ MODEL: Open Orders ----
      if (req.method === "GET" && url.pathname === "/orders/open") {
        const side = url.searchParams.get("side");
        const orders = openOrdersView.list({
          side: side === "BUY" || side === "SELL" ? side : undefined,
        });
        return new Response(
          JSON.stringify(
            {
              openOrders: orders,
              pendingEvents: eventBus.size(), // backlog visible
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      // ---- COMMAND: Simulate Crash ----
      if (req.method === "POST" && url.pathname === "/crash") {
        console.log("💥 CRASH endpoint called. Killing process.");
        setTimeout(() => process.exit(1), 100);
        return new Response("Crashing...", { status: 202 });
      }

      // ---- HEALTH Endpoint ----
      if (req.method === "GET" && url.pathname === "/health") {
        return new Response(
          JSON.stringify(
            {
              status: "OK",
              backlog: eventBus.size(),
            },
            null,
            2
          ),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      // ---- 404 Not Found ----
      return new Response("Not Found", { status: 404 });
    },
  });

  console.log(`🚀 Server running on http://localhost:${port}`);

  return server;
}
