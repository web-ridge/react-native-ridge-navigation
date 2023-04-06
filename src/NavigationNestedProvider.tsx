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
  rootKeyAndPaths,
} from './navigationUtils';
import { StateNavigator } from 'navigation';
import { Text } from 'react-native';

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
      },
      ...screens.map((screen) => ({
        key: rootKeyAndPaths(rootKey, screen.path),
        route: makeVariablesNavigationFriendly(
          rootKeyAndPaths(rootKey, screen.path)
        ),
        renderScene: () => <screen.element />,
        trackCrumbTrail: true,
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
          //@ts-ignore
          renderWeb={(key) => (key === rootKey ? children : undefined)}
          renderScene={(state, data) => {
            return (
              <>
                <NavigationBar hidden={true} />
                <OptimizedContextProvider
                  withSuspenseContainer={false}
                  screenKey={state.key}
                  data={data}
                >
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
  return <Text>Empty</Text>;
}
export default NavigationNestedProvider;
