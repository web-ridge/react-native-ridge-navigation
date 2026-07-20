import * as React from 'react';
import RidgeNavigationContext from './RidgeNavigationContext';
import { NavigationContext } from 'navigation-react';
import type { Theme } from '../theme';
import { type BaseScreen, generatePath } from '../navigationUtils';
import type { StateNavigator } from 'navigation';
import type { State } from 'navigation';

// TODO: this could be deprecated in favor of a useContextSelector :)
// We only want to render the screen once, not twice
const OptimizedContext = React.createContext<{
  data: any;
  rootNavigator: StateNavigator;
  stateNavigator: StateNavigator;
  preloadRoot: (rootKey: string) => void;
  preloadScreen: (screen: BaseScreen, params: any) => any;
  preloadElement: (screen: BaseScreen) => void;
  theme: Theme;
  preloaded: any;
}>({} as any);

export function OptimizedContextProvider({
  data,
  state,
  children,
  stateNavigatorOverride,
}: {
  data: any;
  state: State | null;
  children: any;
  // When a pane renders its own scene stack (e.g. the middle column of
  // TripleSplitView), the Links inside must push through a specific navigator
  // — the select-into-next-pane proxy — rather than the ambient
  // NavigationContext navigator. Providing this overrides the stateNavigator
  // seen by descendants without needing a NavigationHandler (which would fight
  // the pane's own navigator for ownership).
  stateNavigatorOverride?: StateNavigator;
}) {
  const {
    preloadedCache,
    rootNavigator,
    preloadRoot,
    preloadScreen,
    preloadElement,
    theme,
  } = React.useContext(RidgeNavigationContext);
  const {
    stateNavigator: contextStateNavigator,
    state: fallbackState,
    data: fallbackData,
  } = React.useContext(NavigationContext);
  const stateNavigator = stateNavigatorOverride ?? contextStateNavigator;
  const preloadId = state?.preloadId || fallbackState?.preloadId;

  const params = data || fallbackData;

  // Scenes without a preloadId (e.g. synthetic roots) must not crash
  // generatePath and have nothing meaningful to render yet.
  const preloaded =
    typeof preloadId === 'string'
      ? preloadedCache[generatePath(preloadId, params ?? {})]
      : undefined;

  const value = React.useMemo(
    () => ({
      data: params,
      rootNavigator,
      stateNavigator,
      preloadRoot,
      preloadScreen,
      preloadElement,
      theme,
      preloaded,
    }),
    [
      params,
      rootNavigator,
      stateNavigator,
      preloadRoot,
      preloadScreen,
      preloadElement,
      theme,
      preloaded,
    ]
  );
  if (!preloadId) {
    return null;
  }
  return (
    <OptimizedContext.Provider value={value}>
      <React.Suspense fallback={null}>{children}</React.Suspense>
    </OptimizedContext.Provider>
  );
}
export default OptimizedContext;
