import * as React from 'react';
import { NavigationMotion } from 'navigation-react-mobile';

import OptimizedContext, {
  OptimizedContextProvider,
} from '../contexts/OptimizedContext';
import OptimizedRenderScene from '../OptimizedRenderScene';
import { StyleSheet, View } from 'react-native';

function NavigationStackW({ renderWeb }: { renderWeb?: (key: string) => any }) {
  const { theme } = React.useContext(OptimizedContext);
  const backgroundColor = theme.layout.backgroundColor as any;
  return (
    <NavigationMotion
      duration={0}
      unmountedStyle={{ translate: 100 }}
      mountedStyle={{ translate: 0 }}
      crumbStyle={{ translate: 0 }}
      renderMotion={({ translate }, scene, key) => {
        return (
          <View
            key={key}
            style={[
              StyleSheet.absoluteFill,
              {
                transform: `translate(${translate}%)` as any,
                backgroundColor,
                overflow: 'hidden',
              },
            ]}
          >
            {scene}
          </View>
        );
      }}
      renderScene={(state, data) => {
        return (
          <OptimizedContextProvider state={state} data={data}>
            {renderWeb?.(state.key) || (
              <OptimizedRenderScene renderScene={state.renderScene} />
            )}
          </OptimizedContextProvider>
        );
      }}
    />
  );
}

export default React.memo(NavigationStackW);
