import * as React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import {
  BottomTabLink,
  CollapsingHeader,
  fluentRootBottomTabs,
  fluentScreen,
  useNavigation,
} from 'react-native-ridge-navigation';
import Introduction from './Introduction';
import { useRenderLog } from './helpers/utils';
import Routes from './Routes';
import NavigationRoots from './NavigationRoots';
import BottomRoots from './BottomRoots';
import Button from './ui/Button';
import Card from './ui/Card';
import RouteChip from './ui/RouteChip';
import Text from './ui/Text';
import { useTheme } from './ui/theme';

function HomeScreen() {
  useRenderLog('HomeScreen');
  const theme = useTheme();
  const { push, fluent, preload } = useNavigation();
  const [pinged, setPinged] = React.useState(0);

  return (
    <CollapsingHeader
      title="Home"
      // Same declarative actions render as native RightBar BarButtons (SF
      // Symbol / systemItem) and as iOS-styled DOM buttons on web.
      actions={[
        {
          key: 'homeSearch',
          label: 'Search',
          systemItem: 'search',
          sfSymbol: 'magnifyingglass',
          webGlyph: '⌕',
          onPress: () => setPinged((p) => p + 1),
        },
        {
          key: 'homeAdd',
          label: 'New',
          systemItem: 'add',
          webGlyph: '+',
          onPress: () => push(Routes.PostScreen, { id: '1' }),
        },
      ]}
    >
      <View style={styles.content}>
        <Introduction />

        <View style={styles.currentRoute}>
          <Text variant="caption" muted style={styles.currentRouteLabel}>
            You are here{pinged ? ` · search ${pinged}×` : ''}
          </Text>
          <RouteChip path="/home" accent />
        </View>

        <View style={styles.grid}>
          <BottomTabLink to={BottomRoots.Posts} params={{}}>
            {({ isSelected: _, ...linkProps }) => (
              <Card
                {...linkProps}
                icon="albums-outline"
                badge="NEW"
                title="Split view"
                description="One navigation model, iPad-style list/detail on wide screens, full-screen pushes on phones."
                path="/overview"
              />
            )}
          </BottomTabLink>
          <Card
            icon="flash-outline"
            title="Render as you fetch"
            description="Screens preload their data on hover or touch-down — before the push animation even starts."
            path="/post/:id"
            onPressIn={() => preload(Routes.PostScreen, { id: '1' })}
            onPress={() => push(Routes.PostScreen, { id: '1' })}
          />
          <Card
            icon="fitness-outline"
            badge="NEW"
            title="Translucent sidebar"
            description="Health-style: a glass sidebar floating over an edge-to-edge colored hero — the color bleeds under it (TripleSplitView floatingSidebar)."
            path="/health"
            onPressIn={() => preload(Routes.HealthScreen, {})}
            onPress={() => push(Routes.HealthScreen, {})}
          />
          <Card
            icon="link-outline"
            title="URLs everywhere"
            description="Every screen has a real path on web, iOS and Android. Deep links and browser history for free."
            path="/post/1?crumb=/home"
          />
          <Card
            icon="phone-portrait-outline"
            title="100% native stacks"
            description="UINavigationController on iOS, Fragments on Android. Real swipe-back, real large titles."
          />
          <Card
            icon="git-branch-outline"
            title="Fluent deep links"
            description="Build a whole stack — tabs, screen, three details deep — in one type-safe call."
            path="account → /post/30"
            onPress={() =>
              fluent(
                fluentRootBottomTabs(
                  NavigationRoots.RootHome,
                  BottomRoots.Account
                ),
                fluentScreen(Routes.HomeScreen, {}),
                fluentScreen(Routes.PostScreen, { id: '10' }),
                fluentScreen(Routes.PostScreen, { id: '20' }),
                fluentScreen(Routes.PostScreen, { id: '30' })
              )
            }
          />
          <BottomTabLink to={BottomRoots.Account} params={{}}>
            {({ isSelected: _, ...linkProps }) => (
              <Card
                {...linkProps}
                icon="layers-outline"
                title="Modals & tab badges"
                description="Nested navigation stacks inside modals, badge counts on native bottom tabs."
                path="/account"
              />
            )}
          </BottomTabLink>
        </View>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Button
            icon="logo-github"
            onPress={() =>
              Linking.openURL(
                'https://github.com/web-ridge/react-native-ridge-navigation'
              )
            }
          >
            Star on GitHub
          </Button>
          <View style={styles.footerRow}>
            <Button
              variant="ghost"
              icon="logo-twitter"
              onPress={() =>
                Linking.openURL('https://twitter.com/RichardLindhout')
              }
            >
              @RichardLindhout
            </Button>
            <Button
              variant="ghost"
              icon="logo-twitter"
              onPress={() => Linking.openURL('https://twitter.com/web_ridge')}
            >
              @web_ridge
            </Button>
          </View>
        </View>
      </View>
    </CollapsingHeader>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 860,
    marginTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignSelf: 'center',
  },
  currentRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  currentRouteLabel: {
    marginRight: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 28,
  },
  footer: {
    marginTop: 36,
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
});

export default React.memo(HomeScreen);
