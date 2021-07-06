import * as React from 'react';
import type { RootChildBottomTabs } from './navigationUtils';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { useLocation } from './react-router';
import BottomTab from './BottomTab';
// import Link from './Link';
// import { TouchableRipple } from 'react-native-paper';
import { badgesCount } from './Navigation';

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
  const colorScheme = useColorScheme();
  const location = useLocation();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.root,
        isDark ? styles.rootDark : styles.rootLight,
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
          isDark={isDark}
          count={badgesCounts[child.path]}
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
  rootLight: {
    backgroundColor: '#fff',
  },
  rootDark: {
    backgroundColor: '#121212',
  },
  logoRipple: {
    padding: 10,
    borderRadius: 10,
  },
  logo: { width: 46, height: 76, marginBottom: 12 },
});

export default React.memo(BottomTabs);
