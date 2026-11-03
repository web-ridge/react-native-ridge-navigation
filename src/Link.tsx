import * as React from 'react';
import type { BaseScreen } from './navigationUtils';

import type { LinkProps } from './navigationUtils';
import type { GestureResponderEvent } from 'react-native';
import useNavigation from './useNavigation';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import { generatePath } from './navigationUtils';
import {
  isStalePreload,
  shouldHandleNativeLinkPress,
  type NativePressPoint,
} from './Link.shared';

export default function Link<T extends BaseScreen>({
  to,
  toBottomTab,
  params,
  children,
  onPress: onCustomPress,
  skipLinkBehaviourIfPressIsDefined,
  replace: isReplaceInsteadOfPush,
  refresh: isRefreshInsteadOfPush,
  fullScreen,
  ...rest
}: LinkProps<T>) {
  const isPushing = React.useRef<boolean>(false);
  const pressOrigin = React.useRef<NativePressPoint | null>(null);
  const { push, replace, refresh, preload, preloadElement } = useNavigation();
  const { preloadedCache } = React.useContext(RidgeNavigationContext);
  const preloadPath = generatePath(to.path, params);
  const lastPreloadedAt = React.useRef<number | null>(null);
  React.useEffect(() => {
    lastPreloadedAt.current = null;
  }, [preloadPath]);
  const hasPreloadedData = React.useCallback(() => {
    return Boolean(preloadedCache[preloadPath]);
  }, [preloadedCache, preloadPath]);
  const preloadData = React.useCallback(() => {
    if (!isStalePreload(lastPreloadedAt.current) && hasPreloadedData()) {
      return;
    }
    lastPreloadedAt.current = Date.now();
    preload(to, params);
  }, [hasPreloadedData, preload, to, params]);
  const preloadElementInner = React.useCallback(
    () => preloadElement(to),
    [preloadElement, to]
  );
  const onPress = React.useCallback(
    async (event: GestureResponderEvent) => {
      const shouldNavigate = shouldHandleNativeLinkPress(
        pressOrigin.current,
        event.nativeEvent,
        Boolean(toBottomTab)
      );
      pressOrigin.current = null;
      if (!shouldNavigate) {
        return;
      }

      // we don't want to go to another screen but we do want preloading
      // behaviour of the Link component :)
      // e.g. a modal with same data dependencies as the list screen
      if (onCustomPress) {
        onCustomPress(event);
        return;
      }

      if (isPushing.current) {
        return;
      }
      isPushing.current = true;
      try {
        const options = {
          preload:
            isStalePreload(lastPreloadedAt.current) || !hasPreloadedData(),
          toBottomTab,
          fullScreen,
        };

        if (isRefreshInsteadOfPush) {
          refresh(to, params, options);
        } else if (isReplaceInsteadOfPush) {
          replace(to, params, options);
        } else {
          push(to, params, options);
        }
      } finally {
        isPushing.current = false;
      }
    },
    [
      toBottomTab,
      onCustomPress,
      isRefreshInsteadOfPush,
      isReplaceInsteadOfPush,
      refresh,
      to,
      params,
      hasPreloadedData,
      replace,
      push,
      fullScreen,
    ]
  );

  const onPressInExternal = rest?.onPressIn || undefined;
  const onPressIn = React.useCallback(
    (e: GestureResponderEvent) => {
      pressOrigin.current = {
        pageX: e.nativeEvent.pageX,
        pageY: e.nativeEvent.pageY,
      };
      preloadElementInner();
      preloadData();
      onPressInExternal?.(e);
    },
    [preloadData, preloadElementInner, onPressInExternal]
  );

  // Native has no intent preloading; hand the caller's own hover/focus
  // handlers through (createLinkComponent extracts them for the web Link).
  const passThrough = {
    ...(rest.onHoverIn ? { onHoverIn: rest.onHoverIn } : null),
    ...(rest.onHoverOut ? { onHoverOut: rest.onHoverOut } : null),
    ...(rest.onFocus ? { onFocus: rest.onFocus } : null),
    ...(rest.onBlur ? { onBlur: rest.onBlur } : null),
  };
  if (skipLinkBehaviourIfPressIsDefined && onCustomPress) {
    return children({
      ...passThrough,
      onPress: onCustomPress,
      onPressIn: onPressInExternal,
    });
  }
  return children({
    ...passThrough,
    onPress: onPress,
    onPressIn,
  });
}
