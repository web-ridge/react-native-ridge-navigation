import type { RootChildBottomTabs } from './navigationUtils';
import * as React from 'react';
import RidgeNavigationContext from './contexts/RidgeNavigationContext';

export default function BottomTabs({
  root,
}: {
  root: RootChildBottomTabs;
  rootKey: string;
}) {
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
