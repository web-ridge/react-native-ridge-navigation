import {
  type BottomTabType,
  getScreenKey,
  type RootChildBottomTabs,
  getSharedElementsForState,
} from './navigationUtils';

import * as React from 'react';
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
              <TabBarItemStack
                tab={tab}
                rootKey={currentRootKey}
                nativeAccessory={NativeAccessory}
              />
            </NativeTabBarItem>
          );
        })}
      </TabBar>
    </>
  );
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
              <>
                <HiddenNavbarWithSwipeBack
                  nativeHeader={state?.screen?.options?.nativeHeader}
                />
                {NativeAccessory ? <NativeAccessory /> : null}
                <OptimizedContextProvider state={state} data={data}>
                  {state.renderScene()}
                </OptimizedContextProvider>
              </>
            );
          }}
        />
      </NavigationHandler>
    );
  }
);
