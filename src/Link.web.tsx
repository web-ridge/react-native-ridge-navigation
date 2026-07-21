import * as React from 'react';
import type { BaseScreen, LinkProps, LinkRenderProps } from './navigationUtils';

import type { MouseEvent, GestureResponderEvent } from 'react-native';
import useNavigation from './useNavigation';
import { isStalePreload } from './Link.shared';
import { generatePath } from './navigationUtils';
import useModal from './useModal';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import useBottomTabIndex from './useBottomTabIndex';

function isModifiedEvent(event: React.MouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export default function Link<T extends BaseScreen>({
  to,
  toBottomTab,
  params,
  children,
  linkMode = 'default',
  onPress: onCustomPress,
  skipLinkBehaviourIfPressIsDefined,
  replace: isReplaceInsteadOfPush,
  refresh: isRefreshInsteadOfPush,
  fullScreen,
  ...rest
}: LinkProps<T>) {
  const { basePath, preloadedCache, rootNavigator } = React.useContext(
    RidgeNavigationContext
  );
  const { currentTab } = useBottomTabIndex();
  const { inModal } = useModal();
  const { push, replace, refresh, preload, preloadElement, currentRootKey } =
    useNavigation();

  let path = to.path;

  if (toBottomTab?.path) {
    path = toBottomTab.path;
  } else if (currentTab?.path) {
    path = currentTab.path + path;
  }
  let href = generatePath('/' + currentRootKey + path, params);

  if (basePath) {
    href = '/' + basePath + href;
  }

  const preloadPath = generatePath(to.path, params);
  const lastPreloadedAt = React.useRef<number | null>(null);

  React.useEffect(() => {
    lastPreloadedAt.current = null;
  }, [href]);

  const hasPreloadedData = React.useCallback(() => {
    return Boolean(preloadedCache[preloadPath]);
  }, [preloadedCache, preloadPath]);

  const preloadData = React.useCallback(() => {
    if (!isStalePreload(lastPreloadedAt.current) && hasPreloadedData()) {
      return;
    }

    lastPreloadedAt.current = new Date().getTime();
    preload(to, params);
  }, [hasPreloadedData, preload, to, params]);

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
      }
    },
    [
      onCustomPress,
      toBottomTab,
      isRefreshInsteadOfPush,
      isReplaceInsteadOfPush,
      refresh,
      to,
      params,
      hasPreloadedData,
      replace,
      push,
    ]
  );

  const preloadElementInner = React.useCallback(() => {
    preloadElement(to);
  }, [preloadElement, to]);

  const onPressInExternal = rest?.onPressIn;
  const loadDataOnHover = linkMode === 'sensitive';
  const onPressIn = React.useCallback(
    (e: GestureResponderEvent) => {
      if (!loadDataOnHover) {
        preloadData();
      }
      onPressInExternal?.(e);
    },
    [loadDataOnHover, onPressInExternal, preloadData]
  );

  const onHoverInExternal = rest?.onHoverIn;
  const onHoverIn = React.useCallback(
    (e: MouseEvent) => {
      if (loadDataOnHover) {
        preloadDataAndElement();
      } else {
        preloadElementInner();
      }
      onHoverInExternal?.(e);
    },
    [
      loadDataOnHover,
      onHoverInExternal,
      preloadDataAndElement,
      preloadElementInner,
    ]
  );

  let baseProps: LinkRenderProps = {
    onPressIn: onPressIn,
    onHoverIn: onHoverIn,
    onPress: onPress,
  };
  // Panes (SplitView / TripleSplitView columns, nested providers) run on a
  // history-less navigator whose rootKey is a per-instance ephemeral id, so an
  // href built from it (`/<paneRootKey>/…`) is not a real browser route: a hard
  // navigation to it (reload / open-in-new-tab / cmd-click) 404s and the app
  // falls back to the default root. Emit an onPress-only control instead, just
  // like links inside a modal, so the ephemeral pane URL is never advertised.
  const inEphemeralPane = rootNavigator?.historyManager?.disabled === true;
  let childrenProps: LinkRenderProps =
    onCustomPress || inModal || inEphemeralPane
      ? baseProps
      : {
          ...baseProps,
          accessibilityRole: 'link',
          href,
        };

  if (skipLinkBehaviourIfPressIsDefined && onCustomPress) {
    children({ onPress: onCustomPress });
  }

  return children(childrenProps);
}
