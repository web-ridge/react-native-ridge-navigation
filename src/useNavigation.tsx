import * as React from 'react';
import {
  type BaseScreen,
  type BottomTabType,
  type ExtractRouteParams,
  getScreenKey,
} from './navigationUtils';
import useCurrentRoot from './useCurrentRoot';
import OptimizedContext from './contexts/OptimizedContext';
import useBottomTabIndex from './useBottomTabIndex';
import { Platform } from 'react-native';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import { useFullScreenPush } from './contexts/FullScreenPushContext';

type NavigateOptions = {
  preload?: boolean;
  toBottomTab?: BottomTabType;
  /**
   * Escape an enclosing SplitView / TripleSplitView: push FULL-SCREEN over the
   * whole split via the main navigator instead of landing in the detail pane.
   * No-op outside a split (falls back to a normal push).
   */
  fullScreen?: boolean;
};
export default function useNavigation() {
  const {
    rootNavigator,
    preloadRoot,
    preloadScreen,
    preloadElement,
    theme,
    stateNavigator,
  } = React.useContext(OptimizedContext);
  const { fluent, navigationRoot } = React.useContext(RidgeNavigationContext);
  const fullScreenPush = useFullScreenPush();

  const { currentRootKey, currentRoot } = useCurrentRoot();
  const { currentTab, switchToTab } = useBottomTabIndex();

  const preload = React.useCallback(
    async <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>
    ) => {
      return preloadScreen(screen, params);
    },
    [preloadScreen]
  );

  const canNavigateBack = React.useCallback(
    (dist?: number) => {
      return stateNavigator.canNavigateBack(dist || 1);
    },
    [stateNavigator]
  );

  const popToTop = React.useCallback(() => {
    const { crumbs } = stateNavigator.stateContext;
    stateNavigator.navigateBack(crumbs.length);
  }, [stateNavigator]);

  const pop = React.useCallback(
    (dist?: number) => {
      let distance = 1;
      if (typeof dist === 'number') {
        distance = dist;
      }

      if (stateNavigator.canNavigateBack(distance)) {
        stateNavigator.navigateBack(distance);
      } else {
        console.log('can not navigate back');
      }
    },
    [stateNavigator]
  );

  const switchRoot = React.useCallback(
    (rootKey: string, preloadSetting = true) => {
      if (preloadSetting) {
        preloadRoot(rootKey);
      }

      const root = navigationRoot[rootKey];
      const screenKey = Platform.select({
        web: getScreenKey(
          rootKey,
          root?.type === 'bottomTabs' ? root.children[0] : undefined,
          root?.type === 'bottomTabs'
            ? root.children[0]!.path
            : root?.child.path
        ),
        default: rootKey,
      });
      rootNavigator.start(screenKey);
    },
    [preloadRoot, navigationRoot, rootNavigator]
  );

  const refresh = React.useCallback(
    <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      options?: NavigateOptions
    ) => {
      if (options?.preload) {
        preload(screen, params);
      }
      stateNavigator.refresh(params, 'replace');
    },
    [stateNavigator, preload]
  );

  const innerNavigate = React.useCallback(
    <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      options?: NavigateOptions,
      historyAction?: 'add' | 'replace' | 'none'
    ) => {
      if (options?.preload) {
        preload(screen, params);
      }

      // on web, it works based on url but on mobile it also updates the
      // selected bottom tab index.
      if (options?.toBottomTab && Platform.OS !== 'web') {
        switchToTab(options.toBottomTab);
      }
      const screenKey = getScreenKey(
        currentRootKey!,
        options?.toBottomTab || currentTab,
        screen.path
      );
      stateNavigator.navigate(screenKey, params, historyAction);
    },
    [currentRootKey, currentTab, stateNavigator, preload, switchToTab]
  );

  const push = React.useCallback(
    <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      options?: NavigateOptions
    ) => {
      // Demo G — escape the split and present full-screen on the main navigator.
      if (options?.fullScreen && fullScreenPush) {
        fullScreenPush(screen, params, { preload: options.preload });
        return;
      }
      innerNavigate(screen, params, options, 'add');
    },
    [innerNavigate, fullScreenPush]
  );

  const replace = React.useCallback(
    <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      options?: NavigateOptions
    ) => {
      if (options?.preload) {
        preload(screen, params);
      }

      // on web, it works based on url but on mobile it also updates the
      // selected bottom tab index.
      if (options?.toBottomTab && Platform.OS !== 'web') {
        switchToTab(options.toBottomTab);
      }
      const screenKey = getScreenKey(
        currentRootKey!,
        options?.toBottomTab || currentTab,
        screen.path
      );
      const { crumbs } = stateNavigator.stateContext;
      if (crumbs.length > 0) {
        // Use fluent API to build URL that replaces current screen in the
        // crumb stack (navigateBack(1) + navigate), then apply with 'replace'
        // historyAction so the browser history entry is also replaced.
        const url = stateNavigator
          .fluent(true)
          .navigateBack(1)
          .navigate(screenKey, params).url;
        stateNavigator.navigateLink(url, 'replace');
      } else {
        // No crumbs (at root of stack) — just navigate with replace.
        stateNavigator.navigate(screenKey, params, 'replace');
      }
    },
    [currentRootKey, currentTab, preload, stateNavigator, switchToTab]
  );

  return {
    currentRootKey,
    currentRoot,
    preloadElement,
    preloadRoot,
    preload,
    pop,
    popToTop,
    switchRoot,
    push,
    replace,
    refresh,
    theme,
    canNavigateBack,
    fluent,
  };
}
