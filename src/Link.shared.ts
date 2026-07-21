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
