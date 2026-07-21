import * as React from 'react';
import type { ScopedCollapsingHeaderProps } from './ScopedCollapsingHeader';

export type { ScopedCollapsingHeaderProps } from './ScopedCollapsingHeader';

/**
 * Web counterpart of the native scoped Contacts-style header. Same props and
 * the same look: a soft vertical gradient hero (avatar/name/actions) that
 * scrolls away, and an always-on translucent compact bar that keeps the list
 * blurred beneath it via CSS `backdrop-filter: blur()` — the web equivalent of
 * the native `UIBlurEffect`. Confined to its own column, so the color never
 * bleeds across a sibling master column.
 */
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
  children,
  contentContainerStyle,
}: ScopedCollapsingHeaderProps) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const heroHeight = expandedHeight + topInset;
  const barHeight = collapsedHeight + topInset;
  const distance = heroHeight - barHeight;

  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const compactTitleOpacity = clamp((scrollTop - (distance - 56)) / 56);
  const heroOpacity = 1 - clamp(scrollTop / (distance * 0.85));
  const heroTranslate = -clamp(scrollTop / distance) * distance * 0.25;

  const gradient = `linear-gradient(180deg, ${gradientColors
    .map((c, i) => `${c} ${(i / (gradientColors.length - 1)) * 100}%`)
    .join(', ')})`;

  return (
    <div style={styles.root}>
      <div
        style={styles.scroll}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div
          style={{
            ...styles.hero,
            height: heroHeight,
            paddingTop: topInset,
            backgroundImage: gradient,
            opacity: heroOpacity,
            transform: `translateY(${heroTranslate}px)`,
          }}
        >
          {renderHero() as any}
        </div>
        <div style={contentContainerStyle as any}>{children as any}</div>
      </div>

      <div
        style={{
          ...styles.compactBar,
          height: barHeight,
          paddingTop: topInset,
          borderBottomColor:
            compactTitleOpacity > 0.5 ? 'rgba(0,0,0,0.18)' : 'transparent',
        }}
      >
        {headerLeft ? (
          <div style={styles.compactLeft}>{headerLeft as any}</div>
        ) : null}
        <span
          style={{
            ...styles.compactTitle,
            color: compactTitleColor ?? tintColor,
            opacity: compactTitleOpacity,
          }}
        >
          {title}
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif',
  },
  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  compactBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottom: '1px solid transparent',
    // Real web blur — the list shows through frosted, like UIBlurEffect.
    background: 'rgba(255,255,255,0.5)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    transition: 'border-color 120ms linear',
  },
  compactLeft: {
    position: 'absolute',
    left: 8,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
  },
  compactTitle: {
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: -0.2,
  },
};
