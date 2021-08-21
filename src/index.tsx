// export { default as DeepLinking } from './DeepLinking';
export { default as BackLink } from './BackLink';
export { default as OnlyRenderOnce } from './OnlyRenderOnce.native';
export { default as SwitchRoot } from './SwitchRoot';
export { default as Link } from './Link';
export { usePreloadResult, setPreloadResult } from './Preloader';
export { default as lazyWithPreload } from './LazyWithPreload';
export { default as Redirect } from './Redirect';

export {
  NavigationRoot,
  createNavigation,
  useNavigation,
  useFocus,
  refreshBottomTabs,
  updateBadge,
  useParams,
  staticPush,
} from './Navigation';

export {
  createBottomTabsRoot,
  createNormalRoot,
  createSideMenuRoot,
  registerScreen,
  createScreens,
  defaultTheme,
  useTheme,
  setTheme,
  getTheme,
  createSimpleTheme,
} from './navigationUtils';

export type {
  Root,
  BaseScreen,
  BottomTabType,
  SideMenuItem,
  RootChildBottomTabs,
  RootChildSideMenu,
  RootChildNormal,
  ExtractRouteParams,
  LinkRenderProps,
  LinkProps,
} from './navigationUtils';
