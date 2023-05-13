import * as React from 'react';
import type { BaseScreen } from './navigationUtils';

import type { LinkProps } from './navigationUtils';
import type { GestureResponderEvent } from 'react-native';
import useNavigation from './useNavigation';

export default function Link<T extends BaseScreen>({
  to,
  toBottomTab,
  params,
  children,
  onPress: onCustomPress,
  skipLinkBehaviourIfPressIsDefined,
  replace: isReplaceInsteadOfPush,
  refresh: isRefreshInsteadOfPush,
  ...rest
}: LinkProps<T>) {
  const isPushing = React.useRef<boolean>(false);
  const { push, replace, refresh, preload, preloadElement } = useNavigation();
  const preloadElementInner = React.useCallback(() => {
    preloadElement(to);
  }, [preloadElement, to]);
  const onPress = React.useCallback(
    async (event: GestureResponderEvent) => {
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
      const options = { preload: false, toBottomTab };

      if (isRefreshInsteadOfPush) {
        refresh(to, params, options);
      } else if (isReplaceInsteadOfPush) {
        replace(to, params, options);
      } else {
        push(to, params, options);
      }
      isPushing.current = false;
    },
    [
      toBottomTab,
      onCustomPress,
      isRefreshInsteadOfPush,
      isReplaceInsteadOfPush,
      refresh,
      to,
      params,
      replace,
      push,
    ]
  );

  const onPressIn = React.useCallback(() => {
    preloadElementInner();
    preload(to, params);
  }, [to, preload, preloadElementInner, params]);

  if (skipLinkBehaviourIfPressIsDefined && onCustomPress) {
    return children({ onPress: onCustomPress });
  }
  return children({
    onPress: onPress,
    onPressIn: rest.onPressIn || onPressIn,
  });
}
