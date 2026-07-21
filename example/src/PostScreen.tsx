import * as React from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  BackLink,
  BarButton,
  LeftBar,
  Link,
  NavigationBar,
  RightBar,
  ScopedCollapsingHeader,
  SharedElement,
  useModal,
  useParams,
  usePreloadResult,
  type NavigationBarProps,
} from 'react-native-ridge-navigation';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSuspenseQuery } from '@tanstack/react-query';
import { queryKeyPostScreen, queryKeyPostScreenPromise } from './queryKeys';
import routes from './Routes';
import ButtonLink from './ButtonLink';
import { useRenderLog } from './helpers/utils';
import Text from './ui/Text';
import RouteChip from './ui/RouteChip';

// App Store-style: a per-item tint drives both the immersive colored hero and
// the solid navigation bar it collapses into.
const HERO_TINTS = [
  '#6C5CE7',
  '#E8590C',
  '#0CA678',
  '#1971C2',
  '#C2255C',
  '#5F3DC4',
];
function tintFor(id: string): string {
  const n = Number(id) || 0;
  return HERO_TINTS[n % HERO_TINTS.length]!;
}
// A slightly darker sibling for the gradient's bottom stop.
function darken(hex: string, amount = 0.22): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 255) * (1 - amount));
  const g = clamp(((n >> 8) & 255) * (1 - amount));
  const b = clamp((n & 255) * (1 - amount));
  const hh = (v: number) => v.toString(16).padStart(2, '0');
  return `#${hh(r)}${hh(g)}${hh(b)}`.toUpperCase();
}

type ExtraBarProps = NavigationBarProps & {
  largeTitleColor?: string;
  largeTitleFontWeight?: string;
};
const TypedNavigationBar = NavigationBar as React.ComponentType<ExtraBarProps>;

