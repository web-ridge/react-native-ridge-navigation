import type { BaseScreen } from './navigationUtils';
import * as React from 'react';
import OptimizedContext from './contexts/OptimizedContext';

export type PreloadResultTransformHook = (args: {
  preloaded: any;
  params: any;
  screen: BaseScreen;
}) => any;

// Identity by default; apps can register a hook to replace stale preload
// results (e.g. Relay query refs created against a replaced environment).
let preloadResultTransformHook: PreloadResultTransformHook = ({ preloaded }) =>
  preloaded;

export function setPreloadResultTransformHook(
  hook: PreloadResultTransformHook
) {
  preloadResultTransformHook = hook;
}

export function usePreloadResult<T extends BaseScreen>(
  screen: T
): ReturnType<T['preload']> {
  const preloadResult = React.useContext(OptimizedContext);
  return preloadResultTransformHook({
    preloaded: preloadResult.preloaded,
    params: preloadResult.data,
    screen,
  }) as any;
}

/**
 * Tells transition navigation (web) when a screen's preloaded data can render
 * without suspending. Return a promise that settles once it can, or
 * null/undefined when it already can. The default waits for a preload result
 * that is itself a promise and treats anything else as ready.
 *
 * Relay apps return a promise for every `PreloadedQuery` in the result whose
 * data is not in the store yet (see the README).
 */
export type PreloadReadyHook = (args: {
  preloaded: any;
  params: any;
  screen: BaseScreen;
}) => Promise<unknown> | null | undefined;

export const defaultPreloadReadyHook: PreloadReadyHook = ({ preloaded }) =>
  isPromiseLike(preloaded) ? Promise.resolve(preloaded) : null;

let preloadReadyHook: PreloadReadyHook = defaultPreloadReadyHook;

export function setPreloadReadyHook(hook: PreloadReadyHook) {
  preloadReadyHook = hook;
}

export function getPreloadReady(args: {
  preloaded: any;
  params: any;
  screen: BaseScreen;
}): Promise<unknown> | null {
  try {
    return preloadReadyHook(args) ?? null;
  } catch (error) {
    console.log(
      '[react-native-ridge-navigation] error in preload ready hook',
      error
    );
    return null;
  }
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    value != null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}
