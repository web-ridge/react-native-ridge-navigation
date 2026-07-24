import * as React from 'react';
import { StateNavigator } from 'navigation';
import {
  BackHandler,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { NavigationHandler } from 'navigation-react';
import NavigationStack from './navigation/NavigationStack';
import NavigationBar from './navigation/NavigationBar';
import OptimizedContext, {
  OptimizedContextProvider,
} from './contexts/OptimizedContext';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import FullScreenPushContext from './contexts/FullScreenPushContext';
import SplitPaneContext from './contexts/SplitPaneContext';
import useLatest from './useLatest';
import useCurrentRoot from './useCurrentRoot';
import useBottomTabIndex from './useBottomTabIndex';
import {
  createNormalRoot,
  generatePath,
  getScreenKey,
  makeVariablesNavigationFriendly,
  rootKeyAndPaths,
} from './navigationUtils';

export type SplitViewProps = {
  children: any;
  /**
   * Rendered in the detail pane when nothing is selected yet.
   */
  detailPlaceholder?: React.ReactNode;
  /**
   * Below this width the SplitView renders only the master (children) and
   * pushes go to the main navigator, exactly like without a SplitView.
   */
  breakingPointWidth?: number;
  masterWidth?: number;
  masterStyle?: StyleProp<ViewStyle>;
  detailStyle?: StyleProp<ViewStyle>;
  /**
   * When set, the master column mounts its OWN native navigation bar
   * (iPad-Mail style) scoped to the master column width. The master is a
   * single, non-pushing scene, so — unlike the detail pane — an embedded
   * native stack at partial width is safe here: it never pushes, so the
   * new-architecture partial-width push limitation does not apply.
   *
   * Native only (iOS/Android). On web this is ignored; render your own header.
   */
  masterTitle?: string;
  /** Large-title (native collapse on scroll). Defaults to true. */
  masterLargeTitle?: boolean;
  /**
   * Native bar content for the master's scoped navigation bar — pass a
   * `<RightBar>`/`<LeftBar>` of `<BarButton>`s (SF Symbols / systemItems).
   * Native only; ignored when `masterTitle` is unset or on web.
   */
  masterActions?: React.ReactNode;
  /**
   * Opt in to making the detail SELECTION part of navigation state. When set to
   * a query-param name (e.g. `"detail"`), selecting a detail from the master:
   *
   *  - reflects the selection in the URL of the MAIN navigator as a query param
   *    (`…/overview?detail=post/1`), so it is deep-linkable and restored on a
   *    cold reload,
   *  - records it as a real entry on the MAIN navigator's single history
   *    timeline, so browser Back/Forward (web) and the native back gesture step
   *    back through selections — no second history stack to fight the main one.
   *
   * The detail pane becomes a pure mirror of that URL: it re-derives itself
   * whenever the selection query changes (row tap, Back, Forward, deep link).
   *
   * Unset (default) keeps the original history-less behaviour exactly: the pane
   * is a private selection with no URL/history footprint. Fully backward
   * compatible.
   */
  selectionParam?: string;
};

/**
 * Master/detail split view (iPad Mail style) for wide screens.
 *
 * The master (children) keeps rendering in its own scene; every push made
 * from inside it lands in the detail pane on the right, which is backed by a
 * second, history-less StateNavigator rendering a real native stack on
 * Android/iOS and a NavigationMotion stack on web. Pushes from within the
 * detail pane stack deeper into the pane; a push from the master replaces the
 * current selection instead of stacking on top of it.
 *
 * On narrow screens children render as-is and navigation behaves exactly as
 * it does today (full-screen pushes on the main stack).
 */
export default function SplitView({
  children,
  detailPlaceholder,
  breakingPointWidth = 700,
  masterWidth = 360,
  masterStyle,
  detailStyle,
  masterTitle,
  masterLargeTitle,
  masterActions,
  selectionParam,
}: SplitViewProps) {
  // Seed from the window width (available synchronously) so the split renders on
  // first paint instead of null-until-onLayout — no blank flash, and it works in
  // throttled/background tabs where onLayout can be deferred. onLayout then
  // refines with the true container width near the breakpoint.
  const windowWidth = useWindowDimensions().width;
  const [width, setWidth] = React.useState<number>(windowWidth);
  const isWide = width >= breakingPointWidth;
  return (
    <View
      style={styles.root}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {isWide ? (
        <WideSplitView
          detailPlaceholder={detailPlaceholder}
          masterWidth={masterWidth}
          masterStyle={masterStyle}
          detailStyle={detailStyle}
          masterTitle={masterTitle}
          masterLargeTitle={masterLargeTitle}
          masterActions={masterActions}
          selectionParam={selectionParam}
        >
          {children}
        </WideSplitView>
      ) : (
        children
      )}
    </View>
  );
}

function WideSplitView({
  children,
  detailPlaceholder,
  masterWidth,
  masterStyle,
  detailStyle,
  masterTitle,
  masterLargeTitle,
  masterActions,
  selectionParam,
}: Omit<SplitViewProps, 'breakingPointWidth'>) {
  const id = React.useId();
  const rootKey = 'splitViewProvider_' + id.replace(/:/g, '--');
  const ridge = React.useContext(RidgeNavigationContext);
  const outerOptimized = React.useContext(OptimizedContext);
  const { screens, navigationRoot, SuspenseContainer } = ridge;
  const theme = outerOptimized.theme;
  const detailPlaceholderRef = useLatest(detailPlaceholder);

  // Full-screen push (Demo G): pushes on the MAIN navigator that the split
  // itself lives in, so the pushed screen escapes the split and presents at
  // full width (native full-screen push / normal web route), with a back that
  // returns to the split. Captured here because at this point the context still
  // holds the main navigator (before the split overrides it below).
  const mainNavigator = outerOptimized.stateNavigator;
  const { preloadScreen } = outerOptimized;
  const { currentRootKey } = useCurrentRoot();
  const { currentTab } = useBottomTabIndex();

  // In-app back for selectionParam mode. The selection (and any deeper drill
  // pushed inside the detail pane) lives on the MAIN navigator's history as
  // `refresh(..., 'add')` data entries — same state, changing query. Browser
  // Back walks them via the History API; `mainNavigator.navigateBack` walks the
  // CRUMB trail instead and would jump out of the split entirely. So in-app back
  // must replicate a browser history back: step the History API on web (the
  // detail pane re-derives from the resulting URL). Native falls back to the
  // crumb navigator (best-effort; browser-history back is web-only).
  // The applied selection hrefs, oldest→newest, mirroring the main navigator's
  // selection history (undefined = the placeholder / no selection). Maintained
  // by the URL-mirror effect below; consumed by `paneGoBack` so in-app back is
  // a synchronous state step rather than an async `window.history.go(-1)`.
  const selectionStackRef = React.useRef<Array<string | undefined>>([]);
  const paneCanGoBack = React.useCallback(() => {
    const data: any = mainNavigator.stateContext.data ?? {};
    const hasSelection = selectionParam && data[selectionParam] != null;
    return Boolean(hasSelection) || mainNavigator.canNavigateBack(1);
  }, [mainNavigator, selectionParam]);
  const paneGoBack = React.useCallback(
    (n = 1) => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Step the recorded selection history SYNCHRONOUSLY with a single
        // `refresh('replace')` (URL + pane update in one commit). An async
        // `window.history.go(-n)` leaves a window in which a concurrent
        // re-render's `replaceState` (e.g. from a save mutation's refetch) can
        // rewrite the URL back to the screen we are leaving, stranding the pane.
        if (selectionParam) {
          const stack = selectionStackRef.current;
          const targetIndex = stack.length - 1 - n;
          if (targetIndex >= 0) {
            const targetHref = stack[targetIndex];
            const next: any = { ...(mainNavigator.stateContext.data ?? {}) };
            if (targetHref != null) {
              next[selectionParam] = targetHref;
            } else {
              delete next[selectionParam];
            }
            mainNavigator.refresh(next, 'replace');
            return;
          }
        }
        window.history.go(-n);
        return;
      }
      if (mainNavigator.canNavigateBack(n)) {
        mainNavigator.navigateBack(n);
      }
    },
    [mainNavigator, selectionParam]
  );
  const fullScreenPush = React.useCallback(
    (screen: any, params: any, options?: { preload?: boolean }) => {
      if (options?.preload) {
        preloadScreen(screen, params);
      }
      const screenKey = getScreenKey(currentRootKey!, currentTab, screen.path);
      mainNavigator.navigate(screenKey, params, 'add');
    },
    [mainNavigator, preloadScreen, currentRootKey, currentTab]
  );

  const detailNavigator = React.useMemo(() => {
    const stateInfos = [
      {
        key: rootKey,
        route: rootKey,
        trackCrumbTrail: false,
        renderScene: () => null,
        preloadId: rootKey,
      },
      ...screens.map((screen) => ({
        key: rootKeyAndPaths(rootKey, screen.path),
        route: makeVariablesNavigationFriendly(
          rootKeyAndPaths(rootKey, screen.path)
        ),
        renderScene: () => (
          <SuspenseContainer>
            <screen.element />
          </SuspenseContainer>
        ),
        trackCrumbTrail: true,
        screen,
        preloadId: screen.path,
      })),
    ];

    const navigator = new StateNavigator(stateInfos as any);
    navigator.historyManager.disabled = true;
    navigator.historyManager.stop();
    navigator.navigate(rootKey);
    return navigator;
  }, [SuspenseContainer, rootKey, screens]);

  // Encode a pane route key + params (what a master row push carries) into the
  // compact href stored in the main URL, e.g. key `…/post/:id` + {id:'1'} ->
  // `post/1`. The href is relative to the pane rootKey so the reverse is just
  // `rootKey + '/' + href`.
  const encodeSelectionHref = React.useCallback(
    (key: string, params?: any) => {
      const template = key.startsWith(rootKey + '/')
        ? key.slice(rootKey.length + 1)
        : key;
      return generatePath(template, params ?? {});
    },
    [rootKey]
  );

  // URL-mirror apply intent: master row taps REPLACE the detail selection
  // (Mail: open another message). Pushes from INSIDE the detail STACK on top
  // (Settings: drill into a sub-form). Browser Back/Forward leave intent null
  // and re-derive from the pane crumb trail or a replace.
  const applyIntentRef = React.useRef<'replace' | 'push' | null>(null);

  // Pushes from the master column select a new detail: they reset the pane to
  // [root, detail] instead of stacking on whatever was selected before.
  //
  // With `selectionParam`, selection instead flows through the MAIN navigator:
  // a row push records the selection as a query param on the current main URL
  // (history 'add'), and the pane is re-derived from that URL by the effect
  // below. That keeps ONE history timeline (URL + browser/native Back) and
  // avoids the pane driving itself out of sync with the URL.
  const masterNavigator = React.useMemo(() => {
    const selectViaUrl = (key: string, params?: any) => {
      applyIntentRef.current = 'replace';
      const href = encodeSelectionHref(key, params);
      const currentData = mainNavigator.stateContext.data ?? {};
      mainNavigator.refresh(
        { ...currentData, [selectionParam as string]: href },
        'add'
      );
    };
    const selectDetail = (key: string, params?: any) => {
      const fluentNavigator = new StateNavigator(detailNavigator)
        .fluent()
        .navigate(rootKey)
        .navigate(key, params);
      detailNavigator.navigateLink(fluentNavigator.url);
    };
    return new Proxy(detailNavigator, {
      get(target: any, prop) {
        if (prop === 'navigate') {
          return selectionParam ? selectViaUrl : selectDetail;
        }
        // In selectionParam mode the selection (and any deeper drill pushed
        // inside the detail pane) lives on the MAIN navigator's history. In-app
        // back (BackLink/pop) must therefore step through that history — the
        // pane re-derives from the resulting URL — so Terug matches browser Back
        // and actually deselects instead of no-opping on the history-less pane.
        if (selectionParam && prop === 'navigateBack') {
          return paneGoBack;
        }
        if (selectionParam && prop === 'canNavigateBack') {
          return () => paneCanGoBack();
        }
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    }) as StateNavigator;
  }, [
    detailNavigator,
    rootKey,
    selectionParam,
    mainNavigator,
    encodeSelectionHref,
    paneGoBack,
    paneCanGoBack,
  ]);

  // Detail-pane proxy: drills STACK on top of the current selection (and still
  // record a main-URL history entry when selectionParam is set). Distinct from
  // masterNavigator, which always replaces.
  const detailStackNavigator = React.useMemo(() => {
    const stackViaUrl = (key: string, params?: any) => {
      applyIntentRef.current = 'push';
      const href = encodeSelectionHref(key, params);
      const currentData = mainNavigator.stateContext.data ?? {};
      mainNavigator.refresh(
        { ...currentData, [selectionParam as string]: href },
        'add'
      );
    };
    return new Proxy(detailNavigator, {
      get(target: any, prop) {
        if (prop === 'navigate') {
          return selectionParam
            ? stackViaUrl
            : (key: string, params?: any) =>
                detailNavigator.navigate(key, params);
        }
        if (selectionParam && prop === 'navigateBack') {
          return paneGoBack;
        }
        if (selectionParam && prop === 'canNavigateBack') {
          return () => paneCanGoBack();
        }
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    }) as StateNavigator;
  }, [
    detailNavigator,
    selectionParam,
    mainNavigator,
    encodeSelectionHref,
    paneGoBack,
    paneCanGoBack,
  ]);

  // URL-mirror: when `selectionParam` is set the pane is a pure function of the
  // main navigator's `?<selectionParam>=` query. Re-derive the pane whenever the
  // main navigator navigates (row tap -> refresh, browser Back/Forward, native
  // back, deep-link/cold-load), so the selection is deep-linkable and
  // back-navigable through the single main history timeline.
  //
  // Master taps REPLACE the pane (fluent reset → one screen). Detail drills
  // STACK (navigate on top of the existing crumb trail) so screens sit on top
  // of each other — iOS Settings style — while still being URL-history-backed.
  const appliedHrefRef = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    if (!selectionParam) {
      return undefined;
    }
    const replacePaneSelection = (key: string, params?: any) => {
      const fluentNavigator = new StateNavigator(detailNavigator)
        .fluent()
        .navigate(rootKey)
        .navigate(key, params);
      detailNavigator.navigateLink(fluentNavigator.url);
    };
    const hrefOfScene = (state: any, data: any) => {
      if (!state?.key || state.key === rootKey) {
        return undefined;
      }
      return encodeSelectionHref(state.key, data);
    };
    const syncPaneFromUrl = () => {
      const href: string | undefined =
        mainNavigator.stateContext.data?.[selectionParam];
      // Keep the selection-history stack in step with the URL so in-app back can
      // step it synchronously (see paneGoBack). Every navigation funnels through
      // here: an href already present below the top means we moved back to it
      // (truncate to it); a new href is a push.
      const stack = selectionStackRef.current;
      if (stack.length === 0 || stack[stack.length - 1] !== href) {
        let existing = -1;
        for (let i = stack.length - 1; i >= 0; i -= 1) {
          if (stack[i] === href) {
            existing = i;
            break;
          }
        }
        if (existing === -1) {
          stack.push(href);
        } else {
          stack.length = existing + 1;
        }
      }
      // Already reflecting this selection? Avoid a redundant pane re-render.
      if (appliedHrefRef.current === href) {
        applyIntentRef.current = null;
        return;
      }
      const intent = applyIntentRef.current;
      applyIntentRef.current = null;
      appliedHrefRef.current = href;
      if (!href) {
        // No selection in the URL -> pane shows its placeholder.
        if (detailNavigator.stateContext.state?.key !== rootKey) {
          detailNavigator.navigate(rootKey);
        }
        return;
      }
      const targetUrl = rootKey + '/' + href;
      let parsed: { state?: any; data?: any } | null = null;
      try {
        parsed = detailNavigator.parseLink(targetUrl);
        if (parsed?.state?.screen) {
          preloadScreen(parsed.state.screen, parsed.data);
        }
      } catch {
        // Unresolvable href (stale/foreign link) -> fall back to placeholder.
        detailNavigator.navigate(rootKey);
        return;
      }
      if (!parsed?.state) {
        detailNavigator.navigate(rootKey);
        return;
      }

      // Detail drill: stack the new screen on top of the current crumb trail so
      // the previous detail stays mounted underneath (real navigation stack).
      if (intent === 'push') {
        detailNavigator.navigate(parsed.state.key, parsed.data);
        return;
      }

      // Browser Back/Forward (or in-app back): if the target is already in the
      // pane crumb trail, pop to it so stacked screens unmount correctly.
      if (intent == null) {
        const { crumbs, state, data } = detailNavigator.stateContext;
        const scenes = [
          ...crumbs.map((c) => ({ state: c.state, data: c.data })),
          ...(state ? [{ state, data }] : []),
        ];
        let backDistance = -1;
        for (let i = scenes.length - 1; i >= 0; i -= 1) {
          if (hrefOfScene(scenes[i]!.state, scenes[i]!.data) === href) {
            backDistance = scenes.length - 1 - i;
            break;
          }
        }
        if (backDistance === 0) {
          return;
        }
        if (backDistance > 0) {
          detailNavigator.navigateBack(backDistance);
          return;
        }
      }

      // Master selection / cold deep-link / unknown history step: reset the
      // pane to [root, selection] so peer picks do not stack under each other.
      replacePaneSelection(parsed.state.key, parsed.data);
    };
    // Initial derive (deep-link / cold load) + subscribe to future changes.
    syncPaneFromUrl();
    mainNavigator.onNavigate(syncPaneFromUrl);
    return () => mainNavigator.offNavigate(syncPaneFromUrl);
  }, [
    selectionParam,
    mainNavigator,
    detailNavigator,
    rootKey,
    preloadScreen,
    encodeSelectionHref,
  ]);

  const navigationRootWithSplit = React.useMemo(
    () => ({
      [rootKey]: createNormalRoot({
        path: rootKey,
        preload: () => {},
        element: EmptyElement as any,
      }),
      ...navigationRoot,
    }),
    [navigationRoot, rootKey]
  );

  const splitRidgeValue = React.useMemo(
    () => ({
      ...ridge,
      rootNavigator: detailNavigator,
      navigationRoot: navigationRootWithSplit,
    }),
    [ridge, detailNavigator, navigationRootWithSplit]
  );

  const masterOptimizedValue = React.useMemo(
    () => ({
      ...outerOptimized,
      rootNavigator: detailNavigator,
      stateNavigator: masterNavigator,
    }),
    [outerOptimized, detailNavigator, masterNavigator]
  );

  // The detail pane's stack is invisible to the Android system back button,
  // so handle it here before letting the main stack take over.
  React.useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // selectionParam mode: the selection lives on the MAIN navigator's
        // history, so step IT back (the pane re-derives from the URL). Popping
        // the pane directly would just be undone by the URL-mirror effect.
        if (selectionParam) {
          const data: any = mainNavigator.stateContext.data ?? {};
          if (data[selectionParam] == null) {
            return false;
          }
          if (mainNavigator.canNavigateBack(1)) {
            mainNavigator.navigateBack(1);
          } else {
            // Only selection on the stack (nothing to go back to) -> clear it
            // so back returns to the empty/placeholder pane.
            const rest = { ...data };
            delete rest[selectionParam];
            mainNavigator.refresh(rest, 'replace');
          }
          return true;
        }
        if (detailNavigator.canNavigateBack(1)) {
          detailNavigator.navigateBack(1);
          return true;
        }
        return false;
      }
    );
    return () => subscription.remove();
  }, [detailNavigator, selectionParam, mainNavigator]);

  const renderPlaceholder = () => detailPlaceholderRef.current ?? null;

  return (
    <FullScreenPushContext.Provider value={fullScreenPush}>
      <View style={styles.row}>
        <RidgeNavigationContext.Provider value={splitRidgeValue}>
          <OptimizedContext.Provider value={masterOptimizedValue}>
            {/* Master list column — role lets product chrome hide auto-Back and
                lets entity lists drop nested SplitViews. */}
            <SplitPaneContext.Provider value="master">
              <View
                style={[styles.master, { width: masterWidth }, masterStyle]}
              >
                {Platform.OS !== 'web' && masterTitle != null ? (
                  <MasterPaneScene
                    title={masterTitle}
                    largeTitle={masterLargeTitle ?? true}
                    backgroundColor={theme.layout.backgroundColor}
                    actions={masterActions}
                  >
                    {children}
                  </MasterPaneScene>
                ) : (
                  children
                )}
              </View>
            </SplitPaneContext.Provider>
          </OptimizedContext.Provider>
          <SplitPaneContext.Provider value="detail">
            <View style={[styles.detail, detailStyle]}>
              {/*
               * JS scene stack on every platform (including web). An embedded
               * NavigationMotion stack was unreliable for history-less pane
               * navigators — master→detail selection worked inconsistently and
               * drills from inside the detail (invoice → contact, approval →
               * hour) never stacked screens on top of each other. PaneScenes
               * keeps every crumb mounted (scroll state survives) and the top
               * scene interactive, matching native.
               *
               * Pushes from inside the detail use `detailStackNavigator` so a
               * drill becomes a stacked pane scene + a main-URL history entry
               * (deep-linkable + Back/Terug) rather than replacing the pane.
               * NavigationHandler keeps ambient NavigationContext on the pane
               * when selectionParam is unset.
               */}
              <NavigationHandler stateNavigator={detailNavigator}>
                <DetailPaneScenes
                  navigator={detailNavigator}
                  rootKey={rootKey}
                  renderPlaceholder={renderPlaceholder}
                  backgroundColor={theme.layout.backgroundColor}
                  linkNavigator={
                    selectionParam ? detailStackNavigator : undefined
                  }
                />
              </NavigationHandler>
            </View>
          </SplitPaneContext.Provider>
        </RidgeNavigationContext.Provider>
      </View>
    </FullScreenPushContext.Provider>
  );
}

