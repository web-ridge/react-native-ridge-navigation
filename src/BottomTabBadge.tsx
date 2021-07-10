import * as React from 'react';
import { Animated, StyleSheet, ColorValue } from 'react-native';
import type { ThemeSettings } from './navigationUtils';

const defaultSize = 20;

type Props = React.ComponentProps<typeof Animated.Text> & {
  visible?: boolean;
  children?: string | number;
  size?: number;
  theme: ThemeSettings;
  colorScheme: 'light' | 'dark';
};

function BottomTabBadge({
  children,
  size = defaultSize,
  theme,
  visible = true,
  colorScheme,
  ...rest
}: Props) {
  const { current: opacity } = React.useRef<Animated.Value>(
    new Animated.Value(visible ? 1 : 0)
  );
  const isFirstRendering = React.useRef<boolean>(true);

  React.useEffect(() => {
    // Do not run animation on very first rendering
    if (isFirstRendering.current) {
      isFirstRendering.current = false;
      return;
    }

    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  const backgroundColor = theme[colorScheme].bottomBar.badgeColor as ColorValue;
  const textColor = theme[colorScheme].bottomBar.badgeTextColor as ColorValue;

  const borderRadius = size / 2;

  return (
    <Animated.Text
      numberOfLines={1}
      style={[
        {
          opacity,
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
    </Animated.Text>
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

export default React.memo(BottomTabBadge);
