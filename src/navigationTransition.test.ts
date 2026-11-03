import {
  commitWhenReady,
  settledWithin,
  type NavigationTransition,
} from './navigationTransition';
import {
  intentPreloadStaleMs,
  isFreshPreload,
  whenAllReady,
} from './screenReadiness';
import { defaultPreloadReadyHook } from './Preloader';

// A stand-in for React's startTransition: runs the scope and, for an async
// scope, hands back its promise so the test can await the whole action.
function fakeTransition(pendingMs = 1000) {
  const scopes: Array<unknown> = [];
  const transition: NavigationTransition = {
    start: ((scope: () => unknown) => {
      scopes.push(scope());
    }) as NavigationTransition['start'],
    latest: { current: 0 },
    pendingMs,
  };
  const settled = () => Promise.all(scopes);
  return { transition, settled };
}

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('commitWhenReady', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('commits in the same tick when the screen is ready', () => {
    const { transition } = fakeTransition();
    const commit = jest.fn();
    commitWhenReady(transition, null, commit);
    expect(commit).toHaveBeenCalledTimes(1);
  });

  it('keeps the current screen until the next one is ready', async () => {
    const { transition, settled } = fakeTransition();
    const ready = deferred();
    const commit = jest.fn();
    commitWhenReady(transition, ready.promise, commit);
    await Promise.resolve();
    expect(commit).not.toHaveBeenCalled();

    ready.resolve();
    await settled();
    expect(commit).toHaveBeenCalledTimes(1);
  });

  it('commits after pendingMs when the next screen is still loading', async () => {
    const { transition, settled } = fakeTransition(1000);
    const commit = jest.fn();
    commitWhenReady(transition, new Promise(() => {}), commit);
    jest.advanceTimersByTime(999);
    await Promise.resolve();
    expect(commit).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    await settled();
    expect(commit).toHaveBeenCalledTimes(1);
  });

  it('commits when loading fails, so the screen can show its error', async () => {
    const { transition, settled } = fakeTransition();
    const ready = deferred();
    const commit = jest.fn();
    commitWhenReady(transition, ready.promise, commit);
    ready.reject(new Error('network'));
    await settled();
    expect(commit).toHaveBeenCalledTimes(1);
  });

  it('lets only the latest navigation commit', async () => {
    const { transition, settled } = fakeTransition();
    const first = deferred();
    const second = deferred();
    const commitFirst = jest.fn();
    const commitSecond = jest.fn();
    commitWhenReady(transition, first.promise, commitFirst);
    commitWhenReady(transition, second.promise, commitSecond);

    second.resolve();
    first.resolve();
    await settled();
    expect(commitFirst).not.toHaveBeenCalled();
    expect(commitSecond).toHaveBeenCalledTimes(1);
  });

  it('a ready navigation cancels one that still waits', async () => {
    const { transition, settled } = fakeTransition();
    const waiting = deferred();
    const commitWaiting = jest.fn();
    const commitReady = jest.fn();
    commitWhenReady(transition, waiting.promise, commitWaiting);
    commitWhenReady(transition, null, commitReady);
    waiting.resolve();
    await settled();
    expect(commitReady).toHaveBeenCalledTimes(1);
    expect(commitWaiting).not.toHaveBeenCalled();
  });
});

describe('settledWithin', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('resolves on rejection instead of throwing', async () => {
    await expect(
      settledWithin(Promise.reject(new Error('x')), 1000)
    ).resolves.toBeUndefined();
  });
});

describe('whenAllReady', () => {
  it('is null when nothing has to load', () => {
    expect(whenAllReady([null, undefined])).toBeNull();
  });

  it('waits for every part and swallows failures', async () => {
    const code = deferred();
    const data = deferred();
    let done = false;
    whenAllReady([code.promise, data.promise])!.then(() => {
      done = true;
    });
    code.resolve();
    await Promise.resolve();
    expect(done).toBe(false);
    data.reject(new Error('network'));
    await new Promise((resolve) => setImmediate(resolve));
    expect(done).toBe(true);
  });
});

describe('isFreshPreload', () => {
  it('reuses an intent preload within the stale window', () => {
    const now = 100_000;
    expect(
      isFreshPreload(now - intentPreloadStaleMs, intentPreloadStaleMs, now)
    ).toBe(true);
    expect(
      isFreshPreload(now - intentPreloadStaleMs - 1, intentPreloadStaleMs, now)
    ).toBe(false);
    expect(isFreshPreload(null, intentPreloadStaleMs, now)).toBe(false);
  });
});

describe('defaultPreloadReadyHook', () => {
  const screen = { path: '/x', preload: jest.fn(), element: null } as any;

  it('waits for a preload result that is a promise', () => {
    expect(
      defaultPreloadReadyHook({
        preloaded: Promise.resolve(1),
        params: {},
        screen,
      })
    ).toBeInstanceOf(Promise);
  });

  it('treats any other result as ready', () => {
    expect(
      defaultPreloadReadyHook({ preloaded: { ref: 1 }, params: {}, screen })
    ).toBeNull();
    expect(
      defaultPreloadReadyHook({ preloaded: undefined, params: {}, screen })
    ).toBeNull();
  });
});
