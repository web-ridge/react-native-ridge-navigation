import * as React from 'react';
import { NavigationContext } from 'navigation-react';
import { StateNavigator } from 'navigation';

export function useBottomTabsStateNavigator(key: string) {
  const { stateNavigator } = React.useContext(NavigationContext);
  return React.useMemo(
    () => {
      const navigator = new StateNavigator(stateNavigator);
      navigator.start(key);
      return navigator;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}