function PostScreen() {
  useRenderLog('PostScreen');
  const queryReference = usePreloadResult(routes.PostScreen);
  const { inModal } = useModal();
  const { id } = useParams(routes.PostScreen);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [saved, setSaved] = React.useState(false);
  const [shares, setShares] = React.useState(0);

  const { data } = useSuspenseQuery({
    queryKey: queryKeyPostScreen({ id }),
    queryFn: queryKeyPostScreenPromise({ id }),
  });
  if (queryReference !== 'testQueryReference') {
    console.log({ queryReference });
    return <Text style={styles.preloadError}>No preloaded result</Text>;
  }

  const tint = tintFor(id);
  // Wide + native ⇒ we are inside the SplitView DETAIL pane (JS DetailPaneScenes
  // fallback), so a scene-level native NavigationBar would span the full window
  // and bleed across the master. Demo E: a column-SCOPED JS immersive header.
  const inDetailPane = Platform.OS !== 'web' && width >= 700;

  const body = (
    <View style={styles.body}>
      {/* In selectionParam mode this in-app back must DESELECT (drop ?detail=)
          via the main navigator history — same as browser Back. */}
      <BackLink>
        {({ onPress }) => (
          <Pressable testID="detail-back" onPress={onPress}>
            <Text style={styles.detailBack}>‹ Back (deselect)</Text>
          </Pressable>
        )}
      </BackLink>
      <RouteChip path={`/post/${id}`} accent />
      <Text style={styles.actionStatus}>
        {saved ? 'Bookmarked' : 'Not bookmarked'} · Shared {shares}×
      </Text>
      <Text muted style={styles.bodyText}>
        {data!.body}
      </Text>
      <View style={styles.actions}>
        <ButtonLink
          to={routes.PostScreen}
          params={{ id: `${Number(id) + 1}` }}
          icon="arrow-forward"
        >
          Push the next post
        </ButtonLink>
        {/* Demo G — this push ESCAPES the split and presents full-screen. */}
        <ButtonLink
          to={routes.PostEditScreen}
          params={{ id }}
          variant="outline"
          icon="create-outline"
          fullScreen
        >
          Edit (full-screen over split)
        </ButtonLink>
        {inModal && (
          <ButtonLink
            to={routes.AccountScreen}
            params={{}}
            variant="outline"
            replace
          >
            Replace with account screen
          </ButtonLink>
        )}
      </View>
      {/* Extra content so the detail list actually scrolls — lets the scoped
          header collapse and the rows blur under the compact bar. */}
      <Text muted variant="caption" style={styles.moreLabel}>
        MORE FROM THIS POST
      </Text>
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={i} style={styles.moreRow}>
          <Text style={styles.moreRowTitle}>Paragraph {i + 1}</Text>
          <Text muted style={styles.moreRowBody}>
            {data!.body}
          </Text>
        </View>
      ))}
    </View>
  );

  if (inDetailPane) {
    return (
      <ScopedCollapsingHeader
        title={data!.title}
        gradientColors={[tint, darken(tint)]}
        tintColor="#FFFFFF"
        compactTitleColor={tint}
        topInset={insets.top}
        expandedHeight={260}
        // Real native blur: the list content blurs under this compact bar.
        blurComponent={(style) => (
          <BlurView
            // @ts-ignore RN style vs expo-blur style
            style={style}
            intensity={40}
            tint="systemThinMaterialLight"
          />
        )}
        headerLeft={
          // Demo G — a full-screen Edit from the compact bar too.
          <Link to={routes.PostEditScreen} params={{ id }} fullScreen>
            {(linkProps) => (
              <Pressable
                {...linkProps}
                style={[styles.compactBtn, { backgroundColor: `${tint}26` }]}
              >
                <Text color={tint} style={styles.compactBtnText}>
                  Edit
                </Text>
              </Pressable>
            )}
          </Link>
        }
        renderHero={() => (
          <View style={styles.hero}>
            {/* Demo C — shared-element destination avatar (name matches the
                master row's SharedElement item<id>). */}
            <SharedElement name={`item${id}`} style={styles.avatarWrap}>
              <Image
                source={require('./img/superman.png')}
                style={styles.avatar}
                resizeMode="cover"
              />
            </SharedElement>
            <Text color="#FFFFFF" style={styles.heroName} numberOfLines={2}>
              {data!.title}
            </Text>
            <View style={styles.heroActions}>
              <HeroAction
                icon={saved ? 'bookmark' : 'bookmark-outline'}
                label="Save"
                onPress={() => setSaved((s) => !s)}
              />
              <HeroAction
                icon="arrow-redo-outline"
                label="Share"
                onPress={() => setShares((n) => n + 1)}
              />
              <HeroAction icon="ellipsis-horizontal" label="More" />
            </View>
          </View>
        )}
      >
        {body}
      </ScopedCollapsingHeader>
    );
  }

  // Narrow / web: keep the native App Store colored collapsing bar (Demo B).
  return (
    <>
      <TypedNavigationBar
        hidden={false}
        largeTitle
        title={`Post ${id}`}
        barTintColor={tint}
        tintColor="#FFFFFF"
        titleColor="#FFFFFF"
        largeTitleColor="#FFFFFF"
        largeTitleFontWeight="800"
        backTitle="Posts"
      >
        <LeftBar supplementBack>
          <BarButton
            testID="detailBookmark"
            image={{ uri: saved ? 'bookmark.fill' : 'bookmark' }}
            tintColor="#FFFFFF"
            onPress={() => setSaved((s) => !s)}
          />
        </LeftBar>
        <RightBar>
          <BarButton
            testID="detailShare"
            systemItem="action"
            tintColor="#FFFFFF"
            onPress={() => setShares((n) => n + 1)}
          />
          <BarButton
            testID="detailMore"
            image={{ uri: 'ellipsis.circle' }}
            tintColor="#FFFFFF"
            onPress={() => setShares((n) => n + 1)}
          />
        </RightBar>
      </TypedNavigationBar>
      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <View style={[styles.heroBand, { backgroundColor: tint }]}>
          <SharedElement name={`item${id}`} style={styles.heroImageWrap}>
            <Image
              source={require('./img/superman.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </SharedElement>
          <Text color="#FFFFFF" style={styles.heroTitle} numberOfLines={3}>
            {data!.title}
          </Text>
        </View>
        {body}
      </ScrollView>
    </>
  );
}

const HeroAction = React.memo(
  ({
    icon,
    label,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress?: () => void;
  }) => (
    <Pressable style={styles.heroActionBtn} onPress={onPress}>
      <View style={styles.heroActionCircle}>
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>
      <Text color="rgba(255,255,255,0.9)" style={styles.heroActionLabel}>
        {label}
      </Text>
    </Pressable>
  )
);

const styles = StyleSheet.create({
  preloadError: { marginTop: 56, color: '#D64545' },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },
  // Contacts-style hero (scoped detail header)
  hero: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  avatar: { width: 96, height: 96 },
  heroName: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 22,
    marginTop: 6,
  },
  heroActionBtn: { alignItems: 'center', gap: 5 },
  heroActionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActionLabel: { fontSize: 12, fontWeight: '600' },
  compactBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  compactBtnText: { fontSize: 16, fontWeight: '600' },
  // App Store band (narrow / web)
  heroBand: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroImageWrap: {
    width: 88,
    height: 88,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroImage: { width: 88, height: 88 },
  heroTitle: { flex: 1, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  body: { padding: 20, maxWidth: 640, width: '100%', alignSelf: 'center' },
  detailBack: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4C51F7',
    marginBottom: 8,
  },
  actionStatus: { marginTop: 10, fontSize: 14, fontWeight: '600' },
  bodyText: { fontSize: 16, lineHeight: 26, marginTop: 14 },
  actions: { marginTop: 24, gap: 10, alignItems: 'stretch' },
  moreLabel: { marginTop: 30, marginBottom: 8, letterSpacing: 0.6 },
  moreRow: { marginTop: 16 },
  moreRowTitle: { fontSize: 16, fontWeight: '700' },
  moreRowBody: { fontSize: 15, lineHeight: 22, marginTop: 4 },
});

export default React.memo(PostScreen);
