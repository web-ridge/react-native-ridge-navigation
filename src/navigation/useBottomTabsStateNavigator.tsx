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

  const initialUrl = useURL();
  return React.useMemo(() => {
    const goToDefault = () => {
      const navigator = new StateNavigator(stateNavigator);
      navigator.start(tabKey);
      return navigator;
    };
    if (initialUrl) {
      const navigator = new StateNavigator(stateNavigator);
      let fluentNavigator = navigator.fluent(true);
      fluentNavigator = fluentNavigator.navigate(tabKey);
      const path = getPathFromUrl(initialUrl);
      const initialRootKey = getRootKeyFromPath(path)!;
      const bottomTabKey = getBottomTabKeyFromPath(path);
      const bottomTabScreenKey = getScreenKey(initialRootKey, bottomTabKey);
      if (bottomTabScreenKey !== tabKey) {
        return goToDefault();
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
      return navigator;
    }

    return goToDefault();
  }, [
    tabKey,
    initialUrl,
    preloadElement,
    preloadScreen,
    screens,
    // stateNavigator,
  ]);
}
