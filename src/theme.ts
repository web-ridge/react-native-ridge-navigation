import type { ColorValue } from 'react-native';
import Color from 'color';

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
  rippleColor?: ColorValue;
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
    rippleColor?: ColorValue;
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
          Color(simpleTheme.light.accent).lighten(0.9).hex(),
        rippleColor:
          simpleTheme.light.bottomTabs?.rippleColor ||
          Color(simpleTheme.light.accent).lighten(0.9).hex(),
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
          Color(simpleTheme.dark.accent).darken(0.9).hex(),
        rippleColor:
          simpleTheme.dark.bottomTabs?.rippleColor ||
          Color(simpleTheme.dark.accent).darken(0.9).hex(),
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
