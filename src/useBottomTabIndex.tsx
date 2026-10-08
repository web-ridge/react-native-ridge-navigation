import * as React from 'react';
import type { BottomTabType, RootChildBottomTabs } from './navigationUtils';
import useCurrentRoot from './useCurrentRoot';
import BottomTabIndexContext, {
  BottomTabActionsContext,
} from './contexts/BottomTabIndexContext';

export function useBottomTabActions() {
  const { currentRoot } = useCurrentRoot();
  const { getBottomTabIndex, setBottomTabIndex } = React.useContext(
    BottomTabActionsContext
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
  const getCurrentTab = React.useCallback(() => {
    if (currentRoot?.type !== 'bottomTabs') {
      return undefined;
    }
    const index = getBottomTabIndex();
    return index === undefined ? undefined : currentRoot.children[index];
  }, [currentRoot, getBottomTabIndex]);

  return { getCurrentTab, switchToTab };
}

export function useSwitchToBottomTab() {
  return useBottomTabActions().switchToTab;
}

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
