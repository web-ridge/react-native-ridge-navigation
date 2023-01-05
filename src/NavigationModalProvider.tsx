import { NavigationHandler } from 'navigation-react';
import NavigationStack from './navigation/NavigationStack';
import NavigationBar from './navigation/NavigationBar';
import OptimizedContext, {
  OptimizedContextProvider,
} from './contexts/OptimizedContext';
import * as React from 'react';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import {
  createNormalRoot,
  makeVariablesNavigationFriendly,
  rootKeyAndPath,
} from './navigationUtils';
import { StateNavigator } from 'navigation';

function NavigationModalProvider({ children }: { children: any }) {
  const id = React.useId();
  const rootKey = 'navigationModalProvider_' + id.replace(':', '-)');
  console.log({ rootKey });
  const { theme } = React.useContext(OptimizedContext);
  const { screens, navigationRoot, ...rest } = React.useContext(
    RidgeNavigationContext
  );

  const rootNavigator = React.useMemo(() => {
    const stateInfos = [
      {
        key: rootKey,
        route: rootKey,
        trackCrumbTrail: false,
      },
      ...screens.map((screen) => ({
        key: rootKeyAndPath(rootKey, screen.path),
        route: makeVariablesNavigationFriendly(
          rootKeyAndPath(rootKey, screen.path)
        ),
        renderScene: () => <screen.element />,
        trackCrumbTrail: true,
      })),
    ];
    // TODO: verify memory history
    const navigator = new StateNavigator(stateInfos);
    navigator.start(rootKey);
    return navigator;
  }, [rootKey, screens]);

  const navigationRootWithModal = React.useMemo(
    () => ({
      [rootKey]: createNormalRoot({
        path: rootKey,
        preload: () => {},
        element: EmptyElement,
      }),
      ...navigationRoot,
    }),
    [navigationRoot, rootKey]
  );

  return (
    <RidgeNavigationContext.Provider
      value={{
        screens,
        // rootNavigator,
        // navigationRoot,
        // preloadedCache,
        // preloadRoot,
        // preloadScreen,
        // theme,
        // preloadElement,
        // SuspenseContainer,
        ...rest,
        rootNavigator,
        navigationRoot: navigationRootWithModal,
      }}
    >
      <NavigationHandler stateNavigator={rootNavigator}>
        <NavigationStack
          underlayColor={theme.layout.backgroundColor}
          backgroundColor={() => theme.layout.backgroundColor}
          unmountStyle={() => ''}
          renderScene={(state, data) => {
            return (
              <>
                <NavigationBar hidden={true} />
                <OptimizedContextProvider screenKey={state.key} data={data}>
                  {state.key === rootKey ? children : state.renderScene()}
                </OptimizedContextProvider>
              </>
            );
          }}
        />
      </NavigationHandler>
    </RidgeNavigationContext.Provider>
  );
}

function EmptyElement() {
  return null;
}
export default NavigationModalProvider;
