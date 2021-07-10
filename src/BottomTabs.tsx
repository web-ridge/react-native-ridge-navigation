import * as React from 'react';
import type { RootChildBottomTabs } from './navigationUtils';
import { ColorValue, StyleSheet, useColorScheme, View } from 'react-native';
import { useLocation } from './react-router';
import BottomTab from './BottomTab';

import { badgesCount } from './Navigation';
import { useTheme } from './navigationUtils';

function BottomTabs({
  rootKey,
  bottomTabsRoot,
  isBigScreen,
}: {
  isBigScreen: boolean;
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
        isBigScreen ? styles.rootBigScreen : styles.rootSmall,
      ]}
    >
      {/*{isBigScreen ? (*/}
      {/*  <Link to={bottomTabsRoot.children[0].child} params={{}}>*/}
      {/*    {(linkProps) => (*/}
      {/*      <TouchableRipple*/}
      {/*        {...linkProps}*/}
      {/*        accessibilityRole="button"*/}
      {/*        accessibilityLabel={'Go to home'}*/}
      {/*        style={styles.logoRipple}*/}
      {/*      >*/}
      {/*        <Image*/}
      {/*          source={*/}
      {/*            isDark*/}
      {/*              ? require('../img/logo_small_dark.png').default*/}
      {/*              : require('../img/logo_small.png').default*/}
      {/*          }*/}
      {/*          style={styles.logo}*/}
      {/*          resizeMethod="auto"*/}
      {/*        />*/}
      {/*      </TouchableRipple>*/}
      {/*    )}*/}
      {/*  </Link>*/}
      {/*) : null}*/}
      {bottomTabsRoot.children.map((child) => (
        <BottomTab
          isBigScreen={isBigScreen}
          key={child.path}
          bottomTab={child}
          isSelected={location.pathname.startsWith(`/${rootKey}${child.path}`)}
          colorScheme={colorScheme}
          count={badgesCounts[child.path]}
          theme={theme}
        />
      ))}
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
  rootBigScreen: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  rootSmall: {
    shadowOffset: {
      width: 0,
      height: -1,
    },
    flexDirection: 'row',
    justifyContent: 'center',
  },

  logoRipple: {
    padding: 10,
    borderRadius: 10,
  },
  logo: { width: 46, height: 76, marginBottom: 12 },
});

export default React.memo(BottomTabs);
