import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import { radii, useTheme } from './theme';

export type ButtonProps = {
  children: React.ReactNode;
  onPress?: (event: any) => void;
  onPressIn?: (event: any) => void;
  onHoverIn?: (event: any) => void;
  variant?: 'primary' | 'outline' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export default function Button({
  children,
  onPress,
  onPressIn,
  onHoverIn,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const contentColor = isPrimary ? theme.onPrimary : theme.primary;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onHoverIn={onHoverIn}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary && { backgroundColor: theme.primary },
        variant === 'outline' && {
          borderWidth: 1.5,
          borderColor: theme.primary,
        },
        (pressed || disabled) && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={contentColor} />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <Ionicons
              name={icon}
              size={17}
              color={contentColor}
              style={styles.icon}
            />
          ) : null}
          <Text variant="subtitle" color={contentColor} style={styles.label}>
            {children}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 46,
    borderRadius: radii.control,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 15,
  },
});
