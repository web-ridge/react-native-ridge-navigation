export { default as BackLink } from './BackLink';
export { default as SwitchRoot } from './SwitchRoot';
export { default as Link } from './Link';
export { usePreloadResult } from './Preloader';
export { default as lazyWithPreload } from './LazyWithPreload.web';
export {
  useNavigating as useFocus,
  useNavigating,
  useNavigated,
  useUnloaded,
  useUnloading,
} from './useFocus';
export { default as useParams } from './useParams';
export { default as useBottomTabBadges } from './useBottomTabBadges';
export { default as useBottomTabIndex } from './useBottomTabIndex';
export { default as useNavigation } from './useNavigation';
export { default as NavigationProvider } from './NavigationProvider';

export {
  createBottomTabsRoot,
  createNormalRoot,
  registerScreen,
  createScreens,
} from './navigationUtils';
export { defaultTheme, createSimpleTheme } from './theme';
export type {
  Root,
  BaseScreen,
  BottomTabType,
  SideMenuItem,
  RootChildBottomTabs,
  RootChildNormal,
  ExtractRouteParams,
  LinkRenderProps,
  LinkProps,
} from './navigationUtils';
