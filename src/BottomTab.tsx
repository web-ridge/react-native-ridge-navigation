import * as React from 'react';
import { Badge, Text, TouchableRipple } from 'react-native-paper';
import { Image, StyleSheet, View } from 'react-native';
import Link from './Link';
import type { BottomTabType } from './navigationUtils';
import { bottomTabRenderIndex } from './Navigation';

function BottomTab({
  isSelected,
  bottomTab: { path, child, selectedIcon, icon, title },
  isDark,
  count,
  isBigScreen,
}: {
  isBigScreen: boolean;
  isSelected: boolean;
  bottomTab: BottomTabType;
  isDark: boolean;
  count?: string | undefined;
}) {
  bottomTabRenderIndex.use();
  console.log({ path, selectedIcon, icon });
  return (
    <Link key={path} to={child} params={{}}>
      {(linkProps) => (
        <TouchableRipple
          {...linkProps}
          testID={`bottomTab-${child.path}`}
          style={styles.touchable}
          accessibilityRole="button"
          accessibilityLabel={title()}
        >
          <View style={styles.touchableInner}>
            {count ? (
              <Badge
                style={[
                  styles.badge,
                  {
                    backgroundColor: isDark ? selectedColorDark : selectedColor,
                  },
                ]}
              >
                {count}
              </Badge>
            ) : null}
            <Image
              source={isSelected ? selectedIcon.default : icon.default}
              style={[
                isBigScreen ? styles.iconBig : styles.icon,
                isDark ? styles.iconDark : styles.iconLight,
                isSelected
                  ? isDark
                    ? styles.iconDarkSelected
                    : styles.iconLightSelected
                  : null,
              ]}
            />
            <Text
              style={[
                styles.title,
                isDark ? styles.titleDark : styles.titleLight,
                isSelected
                  ? isDark
                    ? styles.titleDarkSelected
                    : styles.titleLightSelected
                  : null,
              ]}
            >
              {title()}
            </Text>
          </View>
        </TouchableRipple>
      )}
    </Link>
  );
}

const selectedColor = '#F59E00';
const selectedColorDark = '#FDDFAF';

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    maxWidth: 100,
    maxHeight: 100,
    borderRadius: 10,
    margin: 3,
  },
  touchableInner: {
    flex: 1,
    height: 46,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  icon: {
    width: 20,
    height: 20,
    margin: 6,
  },
  iconBig: {
    width: 24,
    height: 24,
    margin: 10,
  },
  iconLight: {
    tintColor: 'black',
  },
  iconDark: {
    tintColor: 'white',
  },
  title: {
    fontSize: 13,
  },
  titleLight: {
    color: 'black',
  },
  titleDark: {
    color: 'white',
  },
  iconLightSelected: {
    tintColor: selectedColor,
  },
  iconDarkSelected: {
    tintColor: selectedColorDark,
  },
  titleLightSelected: {
    color: selectedColor,
  },
  titleDarkSelected: {
    color: selectedColorDark,
  },
});

export default React.memo(BottomTab);
