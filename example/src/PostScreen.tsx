import * as React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import {
  BarButton,
  LeftBar,
  NavigationBar,
  RightBar,
  SharedElement,
  useModal,
  useParams,
  usePreloadResult,
  type NavigationBarProps,
} from 'react-native-ridge-navigation';
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

// Native large-title props exist in the Obj-C view but are absent from the
// shipped d.ts; cast to reach them.
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

  return (
    <>
      {/*
       * Demo B — immersive colored header.
       * barTintColor is the solid tint in BOTH states, so the expanded large
       * title sits on a colored hero and collapses into a matching solid
       * compact bar (App Store product-page feel). White foreground + white
       * large title read on the tint.
       */}
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
        {/* Demo D — native detail bar actions (SF Symbols + systemItem). */}
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
        {/* Colored hero band continues the bar tint; the shared hero flies in here. */}
        <View style={[styles.hero, { backgroundColor: tint }]}>
          {/*
           * Demo C — shared-element destination. Same name as the list row's
           * SharedElement ("item<id>"), so the thumbnail flies into this hero
           * on the native push. The Scene declares sharedElements in its
           * registration (NavigatorScreens.tsx).
           */}
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

        <View style={styles.body}>
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
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  preloadError: {
    marginTop: 56,
    color: '#D64545',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
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
  heroImage: {
    width: 88,
    height: 88,
  },
  heroTitle: {
    flex: 1,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  body: {
    padding: 20,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  actionStatus: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    marginTop: 14,
  },
  actions: {
    marginTop: 24,
    gap: 10,
    alignItems: 'stretch',
  },
});

export default React.memo(PostScreen);
