export { default as BackLink } from './BackLink';
export { default as SwitchRoot } from './SwitchRoot';
export { default as Link } from './Link';
export { default as BottomTabLink } from './BottomTabLink';
export { default as Head } from './Head';
export {
  default as NativeNavigationBar,
  type NativeNavigationSearch,
} from './NativeNavigationBar';
// Native header vocabulary (iOS/Android). Re-exported through a platform-split
// module (nativeBars.native / nativeBars.web) so screens can build collapsing
// large-title / immersive colored headers, bar buttons and shared-element
// transitions with one import — and importing them on web never pulls native
// modules into the bundle.
export {
  NavigationBar,
  SharedElement,
  CoordinatorLayout,
  CollapsingBar,
  LeftBar,
  RightBar,
  BarButton,
  type NavigationBarProps,
  type SharedElementProps,
  type BarButtonProps,
} from './nativeBars';
// Cross-platform iOS-styled header: native UINavigationBar, web DOM mirror
// (CollapsingHeader.web.tsx). Same props/actions across platforms.
export {
  default as CollapsingHeader,
  type CollapsingHeaderProps,
  type HeaderAction,
} from './CollapsingHeader';
export {
  usePreloadResult,
  setPreloadResultTransformHook,
  type PreloadResultTransformHook,
} from './Preloader';
export { default as lazy } from './lazy';
export { default as useBottomTabRefresh } from './useBottomTabRefresh';
export {
  useNavigating as useFocus,
  useNavigating,
  useNavigated,
  useUnloaded,
  useUnloading,
} from './useFocus';
export { default as useIsFocused } from './useIsFocused';
export { default as useParams } from './useParams';
export { default as useBottomTabBadges } from './useBottomTabBadges';
export { default as useBottomTabIndex } from './useBottomTabIndex';
export { default as useModal } from './useModal';

export { default as useNavigation } from './useNavigation';
export { default as NavigationProvider } from './NavigationProvider';
export { default as NavigationNestedProvider } from './NavigationNestedProvider';
export { default as SplitView, type SplitViewProps } from './SplitView';
export {
  default as TripleSplitView,
  type TripleSplitViewProps,
  type TripleSelection,
  type TripleSelectionEntry,
} from './TripleSplitView';
export {
  default as SplitPaneContext,
  useIsInsideSplitPane,
} from './contexts/SplitPaneContext';
export { default as ModalBackHandler } from './ModalBackHandler';
export { default as createLinkComponent } from './createLinkComponent';

export {
  createBottomTabsRoot,
  createNormalRoot,
  registerScreen,
  createScreens,
  fluentScreen,
  fluentRootBottomTabs,
  fluentRootNormal,
} from './navigationUtils';
export { defaultTheme, createSimpleTheme } from './theme';
export type {
  Root,
  BaseScreen,
  BottomTabType,
  BottomTabComponent,
  BottomTabOverrideComponent,
  BottomTabOverrideProps,
  SideMenuItem,
  RootChildBottomTabs,
  RootChildNormal,
  ExtractRouteParams,
  LinkRenderProps,
  LinkProps,
  Orientation,
} from './navigationUtils';
