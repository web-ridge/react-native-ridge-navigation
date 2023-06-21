import * as React from 'react';
import { NavigationContext } from 'navigation-react';
import { StateNavigator } from 'navigation';
import RidgeNavigationContext from '../contexts/RidgeNavigationContext';

export function useBottomTabsStateNavigator(startKey: string) {
  const { goToUrl } = React.useContext(RidgeNavigationContext);
  const { stateNavigator } = React.useContext(NavigationContext);

  const navigator = React.useRef(
    (function () {
      const n = new StateNavigator(stateNavigator);
      n.start(startKey);
      return n;
    })()
  );
  React.useEffect(() => {
    const isCurrentBottomTabs = goToUrl?.startsWith('/' + startKey);

    if (goToUrl && isCurrentBottomTabs) {
      const parsedRootUrl = navigator.current.parseLink(goToUrl);
      let fluentBottomNavigator = navigator.current.fluent(false);
      const crumbs = [...parsedRootUrl.crumbs];
      if (crumbs.length === 0) {
        return undefined;
      }

      fluentBottomNavigator = fluentBottomNavigator.navigate(startKey);
      crumbs.forEach((crumb) => {
        fluentBottomNavigator = fluentBottomNavigator.navigate(
          crumb.state.key,
          crumb.data
        );
      });

      fluentBottomNavigator = fluentBottomNavigator.navigate(
        parsedRootUrl.state.key,
        parsedRootUrl.data
      );

      // we need to wait till bottom tab is switched
      const timerId = setTimeout(() => {
        navigator.current.navigateLink(fluentBottomNavigator.url);
      }, 50);
      return () => clearTimeout(timerId);
    }
    return undefined;
  }, [goToUrl, startKey]);

  return navigator.current;
}
