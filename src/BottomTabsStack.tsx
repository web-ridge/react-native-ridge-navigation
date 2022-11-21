import {
  BottomTabType,
  getFirstPartAndOthers,
  getPathFromUrl,
  RootChildBottomTabs,
  rootKeyAndPath,
  splitPath,
} from './navigationUtils';
import { useContext } from 'react';
import * as React from 'react';
import NavigationBar from './navigation/NavigationBar';
import TabBar from './navigation/TabBar';
import TabBarItem from './navigation/TabBarItem';
import { NavigationHandler } from 'navigation-react';
import NavigationStack from './navigation/NavigationStack';
import { useCopiedStateNavigator } from './navigation/utils';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import BottomTabContext from './contexts/BottomTabContext';
import OptimizedContext, {
  OptimizedContextProvider,
} from './contexts/OptimizedContext';
import { Linking } from 'react-native';
import useCurrentRoot from './useCurrentRoot';

export default function BottomTabsStack({
  root,
  rootKey,
}: {
  root: RootChildBottomTabs;
  rootKey: string;
}) {
  const {
    theme: { bottomBar: bottomTheme },
  } = useContext(OptimizedContext);
  const { bottomTabIndex, setBottomTabIndex } = useDeepLinkingBottomTabsIndex();

  const [badges, setBadges] = React.useState<Record<string, string | number>>(
    {}
  );
  const setBadge = React.useCallback((key: string, badge: string | number) => {
    setBadges((prev) => ({ ...prev, [key]: badge }));
  }, []);
  return (
    <>
      <NavigationBar hidden />
      <BottomTabContext.Provider
        value={{
          bottomTabIndex,
          setBottomTabIndex,
          badges,
          setBadge,
        }}
      >
        <TabBar
          primary={true}
          bottomTabs={true}
          labelVisibilityMode="labeled"
          tab={bottomTabIndex}
          onChangeTab={setBottomTabIndex}
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
              >
                <TabBarItemStack tab={tab} rootKey={rootKey} />
              </TabBarItem>
            );
          })}
        </TabBar>
      </BottomTabContext.Provider>
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

export function useDeepLinkingBottomTabsIndex() {
  const [bottomTabIndex, setBottomTabIndex] = React.useState(0);
  const { currentRoot } = useCurrentRoot();

  const setIndexFromUrl = React.useCallback(
    (url: string | null) => {
      if (url) {
        const path = getPathFromUrl(url);
        const { pathSplit } = getFirstPartAndOthers(splitPath(path));
        const newIndex = (
          currentRoot as RootChildBottomTabs
        ).children.findIndex((tab) => tab.path === '/' + pathSplit[0]);
        if (newIndex >= 0) {
          setBottomTabIndex(newIndex);
        }
      }
    },
    [currentRoot]
  );
  React.useEffect(() => {
    Linking.getInitialURL().then(setIndexFromUrl);
    const handler = Linking.addEventListener('url', ({ url }) =>
      setIndexFromUrl(url)
    );
    return () => {
      return handler.remove();
    };
  }, [setIndexFromUrl]);
  return { bottomTabIndex, setBottomTabIndex };
}
