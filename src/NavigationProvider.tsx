import * as React from 'react';
import { StateNavigator } from 'navigation';
import {
  BaseScreen,
  BottomTabType,
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
  RootValue,
} from './navigationUtils';
import { defaultTheme, ThemeSettings } from './theme';

import { Platform, useColorScheme } from 'react-native';
import { NavigationHandler } from 'navigation-react';
import NavigationStack from './navigation/NavigationStack';
import ReactDOM from 'react-dom';

import BottomTabsStack from './BottomTabsStack';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import NavigationStackWrapper from './NavigationStackWrapper';
import type { PreloadableComponent } from './lazy';
import { OptimizedContextProvider } from './contexts/OptimizedContext';
import historyManager from './navigation/historyManager';
import BottomTabBadgeProvider from './contexts/BottomTabBadgeProvider';
import BottomTabIndexProvider from './contexts/BottomTabIndexProvider';
import useUrl from './useUrl';
import HiddenNavbarWithSwipeBack from './HiddenNavbarWithSwipeBack';
import BottomTabRefreshProvider from './contexts/BottomTabRefreshProvider';
import OptimizedRenderScene from './OptimizedRenderScene';
import fixConcurrent from './fixConcurrent';

function NavigationProvider<ScreenItems extends BaseScreen[]>({
  screens,
  navigationRoot,
  SuspenseContainer,
  themeSettings,
  children,
  initialRootKey,
}: {
  screens: ScreenItems;
  navigationRoot: Root;
  SuspenseContainer: any;
  themeSettings?: ThemeSettings;
  children?: any;
  initialRootKey: string;
}) {
  const navigationId = React.useId();
  console.log('navigationId', navigationId);
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
    console.log('rootNavigator', navigationId);
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
    const stateNavigator = new StateNavigator(navigators, historyManager);
    // const _navigateLink = stateNavigator.navigateLink;
    // stateNavigator.navigateLink = (...args) => {
    //   const history = args[2];
    //   console.log({ history });
    //   if (history) {
    //     ReactDOM.flushSync(() => {
    //       console.log('flush');
    //       _navigateLink.apply(stateNavigator, args);
    //     });
    //   } else {
    //     _navigateLink.apply(stateNavigator, args);
    //   }
    // };
    return stateNavigator;
  }, [navigationId, navigationRoot, preloadRoot, screens]);

  const cachedInitialRootKey = React.useRef<string | undefined>(initialRootKey);
  const initialDefaultUrl = React.useMemo(() => {
    const defaultRootKey =
      cachedInitialRootKey.current || Object.keys(navigationRoot)[0]!;
    const defaultRoot = navigationRoot[defaultRootKey]!;
    return '/' + getPathFromRoot(defaultRoot, undefined, defaultRootKey);
  }, [navigationRoot]);
  const initialUrl = useUrl() || initialDefaultUrl;
  const [goToUrl, setGoToUrl] = React.useState<undefined | string>(initialUrl);
  React.useEffect(() => {
    setGoToUrl(initialUrl);
  }, [initialUrl]);

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
          `Can't convert deep link to the right stack: ${initialUrl}`,
          e,
          { fallback, change }
        );
        if (!fallback && !change) {
          console.log(
            'there is no app started yet, lets go to the default url}',
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
      setGoToUrl(url);
    },
    [navigationRoot, rootNavigator]
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

  React.useEffect(() => {
    if (goToUrl) {
      // reset goToUrl after it has been handled, so we can handle new deep links
      // because in the meantime user can navigate away from goToUrl
      const timerId = setTimeout(() => {
        setGoToUrl(undefined);
      }, 1500);
      return () => {
        clearTimeout(timerId);
      };
    }
    return undefined;
  }, [goToUrl]);

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

function getPathFromRoot(
  root: RootValue,
  tab: BottomTabType | undefined,
  rootKey: string
) {
  if (root.type === 'bottomTabs') {
    return getScreenKey(
      rootKey,
      tab || root.children[0],
      Platform.OS === 'web' ? root.children[0]!.path : undefined
    );
  }

  return getScreenKey(rootKey, undefined, root.child!.path);
}

export default React.memo(NavigationProvider);
// fluent(root.HomeScreen).
// bottomTab(bottomRoots.Post).
// push().
// push().
// push();
