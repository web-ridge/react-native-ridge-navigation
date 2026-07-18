import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AsyncBoundary from './helpers/AsyncBoundary';

import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './queryClient';
import {
  createBottomTabsRoot,
  createNormalRoot,
  createScreens,
  createSimpleTheme,
  NavigationProvider,
} from 'react-native-ridge-navigation';
import routes from './Routes';

import AsyncBoundaryScreen from './helpers/AsyncBoundaryScreen';
import NavigationRoots from './NavigationRoots';
import BottomRoots from './BottomRoots';
import AppWebLayout from './AppWebLayout';
import { darkTheme, lightTheme } from './ui/theme';

const screens = createScreens(routes);

const theme = createSimpleTheme({
  light: {
    text: lightTheme.text,
    primary: lightTheme.primary,
    accent: lightTheme.accent,
    backgroundColor: lightTheme.background,
    bottomTabs: {
      backgroundColor: lightTheme.surface,
      textColor: lightTheme.muted,
      rippleColor: lightTheme.primary,
      selectedTextColor: lightTheme.primary,
      activeIndicatorColor: lightTheme.chip,
    },
  },
  dark: {
    text: darkTheme.text,
    primary: darkTheme.primary,
    accent: darkTheme.accent,
    backgroundColor: darkTheme.background,
    bottomTabs: {
      backgroundColor: darkTheme.surface,
      textColor: darkTheme.muted,
      rippleColor: darkTheme.primary,
      selectedTextColor: darkTheme.primary,
      activeIndicatorColor: darkTheme.chip,
    },
  },
});

const navigationRoot = {
  [NavigationRoots.RootHome]: createBottomTabsRoot(
    [BottomRoots.Home, BottomRoots.Posts, BottomRoots.Account],
    {
      breakingPointWidth: 600,
      components: {
        override: AppWebLayout,
      },
    }
  ),
  [NavigationRoots.RootAuth]: createNormalRoot(routes.AuthScreen),
  [NavigationRoots.RootExample]: createNormalRoot(routes.HomeScreen),
};

export default function App() {
  LogBox.ignoreLogs(['Require cycle: src/Navigator']);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AsyncBoundary>
          <NavigationProvider
            basePath="test-base-path"
            screens={screens}
            SuspenseContainer={AsyncBoundaryScreen}
            navigationRoot={navigationRoot}
            themeSettings={theme}
            initialRootKey={NavigationRoots.RootHome}
          />
        </AsyncBoundary>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
