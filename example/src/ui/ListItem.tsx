import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SharedElement } from 'react-native-ridge-navigation';
import Text from './Text';
import { interactiveText, useTheme } from './theme';

export type ListItemProps = {
  title: string;
  description?: string;
  /** Leading thumbnail. When `sharedName` is set it becomes the flight source. */
  image?: ImageSourcePropType;
  /** Shared-element name; must match the detail hero's SharedElement name. */
  sharedName?: string;
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
  image,
  sharedName,
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
      {image ? (
        <SharedElement name={sharedName ?? ''} style={styles.thumbWrap}>
          <Image source={image} style={styles.thumb} resizeMode="cover" />
        </SharedElement>
      ) : null}
      <View style={styles.texts}>
        <Text variant="subtitle" numberOfLines={1} style={interactiveText}>
          {title}
        </Text>
        {description ? (
          <Text
            muted
            numberOfLines={2}
            style={[styles.description, interactiveText]}
          >
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
  thumbWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
  },
  thumb: {
    width: 44,
    height: 44,
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
