import * as React from 'react';
import RidgeNavigationContext from './RidgeNavigationContext';
import { useContext } from 'react';
import { NavigationContext } from 'navigation-react';
import type { Theme } from '../theme';
import type { BaseScreen } from '../navigationUtils';
import type { StateNavigator } from 'navigation';

// TODO: this could be deprecated in favor of a useContextSelector :)
// We only want to render the screen once, not twice
const OptimizedContext = React.createContext<{
  data: any;
  rootNavigator: StateNavigator;
  stateNavigator: StateNavigator;
  preloadRoot: (rootKey: string) => void;
  preloadScreen: (key: string, result: any) => void;
  preloadElement: (screen: BaseScreen) => void;
  theme: Theme;
  preloaded: any;
}>({} as any);

export function OptimizedContextProvider({
  data,
  screenKey,
  children,
}: {
  data: any;
  screenKey: string;
  children: any;
}) {
  const {
    preloadedCache,
    rootNavigator,
    preloadRoot,
    preloadScreen,
    preloadElement,
    theme,
    SuspenseContainer,
  } = React.useContext(RidgeNavigationContext);
  const { stateNavigator } = useContext(NavigationContext);
  const value = React.useMemo(
    () => ({
      data,
      rootNavigator,
      stateNavigator,
      preloadRoot,
      preloadScreen,
      preloadElement,
      theme,
      preloaded: preloadedCache[screenKey],
    }),
    [
      data,
      rootNavigator,
      stateNavigator,
      preloadRoot,
      preloadScreen,
      preloadElement,
      theme,
      preloadedCache,
      screenKey,
    ]
  );
  return (
    <OptimizedContext.Provider value={value}>
      <SuspenseContainer>{children}</SuspenseContainer>
    </OptimizedContext.Provider>
  );
}
export default OptimizedContext;
