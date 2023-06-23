import { NavigationHandler } from 'navigation-react';
import NavigationStack from './navigation/NavigationStack';
import OptimizedContext, {
  OptimizedContextProvider,
} from './contexts/OptimizedContext';
import * as React from 'react';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import {
  createNormalRoot,
  makeVariablesNavigationFriendly,
  rootKeyAndPaths,
} from './navigationUtils';
import { StateNavigator } from 'navigation';
import { Text } from 'react-native';
import HiddenNavbarWithSwipeBack from './HiddenNavbarWithSwipeBack';
import OptimizedRenderScene from './OptimizedRenderScene';

function NavigationNestedProvider({ children }: { children: any }) {
  const id = React.useId();
  const rootKey = 'navigationModalProvider_' + id.replace(':', '--');
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
        renderScene: () => <EmptyElement />,
        preloadId: rootKey,
      },
      ...screens.map((screen) => ({
        key: rootKeyAndPaths(rootKey, screen.path),
        route: makeVariablesNavigationFriendly(
          rootKeyAndPaths(rootKey, screen.path)
        ),
        renderScene: () => <screen.element />,
        trackCrumbTrail: true,
        preloadId: screen.path,
      })),
    ];

    const navigator = new StateNavigator(stateInfos);
    navigator.historyManager.disabled = true;
    navigator.historyManager.stop();
    navigator.navigate(rootKey);

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
        ...rest,
        rootNavigator,
        navigationRoot: navigationRootWithModal,
      }}
    >
      <NavigationHandler stateNavigator={rootNavigator}>
        <NavigationStack
          underlayColor={theme.layout.backgroundColor}
          backgroundColor={() => theme.layout.backgroundColor}
          //@ts-ignore
          renderWeb={(key) => (key === rootKey ? children : undefined)}
          renderScene={(state, data) => {
            return (
              <>
                <HiddenNavbarWithSwipeBack />
                <OptimizedContextProvider
                  withSuspenseContainer={false}
                  state={state}
                  data={data}
                >
                  {state.key === rootKey ? (
                    children
                  ) : (
                    <OptimizedRenderScene renderScene={state.renderScene} />
                  )}
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
  return <Text>Empty</Text>;
}
export default NavigationNestedProvider;
