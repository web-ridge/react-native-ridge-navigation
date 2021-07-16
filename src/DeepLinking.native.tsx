import * as React from 'react';
import { Linking } from 'react-native';
import { useNavigation } from './Navigation';
import { getConfiguredRoot, staticPush } from './Navigation.native';

function DeepLinking({ routes }: { routes: { path: string }[] }) {
  const { push, preload, switchRoot, switchBottomTabIndex } = useNavigation();
  const handleOpenURL = React.useCallback(
    async (event) => {
      console.log('deepLinking', event.url);
      const path = getPathFromUrl(event.url);

      // get root key and rest of url
      const { firstPart, pathSplit } = getFirstPartAndOthers(splitPath(path));

      const matchedRoute = routes.find((matchRoute) => {
        const matchPathSplit = splitPath(matchRoute.path);
        return (
          pathSplit.every((u, i) => partMatches(u, matchPathSplit[i])) &&
          matchPathSplit.every((m, i) => partMatches(pathSplit[i], m))
        );
      });
      if (!matchedRoute) {
        console.log('no matched route found for url: ', path);
        return;
      }

      const params = getParams(pathSplit, splitPath(matchedRoute.path));

      // switch to the right root
      await switchRoot(firstPart, params, true);

      const root = getConfiguredRoot();

      switch (root.type) {
        case 'sideMenu':
          break;
        case 'bottomTabs':
          const bottomTabRouteConfig = getFirstPartAndOthers(
            splitPath(matchedRoute.path)
          );

          const bottomTab = root.children.find(
            (b) => b.path === '/' + bottomTabRouteConfig.firstPart
          );
          if (bottomTab) {
            const bottomTabIndex = root.children.indexOf(bottomTab);
            await preload(bottomTab.child, params);
            await switchBottomTabIndex(bottomTabIndex);

            // go deeper inside stack of tab
            if (bottomTabRouteConfig.pathSplit.length > 0) {
              // push to the right url
              await staticPush(matchedRoute as any, params, true);
            }
          }

          break;
        case 'normal':
          // push to the right url
          await push(matchedRoute as any, params, true);
          break;
      }
    },
    [preload, push, routes, switchBottomTabIndex, switchRoot]
  );

  React.useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleOpenURL({ url });
      }
    });
    Linking.addEventListener('url', handleOpenURL);
    return () => {
      Linking.removeEventListener('url', handleOpenURL);
    };
  }, [handleOpenURL]);

  return null;
}

function getFirstPartAndOthers(pathSplit: string[]) {
  const firstPart = pathSplit[0];
  pathSplit.shift();
  return {
    firstPart,
    pathSplit,
  };
}

function splitPath(path: string): string[] {
  let splitMatchPath = path.split('/');
  splitMatchPath.shift();
  return splitMatchPath;
}

function getParams(
  urlPathSplit: string[],
  routePathSplit: string[]
): Record<string, string> {
  let params: Record<string, string> = {};
  routePathSplit.forEach((routePath, i) => {
    if (routePath.startsWith(':')) {
      const paramKey = routePath.substring(1);
      params[paramKey] = urlPathSplit[i];
    }
  });
  return params;
}

function partMatches(
  urlPart: string | undefined,
  routePart: string | undefined
) {
  // url part does not exist
  if (urlPart === undefined || routePart === undefined) {
    return false;
  }

  // is parameter in url match everything
  if (routePart.startsWith(':')) {
    return true;
  }
  return routePart === urlPart;
}

function getPathFromUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    let splitUrl = url.split('/');
    let host = splitUrl[0] + '//' + splitUrl[2] + '/';
    return '/' + url.replace(host, '');
  }

  return '/' + url.split('://')[1];
}

export default DeepLinking;
