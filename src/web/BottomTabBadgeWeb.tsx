import * as React from 'react';
import { Text, StyleSheet } from 'react-native';
import RidgeNavigationContext from '../contexts/RidgeNavigationContext';

const defaultSize = 18;

type Props = React.ComponentProps<typeof Text> & {
  visible?: boolean;
  children?: string | number;
  size?: number;
  aboveDrawerBreakingPoint: boolean;
};

function BottomTabBadgeWeb({
  children,
  size = defaultSize,
  visible = true,
  aboveDrawerBreakingPoint,
  ...rest
}: Props) {
  const { theme } = React.useContext(RidgeNavigationContext);
  const backgroundColor = theme.bottomBar.badgeColor || 'red';
  const textColor = theme.bottomBar.badgeTextColor;

  const borderRadius = size / 2;
  if (!visible) {
    return null;
  }
  return (
    <Text
      numberOfLines={1}
      style={[
        styles.container,
        {
          opacity: 1,
          backgroundColor: aboveDrawerBreakingPoint
            ? undefined
            : backgroundColor,
          color: textColor,
          fontSize: size * 0.7,
          lineHeight: size,
          height: size,
          fontWeight: '500',
          minWidth: size,
          borderRadius,
          fontFamily: theme.bottomBar.fontFamily,
        },
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
});

export default React.memo(BottomTabBadgeWeb);
