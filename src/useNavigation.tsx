import { buildReplaceUrl, isPaneNavigatorProxy } from './replaceUrl';
import * as React from 'react';
import {
  type BaseScreen,
  type BottomTabType,
  type ExtractRouteParams,
  generatePath,
  getScreenKey,
} from './navigationUtils';
import useCurrentRoot from './useCurrentRoot';
import OptimizedContext from './contexts/OptimizedContext';
import { useBottomTabActions } from './useBottomTabIndex';
import { Platform } from 'react-native';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import { useFullScreenPush } from './contexts/FullScreenPushContext';
import { getRootPreloadScreens } from './rootPreloadPolicy';
import {
  commitWhenReady,
  NavigationTransitionContext,
} from './navigationTransition';

type NavigateOptions = {
  /**
   * Run the screen's preload before navigating, so data fetching overlaps the
   * transition instead of starting after it. Defaults to true — a screen that
   * suspends without a preload renders an empty scene on native. Pass false
   * only when the target screen must not fetch (for example, a screen whose
   * preload would clobber state the caller just prepared).
   */
  preload?: boolean;
  toBottomTab?: BottomTabType;
  /**
   * Escape an enclosing SplitView / TripleSplitView: push FULL-SCREEN over the
   * whole split via the main navigator instead of landing in the detail pane.
   * No-op outside a split (falls back to a normal push).
   */
  fullScreen?: boolean;
  /**
   * Web: keep the current screen until the destination's code and preloaded
   * data are ready (at most the provider's `pendingMs`), then commit in a
   * transition. `Link` sets this; a programmatic call (after a mutation, a
   * redirect) commits right away unless it opts in, so a form that just saved
   * never lingers with a live submit button.
   */
  waitUntilReady?: boolean;
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
  const { fluent, navigationRoot, preloadedCache, whenScreenReady } =
    React.useContext(RidgeNavigationContext);
  const transition = React.useContext(NavigationTransitionContext);
  const fullScreenPush = useFullScreenPush();

  const { currentRootKey, currentRoot } = useCurrentRoot();
  const { getCurrentTab, switchToTab } = useBottomTabActions();

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
      const root = navigationRoot[rootKey];
      if (preloadSetting && root) {
        getRootPreloadScreens(root, { includeInitialTab: true }).forEach(
          (screen) => {
            preloadElement(screen);
            preloadScreen(screen, {});
          }
        );
      }

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
    [navigationRoot, preloadElement, preloadScreen, rootNavigator]
  );

  /**
   * Web + `waitUntilReady`: run `commit` (the actual navigate) as a
   * transition once the screen's code and preloaded data are ready, capped at
   * `transition.pendingMs`, so the current screen stays until the next one
   * can render. Only the latest navigation commits: a second click while the
   * first still waits wins. Everything else commits right away, as before;
   * on native UIKit pushes immediately and the destination shows its own
   * Suspense fallback.
   */
  const navigateWhenReady = React.useCallback(
    <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      options: NavigateOptions | undefined,
      commit: () => void
    ) => {
      const preloaded =
        (options?.preload ?? true)
          ? preloadScreen(screen, params)
          : preloadedCache?.[generatePath(screen.path, params)];
      if (Platform.OS !== 'web' || !options?.waitUntilReady) {
        // Also cancels a link navigation that is still waiting.
        transition.latest.current += 1;
        commit();
        return;
      }
      commitWhenReady(
        transition,
        whenScreenReady?.(screen, params, preloaded) ?? null,
        commit
      );
    },
    [preloadScreen, preloadedCache, transition, whenScreenReady]
  );

  const refresh = React.useCallback(
    <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      options?: NavigateOptions
    ) => {
      navigateWhenReady(screen, params, options, () =>
        stateNavigator.refresh(params, 'replace')
      );
    },
    [stateNavigator, navigateWhenReady]
  );

  const innerNavigate = React.useCallback(
    <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      options?: NavigateOptions,
      historyAction?: 'add' | 'replace' | 'none'
    ) => {
      navigateWhenReady(screen, params, options, () => {
        // on web, it works based on url but on mobile it also updates the
        // selected bottom tab index.
        if (options?.toBottomTab && Platform.OS !== 'web') {
          switchToTab(options.toBottomTab);
        }
        const screenKey = getScreenKey(
          currentRootKey!,
          options?.toBottomTab || getCurrentTab(),
          screen.path
        );
        stateNavigator.navigate(screenKey, params, historyAction);
      });
    },
    [
      currentRootKey,
      getCurrentTab,
      stateNavigator,
      navigateWhenReady,
      switchToTab,
    ]
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

  // The replacement itself, without preloading or waiting.
  const replaceNow = React.useCallback(
    <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      options?: NavigateOptions
    ) => {
      // on web, it works based on url but on mobile it also updates the
      // selected bottom tab index.
      if (options?.toBottomTab && Platform.OS !== 'web') {
        switchToTab(options.toBottomTab);
      }
      const screenKey = getScreenKey(
        currentRootKey!,
        options?.toBottomTab || getCurrentTab(),
        screen.path
      );
      // Split views proxy `navigate()` so the selected detail remains a pure
      // function of the main URL. Going through a locally-built fluent link on
      // web bypasses that proxy and can leave the pane empty while the address
      // bar still points at the replaced screen (for example /add after a
      // successful create). Let the proxy perform the replacement.
      // On native a pane with crumbs already took the crumb-preserving link
      // below, so only the cases that went through the proxy before still do.
      if (
        isPaneNavigatorProxy(stateNavigator) &&
        (Platform.OS === 'web' ||
          stateNavigator.stateContext.crumbs.length === 0)
      ) {
        stateNavigator.navigate(screenKey, params, 'replace');
        return;
      }
      // Everywhere else: keep the crumb trail and swap only the current scene.
      // A plain navigate(..., 'replace') would push the current scene onto the
      // crumb trail (see buildReplaceUrl).
      stateNavigator.navigateLink(
        buildReplaceUrl(stateNavigator, screenKey, params),
        'replace'
      );
    },
    [currentRootKey, getCurrentTab, stateNavigator, switchToTab]
  );

  const replace = React.useCallback(
    <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      options?: NavigateOptions
    ) => {
      navigateWhenReady(screen, params, options, () =>
        replaceNow(screen, params, options)
      );
    },
    [navigateWhenReady, replaceNow]
  );

  // Replace the whole stack of the current tab in ONE navigation: back to the
  // tab's first screen, then `screens` on top (the last one is shown). Back
  // then walks these screens, never the screens of a flow that just finished
  // (for example the steps of a wizard). Built from the real crumbs, so the
  // tab root is the state the user came from. Falls back to `replace` with
  // the last screen when the stack cannot be built.
  const resetTo = React.useCallback(
    (
      screens: { screen: BaseScreen; params: Record<string, unknown> }[],
      options?: { preload?: boolean; waitUntilReady?: boolean }
    ) => {
      const last = screens[screens.length - 1];
      if (!last) {
        return;
      }
      navigateWhenReady(
        last.screen,
        last.params as never,
        { preload: options?.preload, waitUntilReady: options?.waitUntilReady },
        () => {
          const tab = getCurrentTab();
          try {
            const { crumbs } = stateNavigator.stateContext;
            let link =
              crumbs.length > 0
                ? stateNavigator.fluent(true).navigateBack(crumbs.length)
                : stateNavigator.fluent(false);
            for (const { screen, params } of screens) {
              link = link.navigate(
                getScreenKey(currentRootKey!, tab, screen.path),
                params
              );
            }
            stateNavigator.navigateLink(link.url, 'replace');
          } catch (e) {
            console.log('[react-native-ridge-navigation] resetTo failed', e);
            replaceNow(last.screen, last.params as never);
          }
        }
      );
    },
    [
      currentRootKey,
      getCurrentTab,
      navigateWhenReady,
      replaceNow,
      stateNavigator,
    ]
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
    resetTo,
    refresh,
    theme,
    canNavigateBack,
    fluent,
  };
}
