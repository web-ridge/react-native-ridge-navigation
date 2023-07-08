import * as React from 'react';
import { StateNavigator } from 'navigation';
import {
  BaseScreen,
  FluentParams,
  FluentScreen,
  generatePath,
  getPathFromUrl,
  getRootKeyFromPath,
  getScreenKey,
  makeVariablesNavigationFriendly,
  Root,
  RootChildBottomTabs,
  rootKeyAndPaths,
} from './navigationUtils';
import { defaultTheme, ThemeSettings } from './theme';

import { Platform, useColorScheme } from 'react-native';
import { NavigationHandler } from 'navigation-react';
import NavigationStack from './navigation/NavigationStack';

import BottomTabsStack from './BottomTabsStack';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import NavigationStackWrapper from './NavigationStackWrapper';
import type { PreloadableComponent } from './lazy';
import { OptimizedContextProvider } from './contexts/OptimizedContext';
import getHistoryManager from './navigation/historyManager';
import BottomTabBadgeProvider from './contexts/BottomTabBadgeProvider';
import BottomTabIndexProvider from './contexts/BottomTabIndexProvider';
import HiddenNavbarWithSwipeBack from './HiddenNavbarWithSwipeBack';
import BottomTabRefreshProvider from './contexts/BottomTabRefreshProvider';
import { useNavigationUrl } from './useNavigationUrl';

