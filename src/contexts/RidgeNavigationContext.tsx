import * as React from 'react';
import type { StateNavigator } from 'navigation';
import type { BaseScreen, FluentParams, Root } from '../navigationUtils';
import type { Theme } from '../theme';
import type { FluentScreen } from '../navigationUtils';

const NavigationBackGestureContext = React.createContext<
  ((prevent: boolean) => () => void) | null
>(null);

export const NavigationBackGestureEnabledContext = React.createContext(true);

export function NavigationBackGestureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preventionCount, setPreventionCount] = React.useState(0);
  const register = React.useCallback((prevent: boolean) => {
    if (!prevent) return () => undefined;
    setPreventionCount((count) => count + 1);
    return () => setPreventionCount((count) => Math.max(0, count - 1));
  }, []);

  return (
    <NavigationBackGestureContext.Provider value={register}>
      <NavigationBackGestureEnabledContext.Provider
        value={preventionCount === 0}
      >
        {children}
      </NavigationBackGestureEnabledContext.Provider>
    </NavigationBackGestureContext.Provider>
  );
}

export function usePreventNativeBackGesture(prevent: boolean) {
  const register = React.useContext(NavigationBackGestureContext);
  React.useEffect(() => register?.(prevent), [prevent, register]);
}

const RidgeNavigationContext = React.createContext<{
  screens: BaseScreen[];
  rootNavigator: StateNavigator;
  navigationRoot: Root;
  preloadedCache: Record<string, any>;
  preloadRoot: (rootKey: string) => void;
  preloadScreen: (screen: BaseScreen, params: any) => any;
  preloadElement: (screen: BaseScreen) => void;
  theme: Theme;
  SuspenseContainer: any;
  fluent: (
    rootSettings: FluentParams,
    ...fluentScreens: FluentScreen[]
  ) => void;
  goToUrl: string | undefined;
  basePath: string | undefined;
}>(undefined as any);

export default RidgeNavigationContext;
