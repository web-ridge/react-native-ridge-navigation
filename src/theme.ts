import type { ColorValue } from 'react-native';

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
  backgroundColor?: ColorValue;
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

export interface ThemeLayout {
  backgroundColor: ColorValue;
}

export interface ThemeBottomBar {
  backgroundColor: ColorValue;
  textColor: ColorValue;
  // iconColor: ColorValue;
  // selectedIconColor: ColorValue;
  selectedTextColor: ColorValue;
  activeIndicatorColor?: ColorValue;
  badgeColor?: ColorValue;
  badgeTextColor: ColorValue; // not supported yet in RNN
  elevation: number;
  labelVisibilityMode: 'auto' | 'labeled' | 'unlabeled' | 'selected';
  scrollsToTop: boolean;

  fontFamily?: string;
  fontWeight?: FontWeight;
  fontStyle?: 'normal' | 'italic';
  fontSize?: number;
}

export interface Theme {
  bottomBar: ThemeBottomBar;
  layout: ThemeLayout;
  statusBar: OptionsStatusBar;
}

type FontWeight =
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export interface SimpleTheme {
  text: ColorValue;
  primary: ColorValue;
  accent: ColorValue;
  backgroundColor?: ColorValue;
  bottomTabs?: {
    backgroundColor?: ColorValue;
    textColor?: ColorValue;
    selectedTextColor?: ColorValue;
    activeIndicatorColor?: ColorValue;
    fontFamily?: string;
    fontWeight?: FontWeight;
    fontStyle?: 'normal' | 'italic';
    fontSize?: number;
  };
}

export interface ThemeSettings {
  light: Theme;
  dark: Theme;
}

export interface SimpleThemeSettings {
  light: SimpleTheme;
  dark: SimpleTheme;
}

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
        backgroundColor: simpleTheme.light.backgroundColor || '#fff',
      },
      bottomBar: {
        backgroundColor:
          simpleTheme.light?.bottomTabs?.backgroundColor || '#fff',
        textColor:
          simpleTheme.light.bottomTabs?.textColor || simpleTheme.light.text,
        selectedTextColor:
          simpleTheme.light.bottomTabs?.selectedTextColor ||
          simpleTheme.light.accent,
        activeIndicatorColor:
          simpleTheme.light.bottomTabs?.activeIndicatorColor ||
          simpleTheme.light.accent,
        // badgeColor: "red",
        badgeTextColor: '#fff', // not supported yet in iOS/Android
        elevation: 5,
        labelVisibilityMode: 'labeled',
        scrollsToTop: true,
        fontFamily: simpleTheme.light.bottomTabs?.fontFamily,
        fontWeight: simpleTheme.light.bottomTabs?.fontWeight,
        fontStyle: simpleTheme.light.bottomTabs?.fontStyle,
        fontSize: simpleTheme.light.bottomTabs?.fontSize,
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
        backgroundColor: simpleTheme.dark.backgroundColor || '#000',
      },
      bottomBar: {
        backgroundColor:
          simpleTheme.dark.bottomTabs?.backgroundColor || '#121212',
        textColor:
          simpleTheme.dark.bottomTabs?.textColor || simpleTheme.dark.text,
        selectedTextColor:
          simpleTheme.dark.bottomTabs?.selectedTextColor ||
          simpleTheme.dark.accent,
        activeIndicatorColor:
          simpleTheme.dark.bottomTabs?.activeIndicatorColor ||
          simpleTheme.dark.accent,
        // badgeColor: "red",
        badgeTextColor: '#fff', // not supported yet in iOS/Android
        elevation: 5,
        labelVisibilityMode: 'labeled',
        scrollsToTop: true,
        fontFamily: simpleTheme.dark.bottomTabs?.fontFamily,
        fontWeight: simpleTheme.dark.bottomTabs?.fontWeight,
        fontStyle: simpleTheme.dark.bottomTabs?.fontStyle,
        fontSize: simpleTheme.dark.bottomTabs?.fontSize,
      },
    },
  };
}
export const defaultTheme: ThemeSettings = createSimpleTheme({
  light: {
    primary: '#6200ee',
    accent: '#6200ee',
    text: '#000',
    bottomTabs: {},
  },
  dark: {
    primary: '#edabff',
    accent: '#edabff',
    text: '#fff',
  },
});
