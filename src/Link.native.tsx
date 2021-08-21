import * as React from 'react';
import type { BaseScreen } from './navigationUtils';
import { useNavigation } from './Navigation';
import { setPreloadResult } from './Preloader';
import type { LinkProps } from './navigationUtils';
import type { GestureResponderEvent } from 'react-native';

export default function Link<T extends BaseScreen>({
  to,
  params,
  children,
  onPress: onCustomPress,
}: LinkProps<T>) {
  const isPushing = React.useRef<boolean>(false);
  const navigation = useNavigation();

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
      await navigation.push(to, params, false);
      isPushing.current = false;
    },
    [isPushing, navigation, to, params, onCustomPress]
  );

  const onPressIn = React.useCallback(() => {
    setPreloadResult(to, to.preload(params));
  }, [to, params]);

  return children({
    onPress: onPress,
    onPressIn: onPressIn,
  });
}
