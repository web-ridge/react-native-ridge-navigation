import * as React from 'react';
import useNavigation from './useNavigation';
import OptimizedContext from './contexts/OptimizedContext';
import useCurrentRoot from './useCurrentRoot';
import { getBottomTabKeyFromPath } from './navigationUtils';

export default function useDeepLinkingBottomTabsIndex() {
  const { push } = useNavigation();
  const { currentRoot } = useCurrentRoot();
  const { stateNavigator } = React.useContext(OptimizedContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const children =
    currentRoot?.type === 'bottomTabs' ? currentRoot.children : [];
  const stateKey = stateNavigator.stateContext.state.key;
  const currentTabKey = getBottomTabKeyFromPath(stateKey);
  const bottomTabIndex = React.useMemo(() => {
    return (
      children.findIndex((child) => child.path === '/' + currentTabKey) || 0
    );
  }, [children, currentTabKey]);

  const setBottomTabIndex = React.useCallback(
    (index: number) => {
      const tab = children?.[index];
      const screen = children?.[index]?.child;
      if (screen) {
        push(screen, {}, { preload: true, toBottomTab: tab?.path });
      }
    },
    [children, push]
  );
  return React.useMemo(
    () => ({ bottomTabIndex, setBottomTabIndex }),
    [bottomTabIndex, setBottomTabIndex]
  );
}
