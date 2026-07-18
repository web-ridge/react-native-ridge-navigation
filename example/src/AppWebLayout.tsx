import { Image, StyleSheet, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabOverrideProps } from 'react-native-ridge-navigation';
import { BottomTabLink } from 'react-native-ridge-navigation';
import Superman from './img/superman.png';
import BottomRoots from './BottomRoots';
import Text from './ui/Text';
import { interactiveText, useTheme } from './ui/theme';

function TopTab({
  root,
  label,
}: {
  root: (typeof BottomRoots)[keyof typeof BottomRoots];
  label: string;
}) {
  const theme = useTheme();
  return (
    <BottomTabLink to={root} params={{}}>
      {({ isSelected, ...linkProps }) => (
        <Pressable
          {...linkProps}
          style={({ pressed }) => [
            styles.tab,
            isSelected && { backgroundColor: theme.chip },
            pressed && styles.pressed,
          ]}
        >
          <Text
            variant="subtitle"
            color={isSelected ? theme.primary : theme.muted}
            style={[styles.tabLabel, interactiveText]}
          >
            {label}
          </Text>
        </Pressable>
      )}
    </BottomTabLink>
  );
}

export default function AppWebLayout({
  orientation,
  originalBottomTabs,
  children,
}: BottomTabOverrideProps) {
  const theme = useTheme();
  if (orientation === 'horizontal') {
    return (
      <>
        <View
          style={[
            styles.bar,
            {
              backgroundColor: theme.background,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <View style={styles.brand}>
            <Image source={Superman} style={styles.logo} />
            <Text variant="subtitle" style={interactiveText}>
              ridge navigation
            </Text>
          </View>
          <View style={styles.tabs}>
            <TopTab root={BottomRoots.Home} label="Home" />
            <TopTab root={BottomRoots.Posts} label="Posts" />
          </View>
          <BottomTabLink to={BottomRoots.Account} params={{}}>
            {({ isSelected, ...linkProps }) => (
              <Pressable
                {...linkProps}
                style={({ pressed }) => [
                  styles.accountButton,
                  isSelected && { backgroundColor: theme.chip },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={26}
                  color={isSelected ? theme.primary : theme.muted}
                />
              </Pressable>
            )}
          </BottomTabLink>
        </View>

        <View style={styles.content}>{children}</View>
      </>
    );
  }
  return <>{originalBottomTabs}</>;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 30,
    height: 30,
  },
  tabs: {
    flexDirection: 'row',
    gap: 6,
  },
  tab: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 15,
  },
  accountButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
});
