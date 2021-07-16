import * as React from 'react';
import {
  DefaultTheme,
  DarkTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import {
  LogBox,
  Platform,
  ColorSchemeName,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AsyncBoundary from './helpers/AsyncBoundary';
import LimitedView from './helpers/LimitedView';

import { QueryClientProvider } from 'react-query';
import queryClient from './queryClient';

function getTheme(colorScheme: ColorSchemeName): typeof DarkTheme {
  const isDark = colorScheme === 'dark';
  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    mode: 'adaptive',
    dark: isDark,
    roundness: 10,
  };
}

export default function AppHOC<T extends object>(
  WrappedComponent: React.ComponentType<T>
): React.FC<T> {
  function Wrapper(wrapperProps: T) {
    const colorScheme = useColorScheme(); // Can be dark | light | no-preference
    const memoTheme = React.useMemo(() => getTheme(colorScheme), [colorScheme]);
    React.useEffect(() => {
      if (Platform.OS === 'android') {
        LogBox.ignoreLogs(['Setting a timer']);
      }
    }, []);
    return (
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <PaperProvider theme={memoTheme}>
            <LimitedView>
              <AsyncBoundary>
                <WrappedComponent {...wrapperProps} />
                {/*<OnlyRenderOnce>*/}

                {/*</OnlyRenderOnce>*/}
              </AsyncBoundary>
            </LimitedView>
          </PaperProvider>
          {Platform.OS === 'web' ? (
            <style type="text/css">{`
                      @font-face {
                        font-family: 'MaterialCommunityIcons';
                        src: url(${
                          require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf')
                            .default
                        }) format('truetype');
                      }
                    `}</style>
          ) : null}
        </SafeAreaProvider>
      </QueryClientProvider>
    );
  }

  return Wrapper;
}
