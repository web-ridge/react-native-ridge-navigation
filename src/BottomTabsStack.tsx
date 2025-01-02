import {
  type BottomTabType,
  getScreenKey,
  type RootChildBottomTabs,
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

  return (
    <>
      <HiddenNavbarWithSwipeBack />
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
      >
        {root.children.map((tab, index) => {
          return (
            <TabBarItem
              key={tab.path}
              title={tab.title()}
              image={bottomTabIndex === index ? tab.selectedIcon : tab.icon}
              badge={badges[tab.path]}
              badgeColor={bottomTheme.badgeColor}
              fontFamily={bottomTheme.fontFamily}
              fontSize={bottomTheme.fontSize}
              fontWeight={bottomTheme.fontWeight}
              fontStyle={bottomTheme.fontStyle}
              testID={`bottomTab-${tab.child.path}`}
            >
              <TabBarItemStack tab={tab} rootKey={currentRootKey} />
            </TabBarItem>
          );
        })}
      </TabBar>
    </>
  );
}

const TabBarItemStack = React.memo(
  ({ tab, rootKey }: { tab: BottomTabType; rootKey: string }) => {
    const start = getScreenKey(rootKey, tab);
    const navigator = useBottomTabsStateNavigator(start);
    const {
      theme: { layout },
    } = React.useContext(RidgeNavigationContext);

    return (
      <NavigationHandler stateNavigator={navigator}>
        <NavigationStack
          // underlayColor={layout.backgroundColor} // Disables touchables if returned from background
          backgroundColor={() => layout.backgroundColor}
          renderScene={(state, data) => {
            return (
              <>
                <HiddenNavbarWithSwipeBack />
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
