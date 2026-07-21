import * as React from 'react';
import { NavigationMotion } from 'navigation-react-mobile';
import type { StateNavigator } from 'navigation';

import OptimizedContext, {
  OptimizedContextProvider,
} from '../contexts/OptimizedContext';
import { Head } from '../Head';
import type { BaseScreen } from 'react-native-ridge-navigation';
import { View, StyleSheet } from 'react-native';

function NavigationStack({
  renderWeb,
  stateNavigatorOverride,
}: {
  renderWeb?: (key: string) => any;
  /**
   * Route pushes/pops made from inside the rendered scenes through this
   * navigator instead of the ambient NavigationContext one. Used by
   * SplitView/TripleSplitView so a drill deeper inside the detail pane becomes a
   * main-navigator URL entry (deep-linkable + back-navigable) rather than a
   * private, history-less pane push. Undefined keeps the ambient navigator.
   */
  stateNavigatorOverride?: StateNavigator;
}) {
  const { theme } = React.useContext(OptimizedContext);
  return (
    <NavigationMotion
      unmountedStyle={{}}
      mountedStyle={{}}
      crumbStyle={{}}
      duration={0}
      renderMotion={(_, scene, key, active, state, data) => {
        const screen = state.screen as BaseScreen;
        const screenOptions = screen?.options;
        const title = screenOptions?.title;
        const description = screenOptions?.description;
        return (
          <View
            key={key}
            accessible={active}
            aria-hidden={!active}
            style={[
              StyleSheet.absoluteFill,
              styles.stack,
              {
                backgroundColor: theme.layout.backgroundColor,
              },
            ]}
          >
            {active && (
              <Head>
                <title>{title || ''}</title>
                <meta name="description" content={description || ''} />
              </Head>
            )}
            <OptimizedContextProvider
              state={state}
              data={data}
              stateNavigatorOverride={stateNavigatorOverride}
            >
              {renderWeb?.(state.key) || scene}
            </OptimizedContextProvider>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  stack: {
    overflow: 'hidden',
  },
});

export default NavigationStack;
