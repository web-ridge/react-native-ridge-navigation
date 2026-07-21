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
import OptimizedContext, {
  OptimizedContextProvider,
} from './contexts/OptimizedContext';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import SplitPaneContext from './contexts/SplitPaneContext';
import HiddenNavbarWithSwipeBack from './HiddenNavbarWithSwipeBack';
import useLatest from './useLatest';
import {
  createNormalRoot,
  generatePath,
  makeVariablesNavigationFriendly,
  rootKeyAndPaths,
} from './navigationUtils';

export type TripleSplitViewProps = {
  /**
   * Column 1 — the primary sidebar (a source list / category nav). Pushes made
   * from inside it SELECT the middle column (they reset it to the pushed
   * screen), iPad Settings/Mail style.
   */
  sidebar: React.ReactNode;
  /** Shown in the middle column until the sidebar selects something. */
  masterPlaceholder?: React.ReactNode;
  /** Shown in the detail column until the middle column selects something. */
  detailPlaceholder?: React.ReactNode;
  /**
   * Below this width the whole thing collapses to just the sidebar; pushes go
   * to the main navigator (normal single-column stack), exactly like phones.
   */
  breakingPointWidth?: number;
  sidebarWidth?: number;
  masterWidth?: number;
  sidebarStyle?: StyleProp<ViewStyle>;
  masterStyle?: StyleProp<ViewStyle>;
  detailStyle?: StyleProp<ViewStyle>;
  /**
   * Health-app style: float the sidebar as an absolutely-positioned TRANSLUCENT
   * glass panel ON TOP of the content columns, instead of reserving a column to
   * its left. The middle/detail content then spans edge-to-edge from x=0, so a
   * colored/gradient background visibly bleeds UNDER the sidebar. Make the
   * sidebar surface translucent via `sidebarStyle` (and/or a native BlurView on
   * iOS / `backdrop-filter` on web) for the frosted-glass look. Default false.
   */
  floatingSidebar?: boolean;
  /**
   * Restore a previous middle/detail selection on mount — the hook that makes
   * the three columns deep-linkable. Paths are the registered `screen.path`
   * values (stable across reloads), NOT the internal per-instance pane keys.
   * The host typically reads these from the URL.
   */
  initialSelection?: TripleSelection;
  /**
   * Fires whenever the middle or detail selection changes, with the full
   * current selection expressed as stable `screen.path` + params. The host
   * writes this to the URL (query string / route params) so the columns become
   * shareable, bookmarkable links without the panes fighting the main
   * navigator for browser history.
   */
  onSelectionChange?: (selection: TripleSelection) => void;
  /**
   * Opt in to making the SIDEBAR→MIDDLE selection (which section is open) part
   * of navigation state. When set to a query-param name (e.g. `"section"`),
   * selecting a section from the sidebar:
   *
   *  - reflects the selection in the URL of the MAIN navigator as a query param
   *    (`…/more?section=werknemers`), so it is deep-linkable and restored on a
   *    cold reload,
   *  - records it as a real entry on the MAIN navigator's single history
   *    timeline, so browser Back/Forward (web) and the native back gesture step
   *    back through selections — no second history stack to fight the main one.
   *
   * Switching to another section also drops any `detailParam` from the URL, so
   * the detail column empties (iPad Mail: changing mailbox clears the message).
   *
   * This is the three-column analogue of SplitView's `selectionParam`, applied
   * to the first level. Pair it with `detailParam` for the second level.
   */
  sectionParam?: string;
  /**
   * Opt in to making the MIDDLE→DETAIL selection (which item is open) part of
   * navigation state. When set to a query-param name (e.g. `"detail"`),
   * selecting an item from the middle column reflects it in the MAIN URL
   * (`…/more?section=werknemers&detail=user/42`), records a history entry, and
   * re-derives the detail pane from that URL — so it is deep-linkable,
   * back/forward-navigable and cold-restorable, exactly like SplitView's
   * `selectionParam`.
   */
  detailParam?: string;
};

/** One column's current selection: the registered screen path plus its params,
 *  or null when that column is showing its placeholder. */
export type TripleSelection = {
  middle: TripleSelectionEntry | null;
  detail: TripleSelectionEntry | null;
};
export type TripleSelectionEntry = { path: string; params?: any };

