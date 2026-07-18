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
