import type { BaseScreen, Root } from './navigationUtils';

export type RootPreloadOptions = {
  includeInitialTab?: boolean;
};

/**
 * Resolve only the screens that should be fetched before starting a root.
 * Bottom-tab URL navigation is route-aware and preloads its requested screen
 * separately, so the generic root preload intentionally returns no tab.
 */
export function getRootPreloadScreens(
  root: Root[string],
  options: RootPreloadOptions = {}
): BaseScreen[] {
  if (root.type === 'bottomTabs') {
    const initialScreen = root.children[0]?.child;
    return options.includeInitialTab && initialScreen ? [initialScreen] : [];
  }

  return root.child ? [root.child] : [];
}
