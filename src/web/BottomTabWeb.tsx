import * as React from 'react';
import {
  Image,
  StyleSheet,
  View,
  Pressable,
  Text,
  Platform,
} from 'react-native';
import type { BottomTabType, Orientation } from '../navigationUtils';
import BottomTabBadge from './BottomTabBadgeWeb';
import RidgeNavigationContext from '../contexts/RidgeNavigationContext';
import { BottomTabLink } from 'react-native-ridge-navigation';
import Color from 'color';

function BottomTabWeb({
  isSelected,
  bottomTab,
  count,
  orientation,
  aboveDrawerBreakingPoint,
}: {
  orientation: Orientation;
  isSelected: boolean;
  bottomTab: BottomTabType;
  count?: string | number | undefined;
  aboveDrawerBreakingPoint: boolean;
}) {
  const { theme } = React.useContext(RidgeNavigationContext);

  count = 3;

  return (
    <BottomTabLink key={bottomTab.path} to={bottomTab} params={{}}>
      {(linkProps) => (
        <Pressable
          {...linkProps}
          style={[
            styles.touchable,
            aboveDrawerBreakingPoint && styles.touchableBig,
          ]}
          accessibilityRole="button"
          accessibilityLabel={bottomTab.title()}
        >
          {({ pressed, hovered }: any) => {
            return (
              <View style={styles.touchableInner}>
                <View
                  style={[
                    styles.iconWrapper,
                    aboveDrawerBreakingPoint && styles.iconWrapperBig,
                    {
                      backgroundColor:
                        (isSelected || hovered || pressed) &&
                        Color(theme.bottomBar.activeIndicatorColor)
                          .alpha(
                            isSelected ? 1 : pressed ? 0.7 : hovered ? 0.5 : 1
                          )
                          .toString(),
                    },
                    Platform.OS === 'web'
                      ? ({ transition: 'all 150ms' } as any)
                      : undefined,
                  ]}
                >
                  {!aboveDrawerBreakingPoint && (
                    <View style={styles.badge}>
                      <BottomTabBadge
                        visible={!!count}
                        aboveDrawerBreakingPoint={aboveDrawerBreakingPoint}
                      >
                        {count}
                      </BottomTabBadge>
                    </View>
                  )}
                  <View style={styles.leftWrapper}>
                    <Image
                      source={
                        isSelected ? bottomTab.selectedIcon : bottomTab.icon
                      }
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
                    {aboveDrawerBreakingPoint && (
                      <Text
                        style={[
                          {
                            fontFamily: theme.bottomBar.fontFamily,
                            fontSize: theme.bottomBar.fontSize,
                            fontWeight: theme.bottomBar.fontWeight,
                            color: isSelected
                              ? theme.bottomBar.selectedTextColor
                              : theme.bottomBar.textColor,
                          },
                        ]}
                      >
                        {bottomTab.title()}
                      </Text>
                    )}
                  </View>
                  {aboveDrawerBreakingPoint && !!count && (
                    <View style={styles.badgeRight}>
                      <BottomTabBadge
                        visible={!!count}
                        aboveDrawerBreakingPoint={aboveDrawerBreakingPoint}
                      >
                        {count}
                      </BottomTabBadge>
                    </View>
                  )}
                </View>
                <View style={styles.spacer} />
                {!aboveDrawerBreakingPoint && (
                  <Text
                    style={[
                      {
                        fontFamily: theme.bottomBar.fontFamily,
                        fontSize: theme.bottomBar.fontSize,
                        fontWeight: theme.bottomBar.fontWeight,
                        color: isSelected
                          ? theme.bottomBar.selectedTextColor
                          : theme.bottomBar.textColor,
                      },
                    ]}
                  >
                    {bottomTab.title()}
                  </Text>
                )}
              </View>
            );
          }}
        </Pressable>
      )}
    </BottomTabLink>
  );
}

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    maxWidth: 140,
    maxHeight: 100,
    width: '100%',
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 16,
    // margin: 3,
  },
  leftWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  badgeRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  touchableBig: {
    maxWidth: '100%',
    maxHeight: 64,
  },
  spacer: {
    height: 4,
  },
  iconWrapper: {
    borderRadius: 360,
    width: 64,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperBig: {
    height: 56,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: 6,
    paddingRight: 16,
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
    top: -2,
    right: 13,
    zIndex: 100,
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
});

export default React.memo(BottomTabWeb);
