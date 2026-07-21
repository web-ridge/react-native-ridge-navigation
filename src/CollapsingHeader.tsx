import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  NavigationBar,
  RightBar,
  BarButton,
  type BarButtonProps,
} from 'navigation-react-native';

/**
 * A cross-platform, iOS-flavoured navigation header.
 *
 * One API, two renderers:
 *  - native (this file): the real UINavigationBar / Material toolbar via
 *    navigation-react-native — large title collapses on scroll, real
 *    `barTintColor` immersive header, native `RightBar` bar buttons.
 *  - web (CollapsingHeader.web.tsx): an iOS-styled DOM header that mirrors the
 *    same look/feel — sticky compact bar, large title that collapses on scroll,
 *    trailing actions, optional colored/immersive tint.
 *
 * The `actions` are described declaratively so the SAME array drives native
 * `<BarButton>`s (SF Symbol / systemItem) and web DOM buttons.
 */
export type HeaderAction = {
  key: string;
  /** a11y label + web button text/title. */
  label: string;
  onPress: () => void;
  /** Native: SF Symbol name (iOS) e.g. 'square.and.arrow.up'. */
  sfSymbol?: string;
  /** Native: UIKit system item e.g. 'add' | 'action' | 'edit'. */
  systemItem?: BarButtonProps['systemItem'];
  /** Web: glyph/emoji or short text shown in the DOM button. */
  webGlyph?: string;
};

export type CollapsingHeaderProps = {
  title: string;
  largeTitle?: boolean;
  /** Immersive solid tint for the whole header (App Store style). */
  barTintColor?: string;
  /** Foreground color for title + actions (defaults to system label color). */
  tintColor?: string;
  actions?: HeaderAction[];
  /** The scrollable scene content the header sits above. */
  children: React.ReactNode;
};

// Native large-title props exist in the Obj-C view but not the shipped d.ts.
const TypedNavigationBar = NavigationBar as React.ComponentType<any>;

export default function CollapsingHeader({
  title,
  largeTitle = true,
  barTintColor,
  tintColor,
  actions = [],
  children,
}: CollapsingHeaderProps) {
  return (
    <>
      <TypedNavigationBar
        hidden={false}
        title={title}
        largeTitle={largeTitle}
        barTintColor={barTintColor}
        tintColor={tintColor}
        titleColor={tintColor}
        largeTitleColor={tintColor}
      >
        {actions.length ? (
          <RightBar>
            {actions.map((a) => (
              <BarButton
                key={a.key}
                testID={a.key}
                title={a.sfSymbol || a.systemItem ? undefined : a.label}
                image={a.sfSymbol ? { uri: a.sfSymbol as any } : undefined}
                systemItem={a.systemItem}
                tintColor={tintColor}
                onPress={a.onPress}
              />
            ))}
          </RightBar>
        ) : null}
      </TypedNavigationBar>
      {/* Bound + insetting scroll view lets UIKit collapse the large title. */}
      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
      >
        {children}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
});
