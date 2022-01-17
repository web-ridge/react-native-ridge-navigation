import type { ComponentType } from 'react';
import { setPreloadResult } from './Preloader';
import { newRidgeState, StateWithValue } from 'react-ridge-state';
import { refreshTheme } from './Navigation';
import type { GestureResponderEvent } from 'react-native';
declare type Color = string | symbol;

export function createSimpleTheme(
  simpleTheme: SimpleThemeSettings
): ThemeSettings {
  return {
    light: {
      statusBar: {
        translucent: false,
        drawBehind: true,
        style: 'dark',
        backgroundColor: 'transparent',
      },
      layout: {
        backgroundColor: '#fff',
      },
      bottomBar: {
        backgroundColor: '#fff',
        textColor: simpleTheme.light.text,
        iconColor: simpleTheme.light.text,
        selectedIconColor: simpleTheme.light.accent,
        selectedTextColor: simpleTheme.light.accent,
        badgeColor: 'red',
        badgeTextColor: '#fff', // not supported yet in iOS/Android
        elevation: 5,
      },
    },
    dark: {
      statusBar: {
        translucent: false,
        drawBehind: true,
        style: 'light',
        backgroundColor: 'transparent',
      },
      layout: {
        backgroundColor: '#000',
      },
      bottomBar: {
        backgroundColor: '#121212',
        textColor: simpleTheme.dark.text,
        iconColor: simpleTheme.dark.text,
        selectedIconColor: simpleTheme.dark.accent,
        selectedTextColor: simpleTheme.dark.accent,
        badgeColor: 'red',
        badgeTextColor: '#fff', // not supported yet in iOS/Android
        elevation: 5,
      },
    },
  };
}
export const defaultTheme: ThemeSettings = createSimpleTheme({
  light: {
    primary: '#6200ee',
    accent: '#6200ee',
    text: '#000',
  },
  dark: {
    primary: '#edabff',
    accent: '#edabff',
    text: '#fff',
  },
});

let theme: StateWithValue<ThemeSettings> = newRidgeState<ThemeSettings>(
  defaultTheme,
  {
    onSet: () => {
      refreshTheme();
    },
  }
);

export function getTheme() {
  return theme.get();
}

export function useTheme() {
  return theme.useValue();
}

export function setTheme(v: ThemeSettings) {
  return theme.set(v);
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

export type BottomTabComponent = ComponentType<{ orientation: Orientation }>;

export interface BottomTabComponents {
  // you can specify a end component which will be included in the bottom tabs
  start?: BottomTabComponent;
  // you can specify a end component which will be included in the bottom tabs
  end?: BottomTabComponent;
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
  elevation: number;
}

export interface Theme {
  bottomBar: ThemeBottomBar;
  layout: ThemeLayout;
  statusBar: OptionsStatusBar;
}

export interface SimpleTheme {
  text: Color;
  primary: Color;
  accent: Color;
}

export interface ThemeSettings {
  light: Theme;
  dark: Theme;
}

export interface SimpleThemeSettings {
  light: SimpleTheme;
  dark: SimpleTheme;
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
export interface RootChildSideMenu {
  type: 'sideMenu';
  children: SideMenuItem[];
}
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

export type RootValue =
  | RootChildNormal
  | RootChildBottomTabs
  | RootChildSideMenu;
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

export function preloadRoot(root: Root, rootKey: string, params: any) {
  const b = root[rootKey];

  switch (b.type) {
    case 'normal':
      setPreloadResult(b.child, b.child.preload(params));
      break;
    case 'bottomTabs':
      b.children.forEach(({ child }) =>
        setPreloadResult(child, child.preload(params))
      );
      break;
    case 'sideMenu':
      break;
  }
}

export type LinkRenderProps = {
  onPressIn?: (e: GestureResponderEvent) => any | undefined;
  onMouseDown?: (e: GestureResponderEvent) => any | undefined;
  onMouseEnter?: (e: GestureResponderEvent) => any;
  onPress: (e: GestureResponderEvent) => any;
  accessibilityRole?: 'link';
  href?: string;
};

export type LinkProps<T extends BaseScreen> = {
  to: T;
  params: ExtractRouteParams<T['path']>;
  children: (p: LinkRenderProps) => any;
  mode?: 'default' | 'sensitive'; // used on the web when 'aggressive' the preload() will be called on mouse enter
  onPress?: (event: GestureResponderEvent) => void;
};

export function createScreens(screenMap: Record<string, BaseScreen>) {
  return Object.keys(screenMap).map((key) => {
    return screenMap[key as keyof typeof screenMap]!;
  });
}
