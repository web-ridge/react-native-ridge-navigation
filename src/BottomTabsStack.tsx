import {
  BottomTabType,
  RootChildBottomTabs,
  rootKeyAndPath,
} from './navigationUtils';

import * as React from 'react';
import NavigationBar from './navigation/NavigationBar';
import TabBar from './navigation/TabBar';
import TabBarItem from './navigation/TabBarItem';
import { NavigationHandler } from 'navigation-react';
import NavigationStack from './navigation/NavigationStack';
import { useCopiedStateNavigator } from './navigation/utils';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import OptimizedContext, {
  OptimizedContextProvider,
} from './contexts/OptimizedContext';
import BottomTabIndexContext from './contexts/BottomTabIndexContext';
import BottomTabBadgesContext from './contexts/BottomTabBadgesContext';
import useCurrentRoot from './useCurrentRoot';

export default function BottomTabsStack() {
  const { currentRoot, currentRootKey } = useCurrentRoot();
  const root = currentRoot as RootChildBottomTabs;
  const {
    theme: { bottomBar: bottomTheme },
  } = React.useContext(OptimizedContext);
  const { badges } = React.useContext(BottomTabBadgesContext);

  const { setBottomTabIndex, bottomTabIndex } = React.useContext(
    BottomTabIndexContext
  );

  return (
    <>
      <NavigationBar hidden />
      <TabBar
        primary={true}
        bottomTabs={true}
        labelVisibilityMode="labeled"
        tab={bottomTabIndex}
        onChangeTab={setBottomTabIndex}
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
            >
              <TabBarItemStack tab={tab} rootKey={currentRootKey} />
            </TabBarItem>
          );
        })}
      </TabBar>
    </>
  );
}

function TabBarItemStack({
  tab,
  rootKey,
}: {
  tab: BottomTabType;
  rootKey: string;
}) {
  const start = rootKeyAndPath(rootKey, tab.path);
  const navigator = useCopiedStateNavigator(start);
  const {
    theme: { layout },
  } = React.useContext(RidgeNavigationContext);

  return (
    <NavigationHandler stateNavigator={navigator}>
      <NavigationStack
        underlayColor={layout.backgroundColor}
        backgroundColor={() => layout.backgroundColor}
        renderScene={(state, data) => {
          return (
            <>
              <NavigationBar hidden={true} />
              <OptimizedContextProvider screenKey={state.key} data={data}>
                {state.renderScene()}
              </OptimizedContextProvider>
            </>
          );
        }}
      />
    </NavigationHandler>
  );
}
