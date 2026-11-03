import * as React from 'react';

/**
 * Transition navigation (web), modelled on TanStack Router: a navigation keeps
 * the current screen on display until the destination's code and preloaded
 * data are ready, instead of mounting the destination and showing its
 * Suspense fallback.
 *
 * Why a wait before navigating and not "just startTransition": React keeps the
 * old UI during a transition only for Suspense boundaries that are already on
 * screen. Every pushed scene mounts new boundaries (the scene's own and the
 * stack's freeze boundary), so a destination that suspends always commits its
 * fallback — and once a fallback is shown React holds the reveal of the real
 * content until 300 ms after it (FALLBACK_THROTTLE_MS). Waiting for the screen
 * to be ready inside an async transition avoids both.
 *
 * The wait is capped (`pendingMs`, default 1000 ms like TanStack's
 * `defaultPendingMs`): after that the destination commits and shows its own
 * fallback, exactly like before.
 */
export type NavigationTransition = {
  start: React.TransitionStartFunction;
  /** Increases with every navigation that waits; only the latest commits. */
  latest: { current: number };
  pendingMs: number;
};

export const defaultNavigationPendingMs = 1000;

const fallbackTransition: NavigationTransition = {
  start: React.startTransition,
  latest: { current: 0 },
  pendingMs: defaultNavigationPendingMs,
};

export const NavigationTransitionContext =
  React.createContext<NavigationTransition>(fallbackTransition);

const NavigationPendingContext = React.createContext(false);

export function NavigationTransitionProvider({
  pendingMs = defaultNavigationPendingMs,
  children,
}: {
  pendingMs?: number;
  children: React.ReactNode;
}) {
  const [isPending, start] = React.useTransition();
  const latest = React.useRef(0);
  const transition = React.useMemo(
    () => ({ start, latest, pendingMs }),
    [start, pendingMs]
  );
  return (
    <NavigationTransitionContext.Provider value={transition}>
      <NavigationPendingContext.Provider value={isPending}>
        {children}
      </NavigationPendingContext.Provider>
    </NavigationTransitionContext.Provider>
  );
}

/**
 * True while a navigation is waiting for its destination (web) or rendering
 * it in a transition. Pass `delayMs` to only report a navigation that takes
 * longer than that, so a quick switch never flashes an indicator.
 */
export function useNavigationPending(delayMs = 0): boolean {
  const isPending = React.useContext(NavigationPendingContext);
  const [delayPassed, setDelayPassed] = React.useState(false);
  // Reset during render once the navigation is done, so the next one starts
  // hidden again (the "adjust state when a prop changes" pattern).
  if (!isPending && delayPassed) {
    setDelayPassed(false);
  }

  React.useEffect(() => {
    if (!isPending || delayMs <= 0) {
      return undefined;
    }
    const timer = setTimeout(() => setDelayPassed(true), delayMs);
    return () => clearTimeout(timer);
  }, [isPending, delayMs]);

  if (delayMs <= 0) {
    return isPending;
  }
  return isPending && delayPassed;
}

/** Resolves when `promise` settles or after `ms`, whichever comes first. */
export function settledWithin(promise: Promise<unknown>, ms: number) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    promise.then(done, done);
  });
}

/**
 * Runs `commit` (the navigate call) as a transition once `ready` settles,
 * capped at `transition.pendingMs`; immediately when `ready` is null. Only the
 * latest call commits: a second navigation while the first still waits wins,
 * like the last click in a browser.
 */
export function commitWhenReady(
  transition: NavigationTransition,
  ready: Promise<unknown> | null,
  commit: () => void
) {
  const token = ++transition.latest.current;
  if (!ready) {
    transition.start(commit);
    return;
  }
  transition.start(async () => {
    await settledWithin(ready, transition.pendingMs);
    if (token !== transition.latest.current) {
      return;
    }
    transition.start(commit);
  });
}
