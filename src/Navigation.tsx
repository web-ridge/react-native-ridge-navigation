import * as React from 'react';
import { setPreloadResult } from './Preloader';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import BottomTabs from './web/BottomTabs';
import SwitchRoot from './SwitchRoot';
import type {
  BaseScreen,
  ExtractRouteParams,
  Orientation,
  Root,
  RootValue,
} from './navigationUtils';
import { StateNavigator } from 'navigation';

function rootKeyAndPath(rootKey: string, path: string) {
  return '/' + rootKey + path;
}

export function useNavigation() {
  return {
    switchBottomTabIndex: async (index: number) => {},
    switchRoot: async (rootKey: string, params: any, preload = true) => {
      if (preload) {
        // preloadRoot(root, rootKey, params);
      }

      switch (currentRoot?.type) {
        case 'normal':
          break;
        case 'bottomTabs':
          break;
      }
    },
    preload: async <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>
    ) => {
      setPreloadResult(screen, screen.preload(params));
    },
    push: async <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      preload = true
    ) => {
      if (preload) {
        setPreloadResult(screen, screen.preload(params));
      }
      // navigate(generatePath(rootKeyAndPath(oldRootKey, screen.path), params));
    },
    replace: async <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      preload = true
    ) => {
      if (preload) {
        setPreloadResult(screen, screen.preload(params));
      }
      // navigate(generatePath(rootKeyAndPath(oldRootKey, screen.path), params), {
      //   replace: true,
      // });
    },
  };
}

function useAboveBreakingPoint(breakingPoint: number) {
  const { width } = useWindowDimensions();
  return width > breakingPoint;
}

function NavContainer({
  orientation,
  children,
}: {
  orientation: Orientation;
  children: any;
}) {
  return (
    <View style={[navStyles.root, navStyles[orientation]]}>{children}</View>
  );
}

const navStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  horizontal: { flexDirection: 'row' },
  vertical: { flexDirection: 'column-reverse' },
  full: { flex: 1 },
});

function Nav({
  orientation,
  currentRoot,
  rootKey,
}: {
  orientation: Orientation;
  currentRoot: RootValue;
  rootKey: string;
}) {
  return (
    <>
      {currentRoot?.type === 'bottomTabs' ? (
        <BottomTabs
          bottomTabsRoot={currentRoot}
          rootKey={rootKey}
          orientation={orientation}
        />
      ) : null}
    </>
  );
}

const defaultBreakingPoint = 1200;
function getBreakingPointFromRoot(v?: RootValue): number {
  let configuredBreakingPoint: number | null | undefined;
  if (v?.type === 'bottomTabs') {
    configuredBreakingPoint = v.breakingPointWidth;
  }

  // user explicitly set the breaking point to null, so we never will make sure the breaking point will never happen
  if (configuredBreakingPoint === null) {
    configuredBreakingPoint = Infinity;
  }
  return configuredBreakingPoint || defaultBreakingPoint;
}

export function createNavigation<ScreenItems extends BaseScreen[]>(
  screens: ScreenItems,
  r: Root,
  SuspenseContainer: any
) {
  // TODO: expo-linking??
  // import {Linking} from 'react-native';
  //
  // const openLink = (url) => {
  //   if (url) {
  //     const id = +url.split('=')[1];
  //     stateNavigator.navigate('mail', {id});
  //   }
  // };
  // Linking.getInitialURL().then(openLink);
  // Linking.addEventListener('url', ({url}) => openLink(url));

  const navigators = Object.entries(r).map(([rootKey, root]) => {
    switch (root.type) {
      case 'bottomTabs':
        const stackNavigators = root.children.map((tab) => {
          const tabPath = rootKeyAndPath(rootKey, tab.path);
          return new StateNavigator([
            { key: tabPath, route: tabPath },
            // add support for all other screens to go to
            ...screens.map((screen) => ({
              key: screen.path,
              trackCrumbTrail: true,
              route: tabPath + screen.path,
              renderScene: () => <screen.element />,
            })),
          ]);
        });

        return { type: root.type, rootKey, stackNavigators };
      case 'normal':
        const path = rootKeyAndPath(rootKey, root.child.path);
        const stackNavigator = new StateNavigator([
          { key: path, route: path },
          // add support for all other screens to go to
          ...screens.map((screen) => ({
            key: screen.path,
            trackCrumbTrail: true,
            route: path + screen.path,
            renderScene: () => <screen.element />,
          })),
        ]);
        return {
          type: root.type,
          rootKey,
          stackNavigator,
        };
    }
  });

  // https://grahammendick.github.io/navigation/documentation/native/tab-bar.html

  // TODO: render app here
  const aboveBreakingPoint = useAboveBreakingPoint(
    getBreakingPointFromRoot(currentRoot)
  );
  const orientation = aboveBreakingPoint ? 'horizontal' : 'vertical';

  return (
    <NavContainer orientation={orientation}>
      <Nav
        orientation={orientation}
        rootKey={rootKey}
        currentRoot={currentRoot}
      />
      <View style={navStyles.full}>
        <SuspenseContainer>
          <Routes>
            <Route
              path={'/'}
              element={
                <SwitchRoot rootKey={Object.keys(root)[0]} params={{}} />
              }
            />
            {screenItems.map((screen, i) => (
              <Route
                key={i}
                path={'/:rootKey' + screen.path}
                preload={(params) => {
                  setPreloadResult(screen, screen.preload(params));
                }}
                element={
                  <SuspenseContainer>
                    <screen.element />
                  </SuspenseContainer>
                }
              />
            ))}
          </Routes>
        </SuspenseContainer>
      </View>
    </NavContainer>
  );
}
