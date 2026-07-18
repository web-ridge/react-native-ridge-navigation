import * as React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BackLink,
  useModal,
  useNavigation,
} from 'react-native-ridge-navigation';
import Text from './ui/Text';
import { useTheme } from './ui/theme';

function Header({ title }: { title: string }) {
  const { canNavigateBack } = useNavigation();
  const { inModal } = useModal();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const topInset = inModal && Platform.OS === 'ios' ? 0 : insets.top;
  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: topInset,
          backgroundColor: theme.background,
          borderBottomColor: theme.border,
        },
      ]}
    >
      <View style={styles.inner}>
        {canNavigateBack(1) ? (
          <BackLink>
            {(linkProps) => (
              <Pressable
                {...linkProps}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="arrow-back" size={22} color={theme.text} />
              </Pressable>
            )}
          </BackLink>
        ) : null}
        <Text variant="title" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
  title: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 19,
  },
});

export default React.memo(Header);
