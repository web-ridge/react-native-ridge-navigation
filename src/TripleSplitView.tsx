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
import HiddenNavbarWithSwipeBack from './HiddenNavbarWithSwipeBack';
import useLatest from './useLatest';
import {
  createNormalRoot,
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
};

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

/** A proxy over `paneNavigator` whose `navigate(key, params)` RESETS the pane to
 *  [root, key] — i.e. selecting replaces the current selection instead of
 *  stacking on it. Mirrors SplitView's masterNavigator. */
function useSelectIntoPaneNavigator(
  paneNavigator: StateNavigator,
  rootKey: string
) {
  return React.useMemo(() => {
    const select = (key: string, params?: any) => {
      const fluent = new StateNavigator(paneNavigator)
        .fluent()
        .navigate(rootKey)
        .navigate(key, params);
      paneNavigator.navigateLink(fluent.url);
    };
    return new Proxy(paneNavigator, {
      get(target: any, prop) {
        if (prop === 'navigate') {
          return select;
        }
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    }) as StateNavigator;
  }, [paneNavigator, rootKey]);
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

  // Sidebar pushes select the middle column; middle-column pushes select detail.
  const sidebarSelect = useSelectIntoPaneNavigator(
    middleNavigator,
    middleRootKey
  );
  const middleSelect = useSelectIntoPaneNavigator(
    detailNavigator,
    detailRootKey
  );

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
  }, [detailNavigator, middleNavigator]);

  const renderMasterPlaceholder = () => masterPlaceholderRef.current ?? null;
  const renderDetailPlaceholder = () => detailPlaceholderRef.current ?? null;

  return (
    <View style={styles.row}>
      {/* Column 1 — sidebar */}
      <RidgeNavigationContext.Provider value={sidebarRidgeValue}>
        <OptimizedContext.Provider value={sidebarOptimizedValue}>
          <View style={[{ width: sidebarWidth }, sidebarStyle]}>
            {children}
          </View>
        </OptimizedContext.Provider>
      </RidgeNavigationContext.Provider>

      {/* Column 2 — middle/list, whose pushes select the detail column */}
      <View style={[{ width: masterWidth }, masterStyle]}>
        <RidgeNavigationContext.Provider value={middleRidgeValue}>
          <OptimizedContext.Provider value={middleOptimizedValue}>
            <NavigationHandler stateNavigator={middleNavigator}>
              <PaneScenes
                navigator={middleNavigator}
                rootKey={middleRootKey}
                renderPlaceholder={renderMasterPlaceholder}
                backgroundColor={theme.layout.backgroundColor}
              />
            </NavigationHandler>
          </OptimizedContext.Provider>
        </RidgeNavigationContext.Provider>
      </View>

      {/* Column 3 — detail */}
      <View style={[styles.detail, detailStyle]}>
        <NavigationHandler stateNavigator={detailNavigator}>
          {Platform.OS === 'web' ? (
            <NavigationStack
              underlayColor={theme.layout.backgroundColor}
              backgroundColor={() => theme.layout.backgroundColor}
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
            />
          )}
        </NavigationHandler>
      </View>
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
}: {
  navigator: StateNavigator;
  rootKey: string;
  renderPlaceholder: () => React.ReactNode;
  backgroundColor: any;
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
            <OptimizedContextProvider state={scene.state} data={scene.data}>
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
});
