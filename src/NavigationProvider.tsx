import * as React from 'react';
import { StateNavigator } from 'navigation';
import {
  BaseScreen,
  getFirstPartAndOthers,
  getParams,
  getPathFromUrl,
  makeVariablesNavigationFriendly,
  partMatches,
  Root,
  rootKeyAndPath,
  splitPath,
} from './navigationUtils';
import { defaultTheme, ThemeSettings } from './theme';
import { Linking, Platform, useColorScheme } from 'react-native';
import { NavigationHandler } from 'navigation-react';
import NavigationStack from './navigation/NavigationStack';
import StatusBar from './navigation/StatusBar';
import NavigationBar from './navigation/NavigationBar';
import BottomTabsStack from './BottomTabsStack';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import NavigationStackWrapper from './NavigationStackWrapper';
import type { PreloadableComponent } from './LazyWithPreload.web';
import { OptimizedContextProvider } from './contexts/OptimizedContext';
import getHistoryManager from './navigation/historyManager';
import BottomTabBadgeProvider from './contexts/BottomTabBadgeProvider';
import BottomTabIndexProvider from './contexts/BottomTabIndexProvider';

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
  children: any;
}) {
  // dark/light mode
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
      const root = navigationRoot[rootKey]!;
      switch (root.type) {
        case 'bottomTabs':
          root.children.forEach((tab) => {
            const path = rootKeyAndPath(rootKey, tab.path);
            preloadElement(tab.child);
            preloadScreen(path, tab.child.preload({}));
          });
          break;
        case 'normal':
          const path = rootKeyAndPath(rootKey, root.child.path);

          if (root.child) {
            preloadElement(root.child);
            preloadScreen(path, root.child.preload({}));
          }
      }
    },
    [navigationRoot, preloadElement, preloadScreen]
  );

  const { rootNavigator, openLink } = React.useMemo(() => {
    const navigators = Object.entries(navigationRoot)
      .map(([rootKey, root]) => {
        const defaultScreens = screens.map((screen) => ({
          key: rootKeyAndPath(rootKey, screen.path),
          route: makeVariablesNavigationFriendly(
            rootKeyAndPath(rootKey, screen.path)
          ),
          renderScene: () => <screen.element />,
          trackCrumbTrail: !(
            root.type === 'bottomTabs' &&
            root.children.some((c) => c.path === screen.path)
          ),
        }));

        switch (root.type) {
          case 'bottomTabs':
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
              ...defaultScreens,
            ];

          case 'normal':
            return [
              {
                key: rootKey,
                route: rootKey,
                trackCrumbTrail: false,
                renderScene: () => <root.child.element />,
              },
              ...defaultScreens,
            ];
        }
      })
      .flat();
    const stateNavigator = new StateNavigator(navigators, getHistoryManager());
    const openLinkInner = (url: string | null) => {
      const defaultKey = navigators?.[0]!.key;
      if (url) {
        const path = getPathFromUrl(url);
        const { firstPart, pathSplit } = getFirstPartAndOthers(splitPath(path));

        const initialRootKey = firstPart || defaultKey;

        preloadRoot(initialRootKey);
        stateNavigator.start(initialRootKey);

        if (pathSplit.length > 0) {
          const matchedRoute = screens.find((matchRoute) => {
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
          stateNavigator.navigate(
            rootKeyAndPath(initialRootKey, matchedRoute.path),
            params
          );
        }
      } else {
        console.log('no url found');
        preloadRoot(defaultKey);
        stateNavigator.start(defaultKey);
      }
    };
    if (Platform.OS === 'web') {
      openLinkInner(location.pathname);
    } else {
      Linking.getInitialURL().then(openLinkInner);
    }
    return { rootNavigator: stateNavigator, openLink: openLinkInner };
  }, [navigationRoot, screens, preloadRoot]);

  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      const handler = Linking.addEventListener('url', ({ url }) =>
        openLink(url)
      );
      return () => {
        return handler.remove();
      };
    }
    return undefined;
  }, [openLink]);

  return (
    <RidgeNavigationContext.Provider
      value={{
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
            <OptimizedContextProvider screenKey="" data={undefined}>
              {children}
            </OptimizedContextProvider>
            <NavigationStack
              underlayColor={theme.layout.backgroundColor}
              backgroundColor={() => theme.layout.backgroundColor}
              // crumbStyle={(from, state, data, crumbs, nextState, nextData) => {
              //   const is
              // }}
              unmountStyle={() => ''}
              renderScene={(state, data) => {
                return (
                  <>
                    <NavigationBar hidden={true} />
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
