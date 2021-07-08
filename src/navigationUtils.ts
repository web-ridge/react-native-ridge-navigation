import type { ComponentType } from 'react';
import preloader from './Preloader';
import { newRidgeState } from 'react-ridge-state';
import { refreshTheme } from './Navigation';
import { Platform } from 'react-native';
declare type Color = string | symbol;

export const defaultTheme: ThemeSettings = {
  light: {
    statusBar: Platform.select({
      android: {
        translucent: false,
        drawBehind: true,
        style: 'light',
        backgroundColor: 'transparent',
      },
      default: {
        translucent: false,
        drawBehind: true,
      },
    }),
    layout: {
      backgroundColor: '#fff',
    },
    bottomBar: {
      backgroundColor: '#fff',
      textColor: '#000',
      iconColor: '#000',
      selectedIconColor: '#F59E00',
      selectedTextColor: '#F59E00',
      badgeColor: '#F59E00',
      badgeTextColor: '#fff', // not supported yet in iOS/Android
    },
  },
  dark: {
    statusBar: Platform.select({
      android: {
        translucent: false,
        drawBehind: true,
        style: 'light',
        backgroundColor: 'transparent',
      },
      default: {
        translucent: false,
        drawBehind: true,
      },
    }),
    layout: {
      backgroundColor: '#000',
    },
    bottomBar: {
      backgroundColor: '#121212',
      textColor: '#fff',
      iconColor: '#fff',
      selectedIconColor: '#FDDFAF',
      selectedTextColor: '#FDDFAF',
      badgeColor: 'red',
      badgeTextColor: '#fff', // not supported yet in iOS/Android
    },
  },
};

export function createTheme(theme: ThemeSettings) {
  return newRidgeState<ThemeSettings>(theme, {
    onSet: () => {
      refreshTheme();
    },
  });
}

export type ExtractRouteParams<T extends string> = string extends T
  ? Record<string, string>
  : // @ts-ignore
  T extends `${infer Start}:${infer Param}/${infer Rest}`
  ? { [k in Param | keyof ExtractRouteParams<Rest>]: string }
  : // @ts-ignore
  T extends `${infer Start}:${infer Param}`
  ? { [k in Param]: string }
  : {};

export interface OptionsStatusBar {
  /**
   * Set the status bar visibility
   * @default true
   */
  visible?: boolean;
  /**
   * Set the text color of the status bar
   * @default 'light'
   */
  style?: 'light' | 'dark';
  /**
   * Set the background color of the status bar
   * #### (Android specific)
   */
  backgroundColor?: Color;
  /**
   * Draw screen behind the status bar
   * #### (Android specific)
   */
  drawBehind?: boolean;
  /**
   * Allows the StatusBar to be translucent (blurred)
   * #### (Android specific)
   */
  translucent?: boolean;
  /**
   * Animate StatusBar style changes.
   * #### (iOS specific)
   */
  animated?: boolean;
  /**
   * Automatically hide the StatusBar when the TopBar hides.
   * #### (iOS specific)
   */
  hideWithTopBar?: boolean;
  /**
   * Blur content beneath the StatusBar.
   * #### (iOS specific)
   */
  blur?: boolean;
}

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

export interface ThemeLayout {
  backgroundColor: Color;
}

export interface ThemeBottomBar {
  backgroundColor: Color;
  textColor: Color;
  iconColor: Color;
  selectedIconColor: Color;
  selectedTextColor: Color;
  badgeColor: Color;
  badgeTextColor: Color; // not supported yet in RNN
}

export interface Theme {
  bottomBar: ThemeBottomBar;
  layout: ThemeLayout;
  statusBar: OptionsStatusBar;
}

export interface ThemeSettings {
  light: Theme;
  dark: Theme;
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

export function createScreens(screenMap: Record<string, BaseScreen>) {
  return Object.keys(screenMap).map((key) => {
    return screenMap[key as keyof typeof screenMap]!;
  });
}
