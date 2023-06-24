import * as React from 'react';
import { NavigationMotion } from 'navigation-react-mobile';

import OptimizedContext, {
  OptimizedContextProvider,
} from '../contexts/OptimizedContext';
import { Head } from '../Head';
import type { BaseScreen } from 'react-native-ridge-navigation';

function NavigationStack({ renderWeb }: { renderWeb?: (key: string) => any }) {
  const { theme } = React.useContext(OptimizedContext);
  return (
    <NavigationMotion
      duration={0}
      renderMotion={(_, scene, key, active, state, data) => {
        const screen = state.screen as BaseScreen;
        const screenOptions = screen?.options;
        const title = screenOptions?.title;
        const description = screenOptions?.description;
        return (
          <div
            key={key}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              overflow: 'hidden',
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              // opacity: 1,
              backgroundColor: theme.layout.backgroundColor as any,
            }}
          >
            {active && (
              <Head>
                <title>{title || ''}</title>
                <meta name="description" content={description || ''} />
              </Head>
            )}
            <OptimizedContextProvider state={state} data={data}>
              {renderWeb?.(state.key) || scene}
            </OptimizedContextProvider>
          </div>
        );
      }}
    />
  );
}

export default NavigationStack;
