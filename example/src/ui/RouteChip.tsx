import { StyleSheet, View } from 'react-native';
import Text from './Text';
import { useTheme } from './theme';

/**
 * The signature element of this example: every screen and action wears its
 * actual route path. The library's promise is URLs on every platform — so the
 * UI shows them.
 */
export default function RouteChip({
  path,
  accent,
}: {
  path: string;
  accent?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: theme.chip,
          borderColor: accent ? theme.primary : theme.border,
        },
      ]}
    >
      <Text variant="mono" color={accent ? theme.primary : theme.muted}>
        {path}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
