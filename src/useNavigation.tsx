import * as React from 'react';
import {
  BaseScreen,
  ExtractRouteParams,
  rootKeyAndPath,
} from './navigationUtils';
import useCurrentRoot from './useCurrentRoot';
import { useContext } from 'react';
import OptimizedContext from './contexts/OptimizedContext';

export default function useNavigation() {
  const {
    rootNavigator,
    preloadRoot,
    preloadScreen,
    preloadElement,
    theme,
    stateNavigator,
  } = useContext(OptimizedContext);

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
    theme,
    canNavigateBack,
  };
}
