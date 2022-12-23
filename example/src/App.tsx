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
export default function App() {
  const colorScheme = useColorScheme(); // Can be dark | light | no-preference
  const paperTheme = React.useMemo(() => getTheme(colorScheme), [colorScheme]);

  const navigationRoot = React.useMemo(() => {
    return {
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
  }, []);
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
            />
          </AsyncBoundary>
        </PaperProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
