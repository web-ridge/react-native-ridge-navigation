import * as React from 'react';
import { NavigationContext } from 'navigation-react';
import { StateNavigator } from 'navigation';
import * as Linking from 'expo-linking';
import { getPathFromUrl, splitPath } from '../navigationUtils';
import { findMatchedRoute } from '../parseUrl';
import { useNavigation } from 'react-native-ridge-navigation';
import RidgeNavigationContext from '../contexts/RidgeNavigationContext';

export function useBottomTabsStateNavigator(key: string) {
  const { stateNavigator } = React.useContext(NavigationContext);
  useHandleDeeplinking(key);
  return React.useMemo(() => {
    const navigator = new StateNavigator(stateNavigator);
    navigator.start(key);
    return navigator;
  }, [key]);
}

function useHandleDeeplinking(key: string) {
  const initialUrl = Linking.useURL();
  const { screens } = React.useContext(RidgeNavigationContext);
  const { preloadElement, push } = useNavigation();
  const handled = React.useRef(false);
  React.useEffect(() => {
    if (handled.current) {
      return;
    }
    if (initialUrl) {
      handled.current = true;
      const path = getPathFromUrl(initialUrl);
      const split = splitPath(path);
      const rootAndBottomTabKey = [split[0], split[1]].join('/');
      const currentBottomTab = '/' + rootAndBottomTabKey === key;

      const rest = split.slice(1);
      console.log({ rest });
      if (currentBottomTab && rest.length > 0) {
        const match = findMatchedRoute(rest, screens);
        if (match) {
          console.log({ match });
          preloadElement(match.matchedRoute);
          push(match.matchedRoute, match.params, true);
        }
      }
    }
  }, [initialUrl]);
}
