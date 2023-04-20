import * as React from 'react';
import { NavigationContext } from 'navigation-react';
import { StateNavigator } from 'navigation';

export function useBottomTabsStateNavigator(startKey: string) {
  const { stateNavigator } = React.useContext(NavigationContext);
  // const { preloadElement, preloadScreen } = React.useContext(OptimizedContext);

  const navigator = React.useMemo(() => {
    const n = new StateNavigator(stateNavigator);

    n.start(startKey);

    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return navigator;
}