/**
 * Hosts the master column inside its OWN one-scene native navigation stack so
 * the UINavigationBar lays out in the master column's bounds (see
 * NVNavigationStackView `layoutSubviews`, which sets the embedded
 * UINavigationController's view frame to the RN view bounds). Because the scene
 * never pushes — master row taps drive the DETAIL navigator instead — the
 * partial-width push limitation that forces the detail pane onto a JS fallback
 * does not apply here.
 */
function MasterPaneScene({
  children,
  title,
  largeTitle,
  backgroundColor,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  largeTitle: boolean;
  backgroundColor: any;
  actions?: React.ReactNode;
}) {
  const sceneNavigator = React.useMemo(() => {
    const navigator = new StateNavigator([
      { key: 'master', route: 'master', trackCrumbTrail: false },
    ]);
    navigator.historyManager.disabled = true;
    navigator.historyManager.stop();
    navigator.navigate('master');
    return navigator;
  }, []);

  return (
    <NavigationHandler stateNavigator={sceneNavigator}>
      <NavigationStack
        underlayColor={backgroundColor}
        backgroundColor={() => backgroundColor}
        //@ts-ignore - renderScene signature comes from navigation-react-native
        renderScene={() => (
          <>
            <NavigationBar hidden={false} title={title} largeTitle={largeTitle}>
              {actions}
            </NavigationBar>
            {/*
             * Bound the master content to the scene so its scroll view has a
             * finite height. Without this the list lays out at its full content
             * height (clipped by the master column's overflow:hidden): it can't
             * scroll, and UIKit never finds a collapsible content scroll view,
             * so the large title stays permanently expanded.
             */}
            <View style={styles.masterContent}>{children}</View>
          </>
        )}
      />
    </NavigationHandler>
  );
}

