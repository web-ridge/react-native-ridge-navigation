import * as React from 'react';
import type { BaseScreen, LinkProps, LinkRenderProps } from './navigationUtils';

import type { GestureResponderEvent } from 'react-native';
import useNavigation from './useNavigation';
import { generatePath } from './navigationUtils';

function isModifiedEvent(event: React.MouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export default function Link<T extends BaseScreen>({
  to,
  params,
  children,
  mode = 'default',
  onPress: onCustomPress,
}: LinkProps<T>) {
  const { push, preload, preloadElement, currentRootKey } = useNavigation();

  const preloadData = React.useCallback(() => {
    preload(to, params);
  }, [preload, to, params]);

  const preloadDataAndElement = React.useCallback(() => {
    preloadElement(to);
    preloadData();
  }, [preloadElement, to, preloadData]);

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
        push(to, params, false);
      }
    },
    [push, onCustomPress, to, params]
  );

  const preloadElementInner = React.useCallback(() => {
    preloadElement(to);
  }, [preloadElement, to]);

  let baseProps: LinkRenderProps = {
    onMouseDown: mode === 'sensitive' ? undefined : preloadData,
    onMouseEnter:
      mode === 'sensitive' ? preloadDataAndElement : preloadElementInner,
    onPress: onPress,
  };
  let childrenProps: LinkRenderProps = onCustomPress
    ? baseProps
    : {
        ...baseProps,
        accessibilityRole: 'link',
        href: generatePath('/' + currentRootKey + to.path, params),
      };

  return children(childrenProps);
}