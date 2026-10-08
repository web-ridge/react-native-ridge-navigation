import {
  type BottomTabType,
  getScreenKey,
  type RootChildBottomTabs,
  getSharedElementsForState,
} from './navigationUtils';

import * as React from 'react';
import { type ColorValue, StyleSheet, View } from 'react-native';
import TabBar from './navigation/TabBar';
import TabBarItem from './navigation/TabBarItem';
import { NavigationHandler } from 'navigation-react';
import NavigationStack from './navigation/NavigationStack';
import { useBottomTabsStateNavigator } from './navigation/useBottomTabsStateNavigator';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import OptimizedContext, {
  OptimizedContextProvider,
} from './contexts/OptimizedContext';
import BottomTabIndexContext from './contexts/BottomTabIndexContext';
import BottomTabBadgesContext from './contexts/BottomTabBadgesContext';
import useCurrentRoot from './useCurrentRoot';
import HiddenNavbarWithSwipeBack from './HiddenNavbarWithSwipeBack';
import BottomTabRefreshContext from './contexts/BottomTabRefreshContext';
import { NavigationBackGestureProvider } from './contexts/RidgeNavigationContext';

// The app patches navigation-react-native with the iOS 26 UISearchTab prop;
// keep Ridge buildable against the upstream package types as well.
const NativeTabBarItem = TabBarItem as React.ComponentType<any>;

export default function BottomTabsStack() {
  const { currentRoot, currentRootKey } = useCurrentRoot();
  const root = currentRoot as RootChildBottomTabs;
  const {
    theme: { bottomBar: bottomTheme },
  } = React.useContext(OptimizedContext);
  const { badges } = React.useContext(BottomTabBadgesContext);
  React.useContext(BottomTabRefreshContext);

  const { setBottomTabIndex, bottomTabIndex } = React.useContext(
    BottomTabIndexContext
  );
  // Render a tab's screens only once that tab has been shown. Every tab used
  // to render its root screen at launch, so hidden tabs ran their queries and
  // paginated prefetches while the user waited for the first one. The native
  // stack itself must still mount (the tab bar needs its navigation
  // controller); only the scene content waits. Root data is still preloaded,
  // so the first switch to a tab stays fast.
  const activeTabIndex = bottomTabIndex ?? 0;
  const [visitedTabs, setVisitedTabs] = React.useState<ReadonlySet<number>>(
    () => new Set([activeTabIndex])
  );
  if (!visitedTabs.has(activeTabIndex)) {
    setVisitedTabs(new Set([...visitedTabs, activeTabIndex]));
  }

  if (root.type !== 'bottomTabs') {
    return null;
  }

  const NativeAccessory = root.components?.nativeAccessory;

  return (
    <>
      <TabBar
        primary={true}
        bottomTabs={true}
        labelVisibilityMode="labeled"
        tab={bottomTabIndex}
        onChangeTab={setBottomTabIndex}
        rippleColor={bottomTheme.rippleColor}
        unselectedTintColor={bottomTheme.textColor}
        barTintColor={bottomTheme.backgroundColor}
        selectedTintColor={bottomTheme.selectedTextColor}
        activeIndicatorColor={bottomTheme.activeIndicatorColor}
        scrollsToTop={bottomTheme.scrollsToTop}
        preventFouc={true}
      >
        {root.children.map((tab, index) => {
          return (
            <NativeTabBarItem
              key={tab.path}
              title={tab.title()}
              image={bottomTabIndex === index ? tab.selectedIcon : tab.icon}
              badge={badges[tab.path]}
              badgeColor={bottomTheme.badgeColor}
              fontFamily={bottomTheme.fontFamily}
              fontSize={bottomTheme.fontSize}
              fontWeight={bottomTheme.fontWeight}
              fontStyle={bottomTheme.fontStyle}
              searchTab={tab.searchTab}
              testID={`bottomTab-${tab.child.path}`}
            >
              <TabVisitedContext.Provider
                value={visitedTabs.has(index) || index === activeTabIndex}
              >
                <TabBarItemStack
                  tab={tab}
                  rootKey={currentRootKey}
                  nativeAccessory={NativeAccessory}
                />
              </TabVisitedContext.Provider>
            </NativeTabBarItem>
          );
        })}
      </TabBar>
    </>
  );
}

const TabVisitedContext = React.createContext(true);

function TabSceneGate({
  backgroundColor,
  children,
}: {
  backgroundColor: ColorValue;
  children: React.ReactNode;
}) {
  const visited = React.useContext(TabVisitedContext);
  if (!visited) {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor }]} />;
  }
  return <>{children}</>;
}

const TabBarItemStack = React.memo(
  ({
    tab,
    rootKey,
    nativeAccessory: NativeAccessory,
  }: {
    tab: BottomTabType;
    rootKey: string;
    nativeAccessory?: React.ComponentType;
  }) => {
    const start = getScreenKey(rootKey, tab);
    const navigator = useBottomTabsStateNavigator(start);
    const {
      theme: { layout },
    } = React.useContext(RidgeNavigationContext);

    return (
      <NavigationHandler stateNavigator={navigator}>
        <NavigationStack
          underlayColor={layout.backgroundColor}
          backgroundColor={() => layout.backgroundColor}
          hidesTabBar={(state: any) => !!state?.screen?.options?.hidesTabBar}
          sharedElements={getSharedElementsForState}
          renderScene={(state, data) => {
            return (
              <NavigationBackGestureProvider>
                <HiddenNavbarWithSwipeBack
                  nativeHeader={state?.screen?.options?.nativeHeader}
                />
                {NativeAccessory ? <NativeAccessory /> : null}
                <TabSceneGate backgroundColor={layout.backgroundColor}>
                  <OptimizedContextProvider state={state} data={data}>
                    {state.renderScene()}
                  </OptimizedContextProvider>
                </TabSceneGate>
              </NavigationBackGestureProvider>
            );
          }}
        />
      </NavigationHandler>
    );
  }
);
