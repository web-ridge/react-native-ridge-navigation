import * as React from 'react';
import {
  DefaultTheme,
  DarkTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import { ColorSchemeName, Platform, useColorScheme } from 'react-native';

import AsyncBoundary from './helpers/AsyncBoundary';
import LimitedView from './helpers/LimitedView';

function getTheme(colorScheme: ColorSchemeName): typeof DarkTheme {
  const isDark = colorScheme === 'dark';
  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    mode: 'adaptive',
    dark: isDark,
    roundness: 10,
    colors: {
      ...baseTheme.colors,
      background: isDark ? '#121212' : '#ffffff',
      primary: isDark ? '#908DA4' : '#211a48',
      accent: isDark ? '#BBD78A' : '#76ae14',
    },
  };
}

export default function AppHOC<T extends object>(
  WrappedComponent: React.ComponentType<T>
): React.FC<T> {
  function Wrapper(wrapperProps: T) {
    const colorScheme = useColorScheme(); // Can be dark | light | no-preference
    const memoTheme = React.useMemo(() => getTheme(colorScheme), [colorScheme]);

    return (
      <PaperProvider theme={memoTheme}>
        <LimitedView>
          {Platform.OS === 'web' ? (
            <style type="text/css">
              {`@font-face {
                font-family: 'MaterialCommunityIcons';
                src: url(${
                  require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf')
                    .default
                }) format('truetype');
              }`}
            </style>
          ) : null}
          <AsyncBoundary>
            <WrappedComponent {...wrapperProps} />
          </AsyncBoundary>
        </LimitedView>
      </PaperProvider>
    );
  }

  return Wrapper;
}
