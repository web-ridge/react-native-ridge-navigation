export { default as BackLink } from './BackLink';
export { default as SwitchRoot } from './SwitchRoot';
export { default as Link } from './Link';
export { default as BottomTabLink } from './BottomTabLink';
export { default as Head } from './Head';
export { usePreloadResult } from './Preloader';
export { default as lazy } from './lazy';
export { default as StatusBar } from './StatusBar';
export { default as useBottomTabRefresh } from './useBottomTabRefresh';
export { default as FocusAwareStatusBar } from './FocusAwareStatusBar';
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
