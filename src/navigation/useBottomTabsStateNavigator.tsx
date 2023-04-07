import * as React from 'react';
import { NavigationContext } from 'navigation-react';
import { StateNavigator } from 'navigation';
import {
  getBottomTabKeyFromPath,
  getPathFromUrl,
  getPaths,
  getRootKeyFromPath,
  getScreenKey,
} from '../navigationUtils';
import { findMatchedRoutes } from '../parseUrl';
import RidgeNavigationContext from '../contexts/RidgeNavigationContext';
import { useURL } from 'expo-linking';

export function useBottomTabsStateNavigator(tabKey: string) {
  const { screens, preloadScreen, preloadElement } = React.useContext(
    RidgeNavigationContext
  );
  const { stateNavigator } = React.useContext(NavigationContext);

  const navigator = React.useMemo(() => {
    const n = new StateNavigator(stateNavigator);
    n.start(tabKey);
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const initialUrl = useURL();
  React.useEffect(() => {
    const timerId = setTimeout(() => {
      if (initialUrl) {
        let fluentNavigator = navigator.fluent(false).navigate(tabKey);
        const path = getPathFromUrl(initialUrl);
        const initialRootKey = getRootKeyFromPath(path)!;
        const bottomTabKey = getBottomTabKeyFromPath(path);
        const bottomTabScreenKey = getScreenKey(initialRootKey, bottomTabKey);
        if (bottomTabScreenKey !== tabKey) {
          return;
        }
        const paths = getPaths(path, true);
        const matches = findMatchedRoutes(paths, screens);
        matches.forEach(({ route, params }) => {
          const navigateKey = getScreenKey(
            initialRootKey,
            bottomTabKey,
            route.path
          );
          preloadElement(route);
          preloadScreen(navigateKey, route.preload(params));
          fluentNavigator = fluentNavigator.navigate(navigateKey, params);
        });
        console.log('fluent', fluentNavigator.url);

        navigator.navigateLink(fluentNavigator.url);
      }
    }, 600);
    return () => clearTimeout(timerId);
  }, [
    initialUrl,
    tabKey,
    stateNavigator,
    screens,
    preloadScreen,
    preloadElement,
    navigator,
  ]);
  return navigator;
}
