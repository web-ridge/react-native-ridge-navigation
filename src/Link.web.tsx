import * as React from 'react';
import type { BaseScreen, LinkProps, LinkRenderProps } from './navigationUtils';

import type { MouseEvent, GestureResponderEvent } from 'react-native';
import useNavigation from './useNavigation';
import { isStalePreload, shouldHandleWebLinkPress } from './Link.shared';
import { generatePath } from './navigationUtils';
import useModal from './useModal';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import useBottomTabIndex from './useBottomTabIndex';
import {
  intentPreloadDelayMs,
  intentPreloadStaleMs,
  isFreshPreload,
} from './screenReadiness';

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
  const { basePath, preloadedCache, preloadedAt, rootNavigator } =
    React.useContext(RidgeNavigationContext);
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
  const intentTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // When this path was last preloaded by anyone: every Link to the same
  // screen shares it, so two links (or repeated hovers) preload once.
  const lastPreloadedAt = React.useCallback(
    () => (preloadedCache[preloadPath] ? preloadedAt?.[preloadPath] : null),
    [preloadedCache, preloadedAt, preloadPath]
  );

  // Press: preload again unless the last preload is younger than the press
  // window (Link.shared isStalePreload), so a click opens fresh data.
  const preloadData = React.useCallback(() => {
    if (!isStalePreload(lastPreloadedAt())) {
      return;
    }
    preload(to, params);
  }, [lastPreloadedAt, preload, to, params]);

  // Intent (hover/focus): reuse a preload for longer, see intentPreloadStaleMs.
  const preloadIntent = React.useCallback(() => {
    preloadElement(to);
    if (isFreshPreload(lastPreloadedAt(), intentPreloadStaleMs)) {
      return;
    }
    preload(to, params);
  }, [preloadElement, lastPreloadedAt, preload, to, params]);

  const cancelIntent = React.useCallback(() => {
    if (intentTimer.current) {
      clearTimeout(intentTimer.current);
      intentTimer.current = null;
    }
  }, []);

  const startIntent = React.useCallback(() => {
    cancelIntent();
    intentTimer.current = setTimeout(() => {
      intentTimer.current = null;
      preloadIntent();
    }, intentPreloadDelayMs);
  }, [cancelIntent, preloadIntent]);

  React.useEffect(() => cancelIntent, [cancelIntent]);

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

      if (shouldHandleWebLinkPress(event, nativeEvent)) {
        event.preventDefault();
        cancelIntent();
        const options = {
          preload: isStalePreload(lastPreloadedAt()),
          toBottomTab,
          fullScreen,
          waitUntilReady: true,
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
      cancelIntent,
      toBottomTab,
      isRefreshInsteadOfPush,
      isReplaceInsteadOfPush,
      refresh,
      to,
      params,
      lastPreloadedAt,
      replace,
      push,
      fullScreen,
    ]
  );

  // 'default': hover/focus preloads code + data after a short rest (intent),
  // press preloads right away as a fallback (keyboard, touch, fast clicks).
  // 'sensitive': hover preloads code + data immediately (pickers).
  // 'press': hover preloads only the code, data waits for the press (opt-out
  // for links whose data is expensive to fetch speculatively).
  const onPressInExternal = rest?.onPressIn;
  const onPressIn = React.useCallback(
    (e: GestureResponderEvent) => {
      cancelIntent();
      preloadElement(to);
      preloadData();
      onPressInExternal?.(e);
    },
    [cancelIntent, preloadElement, to, preloadData, onPressInExternal]
  );

  const onHoverInExternal = rest?.onHoverIn;
  const onHoverIn = React.useCallback(
    (e: MouseEvent) => {
      if (linkMode === 'sensitive') {
        preloadIntent();
      } else if (linkMode === 'press') {
        preloadElement(to);
      } else {
        startIntent();
      }
      onHoverInExternal?.(e);
    },
    [
      linkMode,
      preloadIntent,
      preloadElement,
      to,
      startIntent,
      onHoverInExternal,
    ]
  );

  const onHoverOutExternal = rest?.onHoverOut;
  const onHoverOut = React.useCallback(
    (e: MouseEvent) => {
      cancelIntent();
      onHoverOutExternal?.(e);
    },
    [cancelIntent, onHoverOutExternal]
  );

  const onFocusExternal = rest?.onFocus;
  const onFocus = React.useCallback(
    (e: any) => {
      if (linkMode !== 'press') {
        startIntent();
      }
      onFocusExternal?.(e);
    },
    [linkMode, startIntent, onFocusExternal]
  );

  const onBlurExternal = rest?.onBlur;
  const onBlur = React.useCallback(
    (e: any) => {
      cancelIntent();
      onBlurExternal?.(e);
    },
    [cancelIntent, onBlurExternal]
  );

  let baseProps: LinkRenderProps = {
    onPressIn,
    onHoverIn,
    onHoverOut,
    onFocus,
    onBlur,
    onPress,
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
