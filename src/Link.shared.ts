import type { BaseScreen, LinkProps } from './navigationUtils';

// Preloaded data older than this is considered stale: a Link press should
// preload again so the screen refreshes, instead of trusting the cache
// forever.
const staleTimeInSeconds = 5;
export function isStalePreload(lastPreloadedAt: number | null | undefined) {
  if (!lastPreloadedAt) {
    return true;
  }
  return Date.now() - lastPreloadedAt > staleTimeInSeconds * 1000;
}

type WebLinkNativeEvent = {
  altKey?: boolean;
  button?: number;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
};

export type NativePressPoint = {
  pageX: number;
  pageY: number;
};

// A scene can still move underneath the finger while a native transition
// settles. Keep a normal tap valid during that short drift; ScrollView and
// Pressable already cancel actual scroll gestures before the link sees them.
const nativePressMovementTolerance = 32;

export function shouldHandleNativeLinkPress(
  origin: NativePressPoint | null,
  release: NativePressPoint,
  isFixedNavigation = false
) {
  if (isFixedNavigation || !origin) {
    // Accessibility activation can dispatch `onPress` without `onPressIn`.
    // Fixed navigation (for example a bottom tab bar) is not embedded in a
    // scroll view, so once Pressable emits `onPress` it must not be rejected
    // by responder-coordinate drift on iPadOS.
    return true;
  }

  return (
    Math.hypot(release.pageX - origin.pageX, release.pageY - origin.pageY) <=
    nativePressMovementTolerance
  );
}

export function shouldHandleWebLinkPress(
  event: { defaultPrevented?: boolean },
  nativeEvent: WebLinkNativeEvent
) {
  return (
    !event.defaultPrevented &&
    // Accessibility activation and some WKWebView presses omit `button`.
    // Reject only an explicitly non-primary mouse button.
    (nativeEvent.button == null || nativeEvent.button === 0) &&
    !(
      nativeEvent.metaKey ||
      nativeEvent.altKey ||
      nativeEvent.ctrlKey ||
      nativeEvent.shiftKey
    )
  );
}

export function extractLinkProps<T extends BaseScreen>(
  props: Omit<LinkProps<T>, 'children'>
) {
  const {
    to,
    params,
    linkMode,
    onPress,
    skipLinkBehaviourIfPressIsDefined,
    replace,
    refresh,
    fullScreen,
    toBottomTab,
    onPressIn,
    onHoverIn,
    ...otherProps
  } = props;
  return {
    to,
    params,
    linkMode,
    onPress,
    skipLinkBehaviourIfPressIsDefined,
    replace,
    refresh,
    fullScreen,
    toBottomTab,
    onPressIn,
    onHoverIn,
    otherProps,
  };
}
