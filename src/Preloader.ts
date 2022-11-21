import type { BaseScreen } from './navigationUtils';
import { useContext } from 'react';
import OptimizedContext from './contexts/OptimizedContext';

export function usePreloadResult<T extends BaseScreen>(): ReturnType<
  T['preload']
> {
  const preloadResult = useContext(OptimizedContext);
  return preloadResult as any;
}
