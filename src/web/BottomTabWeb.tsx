import * as React from 'react';
import {
  Image,
  StyleSheet,
  View,
  Pressable,
  Text,
  Platform,
  useColorScheme,
} from 'react-native';
import type { BottomTabType, Orientation } from '../navigationUtils';
import BottomTabBadge from './BottomTabBadgeWeb';
import RidgeNavigationContext from '../contexts/RidgeNavigationContext';
import { BottomTabLink } from 'react-native-ridge-navigation';

function BottomTabWeb({
  isSelected,
  bottomTab,
  count,
  orientation,
}: {
  orientation: Orientation;
  isSelected: boolean;
  bottomTab: BottomTabType;
  count?: string | number | undefined;
}) {
  const colorScheme = useColorScheme();
  const { theme } = React.useContext(RidgeNavigationContext);

  return (
    <BottomTabLink key={bottomTab.path} to={bottomTab} params={{}}>
      {(linkProps) => (
        <Pressable
          {...linkProps}
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
          accessibilityLabel={bottomTab.title()}
        >
          <View style={styles.touchableInner}>
            <View style={styles.badge}>
              <BottomTabBadge visible={!!count}>{count}</BottomTabBadge>
            </View>

            <Image
              source={isSelected ? bottomTab.selectedIcon : bottomTab.icon}
              style={[
                orientation === 'horizontal' && styles.horizontalIcon,
                orientation === 'vertical' && styles.verticalIcon,
                {
                  tintColor: isSelected
                    ? theme.bottomBar.selectedTextColor
                    : theme.bottomBar.textColor,
                },
              ]}
            />
            <Text
              style={[
                styles.title,
                {
                  color: isSelected
                    ? theme.bottomBar.selectedTextColor
                    : theme.bottomBar.textColor,
                },
              ]}
            >
              {bottomTab.title()}
            </Text>
          </View>
        </Pressable>
      )}
    </BottomTabLink>
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
  verticalIcon: {
    width: 20,
    height: 20,
    margin: 6,
  },
  horizontalIcon: {
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

export default React.memo(BottomTabWeb);
