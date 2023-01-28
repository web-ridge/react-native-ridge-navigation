import * as React from 'react';
import type { BaseScreen } from './navigationUtils';

import type { LinkProps } from './navigationUtils';
import type { GestureResponderEvent } from 'react-native';
import useNavigation from './useNavigation';

export default function Link<T extends BaseScreen>({
  to,
  params,
  children,
  onPress: onCustomPress,
  skipLinkBehaviourIfPressIsDefined,
}: LinkProps<T>) {
  const isPushing = React.useRef<boolean>(false);
  const { push, preload } = useNavigation();

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
      push(to, params, false);
      isPushing.current = false;
    },
    [isPushing, push, to, params, onCustomPress]
  );

  const onPressIn = React.useCallback(() => {
    preload(to, params);
  }, [to, preload, params]);

  if (skipLinkBehaviourIfPressIsDefined && onCustomPress) {
    return children({ onPress: onCustomPress });
  }
  return children({
    onPress: onPress,
    onPressIn: onPressIn,
  });
}
