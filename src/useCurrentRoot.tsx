import * as React from 'react';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import { Platform } from 'react-native';
import type { Root } from './navigationUtils';
import type { StateNavigator } from 'navigation';

function getRootKey(rootNavigator: StateNavigator, navigationRoot: Root) {
  const stateKey = rootNavigator?.stateContext?.state?.key;
  if (stateKey) {
    const splitUrl = stateKey.split('/');
    return splitUrl.filter(Boolean)?.[0];
  }

  return Object.keys(navigationRoot)[0];
}

export default function useCurrentRoot() {
  const [_, setForceUpdate] = React.useState(0);
  const { rootNavigator, navigationRoot } = React.useContext(
    RidgeNavigationContext
  );

  const rootKey = getRootKey(rootNavigator, navigationRoot)!;

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      rootNavigator.onNavigate(() => {
        if (getRootKey(rootNavigator, navigationRoot) !== rootKey) {
          setForceUpdate((x) => x + 1);
        }
      });
    }
  }, [rootKey, rootNavigator, navigationRoot]);

  return {
    currentRoot: navigationRoot[rootKey],
    currentRootKey: rootKey,
  };
}
