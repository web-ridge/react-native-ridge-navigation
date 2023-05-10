import * as React from 'react';
import { StateNavigator } from 'navigation';
import {
  BaseScreen,
  generatePath,
  getPathFromUrl,
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

  const preloadScreen = React.useCallback(
    <T extends BaseScreen>(screen: T, params: any) => {
      const result = screen.preload(params);
      const path = generatePath(screen.path, params);
      preloadedCache.current[path] = result;
    },
    []
  );

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
                    <BottomTabIndexProvider>
                      <BottomTabsStack />
                    </BottomTabIndexProvider>
                  ),
              },
              ...root.children
                .map((tab) =>
                  screens.map((screen) => {
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
    return new StateNavigator(navigators, getHistoryManager());
  }, [navigationRoot, preloadRoot, screens]);

  const initialDefaultUrl = React.useMemo(() => {
    const defaultRootKey = Object.keys(navigationRoot)[0]!;
    const defaultRoot = navigationRoot[defaultRootKey]!;
    if (defaultRoot.type === 'bottomTabs') {
      return (
        '/' +
        getScreenKey(
          defaultRootKey,
          defaultRoot.children[0],
          Platform.OS === 'web' ? defaultRoot.children[0]!.path : undefined
        )
      );
    }

    return (
      '/' + getScreenKey(defaultRootKey, undefined, defaultRoot.child!.path)
    );
  }, [navigationRoot]);
  const initialUrl = useUrl() || initialDefaultUrl;

  const done = React.useRef<boolean>(false);

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
  React.useMemo(() => {
    if (done.current) return;
    done.current = true;

    const path = getPathFromUrl(initialUrl);
    const rootKey = getRootKeyFromPath(path)!;
    const root = navigationRoot[rootKey];
    const rootType = root?.type;
    const isBottomTabs = rootType === 'bottomTabs';
    const isNative = Platform.OS !== 'web';

    if (isNative && isBottomTabs) {
      preloadRoot(rootKey);
      rootNavigator.start(rootKey);
    } else {
      preloadLink(initialUrl);
      rootNavigator.navigateLink(initialUrl);
    }
  }, [initialUrl, navigationRoot, preloadLink, preloadRoot, rootNavigator]);

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
        style={theme.statusBar.style}
        backgroundColor={theme.statusBar.backgroundColor as any}
        translucent
      />

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
