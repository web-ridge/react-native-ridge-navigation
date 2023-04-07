import * as React from 'react';
import type { BaseScreen, ExtractRouteParams } from './navigationUtils';
import useNavigation from './useNavigation';

export default function Redirect<T extends BaseScreen>({
  to,
  params,
  addToHistory,
}: {
  to: T;
  params: ExtractRouteParams<T['path']>;
  addToHistory: boolean;
}) {
  const { push, replace } = useNavigation();
  React.useEffect(() => {
    if (addToHistory) {
      push(to, params, { preload: true });
    } else {
      replace(to, params, { preload: true });
    }
  }, [push, replace, to, params, addToHistory]);
  return null;
}
