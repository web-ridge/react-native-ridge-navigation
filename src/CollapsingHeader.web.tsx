import * as React from 'react';
import type { CollapsingHeaderProps } from './CollapsingHeader';

export type { CollapsingHeaderProps, HeaderAction } from './CollapsingHeader';

const LARGE_TITLE_HEIGHT = 52; // px the large title travels before collapsing
const COMPACT_BAR_HEIGHT = 44;

/**
 * Web counterpart to the native UINavigationBar header. Pure DOM so it can
 * nail the iOS look: a sticky compact bar whose centered title cross-fades in
 * as the large title scrolls away, trailing actions, hairline that appears on
 * scroll, and an optional immersive `barTintColor`. Same props as the native
 * CollapsingHeader — screens don't branch on platform.
 */
export default function CollapsingHeader({
  title,
  largeTitle = true,
  barTintColor,
  tintColor,
  actions = [],
  children,
}: CollapsingHeaderProps) {
  const [progress, setProgress] = React.useState(0); // 0 expanded → 1 collapsed

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop;
    setProgress(Math.min(1, Math.max(0, y / LARGE_TITLE_HEIGHT)));
  };

  const immersive = !!barTintColor;
  const fg = tintColor ?? (immersive ? '#FFFFFF' : 'var(--rn-label, #111111)');
  const barBg = immersive
    ? barTintColor
    : `rgba(249,249,251,${0.6 + 0.4 * progress})`;

  return (
    <div style={styles.root}>
      <div
        style={{
          ...styles.compactBar,
          height: COMPACT_BAR_HEIGHT,
          background: barBg,
          backdropFilter: immersive ? undefined : 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: immersive
            ? undefined
            : 'saturate(180%) blur(20px)',
          borderBottomColor:
            immersive || progress > 0.5
              ? 'rgba(0,0,0,0.12)'
              : 'transparent',
        }}
      >
        <span
          style={{
            ...styles.compactTitle,
            color: fg,
            // Large title present ⇒ compact title fades in on collapse.
            opacity: largeTitle ? progress : 1,
            transform: `translateY(${(1 - (largeTitle ? progress : 1)) * 6}px)`,
          }}
        >
          {title}
        </span>
        <div style={styles.actions}>
          {actions.map((a) => (
            <button
              key={a.key}
              data-testid={a.key}
              onClick={a.onPress}
              aria-label={a.label}
              title={a.label}
              style={{ ...styles.actionBtn, color: fg }}
            >
              {a.webGlyph ?? a.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.scroll} onScroll={onScroll}>
        {largeTitle ? (
          <div
            style={{
              ...styles.largeTitleWrap,
              background: immersive ? barTintColor : undefined,
            }}
          >
            <span
              style={{
                ...styles.largeTitle,
                color: fg,
                opacity: 1 - progress,
                transform: `translateY(${-progress * 8}px) scale(${
                  1 - progress * 0.12
                })`,
              }}
            >
              {title}
            </span>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    position: 'relative',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif',
  },
  compactBar: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 12px',
    borderBottom: '1px solid transparent',
    transition: 'background 120ms linear, border-color 120ms linear',
  },
  compactTitle: {
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: -0.2,
  },
  actions: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    appearance: 'none',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
    padding: '6px 10px',
    borderRadius: 8,
    lineHeight: 1,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  largeTitleWrap: {
    padding: '4px 20px 10px',
  },
  largeTitle: {
    display: 'block',
    fontSize: 34,
    lineHeight: '41px',
    fontWeight: 800,
    letterSpacing: -0.8,
    transformOrigin: 'left center',
  },
};
