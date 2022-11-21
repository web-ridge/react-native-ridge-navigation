import * as React from 'react';
import { Text, StyleSheet } from 'react-native';
import RidgeNavigationContext from '../contexts/RidgeNavigationContext';

const defaultSize = 20;

type Props = React.ComponentProps<typeof Text> & {
  visible?: boolean;
  children?: string | number;
  size?: number;
};

function BottomTabBadgeWeb({
  children,
  size = defaultSize,
  visible = true,
  ...rest
}: Props) {
  const { theme } = React.useContext(RidgeNavigationContext);
  const backgroundColor = theme.bottomBar.badgeColor;
  const textColor = theme.bottomBar.badgeTextColor;

  const borderRadius = size / 2;

  if (!visible) {
    return null;
  }
  return (
    <Text
      numberOfLines={1}
      style={[
        {
          opacity: 1,
          backgroundColor,
          color: textColor,
          fontSize: size * 0.5,
          lineHeight: size,
          height: size,
          minWidth: size,
          borderRadius,
        },
        styles.container,
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
