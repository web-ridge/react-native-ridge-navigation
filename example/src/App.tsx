import * as React from 'react';
import {
  MD3LightTheme,
  MD3DarkTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import {
  type ColorSchemeName,
  Image,
  LogBox,
  useColorScheme,
  View,
} from 'react-native';
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

const screens = createScreens(routes);

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
    bottomTabs: {
      backgroundColor: MD3LightTheme.colors.surface,
      textColor: MD3LightTheme.colors.onSurfaceVariant,
      rippleColor: MD3LightTheme.colors.primary,
      selectedTextColor: MD3LightTheme.colors.onSecondaryContainer,
      activeIndicatorColor: MD3LightTheme.colors.secondaryContainer,
      // fontSize: 13,
      // fontFamily: 'Montserrat',
      // fontWeight: '500',
    },
    // bottomTabs: {
    //   rippleColor: MD3LightTheme.colors.secondaryContainer,
    //   activeIndicatorColor: MD3LightTheme.colors.secondaryContainer,
    // },
  },
  dark: {
    text: MD3DarkTheme.colors.onBackground,
    primary: MD3DarkTheme.colors.primary,
    accent: MD3DarkTheme.colors.primary,
    backgroundColor: MD3DarkTheme.colors.background,
    // bottomTabs: {
    //   rippleColor: MD3DarkTheme.colors.secondaryContainer,
    //   activeIndicatorColor: MD3DarkTheme.colors.secondaryContainer,
    // },
    // Optional styling of bottom tabs
    bottomTabs: {
      backgroundColor: MD3DarkTheme.colors.surface,
      textColor: MD3DarkTheme.colors.onSurfaceVariant,
      rippleColor: MD3DarkTheme.colors.primary,
      selectedTextColor: MD3DarkTheme.colors.onSecondaryContainer,
      activeIndicatorColor: MD3DarkTheme.colors.secondaryContainer,
      // fontSize: 13,
      // fontFamily: 'Montserrat',
      // fontWeight: '500',
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
        start: ({ orientation }) => {
          if (orientation === 'vertical') {
            return null;
          }
          return (
            <View
              style={{
                marginTop: 24,
                marginBottom: 24,
                alignItems: 'center',
                justifyContent: 'center',
                // alignSelf: 'center',
                paddingHorizontal: 16,
              }}
            >
              <Image
                source={{
                  uri: 'https://webridge-assets.s3.eu-central-1.amazonaws.com/half5-logo.png',
                }}
                style={{ height: 60, width: 186 }}
              />
            </View>
          );
        },
      },
    }
  ),
  [NavigationRoots.RootAuth]: createNormalRoot(routes.AuthScreen),
  [NavigationRoots.RootExample]: createNormalRoot(routes.HomeScreen),
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
              basePath="test-base-path"
              screens={screens}
              SuspenseContainer={AsyncBoundaryScreen}
              navigationRoot={navigationRoot}
              themeSettings={theme}
              initialRootKey={NavigationRoots.RootHome}
            />
          </AsyncBoundary>
        </PaperProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
