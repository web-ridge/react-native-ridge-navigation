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
  iconColor: ColorValue;
  selectedIconColor: ColorValue;
  selectedTextColor: ColorValue;
  activeIndicatorColor?: ColorValue;
  badgeColor?: ColorValue;
  badgeTextColor: ColorValue; // not supported yet in RNN
  elevation: number;
  labelVisibilityMode: 'auto' | 'labeled' | 'unlabeled' | 'selected';
  scrollsToTop: boolean;
}

export interface Theme {
  bottomBar: ThemeBottomBar;
  layout: ThemeLayout;
  statusBar: OptionsStatusBar;
}

export interface SimpleTheme {
  text: ColorValue;
  primary: ColorValue;
  accent: ColorValue;
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
        backgroundColor: '#fff',
      },
      bottomBar: {
        backgroundColor: '#fff',
        textColor: simpleTheme.light.text,
        iconColor: simpleTheme.light.text,
        selectedIconColor: simpleTheme.light.accent,
        selectedTextColor: simpleTheme.light.accent,
        activeIndicatorColor: simpleTheme.dark.accent,
        // badgeColor: "red",
        badgeTextColor: '#fff', // not supported yet in iOS/Android
        elevation: 5,
        labelVisibilityMode: 'labeled',
        scrollsToTop: true,
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
        activeIndicatorColor: simpleTheme.dark.accent,
        // badgeColor: "red",
        badgeTextColor: '#fff', // not supported yet in iOS/Android
        elevation: 5,
        labelVisibilityMode: 'labeled',
        scrollsToTop: true,
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
