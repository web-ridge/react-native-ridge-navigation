import * as React from 'react';
import { StateNavigator } from 'navigation';
import {
  BaseScreen,
  getBottomTabKeyFromPath,
  getPathFromUrl,
  getPaths,
  getRootKeyFromPath,
  getScreenKey,
  makeVariablesNavigationFriendly,
  Root,
  rootKeyAndPaths,
} from './navigationUtils';
import { defaultTheme, ThemeSettings } from './theme';

import { Platform, useColorScheme } from 'react-native';
import { NavigationHandler } from 'navigation-react';
import NavigationStack from './navigation/NavigationStack';
import StatusBar from './navigation/StatusBar';
import BottomTabsStack from './BottomTabsStack';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import NavigationStackWrapper from './NavigationStackWrapper';
import type { PreloadableComponent } from './LazyWithPreload.web';
import { OptimizedContextProvider } from './contexts/OptimizedContext';
import getHistoryManager from './navigation/historyManager';
import BottomTabBadgeProvider from './contexts/BottomTabBadgeProvider';
import BottomTabIndexProvider from './contexts/BottomTabIndexProvider';
import { findMatchedRoutes } from './parseUrl';
import useUrl from './useUrl';
import HiddenNavbarWithSwipeBack from './HiddenNavbarWithSwipeBack';

export default function NavigationProvider<ScreenItems extends BaseScreen[]>({
  screens,
  navigationRoot,
  SuspenseContainer,
  themeSettings,
  children,
}: {
  screens: ScreenItems;
  navigationRoot: Root;
  SuspenseContainer: any;
  themeSettings?: ThemeSettings;
  children?: any;
}) {
  const colorScheme = useColorScheme();
  const theme = React.useMemo(
    () => (themeSettings || defaultTheme)[colorScheme || 'light'],
    [colorScheme, themeSettings]
  );

  const preloadedCache = React.useRef<Record<string, any>>({});

  const preloadScreen = React.useCallback((k: string, result: any) => {
    preloadedCache.current[k] = result;
  }, []);

  const preloadElement = React.useCallback(
    async <T extends BaseScreen>(screen: T) => {
      (screen.element as PreloadableComponent<any>)?.preload?.();
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
            const path = rootKeyAndPaths(rootKey, tab.path);
            preloadElement(tab.child);
            preloadScreen(path, tab.child.preload({}));
          });
          break;
        case 'normal':
          const path = rootKeyAndPaths(rootKey, root.child.path);

          if (root.child) {
            preloadElement(root.child);
            preloadScreen(path, root.child.preload({}));
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
                renderScene: () =>
                  Platform.OS === 'web' ? (
                    <BottomTabsStack />
                  ) : (
                    <BottomTabIndexProvider>
                      <BottomTabsStack />
                    </BottomTabIndexProvider>
                  ),
              },
              ...root.children
                .map((tab) =>
                  screens.map((screen) => {
                    // we don't want too much segments in the url if the tab is the same
                    // so we don't add the tab path if it's the same
                    const isTheSame = tab.path === screen.path;
                    const screenPath = isTheSame ? undefined : screen.path;

                    return {
                      key: getScreenKey(rootKey, tab.path, screenPath),
                      route: makeVariablesNavigationFriendly(
                        getScreenKey(rootKey, tab.path, screenPath)
                      ),
                      renderScene: () => <screen.element />,
                      trackCrumbTrail: !isTheSame,
                    };
                  })
                )
                .flat(2),
            ];

          case 'normal':
            return [
              {
                key: rootKey,
                route: rootKey,
                trackCrumbTrail: false,
                renderScene: () => <root.child.element />,
              },
              ...screens.map((screen) => ({
                key: rootKeyAndPaths(rootKey, screen.path),
                route: makeVariablesNavigationFriendly(
                  rootKeyAndPaths(rootKey, screen.path)
                ),
                renderScene: () => <screen.element />,
                trackCrumbTrail: true,
              })),
            ];
        }
      })
      .flat();
    return new StateNavigator(navigators, getHistoryManager());
  }, [navigationRoot, screens]);

  const initialUrl = useUrl();
  const done = React.useRef<boolean>(false);
  React.useMemo(() => {
    if (done.current) return;
    done.current = true;

    const defaultKey = Object.keys(navigationRoot)[0]!;
    const startDefault = () => {
      preloadRoot(defaultKey);
      rootNavigator.start(defaultKey);
    };
    if (!initialUrl) {
      console.log({ initialUrl });
      startDefault();
      return;
    }

    const path = getPathFromUrl(initialUrl);
    const initialRootKey = getRootKeyFromPath(path) || defaultKey;
    const root = navigationRoot[initialRootKey];
    const rootType = root?.type;
    const isBottomTabs = rootType === 'bottomTabs';
    const isNormal = rootType === 'normal';
    const bottomTabKey = getBottomTabKeyFromPath(path);
    const paths = getPaths(path, isBottomTabs);
    preloadRoot(initialRootKey);

    let fluentNavigator = rootNavigator.fluent(true);
    fluentNavigator = fluentNavigator.navigate(initialRootKey);
    const isWeb = Platform.OS === 'web';
    const isNormalStack = isNormal || (isBottomTabs && isWeb);
    const hasHistory = paths.length > 0;

    // add the bottom tab to the stack if it's not the default
    if (isBottomTabs && isWeb) {
      const route = root?.children.find(
        (tab) => tab.path === '/' + bottomTabKey
      );
      if (route) {
        const navigateKey = getScreenKey(initialRootKey, bottomTabKey);
        preloadElement(route.child);
        preloadScreen(navigateKey, route.child.preload({}));
        fluentNavigator = fluentNavigator.navigate(navigateKey, {});
      }
    }

    if (isNormalStack && hasHistory) {
      const matches = findMatchedRoutes(paths, screens);
      if (matches.length === 0) {
        console.warn(`[ridge-navigation] No route found for path: ${path}`);
        startDefault();
        return;
      }
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
    }
    console.log(
      '[ridge-navigation] Initial url',
      fluentNavigator.url,
      initialUrl
    );
    rootNavigator.navigateLink(fluentNavigator.url);
  }, [
    initialUrl,
    navigationRoot,
    preloadElement,
    preloadRoot,
    preloadScreen,
    rootNavigator,
    screens,
  ]);

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
      }}
    >
      <StatusBar
        tintStyle={theme.statusBar.style}
        barTintColor={theme.statusBar.backgroundColor}
      />

      <BottomTabBadgeProvider>
        <NavigationHandler stateNavigator={rootNavigator}>
          <NavigationStackWrapper>
            {children && (
              <OptimizedContextProvider
                screenKey=""
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
                    <OptimizedContextProvider screenKey={state.key} data={data}>
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
