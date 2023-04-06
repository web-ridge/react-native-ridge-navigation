import * as React from 'react';
import {
  BaseScreen,
  ExtractRouteParams,
  getScreenKey,
} from './navigationUtils';
import useCurrentRoot from './useCurrentRoot';
import OptimizedContext from './contexts/OptimizedContext';
import useBottomTabIndex from './useBottomTabIndex';

type NavigateOptions = {
  preload?: boolean;
  toBottomTab?: string;
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

  const { currentRootKey, currentRoot } = useCurrentRoot();
  const { currentTab } = useBottomTabIndex();

  // TODO: we don't always want this, sometimes we want to switch tabs
  const tabPath = currentTab ? currentTab.path : undefined;

  const preload = React.useCallback(
    async <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>
    ) => {
      const screenKey = getScreenKey(currentRootKey, tabPath, screen.path);
      preloadScreen(screenKey, screen.preload(params));
    },
    [preloadScreen, tabPath, currentRootKey]
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
      rootNavigator.start(rootKey);
      if (rootKey === currentRootKey) {
        stateNavigator.refresh({}, 'replace');
      }
    },
    [preloadRoot, rootNavigator, currentRootKey, stateNavigator]
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
      const screenKey = getScreenKey(
        currentRootKey!,
        options?.toBottomTab || tabPath,
        screen.path
      );
      stateNavigator.navigate(screenKey, params, historyAction);
    },
    [currentRootKey, tabPath, stateNavigator, preload]
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
        options?.toBottomTab || tabPath,
        screen.path
      );
      const url = stateNavigator
        .fluent(true)
        .navigateBack(1)
        .navigate(screenKey, params).url;
      stateNavigator.navigateLink(url);
    },
    [currentRootKey, tabPath, preload, stateNavigator]
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
