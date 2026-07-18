import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import { useTheme } from './theme';

export type ListItemProps = {
  title: string;
  description?: string;
  onPress?: (event: any) => void;
  onPressIn?: (event: any) => void;
  onHoverIn?: (event: any) => void;
  testID?: string;
};

/**
 * Row for link lists — kept prop-compatible with createLinkComponent.
 */
export default function ListItem({
  title,
  description,
  onPress,
  onPressIn,
  onHoverIn,
  testID,
}: ListItemProps) {
  const theme = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onHoverIn={onHoverIn}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.border },
        pressed && { backgroundColor: theme.chip },
      ]}
    >
      <View style={styles.texts}>
        <Text variant="subtitle" numberOfLines={1}>
          {title}
        </Text>
        {description ? (
          <Text muted numberOfLines={2} style={styles.description}>
            {description}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  texts: {
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
});
