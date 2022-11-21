import * as React from 'react';
import type { RootChildBottomTabs } from '../navigationUtils';
import { StyleSheet, View } from 'react-native';
import BottomTab from './BottomTabWeb';

import BottomTabContext from '../contexts/BottomTabContext';
import OptimizedContext from '../contexts/OptimizedContext';
import useNavigation from '../useNavigation';
import {
  getBreakingPointFromRoot,
  useAboveBreakingPoint,
} from '../navigationUtils';

function BottomTabsWrapperWeb({
  children,
  currentRootKey,
  currentRoot,
}: {
  children: any;
  currentRootKey: string;
  currentRoot: RootChildBottomTabs;
}) {
  // TODO: render app here
  // const aboveBreakingPoint = useAboveBreakingPoint(
  //   getBreakingPointFromRoot(currentRoot)
  // );
  // const orientation = aboveBreakingPoint ? "horizontal" : "vertical";

  const { push } = useNavigation();
  const { theme, stateNavigator } = React.useContext(OptimizedContext);
  const bottomTabIndex = currentRoot.children.findIndex(
    (child, index) =>
      stateNavigator.stateContext.state.key.startsWith(
        `/${currentRootKey}${child.path}`
      ) ||
      (stateNavigator.stateContext.state.key === currentRootKey && index === 0)
  );

  const setBottomTabIndex = (index: number) => {
    const screen = currentRoot.children?.[index]?.child;
    if (screen) {
      push(screen, {}, true);
    }
  };
  const [badges, setBadges] = React.useState<Record<string, string | number>>(
    {}
  );
  const setBadge = React.useCallback((key: string, badge: string | number) => {
    setBadges((prev) => ({ ...prev, [key]: badge }));
  }, []);

  const aboveBreakingPoint = useAboveBreakingPoint(
    getBreakingPointFromRoot(currentRoot)
  );
  const orientation = aboveBreakingPoint ? 'horizontal' : 'vertical';

  return (
    <BottomTabContext.Provider
      value={{
        bottomTabIndex,
        setBottomTabIndex,
        badges,
        setBadge,
      }}
    >
      <View style={[styles.root, styles[orientation]]}>
        <View style={styles.screens}>{children}</View>
        <View
          style={[
            bottomStyles.root,
            {
              backgroundColor: theme.bottomBar.backgroundColor,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 5,
              },
              shadowOpacity: 0.34,
              shadowRadius: 6.27,
              elevation: 10,
              paddingBottom: 'env(safe-area-inset-bottom)',
            },
            bottomStyles[orientation],
          ]}
        >
          {currentRoot?.components?.start ? (
            <currentRoot.components.start orientation={orientation} />
          ) : null}
          {currentRoot.children.map((child, index) => (
            <BottomTab
              orientation={orientation}
              key={child.path}
              bottomTab={child}
              isSelected={bottomTabIndex === index}
              count={badges[child.path]}
            />
          ))}
          {currentRoot?.components?.end ? (
            <currentRoot.components.end orientation={orientation} />
          ) : null}
        </View>
      </View>
    </BottomTabContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screens: {
    flex: 1,
  },
  bottomTabs: {
    position: 'relative',
    zIndex: 100,
    alignItems: 'center',
  },
  horizontal: { flexDirection: 'row-reverse' },
  vertical: { flexDirection: 'column' },
});

const bottomStyles = StyleSheet.create({
  root: {
    position: 'relative',
    alignItems: 'center',
  },
  horizontal: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  vertical: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default React.memo(BottomTabsWrapperWeb);
