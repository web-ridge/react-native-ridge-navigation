import * as React from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

/**
 * A COLUMN-SCOPED, Contacts-style immersive header that collapses on scroll.
 *
 * Why this is JS on native (not a scene-level native UINavigationBar): inside a
 * SplitView/TripleSplitView DETAIL pane the content is rendered by the JS
 * `DetailPaneScenes` fallback (an embedded native nav stack at partial width
 * does not present pushed scenes on the new architecture). A scene-level native
 * `NavigationBar` there would span the FULL window width and bleed across the
 * master column. This header is a plain View subtree, so its colored/gradient
 * band is confined to the detail column and both columns read independently
 * (iPad Mail/Contacts). It still uses a REAL native blur for the compact bar via
 * the injected `blurComponent` (expo-blur's `UIBlurEffect`), so the list content
 * genuinely blurs as it scrolls under the bar.
 *
 * The collapse is driven by a native `Animated.Value` fed from the scroll view's
 * onScroll (useNativeDriver), mirroring the web variant's progress math: a soft
 * vertical gradient hero (avatar/name/actions) scrolls away while an always-on
 * translucent blur bar keeps the compact title.
 *
 * The `.web.tsx` sibling renders the same look with `backdrop-filter: blur()`.
 */
export type ScopedCollapsingHeaderProps = {
  /** Compact-bar title (the entity name). */
  title: string;
  /** Soft vertical gradient band, top → bottom (>= 2 stops). */
  gradientColors: readonly string[];
  /** Foreground color for the hero (name/avatar ring). Default white. */
  tintColor?: string;
  /**
   * Color for the COLLAPSED compact-bar title. The compact bar is translucent
   * over the (light) list content once the colored hero has scrolled away, so
   * this usually differs from `tintColor` (e.g. the entity tint or the label
   * color). Defaults to `tintColor`.
   */
  compactTitleColor?: string;
  /** Hero height, EXCLUDING the top safe-area inset. Default 240. */
  expandedHeight?: number;
  /** Compact bar height, EXCLUDING the top safe-area inset. Default 48. */
  collapsedHeight?: number;
  /** Top safe-area inset (pass from useSafeAreaInsets). Default 0. */
  topInset?: number;
  /** The immersive hero: large avatar, name, round action buttons. */
  renderHero: () => React.ReactNode;
  /** Optional leading control in the compact bar (e.g. a back chip). */
  headerLeft?: React.ReactNode;
  /**
   * Injected native blur surface for the compact bar (e.g. expo-blur `BlurView`).
   * Receives an absolute-fill style. Falls back to a translucent View so the
   * library never hard-depends on expo-blur.
   */
  blurComponent?: (style: StyleProp<ViewStyle>) => React.ReactNode;
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export default function ScopedCollapsingHeader({
  title,
  gradientColors,
  tintColor = '#FFFFFF',
  compactTitleColor,
  expandedHeight = 240,
  collapsedHeight = 48,
  topInset = 0,
  renderHero,
  headerLeft,
  blurComponent,
  children,
  contentContainerStyle,
}: ScopedCollapsingHeaderProps) {
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const heroHeight = expandedHeight + topInset;
  const barHeight = collapsedHeight + topInset;
  // Distance the hero travels before the compact title takes over.
  const distance = heroHeight - barHeight;

  // Compact title fades in as the hero name approaches the bar (last ~56pt).
  const compactTitleOpacity = scrollY.interpolate({
    inputRange: [distance - 56, distance],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  // Hero content fades + lifts slightly as it scrolls away (parallax).
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, distance * 0.85],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const heroTranslate = scrollY.interpolate({
    inputRange: [-120, 0, distance],
    outputRange: [40, 0, -distance * 0.25],
    extrapolate: 'clamp',
  });
  // Hairline under the compact bar appears once collapsed.
  const hairlineOpacity = scrollY.interpolate({
    inputRange: [distance - 40, distance],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const gradient = `linear-gradient(180deg, ${gradientColors
    .map((c, i) => `${c} ${(i / (gradientColors.length - 1)) * 100}%`)
    .join(', ')})`;

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        style={styles.scroll}
        scrollEventThrottle={16}
        contentContainerStyle={contentContainerStyle}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Immersive gradient hero (scrolls away like Contacts). */}
        <Animated.View
          style={[
            { height: heroHeight, paddingTop: topInset },
            styles.hero,
            {
              // @ts-ignore RN 0.76+ CSS gradient (new arch).
              experimental_backgroundImage: gradient,
              opacity: heroOpacity,
              transform: [{ translateY: heroTranslate }],
            },
          ]}
          pointerEvents="box-none"
        >
          {renderHero()}
        </Animated.View>
        {children}
      </Animated.ScrollView>

      {/* Always-present translucent NATIVE blur compact bar. The list scrolls
          UNDER it, so its content shows through blurred (iOS large-title bar). */}
      <View
        style={[styles.compactBar, { height: barHeight, paddingTop: topInset }]}
        pointerEvents="box-none"
      >
        {blurComponent ? (
          blurComponent(StyleSheet.absoluteFill)
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(255,255,255,0.55)' },
            ]}
          />
        )}
        <Animated.View
          style={[styles.hairline, { opacity: hairlineOpacity }]}
        />
        {headerLeft ? (
          <View style={styles.compactLeft}>{headerLeft}</View>
        ) : null}
        <Animated.Text
          numberOfLines={1}
          style={[
            styles.compactTitle,
            {
              color: compactTitleColor ?? tintColor,
              opacity: compactTitleOpacity,
            },
          ]}
        >
          {title}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  hero: {
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  compactBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  compactLeft: {
    position: 'absolute',
    left: 8,
    bottom: 0,
    top: 0,
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
