import * as React from 'react';
import {
  BaseScreen,
  BottomTabType,
  ExtractRouteParams,
  RootChildBottomTabs,
  rootKeyAndPath,
} from './navigationUtils';
import BottomTabContext from './contexts/BottomTabContext';
import useCurrentRoot from './useCurrentRoot';
import { useContext } from 'react';
import OptimizedContext from './contexts/OptimizedContext';

export default function useNavigation() {
  const {
    // data,
    rootNavigator,
    preloadRoot,
    preloadScreen,
    preloadElement,
    theme,
    stateNavigator,
  } = useContext(OptimizedContext);
  const { setBadge, setBottomTabIndex } = React.useContext(BottomTabContext);
  const { currentRootKey, currentRoot } = useCurrentRoot();

  const preload = React.useCallback(
    async <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>
    ) => {
      const screenKey = rootKeyAndPath(currentRootKey, screen.path);
      preloadScreen(screenKey, screen.preload(params));
    },
    [preloadScreen, currentRootKey]
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
      const distance = dist || 1;
      if (stateNavigator.canNavigateBack(distance)) {
        stateNavigator.navigateBack(distance);
      } else {
        console.log('can not navigate back');
      }
    },
    [stateNavigator]
  );

  const updateBadge = React.useCallback(
    <T extends BottomTabType>(tab: T, badge: string | number) => {
      setBadge(tab.path, badge);
    },
    [setBadge]
  );

  const switchRoot = React.useCallback(
    (rootKey: string, preload = true) => {
      if (preload) {
        preloadRoot(rootKey);
      }
      rootNavigator.start(rootKey);
    },
    [preloadRoot, rootNavigator]
  );

  const innerNavigate = React.useCallback(
    <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      doPreload = true,
      historyAction?: 'add' | 'replace' | 'none'
    ) => {
      if (doPreload) {
        preload(screen, params);
      }
      const screenKey = rootKeyAndPath(currentRootKey!, screen.path);
      stateNavigator.navigate(screenKey, params, historyAction);
    },
    [currentRootKey, stateNavigator, preload]
  );

  const push = React.useCallback(
    <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      doPreload = true
    ) => {
      innerNavigate(screen, params, doPreload);
    },
    [innerNavigate]
  );

  const replace = React.useCallback(
    <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      doPreload = true
    ) => {
      return innerNavigate(screen, params, doPreload, 'replace');
    },
    [innerNavigate]
  );

  const switchToTab = React.useCallback(
    async <T extends BottomTabType>(tab: T) => {
      setBottomTabIndex(
        (currentRoot as RootChildBottomTabs).children.findIndex(
          (child) => child.path === tab.path
        )
      );
    },
    [currentRoot, setBottomTabIndex]
  );
  return {
    currentRootKey,
    currentRoot,
    preloadElement,
    preloadRoot,
    preload,
    pop,
    popToTop,
    updateBadge,
    switchToTab,
    switchRoot,
    push,
    replace,
    theme,
    canNavigateBack,
  };
}
