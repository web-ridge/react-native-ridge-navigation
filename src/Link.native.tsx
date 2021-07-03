import * as React from 'react';
import type { BaseScreen, ExtractRouteParams } from './navigationUtils';
import { useNavigation } from './Navigation';
import type { GestureResponderEvent } from 'react-native';
import preloader from './Preloader';

interface RenderProps {
  onPressIn: (e: GestureResponderEvent) => any;
  onPress: (e: GestureResponderEvent) => any;
}

export default function Link<T extends BaseScreen>({
  to,
  params,
  children,
}: {
  to: T;
  params: ExtractRouteParams<T['path']>;
  children: (p: RenderProps) => any;
}) {
  const [isPushing, setIsPushing] = React.useState<boolean>(false);
  const navigation = useNavigation();

  const onPress = React.useCallback(async () => {
    if (isPushing) {
      return;
    }
    setIsPushing(true);
    await navigation.push(to, params, false);
    setIsPushing(false);
  }, [isPushing, navigation, to, params]);

  const onPressIn = React.useCallback(() => {
    preloader.setPreloadResult(to, to.preload(params));
  }, [to, params]);

  return children({
    onPress: onPress,
    onPressIn: onPressIn,
  });
}
