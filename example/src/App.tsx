import * as React from 'react';
import {
  MD3LightTheme,
  MD3DarkTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import { ColorSchemeName, LogBox, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AsyncBoundary from './helpers/AsyncBoundary';

import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './queryClient';
import {
  createBottomTabsRoot,
  createNormalRoot,
  createSimpleTheme,
  NavigationProvider,
} from 'react-native-ridge-navigation';
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { BottomRoot, NavigationRoots, screens } from './Navigator';
import routes from './Routes';
import AsyncBoundaryScreen from './helpers/AsyncBoundaryScreen';
import HeaderWeb from './HeaderWeb';

function getTheme(colorScheme: ColorSchemeName): typeof MD3LightTheme {
  const isDark = colorScheme === 'dark';
  const baseTheme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return {
    ...baseTheme,
    version: 3,
    mode: 'adaptive',
    dark: isDark,
    roundness: 10,
  };
}

let theme = createSimpleTheme({
  light: {
    text: MD3LightTheme.colors.onBackground,
    primary: MD3LightTheme.colors.primary,
    accent: MD3LightTheme.colors.primary,
    backgroundColor: MD3LightTheme.colors.background,
    // Optional styling of bottom tabs
    // bottomTabs: {
    //   backgroundColor: MD3LightTheme.colors.background,
    //   textColor: MD3LightTheme.colors.onBackground,
    //   selectedTextColor: MD3LightTheme.colors.primary,
    //   activeIndicatorColor: MD3LightTheme.colors.secondary,
    //   fontSize: 10,
    //   fontStyle: 'italic',
    //   fontWeight: '900',
    //   fontFamily: 'Arial',
    // },
  },
  dark: {
    text: MD3DarkTheme.colors.onBackground,
    primary: MD3DarkTheme.colors.primary,
    accent: MD3DarkTheme.colors.primary,
    backgroundColor: MD3DarkTheme.colors.background,
    // Optional styling of bottom tabs
    // bottomTabs: {
    //   backgroundColor: MD3DarkTheme.colors.background,
    //   textColor: MD3DarkTheme.colors.onBackground,
    //   selectedTextColor: MD3DarkTheme.colors.primary,
    //   activeIndicatorColor: MD3DarkTheme.colors.secondary,
    //   fontSize: 10,
    //   fontStyle: 'italic',
    //   fontWeight: '900',
    // fontFamily: 'sans-serif',
    // },
  },
});

const navigationRoot = {
  [NavigationRoots.RootHome]: createBottomTabsRoot(
    [BottomRoot.Home, BottomRoot.Posts, BottomRoot.Account],
    {
      breakingPointWidth: 500,
      components: {
        override: HeaderWeb,
      },
    }
  ),
  [NavigationRoots.RootAuth]: createNormalRoot(routes.AuthScreen),
};
export default function App() {
  const colorScheme = useColorScheme(); // Can be dark | light | no-preference
  const paperTheme = React.useMemo(() => getTheme(colorScheme), [colorScheme]);

  LogBox.ignoreLogs(['Require cycle: src/Navigator']);

  return (
    <QueryClientProvider client={queryClient}>
      {/*<ReactQueryDevtools initialIsOpen={false} />*/}
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <AsyncBoundary>
            <NavigationProvider
              screens={screens}
              SuspenseContainer={AsyncBoundaryScreen}
              navigationRoot={navigationRoot}
              themeSettings={theme}
            />
          </AsyncBoundary>
        </PaperProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
