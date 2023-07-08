import * as React from 'react';
import type { StateNavigator } from 'navigation';
import type { BaseScreen, FluentParams, Root } from '../navigationUtils';
import type { Theme } from '../theme';
import type { FluentScreen } from '../navigationUtils';

const RidgeNavigationContext = React.createContext<{
  screens: BaseScreen[];
  rootNavigator: StateNavigator;
  navigationRoot: Root;
  preloadedCache: Record<string, any>;
  preloadRoot: (rootKey: string) => void;
  preloadScreen: (screen: BaseScreen, params: any) => void;
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
