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
