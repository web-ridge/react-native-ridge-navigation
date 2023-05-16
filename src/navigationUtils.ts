import type { ComponentType, FC, ReactNode } from 'react';
import type { PressableProps, GestureResponderEvent } from 'react-native';
import { useWindowDimensions } from 'react-native';

export type ExtractRouteParams<T extends string> = string extends T
  ? Record<string, string>
  : // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends `${infer Start}:${infer Param}/${infer Rest}`
  ? { [k in Param | keyof ExtractRouteParams<Rest>]: string }
  : // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends `${infer Start}:${infer Param}`
  ? { [k in Param]: string }
  : {};

export interface BaseScreen {
  path: string;
  element: ComponentType;
  preload: (params: any) => any;
}

export interface BottomTabType {
  child: BaseScreen;
  path: string;
  title: () => string;

  icon?: any;
  selectedIcon?: any;
}

export type BottomTabComponent = FC<{ orientation: Orientation }>;
export type BottomTabOverrideComponent = FC<BottomTabOverrideProps>;
export type BottomTabOverrideProps = {
  originalBottomTabs: ReactNode;
  orientation: Orientation;
  children: any;
};

export interface BottomTabComponents {
  // you can specify a end component which will be included in the bottom tabs
  start?: BottomTabComponent;
  // you can specify a end component which will be included in the bottom tabs
  end?: BottomTabComponent;

  // you can specify an override component to replace the default bottom tab (only on web)
  override?: BottomTabOverrideComponent;
}

export interface SideMenuItem {
  child: BaseScreen;
  title: () => string;
  icon: string;
}

export interface RootChildBottomTabs {
  type: 'bottomTabs';
  children: BottomTabType[];
  components?: BottomTabComponents;
  breakingPointWidth: undefined | null | number;
}
// export interface RootChildSideMenu {
//   type: 'sideMenu';
//   children: SideMenuItem[];
// }
export interface RootChildNormal {
  type: 'normal';
  child: BaseScreen;
}
export type Orientation = 'vertical' | 'horizontal';
export function createBottomTabsRoot(
  children: BottomTabType[],
  extra?:
    | { components?: BottomTabComponents; breakingPointWidth?: number | null }
    | undefined
    | null
): RootChildBottomTabs {
  return {
    type: 'bottomTabs',
    children,
    components: extra?.components,
    breakingPointWidth: extra?.breakingPointWidth,
  };
}

export function createNormalRoot(child: BaseScreen): RootChildNormal {
  return {
    type: 'normal',
    child,
  };
}

export type RootValue = RootChildNormal | RootChildBottomTabs;
export type Root = Record<string, RootValue>;

export function registerScreen<
  Path extends string,
  E extends ComponentType,
  Preload extends (params: ExtractRouteParams<Path>) => void
>(path: Path, element: E, preload: Preload) {
  return {
    path,
    element,
    preload,
  };
}

export type LinkRenderProps = {
  onPressIn?: (event: GestureResponderEvent) => void;
  onHoverIn?: (event: any) => void;
  onPress: (event: GestureResponderEvent) => void;
  accessibilityRole?: 'link';
  href?: string;
};

export type LinkProps<T extends BaseScreen> = {
  to: T;
  toBottomTab?: BottomTabType;
  params: ExtractRouteParams<T['path']>;
  children: (p: LinkRenderProps) => any;
  linkMode?: 'default' | 'sensitive'; // used on the web when 'aggressive' the preload() will be called on mouse enter
  onPress?: PressableProps['onPress'];
  onPressIn?: PressableProps['onPressIn'];
  onHoverIn?: PressableProps['onHoverIn'];
  skipLinkBehaviourIfPressIsDefined?: boolean;
  replace?: boolean;
  refresh?: boolean;
};

export type BottomTabLinkRenderProps = LinkRenderProps & {
  isSelected: boolean;
  testID?: string;
};

export type BottomTabLinkProps<T extends BottomTabType> = {
  to: BottomTabType;
  params: ExtractRouteParams<T['child']['path']>;
  children: (p: BottomTabLinkRenderProps) => any;
  mode?: 'default' | 'sensitive'; // used on the web when 'aggressive' the preload() will be called on mouse enter
  onPress?: PressableProps['onPress'];
};

