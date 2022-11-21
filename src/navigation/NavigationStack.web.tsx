import React, { useContext } from 'react';
import { NavigationMotion } from 'navigation-react-mobile';
import { View, StyleSheet } from 'react-native';

import OptimizedContext, {
  OptimizedContextProvider,
} from '../contexts/OptimizedContext';

function NavigationStack() {
  const { theme } = useContext(OptimizedContext);
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
            {scene}
          </OptimizedContextProvider>
        </View>
      )}
    />
  );
}

export default NavigationStack;
