import * as React from 'react';
import useNavigation from './useNavigation';
import OptimizedContext from './contexts/OptimizedContext';
import useCurrentRoot from './useCurrentRoot';

export default function useDeepLinkingBottomTabsIndex() {
  const { push } = useNavigation();
  const { currentRoot, currentRootKey } = useCurrentRoot();
  const { stateNavigator } = React.useContext(OptimizedContext);
  const bottomTabIndex =
    currentRoot?.type === 'bottomTabs'
      ? currentRoot.children.findIndex(
          (child, index) =>
            stateNavigator.stateContext.state.key.startsWith(
              `/${currentRootKey}${child.path}`
            ) ||
            (stateNavigator.stateContext.state.key === currentRootKey &&
              index === 0)
        )
      : 0;

  const setBottomTabIndex = React.useCallback(
    (index: number) => {
      if (currentRoot?.type === 'bottomTabs') {
        const screen = currentRoot?.children?.[index]?.child;
        if (screen) {
          push(screen, {}, true);
        }
      }
    },
    [currentRoot, push]
  );
  return React.useMemo(
    () => ({ bottomTabIndex, setBottomTabIndex }),
    [bottomTabIndex, setBottomTabIndex]
  );
}
