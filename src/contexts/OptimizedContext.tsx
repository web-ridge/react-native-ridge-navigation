import * as React from 'react';
import RidgeNavigationContext from './RidgeNavigationContext';
import { NavigationContext } from 'navigation-react';
import type { Theme } from '../theme';
import { BaseScreen, generatePath } from '../navigationUtils';
import type { StateNavigator } from 'navigation';
import type { State } from 'navigation';

// TODO: this could be deprecated in favor of a useContextSelector :)
// We only want to render the screen once, not twice
const OptimizedContext = React.createContext<{
  data: any;
  rootNavigator: StateNavigator;
  stateNavigator: StateNavigator;
  preloadRoot: (rootKey: string) => void;
  preloadScreen: (screen: BaseScreen, params: any) => void;
  preloadElement: (screen: BaseScreen) => void;
  theme: Theme;
  preloaded: any;
}>({} as any);

export function OptimizedContextProvider({
  data,
  state,
  children,
  withSuspenseContainer = true,
}: {
  data: any;
  state: State | null;
  children: any;
  withSuspenseContainer?: boolean;
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
  const {
    stateNavigator,
    state: fallbackState,
    data: fallbackData,
  } = React.useContext(NavigationContext);
  const preloadId = state?.preloadId || fallbackState?.preloadId;
  const params = data || fallbackData;

  const value = React.useMemo(
    () => ({
      data: params,
      rootNavigator,
      stateNavigator,
      preloadRoot,
      preloadScreen,
      preloadElement,
      theme,
      preloaded: preloadedCache[generatePath(preloadId, params)],
    }),
    [
      params,
      rootNavigator,
      stateNavigator,
      preloadRoot,
      preloadScreen,
      preloadElement,
      theme,
      preloadedCache,
      preloadId,
    ]
  );
  return (
    <OptimizedContext.Provider value={value}>
      {withSuspenseContainer ? (
        <SuspenseContainer>{children}</SuspenseContainer>
      ) : (
        <React.Suspense fallback={null}>{children}</React.Suspense>
      )}
    </OptimizedContext.Provider>
  );
}
export default OptimizedContext;
