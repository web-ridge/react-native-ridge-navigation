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
import HiddenNavbarWithSwipeBack from './HiddenNavbarWithSwipeBack';
import useLatest from './useLatest';
import {
  createNormalRoot,
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
}: Omit<SplitViewProps, 'breakingPointWidth'>) {
  const id = React.useId();
  const rootKey = 'splitViewProvider_' + id.replace(/:/g, '--');
  const ridge = React.useContext(RidgeNavigationContext);
  const outerOptimized = React.useContext(OptimizedContext);
  const { screens, navigationRoot, SuspenseContainer } = ridge;
  const theme = outerOptimized.theme;
  const detailPlaceholderRef = useLatest(detailPlaceholder);

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

  // Pushes from the master column select a new detail: they reset the pane to
  // [root, detail] instead of stacking on whatever was selected before.
  const masterNavigator = React.useMemo(() => {
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
          return selectDetail;
        }
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    }) as StateNavigator;
  }, [detailNavigator, rootKey]);

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
  // so pop the pane first before letting the main stack handle it.
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
        return false;
      }
    );
    return () => subscription.remove();
  }, [detailNavigator]);

  const renderPlaceholder = () => detailPlaceholderRef.current ?? null;

  return (
    <View style={styles.row}>
      <RidgeNavigationContext.Provider value={splitRidgeValue}>
        <OptimizedContext.Provider value={masterOptimizedValue}>
          <View style={[styles.master, { width: masterWidth }, masterStyle]}>
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
        </OptimizedContext.Provider>
        <View style={[styles.detail, detailStyle]}>
          <NavigationHandler stateNavigator={detailNavigator}>
            {Platform.OS === 'web' ? (
              <NavigationStack
                underlayColor={theme.layout.backgroundColor}
                backgroundColor={() => theme.layout.backgroundColor}
                //@ts-ignore
                renderWeb={(key: string) =>
                  key === rootKey ? renderPlaceholder() : undefined
                }
                renderScene={(state: any, data: any) => {
                  return (
                    <>
                      <HiddenNavbarWithSwipeBack
                        nativeHeader={state?.screen?.options?.nativeHeader}
                      />
                      <OptimizedContextProvider state={state} data={data}>
                        {state.key === rootKey
                          ? renderPlaceholder()
                          : state.renderScene()}
                      </OptimizedContextProvider>
                    </>
                  );
                }}
              />
            ) : (
              // An NVNavigationStack embedded at partial width does not
              // present pushed scenes on the new architecture, so the pane
              // keeps its own JS scene stack: every crumb stays mounted
              // (scroll state survives), the top one is interactive.
              <DetailPaneScenes
                navigator={detailNavigator}
                rootKey={rootKey}
                renderPlaceholder={renderPlaceholder}
                backgroundColor={theme.layout.backgroundColor}
              />
            )}
          </NavigationHandler>
        </View>
      </RidgeNavigationContext.Provider>
    </View>
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
