import * as React from 'react';
import { NavigationMotion } from 'navigation-react-mobile';
import { View, StyleSheet } from 'react-native';

import OptimizedContext, {
  OptimizedContextProvider,
} from '../contexts/OptimizedContext';

function NavigationStack({ renderWeb }: { renderWeb?: (key: string) => any }) {
  const { theme } = React.useContext(OptimizedContext);
  return (
    <NavigationMotion
      duration={0}
      renderMotion={(_, scene, __, ___, state, data) => (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.layout.backgroundColor,
            },
          ]}
        >
          <OptimizedContextProvider screenKey={state.key} data={data}>
            {renderWeb?.(state.key) || scene}
          </OptimizedContextProvider>
        </View>
      )}
    />
  );
}

export default NavigationStack;
