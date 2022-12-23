import * as React from 'react';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';
import useCurrentRoot from './useCurrentRoot';
import type { RootChildBottomTabs } from './navigationUtils';

export default function BottomTabsStack() {
  const { currentRoot } = useCurrentRoot();
  const root = currentRoot as RootChildBottomTabs;
  const { SuspenseContainer } = React.useContext(RidgeNavigationContext);
  const first = root.children[0];

  if (!first) {
    return null;
  }
  return (
    <SuspenseContainer>
      <first.child.element />
    </SuspenseContainer>
  );
}
