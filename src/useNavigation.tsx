import * as React from 'react';
import {
  BaseScreen,
  BottomTabType,
  ExtractRouteParams,
  getScreenKey,
} from './navigationUtils';
import useCurrentRoot from './useCurrentRoot';
import OptimizedContext from './contexts/OptimizedContext';
import useBottomTabIndex from './useBottomTabIndex';
import { Platform } from 'react-native';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';

type NavigateOptions = {
  preload?: boolean;
  toBottomTab?: BottomTabType;
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
  const { navigationRoot } = React.useContext(RidgeNavigationContext);

  const { currentRootKey, currentRoot } = useCurrentRoot();
  const { currentTab, switchToTab } = useBottomTabIndex();

  const preload = React.useCallback(
    async <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>
    ) => {
      preloadScreen(screen, params);
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

      // on web, it works based on url but on mobile it works based on bottom tab index
      if (options?.toBottomTab && Platform.OS !== 'web') {
        switchToTab(options.toBottomTab);
      } else {
        const screenKey = getScreenKey(
          currentRootKey!,
          options?.toBottomTab || currentTab,
          screen.path
        );
        stateNavigator.navigate(screenKey, params, historyAction);
      }
    },
    [currentRootKey, currentTab, stateNavigator, preload, switchToTab]
  );

  const push = React.useCallback(
    <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      options?: NavigateOptions
    ) => {
      innerNavigate(screen, params, options);
    },
    [innerNavigate]
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
      const screenKey = getScreenKey(
        currentRootKey!,
        options?.toBottomTab || currentTab,
        screen.path
      );
      const url = stateNavigator
        .fluent(true)
        .navigateBack(1)
        .navigate(screenKey, params).url;
      stateNavigator.navigateLink(url);
    },
    [currentRootKey, currentTab, preload, stateNavigator]
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
  };
}