/**
 * Three-column master/detail (iPad Mail / macOS Settings style) for wide
 * screens: sidebar → middle list → detail.
 *
 * Built on the same history-less-navigator technique as SplitView, applied
 * twice: pushes from the sidebar select the MIDDLE column (a second history-
 * less navigator); pushes from the middle column select the DETAIL column (a
 * third history-less navigator). On narrow screens the sidebar renders as-is
 * and navigation behaves exactly like today — full-screen pushes on the main
 * stack — so phones (iOS + Android) are unaffected.
 *
 * Cross-platform: no UIKit UISplitViewController dependency, so it renders
 * identically on iOS, Android and web (Android has no native 3-column
 * controller; this is the portable equivalent).
 */
export default function TripleSplitView({
  sidebar,
  masterPlaceholder,
  detailPlaceholder,
  breakingPointWidth = 900,
  sidebarWidth = 260,
  masterWidth = 360,
  sidebarStyle,
  masterStyle,
  detailStyle,
  floatingSidebar,
  initialSelection,
  onSelectionChange,
  sectionParam,
  detailParam,
}: TripleSplitViewProps) {
  // Seed from window width so it renders on first paint (no null-until-onLayout
  // flash / background-tab breakage); onLayout refines the container width.
  const windowWidth = useWindowDimensions().width;
  const [width, setWidth] = React.useState<number>(windowWidth);
  const isWide = width >= breakingPointWidth;
  return (
    <View
      style={styles.root}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {isWide ? (
        <WideTripleSplitView
          detailPlaceholder={detailPlaceholder}
          masterPlaceholder={masterPlaceholder}
          sidebarWidth={sidebarWidth}
          masterWidth={masterWidth}
          sidebarStyle={sidebarStyle}
          masterStyle={masterStyle}
          detailStyle={detailStyle}
          floatingSidebar={floatingSidebar}
          initialSelection={initialSelection}
          onSelectionChange={onSelectionChange}
          sectionParam={sectionParam}
          detailParam={detailParam}
        >
          {sidebar}
        </WideTripleSplitView>
      ) : (
        sidebar
      )}
    </View>
  );
}

/** Builds a history-less navigator that renders every registered screen under a
 *  scoped rootKey, plus a placeholder at the root. */
