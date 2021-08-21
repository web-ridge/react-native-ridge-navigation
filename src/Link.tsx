import * as React from 'react';
import type { BaseScreen, LinkProps, LinkRenderProps } from './navigationUtils';
import { useNavigation, useRootKey } from './Navigation';
import { generatePath } from './react-router';
import type { GestureResponderEvent } from 'react-native';
import type { PreloadableComponent } from './LazyWithPreload';
import { setPreloadResult } from './Preloader';

export default function Link<T extends BaseScreen>({
  to,
  params,
  children,
  mode = 'default',
  onPress: onCustomPress,
}: LinkProps<T>) {
  const rootKey = useRootKey();
  const navigation = useNavigation();

  const preloadElement = React.useCallback(() => {
    (to.element as PreloadableComponent<any>)?.preload?.();
  }, [to]);

  const preloadData = React.useCallback(() => {
    setPreloadResult(to, to.preload(params));
  }, [to, params]);

  const preloadDataAndElement = React.useCallback(() => {
    preloadElement();
    preloadData();
  }, [preloadElement, preloadData]);

  const onPress = React.useCallback(
    (event: GestureResponderEvent) => {
      // we don't want to go to another screen but we do want preloading
      // behaviour of the Link component :)
      // e.g. a modal with same data dependencies as the list screen
      if (onCustomPress) {
        onCustomPress(event);
        return;
      }

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
    [navigation, onCustomPress, to, params]
  );

  let baseProps: LinkRenderProps = {
    onMouseDown: mode === 'sensitive' ? undefined : preloadData,
    onMouseEnter: mode === 'sensitive' ? preloadDataAndElement : preloadElement,
    onPress: onPress,
  };
  let childrenProps: LinkRenderProps = onCustomPress
    ? baseProps
    : {
        ...baseProps,
        accessibilityRole: 'link',
        href: generatePath('/' + rootKey + to.path, params),
      };

  return children(childrenProps);
}
function isModifiedEvent(event: React.MouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
