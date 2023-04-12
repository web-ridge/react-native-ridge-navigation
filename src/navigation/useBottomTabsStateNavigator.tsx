import * as React from 'react';
import { NavigationContext } from 'navigation-react';
import { StateNavigator } from 'navigation';
import {
  BottomTabType,
  getBottomTabKeyFromPath,
  getPathFromUrl,
  getPaths,
  getRootKeyFromPath,
  getScreenKey,
  RootChildBottomTabs,
} from '../navigationUtils';
import { findMatchedRoutes } from '../parseUrl';
import RidgeNavigationContext from '../contexts/RidgeNavigationContext';
import { useURL } from 'expo-linking';

export function useBottomTabsStateNavigator(startKey: string) {
  const { screens, preloadScreen, preloadElement, navigationRoot } =
    React.useContext(RidgeNavigationContext);
  const { stateNavigator } = React.useContext(NavigationContext);

  const navigator = React.useMemo(() => {
    const n = new StateNavigator(stateNavigator);
    n.start(startKey);
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const initialUrl = useURL();
  React.useEffect(() => {
    const timerId = setTimeout(() => {
      if (initialUrl) {
        let fluentNavigator = navigator.fluent(false).navigate(startKey);
        const path = getPathFromUrl(initialUrl);
        const initialRootKey = getRootKeyFromPath(path)!;
        const bottomTabKey = getBottomTabKeyFromPath(path);
        const bottomTab = (
          navigationRoot[initialRootKey] as RootChildBottomTabs
        )?.children?.find((t) => t.path === '/' + bottomTabKey);

        const bottomTabScreenKey = getScreenKey(initialRootKey, bottomTab);
        if (bottomTabScreenKey !== startKey) {
          return;
        }
        const paths = getPaths(path, true);
        const matches = findMatchedRoutes(paths, screens);
        matches.forEach(({ route, params }) => {
          const navigateKey = getScreenKey(
            initialRootKey,
            bottomTab,
            route.path
          );
          preloadElement(route);
          preloadScreen(navigateKey, route.preload(params));
          fluentNavigator = fluentNavigator.navigate(navigateKey, params);
        });

        navigator.navigateLink(fluentNavigator.url);
      }
    }, 600);
    return () => clearTimeout(timerId);
  }, [
    initialUrl,
    stateNavigator,
    screens,
    preloadScreen,
    preloadElement,
    navigator,
    startKey,
    navigationRoot,
  ]);
  return navigator;
}