function DetailPaneScenes({
  navigator,
  rootKey,
  renderPlaceholder,
  backgroundColor,
  linkNavigator,
}: {
  navigator: StateNavigator;
  rootKey: string;
  renderPlaceholder: () => React.ReactNode;
  backgroundColor: any;
  /** When set (selectionParam mode), Links/pushes inside the rendered detail
   *  scenes route through this navigator instead of the ambient one, so a drill
   *  deeper into the pane becomes a main-navigator URL entry (deep-linkable +
   *  back-navigable) rather than a private, history-less pane push. */
  linkNavigator?: StateNavigator;
}) {
  const [stateContext, setStateContext] = React.useState<
    StateNavigator['stateContext']
  >(() => navigator.stateContext);
  React.useEffect(() => {
    const handler = () => setStateContext(navigator.stateContext);
    navigator.onNavigate(handler);
    return () => navigator.offNavigate(handler);
  }, [navigator]);

  const scenes = [
    ...stateContext.crumbs.map((crumb) => ({
      state: crumb.state,
      data: crumb.data,
    })),
    ...(stateContext.state
      ? [{ state: stateContext.state, data: stateContext.data }]
      : []),
  ];

  return (
    <View style={[styles.paneScenes, { backgroundColor }]}>
      {scenes.map((scene, index) => {
        const isTop = index === scenes.length - 1;
        return (
          <View
            key={`${scene.state.key}-${index}`}
            style={[StyleSheet.absoluteFill, { backgroundColor }]}
            pointerEvents={isTop ? 'auto' : 'none'}
          >
            <OptimizedContextProvider
              state={scene.state}
              data={scene.data}
              stateNavigatorOverride={linkNavigator}
            >
              {scene.state.key === rootKey
                ? renderPlaceholder()
                : scene.state.renderScene()}
            </OptimizedContextProvider>
          </View>
        );
      })}
    </View>
  );
}

function EmptyElement() {
  return null;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  master: {
    overflow: 'hidden',
  },
  masterContent: {
    flex: 1,
  },
  paneScenes: {
    flex: 1,
    overflow: 'hidden',
  },
  detail: {
    flex: 1,
    overflow: 'hidden',
  },
});
