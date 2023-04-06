import * as React from 'react';
import type { BaseScreen, LinkProps, LinkRenderProps } from './navigationUtils';

import type { GestureResponderEvent } from 'react-native';
import useNavigation from './useNavigation';
import { generatePath } from './navigationUtils';
import useModal from './useModal';

function isModifiedEvent(event: React.MouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export default function Link<T extends BaseScreen>({
  to,
  params,
  children,
  linkMode = 'default',
  onPress: onCustomPress,
  skipLinkBehaviourIfPressIsDefined,
  replace: isReplaceInsteadOfPush,
  refresh: isRefreshInsteadOfPush,
}: LinkProps<T>) {
  const { inModal } = useModal();
  const { push, replace, refresh, preload, preloadElement, currentRootKey } =
    useNavigation();

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
        if (isRefreshInsteadOfPush) {
          refresh(to, params, false);
        } else if (isReplaceInsteadOfPush) {
          replace(to, params, false);
        } else {
          push(to, params, false);
        }
      }
    },
    [
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

  const preloadElementInner = React.useCallback(() => {
    preloadElement(to);
  }, [preloadElement, to]);

  let baseProps: LinkRenderProps = {
    onPressIn: linkMode === 'sensitive' ? undefined : preloadData,
    onHoverIn:
      linkMode === 'sensitive' ? preloadDataAndElement : preloadElementInner,
    onPress: onPress,
  };
  let childrenProps: LinkRenderProps =
    onCustomPress || inModal
      ? baseProps
      : {
          ...baseProps,
          accessibilityRole: 'link',
          href: generatePath('/' + currentRootKey + to.path, params),
        };

  if (skipLinkBehaviourIfPressIsDefined && onCustomPress) {
    children({ onPress: onCustomPress });
  }

  return children(childrenProps);
}
