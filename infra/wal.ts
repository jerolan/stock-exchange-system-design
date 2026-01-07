import { appendFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import type { Event } from "../core/types";

/**
 * Dependencies required to create the WAL (Write-Ahead Log).
 */
type WALDeps = {
  filePath: string;
};

/**
 * Creates a Write-Ahead Log (WAL) for event durability and crash recovery.
 *
 * WAL is the source of truth: if it's not in the WAL, it didn't happen.
 *
 * @param filePath - Path to the WAL file.
 * @returns Object with append, replay, and size methods.
 */
export function createWAL({ filePath }: WALDeps) {
  // Ensure directory exists
  const dir = dirname(filePath);
  if (dir && dir !== "." && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  /**
   * Appends an event to the WAL file.
   * Sacred rule: if it's not in the WAL, it didn't happen.
   * @param event - The event to append.
   */
  function append(event: Event) {
    appendFileSync(filePath, JSON.stringify(event) + "\n");
  }

  /**
   * Replays all events from the WAL file.
   * Used for crash recovery and state reconstruction.
   * @returns Array of events from the WAL.
   */
  function replay(): Event[] {
    if (!existsSync(filePath)) return [];
    const content = readFileSync(filePath, "utf-8");
    if (!content.trim()) return [];
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Event);
  }

  /**
   * Returns the number of events in the WAL file.
   * @returns Number of events in the WAL.
   */
  function size(): number {
    if (!existsSync(filePath)) return 0;
    return readFileSync(filePath, "utf-8").split("\n").filter(Boolean).length;
  }

  return {
    append,
    replay,
    size,
  };
}
