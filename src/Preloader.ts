import type { BaseScreen } from './navigationUtils';
import * as React from 'react';
import OptimizedContext from './contexts/OptimizedContext';

export function usePreloadResult<T extends BaseScreen>(
  _: T
): ReturnType<T['preload']> {
  const preloadResult = React.useContext(OptimizedContext);
  return preloadResult.preloaded as any;
}
