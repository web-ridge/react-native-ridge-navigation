/**
 * Combines the parts a screen waits for (its code chunk, its preloaded data)
 * into one promise, or null when every part is ready already so a navigation
 * can commit in the same tick.
 */
export function whenAllReady(
  parts: Array<Promise<unknown> | null | undefined>
): Promise<void> | null {
  const pending = parts.filter((part): part is Promise<unknown> =>
    Boolean(part)
  );
  if (pending.length === 0) {
    return null;
  }
  // A failed part counts as settled: the screen renders and shows its own
  // error boundary instead of the navigation hanging on the old screen.
  return Promise.all(pending.map((part) => part.catch(() => undefined))).then(
    () => undefined
  );
}

// How long a hover/focus preload is reused before another intent preloads
// again. TanStack Router's defaultPreloadStaleTime is 30 s as well. Pressing
// still re-preloads after the shorter press window (Link.shared
// isStalePreload), so a click never opens a screen on data older than that:
// with a store-and-network cache the screen renders from the hover's data
// immediately and refreshes in the background.
export const intentPreloadStaleMs = 30_000;

// Hover/focus has to rest this long before it preloads, so moving the mouse
// across a list does not fire a request per row (TanStack's
// defaultPreloadDelay is 50 ms).
export const intentPreloadDelayMs = 50;

export function isFreshPreload(
  preloadedAt: number | null | undefined,
  staleMs: number,
  now = Date.now()
) {
  return preloadedAt != null && now - preloadedAt <= staleMs;
}
