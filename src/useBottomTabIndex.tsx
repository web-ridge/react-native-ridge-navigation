import * as React from 'react';
import type { BottomTabType, RootChildBottomTabs } from './navigationUtils';
import useCurrentRoot from './useCurrentRoot';
import BottomTabIndexContext from './contexts/BottomTabIndexContext';

export default function useBottomTabIndex() {
  const { currentRoot } = useCurrentRoot();
  const { bottomTabIndex, setBottomTabIndex } = React.useContext(
    BottomTabIndexContext
  );

  const switchToTab = React.useCallback(
    async <T extends BottomTabType>(tab: T) => {
      setBottomTabIndex(
        (currentRoot as RootChildBottomTabs).children.findIndex(
          (child) => child.path === tab.path
        )
      );
    },
    [currentRoot, setBottomTabIndex]
  );

  const hasBottomIndex =
    bottomTabIndex !== undefined && bottomTabIndex !== null;
  const currentTab =
    hasBottomIndex && currentRoot?.type === 'bottomTabs'
      ? currentRoot?.children?.[bottomTabIndex]
      : undefined;
  return {
    switchToTab,
    currentTab,
    // setBottomTabIndex,
    // bottomTabIndex,
  };
}
