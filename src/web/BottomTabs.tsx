import * as React from 'react';
import type { Orientation, RootChildBottomTabs } from './navigationUtils';
import { ColorValue, StyleSheet, useColorScheme, View } from 'react-native';
import { useLocation } from './react-router';
import BottomTab from './BottomTab';

import { badgesCount } from './Navigation';
import { useTheme } from './navigationUtils';

function BottomTabs({
  rootKey,
  bottomTabsRoot,
  orientation,
}: {
  orientation: Orientation;
  rootKey: string;
  bottomTabsRoot: RootChildBottomTabs;
}) {
  const badgesCounts = badgesCount.useValue();
  const colorScheme = useColorScheme() || 'light';
  const location = useLocation();
  const theme = useTheme();
  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme[colorScheme].bottomBar
            .backgroundColor as ColorValue,
        },
        styles[orientation],
      ]}
    >
      {bottomTabsRoot?.components?.start ? (
        <bottomTabsRoot.components.start orientation={orientation} />
      ) : null}
      {bottomTabsRoot.children.map((child) => (
        <BottomTab
          orientation={orientation}
          key={child.path}
          bottomTab={child}
          isSelected={location.pathname.startsWith(`/${rootKey}${child.path}`)}
          colorScheme={colorScheme}
          count={badgesCounts[child.path]}
          theme={theme}
        />
      ))}
      {bottomTabsRoot?.components?.end ? (
        <bottomTabsRoot.components.end orientation={orientation} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    zIndex: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  horizontal: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  vertical: {
    shadowOffset: {
      width: 0,
      height: -1,
    },
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default React.memo(BottomTabs);
