import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import BottomTab from './BottomTabWeb';

import OptimizedContext from '../contexts/OptimizedContext';
import {
  getBreakingPointFromRoot,
  useAboveBreakingPoint,
} from '../navigationUtils';
import useCurrentRoot from '../useCurrentRoot';
import BottomTabIndexContext from '../contexts/BottomTabIndexContext';
import BottomTabBadgesContext from '../contexts/BottomTabBadgesContext';

function BottomTabsWrapperWeb({ children }: { children: any }) {
  const { currentRoot } = useCurrentRoot();
  const aboveBreakingPoint = useAboveBreakingPoint(
    getBreakingPointFromRoot(currentRoot)
  );

  const aboveDrawerBreakingPoint = useAboveBreakingPoint(1240);

  const orientation = aboveBreakingPoint ? 'horizontal' : 'vertical';

  if (currentRoot?.type !== 'bottomTabs') {
    return children;
  }
  const inner = (
    <OriginalBottomTabs
      orientation={orientation}
      aboveDrawerBreakingPoint={aboveDrawerBreakingPoint}
    >
      {children}
    </OriginalBottomTabs>
  );
  if (currentRoot.components?.override) {
    return (
      <currentRoot.components.override
        orientation={orientation}
        originalBottomTabs={inner}
      >
        {children}
      </currentRoot.components.override>
    );
  }
  return inner;
}

export function OriginalBottomTabs({
  children,
  orientation,
  aboveDrawerBreakingPoint,
}: {
  children: any;
  orientation: 'horizontal' | 'vertical';
  aboveDrawerBreakingPoint: boolean;
}) {
  const { currentRoot } = useCurrentRoot();
  const { theme } = React.useContext(OptimizedContext);
  const { badges } = React.useContext(BottomTabBadgesContext);
  const { bottomTabIndex } = React.useContext(BottomTabIndexContext);

  if (currentRoot?.type !== 'bottomTabs') {
    return children;
  }
  return (
    <View style={[styles.root, styles[orientation]]}>
      <View style={styles.screens}>{children}</View>
      <View
        style={[
          bottomStyles.root,
          {
            backgroundColor: theme.bottomBar.backgroundColor,
          },
          bottomStyles[orientation],
          aboveDrawerBreakingPoint && bottomStyles.horizontalBig,
        ]}
      >
        {currentRoot?.components?.start ? (
          <currentRoot.components.start orientation={orientation} />
        ) : null}
        {currentRoot.children.map((child, index) => (
          <BottomTab
            orientation={orientation}
            aboveDrawerBreakingPoint={aboveDrawerBreakingPoint}
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
    justifyContent: 'center',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 5,
    // },
    // shadowOpacity: 0.34,
    // shadowRadius: 6.27,
    // elevation: 10,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  horizontal: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  vertical: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  horizontalBig: {
    width: 320,
    alignItems: 'flex-start',
  },
});

export default React.memo(BottomTabsWrapperWeb);
