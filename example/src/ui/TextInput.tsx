import * as React from 'react';
import {
  TextInput as NativeTextInput,
  StyleSheet,
  View,
  type TextInputProps as NativeTextInputProps,
} from 'react-native';
import Text from './Text';
import { radii, useTheme } from './theme';

export type TextInputProps = NativeTextInputProps & {
  label: string;
};

export default function TextInput({ label, style, ...rest }: TextInputProps) {
  const theme = useTheme();
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={styles.wrap}>
      <Text variant="caption" muted style={styles.label}>
        {label}
      </Text>
      <NativeTextInput
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        placeholderTextColor={theme.muted}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: focused ? theme.primary : theme.border,
            color: theme.text,
          },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderRadius: radii.control,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 15,
  },
});
