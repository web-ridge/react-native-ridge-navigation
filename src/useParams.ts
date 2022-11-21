import type { BaseScreen, ExtractRouteParams } from './navigationUtils';
import * as React from 'react';
import OptimizedContext from './contexts/OptimizedContext';

export default function useParams<T extends BaseScreen>(
  _: T
): ExtractRouteParams<T['path']> {
  const context = React.useContext(OptimizedContext);
  return context.data as any;
}
