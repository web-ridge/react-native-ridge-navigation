import * as React from 'react';
import type { StateNavigator } from 'navigation';
import type { BaseScreen, Root } from '../navigationUtils';
import type { Theme } from '../theme';

const RidgeNavigationContext = React.createContext<{
  rootNavigator: StateNavigator;
  navigationRoot: Root;
  preloadedCache: Record<string, any>;
  preloadRoot: (rootKey: string) => void;
  preloadScreen: (key: string, preload: any) => void;
  preloadElement: (screen: BaseScreen) => void;
  theme: Theme;
  SuspenseContainer: any;
}>(undefined as any);

export default RidgeNavigationContext;