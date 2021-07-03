import * as React from 'react';
import type { BaseScreen, ExtractRouteParams } from './navigationUtils';
import { useNavigation } from './Navigation';
import { generatePath } from 'react-router-dom';
import type { GestureResponderEvent } from 'react-native';
import type { PreloadableComponent } from './LazyWithPreload';
import preloader from './Preloader';

interface RenderProps {
  onMouseDown?: (e: GestureResponderEvent) => any | undefined;
  onMouseEnter?: (e: GestureResponderEvent) => any;
  onPress: (e: GestureResponderEvent) => any;
  accessibilityRole: 'link';
  href: string;
}

export default function Link<T extends BaseScreen>({
  to,
  params,
  children,
  mode = 'default',
}: {
  to: T;
  params: ExtractRouteParams<T['path']>;
  children: (p: RenderProps) => any;
  mode?: 'default' | 'sensitive'; // used on the web when 'aggressive' the preload() will be called on mouse enter
}) {
  const navigation = useNavigation();

  const preloadElement = React.useCallback(() => {
    (to.element as PreloadableComponent<any>)?.preload?.();
  }, [to]);

  const preloadData = React.useCallback(() => {
    preloader.setPreloadResult(to, to.preload(params));
  }, [to, params]);

  const preloadDataAndElement = React.useCallback(() => {
    preloadElement();
    preloadData();
  }, [preloadElement, preloadData]);

  const onPress = React.useCallback(
    (event: GestureResponderEvent) => {
      const nativeEvent = event.nativeEvent as any as React.MouseEvent;

      if (
        !event.defaultPrevented && // onClick prevented default
        nativeEvent.button === 0 && // Ignore everything but left clicks
        // (!target || target === '_self') && // Let browser handle "target=_blank" etc.
        !isModifiedEvent(nativeEvent) // Ignore clicks with modifier keys
      ) {
        event.preventDefault();
        navigation.push(to, params, false);
      }
    },
    [navigation, to, params]
  );

  let childrenProps: RenderProps = {
    onMouseDown: mode === 'sensitive' ? undefined : preloadData,
    onMouseEnter: mode === 'sensitive' ? preloadDataAndElement : preloadElement,
    accessibilityRole: 'link',
    href: generatePath(to.path, params),
    onPress: onPress,
  };

  return children(childrenProps);
}
function isModifiedEvent(event: React.MouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
