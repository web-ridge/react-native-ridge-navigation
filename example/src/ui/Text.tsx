import {
  Text as NativeText,
  StyleSheet,
  type TextProps as NativeTextProps,
} from 'react-native';
import { monoFontFamily, useTheme } from './theme';

type Variant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'mono';

export type TextProps = NativeTextProps & {
  variant?: Variant;
  muted?: boolean;
  color?: string;
};

export default function Text({
  variant = 'body',
  muted,
  color,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();
  return (
    <NativeText
      {...rest}
      style={[
        styles[variant],
        { color: color ?? (muted ? theme.muted : theme.text) },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mono: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: monoFontFamily,
  },
});
