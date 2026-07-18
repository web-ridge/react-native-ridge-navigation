import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import RouteChip from './RouteChip';
import { radii, useTheme } from './theme';

export type CardProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  path?: string;
  badge?: string;
  onPress?: (event: any) => void;
  onPressIn?: (event: any) => void;
  onHoverIn?: (event: any) => void;
  style?: StyleProp<ViewStyle>;
};

export default function Card({
  title,
  description,
  icon,
  path,
  badge,
  onPress,
  onPressIn,
  onHoverIn,
  style,
}: CardProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onHoverIn={onHoverIn}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: theme.chip }]}>
          <Ionicons name={icon} size={20} color={theme.primary} />
        </View>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Text variant="caption" color="#FFFFFF">
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text variant="subtitle" style={styles.title}>
        {title}
      </Text>
      <Text muted style={styles.description}>
        {description}
      </Text>
      {path ? (
        <View style={styles.path}>
          <RouteChip path={path} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: 1,
    padding: 18,
    flexGrow: 1,
    flexBasis: 260,
  },
  pressed: {
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  path: {
    marginTop: 12,
  },
});