export function createScreens(screenMap: Record<string, BaseScreen>) {
  return Object.keys(screenMap).map((key) => {
    return screenMap[key as keyof typeof screenMap]!;
  });
}

export function skipUrlSegment(
  tab: BottomTabType | undefined,
  screenPath: string | undefined
) {
  if (!tab) {
    return false;
  }

  return tab.child.path === screenPath;
}

export function getScreenKey(
  rootKey: string,
  tab: BottomTabType | undefined,
  ...paths: (string | undefined)[]
) {
  const firstPath = paths?.[0] || tab?.child.path;
  const skipSegment = skipUrlSegment(tab, firstPath);

  const screenPath = skipSegment ? undefined : firstPath;
  return rootKeyAndPaths(rootKey, tab?.path, screenPath);
}

export function rootKeyAndPaths(
  rootKey: string,
  ...paths: (string | undefined)[]
) {
  const sanitizedRoot = rootKey.endsWith('/') ? rootKey.slice(0, -1) : rootKey; // Remove trailing slash from rootKey
  const sanitizedPaths = paths
    .filter((p) => p)
    .map((path) => {
      const trimmedPath = path!.trim();
      const withoutLeadingSlash = trimmedPath.startsWith('/')
        ? trimmedPath.slice(1)
        : trimmedPath;
      const withoutTrailingSlash = withoutLeadingSlash.endsWith('/')
        ? withoutLeadingSlash.slice(0, -1)
        : withoutLeadingSlash;
      return withoutTrailingSlash;
    }); // Remove leading and trailing slashes from paths

  const url = sanitizedRoot + '/' + sanitizedPaths.join('/');
  return url;
}

export function makeVariablesNavigationFriendly(s: string) {
  // replace :id with {id} and so on
  return s.replace(/:([^/]+)/g, '{$1}');
}

export function generatePath(
  path: string,
  params: Record<string, string>
): string {
  // replace :id with params[key]
  return path.replace(/:([^/]+)/g, (_match, key) => {
    return params[key] || 'undefined-param';
  });
}

export function getRootKeyFromPath(path: string) {
  return splitPath(path)[0];
}
export function getBottomTabKeyFromPath(path: string) {
  return splitPath(path)?.[1];
}
export function getPaths(path: string, hasBottomTabs: boolean) {
  const paths = splitPath(path);
  // 0 = rootKey
  // 1 = bottomTabKey
  return paths.filter((_, index) => {
    if (hasBottomTabs) {
      return index >= 2;
    }
    return index >= 1;
  });
}

export function splitPath(path: string): string[] {
  let splitMatchPath = path.split('/').filter((p) => p);
  return splitMatchPath;
}

export function getPathFromUrl(url: string): string {
  if (url.startsWith('/')) {
    // web
    return url;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const u = new URL(url);
    return u.pathname + u.search;
  }
  const split = url.split('://');
  return '/' + split[1];
}
export function partMatches(
  urlPart: string | undefined,
  routePart: string | undefined
) {
  // url part does not exist
  if (urlPart === undefined || routePart === undefined) {
    return false;
  }

  // is parameter in url match everything
  if (routePart.startsWith(':')) {
    return true;
  }
  return routePart === urlPart;
}
export function getParams(
  urlPathSplit: string[],
  routePathSplit: string[]
): Record<string, string> {
  let params: Record<string, string> = {};
  routePathSplit.forEach((routePath, i) => {
    if (routePath.startsWith(':')) {
      const paramKey = routePath.substring(1);
      params[paramKey] = urlPathSplit[i]!;
    }
  });
  return params;
}

const defaultBreakingPoint = 1200;
export function getBreakingPointFromRoot(v?: RootValue): number {
  let configuredBreakingPoint: number | null | undefined;
  if (v?.type === 'bottomTabs') {
    configuredBreakingPoint = v.breakingPointWidth;
  }

  // user explicitly set the breaking point to null, so we never will make sure the breaking point will never happen
  if (configuredBreakingPoint === null) {
    configuredBreakingPoint = Infinity;
  }
  return configuredBreakingPoint || defaultBreakingPoint;
}
export function useAboveBreakingPoint(breakingPoint: number) {
  const { width } = useWindowDimensions();
  return width > breakingPoint;
}
