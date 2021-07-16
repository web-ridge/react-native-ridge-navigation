import * as React from 'react';
import {
  ColorValue,
  Image,
  StyleSheet,
  View,
  Pressable,
  Text,
  Platform,
} from 'react-native';
import Link from './Link';
import type { BottomTabType, ThemeSettings } from './navigationUtils';
import { bottomTabRenderIndex } from './Navigation';
import BottomTabBadge from './BottomTabBadge';

function BottomTab({
  isSelected,
  bottomTab: { path, child, selectedIcon, icon, title },
  colorScheme,
  count,
  isBigScreen,
  theme,
}: {
  isBigScreen: boolean;
  isSelected: boolean;
  bottomTab: BottomTabType;
  colorScheme: 'light' | 'dark';
  count?: string | undefined;
  theme: ThemeSettings;
}) {
  bottomTabRenderIndex.use();

  console.log({ colorScheme });
  return (
    <Link key={path} to={child} params={{}}>
      {(linkProps) => (
        <Pressable
          {...linkProps}
          testID={`bottomTab-${child.path}`}
          style={({ pressed, hovered }: any) => [
            styles.touchable,
            Platform.OS === 'web'
              ? ({ transition: 'all 150ms' } as any)
              : undefined,

            hovered
              ? colorScheme === 'dark'
                ? styles.touchableHoveredDark
                : styles.touchableHovered
              : undefined,
            pressed
              ? colorScheme === 'dark'
                ? styles.touchablePressedDark
                : styles.touchablePressed
              : undefined,
          ]}
          accessibilityRole="button"
          accessibilityLabel={title()}
        >
          <View style={styles.touchableInner}>
            <View style={styles.badge}>
              <BottomTabBadge
                theme={theme}
                colorScheme={colorScheme}
                visible={!!count}
              >
                {count}
              </BottomTabBadge>
            </View>

            <Image
              source={isSelected ? selectedIcon.default : icon.default}
              style={[
                isBigScreen ? styles.iconBig : styles.icon,
                {
                  tintColor: isSelected
                    ? (theme[colorScheme].bottomBar
                        .selectedIconColor as ColorValue)
                    : (theme[colorScheme].bottomBar.iconColor as ColorValue),
                },
              ]}
            />
            <Text
              style={[
                styles.title,
                {
                  color: isSelected
                    ? (theme[colorScheme].bottomBar
                        .selectedTextColor as ColorValue)
                    : (theme[colorScheme].bottomBar.textColor as ColorValue),
                },
              ]}
            >
              {title()}
            </Text>
          </View>
        </Pressable>
      )}
    </Link>
  );
}

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    maxWidth: 100,
    maxHeight: 100,
    borderRadius: 5,
    padding: 3,
    width: '100%',
    // margin: 3,
  },
  touchableHovered: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  touchablePressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  touchableHoveredDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  touchablePressedDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
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
    top: 12,
    right: 3,
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
  title: {
    fontSize: 13,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
});

export default React.memo(BottomTab);
