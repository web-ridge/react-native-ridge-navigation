import * as React from 'react';
import useNavigation from './useNavigation';
import OptimizedContext from './contexts/OptimizedContext';
import useCurrentRoot from './useCurrentRoot';
import type { RootChildBottomTabs } from './navigationUtils';

export default function useDeepLinkingBottomTabsIndex() {
  const { push } = useNavigation();
  const { currentRoot: cr, currentRootKey } = useCurrentRoot();
  const currentRoot = cr as RootChildBottomTabs;
  const { stateNavigator } = React.useContext(OptimizedContext);
  const bottomTabIndex = currentRoot.children.findIndex(
    (child, index) =>
      stateNavigator.stateContext.state.key.startsWith(
        `/${currentRootKey}${child.path}`
      ) ||
      (stateNavigator.stateContext.state.key === currentRootKey && index === 0)
  );

  const setBottomTabIndex = React.useCallback(
    (index: number) => {
      const screen = currentRoot.children?.[index]?.child;
      if (screen) {
        push(screen, {}, true);
      }
    },
    [currentRoot.children, push]
  );
  return React.useMemo(
    () => ({ bottomTabIndex, setBottomTabIndex }),
    [bottomTabIndex, setBottomTabIndex]
  );
}