function useScopedPaneNavigator(
  screens: any[],
  SuspenseContainer: any,
  rootKey: string
) {
  return React.useMemo(() => {
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
}

function WideTripleSplitView({
  children,
  masterPlaceholder,
  detailPlaceholder,
  sidebarWidth,
  masterWidth,
  sidebarStyle,
  masterStyle,
  detailStyle,
  floatingSidebar,
  initialSelection,
  onSelectionChange,
  sectionParam,
  detailParam,
}: Omit<TripleSplitViewProps, 'sidebar' | 'breakingPointWidth'> & {
  children: React.ReactNode;
}) {
  const id = React.useId();
  const safe = id.replace(/:/g, '--');
  const middleRootKey = 'tripleMiddle_' + safe;
  const detailRootKey = 'tripleDetail_' + safe;

  const ridge = React.useContext(RidgeNavigationContext);
  const outerOptimized = React.useContext(OptimizedContext);
  const { screens, navigationRoot, SuspenseContainer } = ridge;
  const theme = outerOptimized.theme;

  // The MAIN navigator the split itself lives on. With `sectionParam`/
  // `detailParam` set, selections flow through it (URL query + single history
  // timeline) instead of staying private to the panes — see below.
  const mainNavigator = outerOptimized.stateNavigator;
  const { preloadScreen } = outerOptimized;
  const urlDriven = Boolean(sectionParam || detailParam);

  // In-app back for URL-selection mode. Each selection level (section, detail,
  // and any sub-form drilled inside the detail) is a MAIN-navigator history
  // entry created by `refresh(..., 'add')` — the state stays put, only the
  // query data changes. Browser Back walks those data entries via the History
  // API, but `mainNavigator.navigateBack` walks the CRUMB trail instead and
  // would jump out of the whole split. So in-app back must replicate a browser
  // history back: step the History API on web (the panes re-derive from the
  // resulting URL through the URL-mirror effect). Native has no browser
  // history; fall back to the crumb navigator (best-effort).
  const paneCanGoBack = React.useCallback(() => {
    const data: any = mainNavigator.stateContext.data ?? {};
    const hasSelection =
      (sectionParam && data[sectionParam] != null) ||
      (detailParam && data[detailParam] != null);
    return Boolean(hasSelection) || mainNavigator.canNavigateBack(1);
  }, [mainNavigator, sectionParam, detailParam]);
  const paneGoBack = React.useCallback(
    (n = 1) => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.history.go(-n);
        return;
      }
      if (mainNavigator.canNavigateBack(n)) {
        mainNavigator.navigateBack(n);
      }
    },
    [mainNavigator]
  );
  const masterPlaceholderRef = useLatest(masterPlaceholder);
  const detailPlaceholderRef = useLatest(detailPlaceholder);

  // Third column: the detail navigator.
  const detailNavigator = useScopedPaneNavigator(
    screens,
    SuspenseContainer,
    detailRootKey
  );
  // Second column: the middle/list navigator.
  const middleNavigator = useScopedPaneNavigator(
    screens,
    SuspenseContainer,
    middleRootKey
  );

  // Report the current selection (both columns) as stable screen paths + params
  // so the host can mirror it into the URL. A column showing its placeholder
  // (navigator at its root, no `screen`) reports null.
  const onSelectionChangeRef = useLatest(onSelectionChange);
  const reportSelection = React.useCallback(() => {
    const report = onSelectionChangeRef.current;
    if (!report) {
      return;
    }
    const toEntry = (nav: StateNavigator): TripleSelectionEntry | null => {
      const state: any = nav.stateContext.state;
      return state?.screen?.path
        ? { path: state.screen.path, params: nav.stateContext.data }
        : null;
    };
    report({
      middle: toEntry(middleNavigator),
      detail: toEntry(detailNavigator),
    });
  }, [onSelectionChangeRef, middleNavigator, detailNavigator]);

  // Selecting a new middle section clears the detail column back to its
  // placeholder (iPad Mail: switching mailbox empties the message pane).
  const resetDetail = React.useCallback(() => {
    detailNavigator.navigate(detailRootKey);
  }, [detailNavigator, detailRootKey]);

  const onMiddleSelected = React.useCallback(() => {
    resetDetail();
    reportSelection();
  }, [resetDetail, reportSelection]);

  // Encode a pane route key + params (what a row push carries) into the compact
  // href stored in the main URL, e.g. key `<rootKey>/user/:id` + {id:'42'} ->
  // `user/42`. Relative to the pane rootKey, so the reverse is just
  // `rootKey + '/' + href`. Mirrors SplitView's encodeSelectionHref.
  const encodeHref = React.useCallback(
    (rootKey: string, key: string, params?: any) => {
      const template = key.startsWith(rootKey + '/')
        ? key.slice(rootKey.length + 1)
        : key;
      return generatePath(template, params ?? {});
    },
    []
  );

  // Sidebar pushes select the middle column (and reset detail); middle-column
  // pushes select the detail column.
  //
  // With `sectionParam`/`detailParam`, that selection instead flows through the
  // MAIN navigator: a row push records the selection as a query param on the
  // current main URL (history 'add'), and the pane is re-derived from that URL
  // by the effect below. One history timeline (URL + browser/native Back),
  // deep-linkable and back-navigable — the panes never drive themselves out of
  // sync with the URL. Unset params keep the original history-less behaviour.
  const sidebarSelect = React.useMemo(() => {
    const selectViaUrl = (key: string, params?: any) => {
      const href = encodeHref(middleRootKey, key, params);
      const currentData = mainNavigator.stateContext.data ?? {};
      const next: any = { ...currentData, [sectionParam as string]: href };
      // Switching section clears any detail selection (iPad Mail behaviour).
      if (detailParam) {
        delete next[detailParam];
      }
      mainNavigator.refresh(next, 'add');
    };
    const selectLocal = (key: string, params?: any) => {
      const fluent = new StateNavigator(middleNavigator)
        .fluent()
        .navigate(middleRootKey)
        .navigate(key, params);
      middleNavigator.navigateLink(fluent.url);
      onMiddleSelected();
    };
    return new Proxy(middleNavigator, {
      get(target: any, prop) {
        if (prop === 'navigate') {
          return sectionParam ? selectViaUrl : selectLocal;
        }
        // In URL mode the selection lives on the MAIN navigator's history, so
        // in-app back (BackLink/pop) must step through that history — the panes
        // re-derive from the resulting URL. Popping the history-less pane would
        // be a no-op.
        if (sectionParam && prop === 'navigateBack') {
          return paneGoBack;
        }
        if (sectionParam && prop === 'canNavigateBack') {
          return () => paneCanGoBack();
        }
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    }) as StateNavigator;
  }, [
    middleNavigator,
    middleRootKey,
    sectionParam,
    detailParam,
    mainNavigator,
    encodeHref,
    onMiddleSelected,
    paneGoBack,
    paneCanGoBack,
  ]);

  const middleSelect = React.useMemo(() => {
    const selectViaUrl = (key: string, params?: any) => {
      const href = encodeHref(detailRootKey, key, params);
      const currentData = mainNavigator.stateContext.data ?? {};
      mainNavigator.refresh(
        { ...currentData, [detailParam as string]: href },
        'add'
      );
    };
    const selectLocal = (key: string, params?: any) => {
      const fluent = new StateNavigator(detailNavigator)
        .fluent()
        .navigate(detailRootKey)
        .navigate(key, params);
      detailNavigator.navigateLink(fluent.url);
      reportSelection();
    };
    return new Proxy(detailNavigator, {
      get(target: any, prop) {
        if (prop === 'navigate') {
          return detailParam ? selectViaUrl : selectLocal;
        }
        // URL mode: in-app back steps the MAIN navigator's history (which owns
        // the detail selection + any deeper drill), keeping Terug consistent
        // with browser Back. This proxy also backs the DETAIL column itself, so
        // a card push inside the detail (a sub-form) becomes a new `?detail=`
        // entry and Terug/back walks it back one level.
        if (detailParam && prop === 'navigateBack') {
          return paneGoBack;
        }
        if (detailParam && prop === 'canNavigateBack') {
          return () => paneCanGoBack();
        }
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    }) as StateNavigator;
  }, [
    detailNavigator,
    detailRootKey,
    detailParam,
    mainNavigator,
    encodeHref,
    reportSelection,
    paneGoBack,
    paneCanGoBack,
  ]);

  // URL-mirror: when a param is set the corresponding pane is a pure function of
  // the main navigator's query. Re-derive whenever the main navigator navigates
  // (row tap -> refresh, browser Back/Forward, native back, deep-link/cold
  // load), so both selections live on the single main history timeline and are
  // deep-linkable. Mirrors SplitView's URL-mirror effect, applied per level.
  const appliedSectionRef = React.useRef<string | undefined>(undefined);
  const appliedDetailRef = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    if (!urlDriven) {
      return undefined;
    }
    const applyPane = (
      navigator: StateNavigator,
      rootKey: string,
      href: string | undefined
    ) => {
      if (!href) {
        // No selection in the URL -> pane shows its placeholder.
        if (navigator.stateContext.state?.key !== rootKey) {
          navigator.navigate(rootKey);
        }
        return;
      }
      const targetUrl = rootKey + '/' + href;
      try {
        const parsed = navigator.parseLink(targetUrl);
        if ((parsed as any)?.state?.screen) {
          preloadScreen((parsed as any).state.screen, (parsed as any).data);
        }
      } catch {
        // Unresolvable href (stale/foreign link) -> fall back to placeholder.
        navigator.navigate(rootKey);
        return;
      }
      navigator.navigateLink(targetUrl);
    };
    const syncPanesFromUrl = () => {
      const data: any = mainNavigator.stateContext.data ?? {};
      // Section first (it can empty the detail param), then detail on top.
      if (sectionParam) {
        const href: string | undefined = data[sectionParam];
        if (appliedSectionRef.current !== href) {
          appliedSectionRef.current = href;
          applyPane(middleNavigator, middleRootKey, href);
        }
      }
      if (detailParam) {
        const href: string | undefined = data[detailParam];
        if (appliedDetailRef.current !== href) {
          appliedDetailRef.current = href;
          applyPane(detailNavigator, detailRootKey, href);
        }
      }
    };
    // Initial derive (deep-link / cold load) + subscribe to future changes.
    syncPanesFromUrl();
    mainNavigator.onNavigate(syncPanesFromUrl);
    return () => mainNavigator.offNavigate(syncPanesFromUrl);
  }, [
    urlDriven,
    sectionParam,
    detailParam,
    mainNavigator,
    middleNavigator,
    detailNavigator,
    middleRootKey,
    detailRootKey,
    preloadScreen,
  ]);

  // Restore a deep-linked selection once, after the panes exist. Middle first
  // (which resets detail), then detail on top — mirroring the interactive
  // order — so a shared URL reopens exactly where it pointed. Skipped when
  // `sectionParam`/`detailParam` drive the panes from the URL instead.
  const didRestore = React.useRef(false);
  React.useEffect(() => {
    if (didRestore.current || !initialSelection || urlDriven) {
      return;
    }
    didRestore.current = true;
    const { middle, detail } = initialSelection;
    if (middle?.path) {
      sidebarSelect.navigate(
        rootKeyAndPaths(middleRootKey, middle.path),
        middle.params
      );
    }
    if (detail?.path) {
      middleSelect.navigate(
        rootKeyAndPaths(detailRootKey, detail.path),
        detail.params
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelection]);

  // Root maps so both scoped navigators resolve their placeholder root.
  const navigationRootWithPanes = React.useMemo(
    () => ({
      [middleRootKey]: createNormalRoot({
        path: middleRootKey,
        preload: () => {},
        element: EmptyElement as any,
      }),
      [detailRootKey]: createNormalRoot({
        path: detailRootKey,
        preload: () => {},
        element: EmptyElement as any,
      }),
      ...navigationRoot,
    }),
    [navigationRoot, middleRootKey, detailRootKey]
  );

  // Context for the SIDEBAR: its pushes go to the middle navigator.
  const sidebarRidgeValue = React.useMemo(
    () => ({
      ...ridge,
      rootNavigator: middleNavigator,
      navigationRoot: navigationRootWithPanes,
    }),
    [ridge, middleNavigator, navigationRootWithPanes]
  );
  const sidebarOptimizedValue = React.useMemo(
    () => ({
      ...outerOptimized,
      rootNavigator: middleNavigator,
      stateNavigator: sidebarSelect,
    }),
    [outerOptimized, middleNavigator, sidebarSelect]
  );

  // Context for the MIDDLE column screens: their pushes go to the detail nav.
  const middleRidgeValue = React.useMemo(
    () => ({
      ...ridge,
      rootNavigator: detailNavigator,
      navigationRoot: navigationRootWithPanes,
    }),
    [ridge, detailNavigator, navigationRootWithPanes]
  );
  const middleOptimizedValue = React.useMemo(
    () => ({
      ...outerOptimized,
      rootNavigator: detailNavigator,
      stateNavigator: middleSelect,
    }),
    [outerOptimized, detailNavigator, middleSelect]
  );

  // Android hardware back: pop detail first, then middle, then defer.
  React.useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // URL-driven mode: selections live on the MAIN navigator's history, so
        // step IT back (the panes re-derive from the URL). Popping the panes
        // directly would just be undone by the URL-mirror effect.
        if (urlDriven) {
          const data: any = mainNavigator.stateContext.data ?? {};
          const hasSelection =
            (sectionParam && data[sectionParam] != null) ||
            (detailParam && data[detailParam] != null);
          if (!hasSelection) {
            return false;
          }
          if (mainNavigator.canNavigateBack(1)) {
            mainNavigator.navigateBack(1);
          } else {
            // Only selection on the stack -> clear our params so back returns
            // to the empty/placeholder panes.
            const rest = { ...data };
            if (sectionParam) {
              delete rest[sectionParam];
            }
            if (detailParam) {
              delete rest[detailParam];
            }
            mainNavigator.refresh(rest, 'replace');
          }
          return true;
        }
        if (detailNavigator.canNavigateBack(1)) {
          detailNavigator.navigateBack(1);
          return true;
        }
        if (middleNavigator.canNavigateBack(1)) {
          middleNavigator.navigateBack(1);
          return true;
        }
        return false;
      }
    );
    return () => subscription.remove();
  }, [
    detailNavigator,
    middleNavigator,
    urlDriven,
    sectionParam,
    detailParam,
    mainNavigator,
  ]);

  const renderMasterPlaceholder = () => masterPlaceholderRef.current ?? null;
  const renderDetailPlaceholder = () => detailPlaceholderRef.current ?? null;

  // Column 1 — sidebar. Floating (Health) = an absolute translucent overlay ON
  // TOP of the content so the color bleeds under it; otherwise a normal column.
  const sidebarNode = (
    <RidgeNavigationContext.Provider value={sidebarRidgeValue}>
      <OptimizedContext.Provider value={sidebarOptimizedValue}>
        <View
          style={[
            floatingSidebar
              ? [styles.floatingSidebar, { width: sidebarWidth }]
              : { width: sidebarWidth },
            sidebarStyle,
          ]}
        >
          {children}
        </View>
      </OptimizedContext.Provider>
    </RidgeNavigationContext.Provider>
  );

  return (
    <View style={styles.row}>
      {/* Normal layout: sidebar reserves the leftmost column. Floating layout:
          the content spans from x=0 and the sidebar overlays it (rendered last,
          below). */}
      {!floatingSidebar && sidebarNode}

      {/* Column 2 — middle/list, whose pushes select the detail column.
          No NavigationHandler here on purpose: the middle scene stack is driven
          by the middleNavigator prop, and the Links inside must push through
          `middleSelect` (reset the detail column) — passed as linkNavigator so
          OptimizedContextProvider overrides the ambient stateNavigator. Wrapping
          this in a NavigationHandler(middleSelect) would fight the detail
          column's own NavigationHandler for ownership of detailNavigator and
          leave the middle showing only its placeholder. Mirrors how SplitView's
          master renders its children with no handler at all. */}
      <View style={[{ width: masterWidth }, masterStyle]}>
        <RidgeNavigationContext.Provider value={middleRidgeValue}>
          <OptimizedContext.Provider value={middleOptimizedValue}>
            {/* SplitPaneContext lets entity list screens in the middle render
                list-only (no nested SplitView) so their row pushes land in the
                detail column instead of a split-inside-a-split. */}
            <SplitPaneContext.Provider value={true}>
              <PaneScenes
                navigator={middleNavigator}
                rootKey={middleRootKey}
                renderPlaceholder={renderMasterPlaceholder}
                backgroundColor={theme.layout.backgroundColor}
                linkNavigator={middleSelect}
              />
            </SplitPaneContext.Provider>
          </OptimizedContext.Provider>
        </RidgeNavigationContext.Provider>
      </View>

      {/* Column 3 — detail. Wrapped in the pane ridge context (rootNavigator =
          detailNavigator, navigationRoot incl. the pane rootKeys) so pushes
          from INSIDE a detail screen (a sub-form card) resolve against the
          detail pane's own root instead of the main app root — without this
          they compute a screenKey the pane navigator has no state for and
          dead-click. Mirrors how SplitView wraps its detail in splitRidgeValue.

          When `detailParam` is set, those inner pushes route through
          `middleSelect` (the same proxy the middle rows use): each becomes a new
          `?detail=` history entry, so a sub-form is deep-linkable, back-
          navigable and its in-app Terug steps back one level. */}
      <View style={[styles.detail, detailStyle]}>
        <RidgeNavigationContext.Provider value={middleRidgeValue}>
          <NavigationHandler stateNavigator={detailNavigator}>
            {Platform.OS === 'web' ? (
              <NavigationStack
                underlayColor={theme.layout.backgroundColor}
                backgroundColor={() => theme.layout.backgroundColor}
                // In detailParam mode, pushes from inside a detail screen (a
                // sub-form card) route through `middleSelect` -> the main
                // navigator URL, so the sub-form is a real `?detail=` history
                // entry: deep-linkable, browser-Back- and Terug-navigable.
                // @ts-ignore web-only prop (native detail uses PaneScenes).
                stateNavigatorOverride={detailParam ? middleSelect : undefined}
                //@ts-ignore
                renderWeb={(key: string) =>
                  key === detailRootKey ? renderDetailPlaceholder() : undefined
                }
                renderScene={(state: any, data: any) => (
                  <>
                    <HiddenNavbarWithSwipeBack
                      nativeHeader={state?.screen?.options?.nativeHeader}
                    />
                    <OptimizedContextProvider state={state} data={data}>
                      {state.key === detailRootKey
                        ? renderDetailPlaceholder()
                        : state.renderScene()}
                    </OptimizedContextProvider>
                  </>
                )}
              />
            ) : (
              <PaneScenes
                navigator={detailNavigator}
                rootKey={detailRootKey}
                renderPlaceholder={renderDetailPlaceholder}
                backgroundColor={theme.layout.backgroundColor}
                linkNavigator={detailParam ? middleSelect : undefined}
              />
            )}
          </NavigationHandler>
        </RidgeNavigationContext.Provider>
      </View>

      {/* Floating sidebar overlay, painted on top of the content. */}
      {floatingSidebar && sidebarNode}
    </View>
  );
}

/** Renders a history-less navigator's crumb stack as absolutely-stacked scenes
 *  (top interactive), used for the middle column on all platforms and the
 *  detail column on native (mirrors SplitView's DetailPaneScenes). */
function PaneScenes({
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
  /** When set, Links inside the rendered scenes push through this navigator
   *  instead of the ambient NavigationContext one (used by the middle column so
   *  its rows select the detail column). */
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
  paneScenes: {
    flex: 1,
    overflow: 'hidden',
  },
  detail: {
    flex: 1,
    overflow: 'hidden',
  },
  floatingSidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
    overflow: 'hidden',
  },
});
