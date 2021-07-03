import type { ComponentType } from 'react';
import preloader from './Preloader';

export type ExtractRouteParams<T extends string> = string extends T
  ? Record<string, string>
  : // @ts-ignore
  T extends `${infer Start}:${infer Param}/${infer Rest}`
  ? { [k in Param | keyof ExtractRouteParams<Rest>]: string }
  : // @ts-ignore
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

export interface SideMenuItem {
  child: BaseScreen;
  title: () => string;
  icon: string;
}

export interface RootChildBottomTabs {
  type: 'bottomTabs';
  children: BottomTabType[];
}
export interface RootChildSideMenu {
  type: 'sideMenu';
  children: SideMenuItem[];
}
export interface RootChildNormal {
  type: 'normal';
  child: BaseScreen;
}

export function createBottomTabsRoot(
  children: BottomTabType[]
): RootChildBottomTabs {
  return {
    type: 'bottomTabs',
    children,
  };
}

export function createSideMenuRoot(
  children: SideMenuItem[]
): RootChildSideMenu {
  return {
    type: 'sideMenu',
    children,
  };
}

export function createNormalRoot(child: BaseScreen): RootChildNormal {
  return {
    type: 'normal',
    child,
  };
}

export type Root = Record<
  string,
  RootChildNormal | RootChildBottomTabs | RootChildSideMenu
>;

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

export function preloadRoot(root: Root, rootKey: string, params: any) {
  const b = root[rootKey];
  switch (b.type) {
    case 'normal':
      preloader.setPreloadResult(b.child, b.child.preload(params));
      break;
    case 'bottomTabs':
      b.children.forEach(({ child }) =>
        preloader.setPreloadResult(child, child.preload(params))
      );
      break;
    case 'sideMenu':
      break;
  }
}