export default function NavigationProvider<ScreenItems extends BaseScreen[]>({
  screens,
  navigationRoot,
  SuspenseContainer,
  themeSettings,
  children,
  initialRootKey,
  basePath,
}: {
  screens: ScreenItems;
  navigationRoot: Root;
  SuspenseContainer: any;
  themeSettings?: ThemeSettings;
  children?: any;
  initialRootKey: string;
  basePath?: string;
}) {
  const { setGoToUrl, goToUrl, initialDefaultUrl } = useNavigationUrl({
    navigationRoot,
    initialRootKey,
    basePath,
  });
  const colorScheme = useColorScheme();
  const theme = React.useMemo(
    () => (themeSettings || defaultTheme)[colorScheme || 'light'],
    [colorScheme, themeSettings]
  );

  const preloadedCache = React.useRef<Record<string, any>>({});

  const preloadScreen = React.useCallback(
    <T extends BaseScreen>(screen: T, params: any) => {
      try {
        const result = screen.preload(params);
        const path = generatePath(screen.path, params);
        preloadedCache.current[path] = result;
      } catch (error) {
        console.log(
          '[react-native-ridge-navigation] error while preloading screen',
          screen,
          params,
          error
        );
      }
    },
    []
  );

  const preloadElement = React.useCallback(
    async <T extends BaseScreen>(screen: T) => {
      try {
        (screen.element as PreloadableComponent<any>)?.preload?.();
      } catch (error) {
        console.log(
          '[react-native-ridge-navigation] error while preloading element',
          screen,
          error
        );
      }
    },
    []
  );

  const preloadRoot = React.useCallback(
    (rootKey: string) => {
      const root = navigationRoot[rootKey];
      if (!root) {
        console.log(
          '[react-native-ridge-navigation] No root found for key',
          rootKey
        );
        return;
      }
      switch (root.type) {
        case 'bottomTabs':
          root.children.forEach((tab) => {
            preloadElement(tab.child);
            preloadScreen(tab.child, {});
          });
          break;
        case 'normal':
          if (root.child) {
            preloadElement(root.child);
            preloadScreen(root.child, {});
          }
      }
    },
    [navigationRoot, preloadElement, preloadScreen]
  );

  const rootNavigator = React.useMemo(() => {
    const navigators = Object.entries(navigationRoot)
      .map(([rootKey, root]) => {
        switch (root.type) {
          case 'bottomTabs':
            // on the web we don't have a nested stack because we want to preserve the history
            // on native, we need to nest the stack for bottom tabs
            return [
              {
                key: rootKey,
                route: rootKey,
                trackCrumbTrail: false,
                preload: () => preloadRoot(rootKey),
                preloadId: rootKey,
                renderScene: () =>
                  Platform.OS === 'web' ? null : (
                    <BottomTabRefreshProvider>
                      <BottomTabIndexProvider>
                        <BottomTabsStack />
                      </BottomTabIndexProvider>
                    </BottomTabRefreshProvider>
                  ),
              },
              ...root.children
                .map((tab) => {
                  return screens.map((screen) => {
                    // we don't want the child path segment in the url
                    const isTheSame = tab.child.path === screen.path;

                    return {
                      key: getScreenKey(rootKey, tab, screen.path),
                      route: makeVariablesNavigationFriendly(
                        getScreenKey(rootKey, tab, screen.path)
                      ),
                      renderScene: () => <screen.element />,
                      trackCrumbTrail: !isTheSame,
                      screen,
                      preloadId: screen.path,
                    };
                  });
                })
                .flat(2),
            ];

          case 'normal':
            return [
              {
                key: rootKey,
                route: rootKey,
                trackCrumbTrail: false,
                renderScene: () => <root.child.element />,
                screen: root.child,
                preload: () => preloadRoot(rootKey),
                preloadId: root.child.path,
              },
              ...screens.map((screen) => ({
                key: rootKeyAndPaths(rootKey, screen.path),
                route: makeVariablesNavigationFriendly(
                  rootKeyAndPaths(rootKey, screen.path)
                ),
                renderScene: () => <screen.element />,
                trackCrumbTrail: true,
                screen,
                preloadId: screen.path,
              })),
            ];
        }
      })
      .flat();
    return new StateNavigator(navigators, getHistoryManager(basePath));
  }, [basePath, navigationRoot, preloadRoot, screens]);

  const preloadLink = React.useCallback(
    (url: string) => {
      const { state, data, crumbs } = rootNavigator.parseLink(url);

      state?.preload?.();
      if (state.screen) {
        preloadElement(state.screen);
        preloadScreen(state.screen, data);
      }
      crumbs.forEach((crumb) => {
        crumb.state?.preload?.();
        if (crumb.state.screen) {
          preloadElement(crumb.state.screen);
          preloadScreen(crumb.state.screen, crumb.data);
        }
      });
    },
    [preloadElement, preloadScreen, rootNavigator]
  );

  const openUrl = React.useCallback(
    (uri: string, change: boolean, fallback?: boolean) => {
      try {
        const path = getPathFromUrl(uri);
        const rootKey = getRootKeyFromPath(path)!;
        const root = navigationRoot[rootKey];
        const rootType = root?.type;
        const isBottomTabs = rootType === 'bottomTabs';
        const isNative = Platform.OS !== 'web';

        if (isNative && isBottomTabs) {
          preloadRoot(rootKey);
          preloadLink(uri);
          rootNavigator.start(rootKey);
        } else {
          preloadLink(uri);
          rootNavigator.navigateLink(uri);
        }
      } catch (e) {
        console.log(
          `[react-native-ridge-navigation] can't convert deep link to the right stack: ${uri}`,
          e,
          {
            fallback,
            change,
          }
        );
        if (!fallback && !change) {
          console.debug(
            '[react-native-ridge-navigation] there is no app started yet, lets go to the default url}',
            { defaultUrl: initialDefaultUrl }
          );
          // setTimeout(() => {
          openUrl(initialDefaultUrl, false, true);
          // }, 1000);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fluent = React.useCallback(
    (fluentParams: FluentParams, ...fluentScreens: FluentScreen[]) => {
      let root = navigationRoot[fluentParams.rootKey]!;
      const tab =
        fluentParams.tab || (root as RootChildBottomTabs)?.children?.[0];
      let fluentNavigator = new StateNavigator(rootNavigator)
        .fluent()
        .navigate(
          root.type === 'bottomTabs'
            ? getScreenKey(fluentParams.rootKey, tab)
            : fluentParams.rootKey
        );

      fluentScreens.forEach((fluentScreen) => {
        fluentNavigator = fluentNavigator.navigate(
          root.type === 'bottomTabs'
            ? getScreenKey(fluentParams.rootKey, tab, fluentScreen.screen.path)
            : rootKeyAndPaths(fluentParams.rootKey, fluentScreen.screen.path),
          fluentScreen.params
        );
      });

      const url = fluentNavigator.url;
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[react-native-ridge-navigation] fluent navigation to ${url}`
        );
      }
      setGoToUrl(url);
    },
    [navigationRoot, rootNavigator, setGoToUrl]
  );

  const [_, setForceRerender] = React.useState(0);
  const firstTime = React.useRef(true);

  React.useEffect(() => {
    if (goToUrl) {
      if (firstTime.current) {
        openUrl(goToUrl, false);
        firstTime.current = false;
        setForceRerender((prev) => prev + 1);
      } else {
        const timerId = setTimeout(() => {
          openUrl(goToUrl, true);
        }, 50);
        return () => {
          clearTimeout(timerId);
        };
      }
    }
    return undefined;
  }, [goToUrl, openUrl]);

  if (firstTime.current) {
    return null;
  }
  return (
    <RidgeNavigationContext.Provider
      value={{
        screens,
        rootNavigator,
        navigationRoot,
        preloadedCache: preloadedCache.current,
        preloadRoot,
        preloadScreen,
        theme,
        preloadElement,
        SuspenseContainer,
        fluent,
        goToUrl,
        basePath,
      }}
    >
      <BottomTabBadgeProvider>
        <NavigationHandler stateNavigator={rootNavigator}>
          <NavigationStackWrapper>
            {children && (
              <OptimizedContextProvider
                state={null}
                data={undefined}
                withSuspenseContainer={false}
              >
                {children}
              </OptimizedContextProvider>
            )}
            <NavigationStack
              underlayColor={theme.layout.backgroundColor}
              backgroundColor={() => theme.layout.backgroundColor}
              unmountStyle={() => ''}
              renderScene={(state, data) => {
                return (
                  <>
                    <HiddenNavbarWithSwipeBack />
                    <OptimizedContextProvider state={state} data={data}>
                      <OptimizedRenderScene renderScene={state.renderScene} />
                    </OptimizedContextProvider>
                  </>
                );
              }}
            />
          </NavigationStackWrapper>
        </NavigationHandler>
      </BottomTabBadgeProvider>
    </RidgeNavigationContext.Provider>
  );
}

const OptimizedRenderScene = React.memo(
  ({ renderScene }: { renderScene: () => any }) => {
    return renderScene();
  }
);

// fluent(root.HomeScreen).
// bottomTab(bottomRoots.Post).
// push().
// push().
// push();
