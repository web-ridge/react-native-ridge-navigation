import type { BaseScreen } from './navigationUtils';
import { useContext } from 'react';
import OptimizedContext from './contexts/OptimizedContext';

export function usePreloadResult<T extends BaseScreen>(
  _: T
): ReturnType<T['preload']> {
  const preloadResult = useContext(OptimizedContext);
  return preloadResult.preloaded as any;
}
