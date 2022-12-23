import * as React from 'react';
import BottomTabsWrapperWeb from './web/BottomTabsWrapperWeb';
import useCurrentRoot from './useCurrentRoot';
import { OptimizedContextProvider } from './contexts/OptimizedContext';

export default function NavigationStackWrapper({
  children,
}: {
  children: any;
}) {
  const { currentRootKey, currentRoot } = useCurrentRoot();
  let inner = children;

  if (currentRoot?.type === 'bottomTabs') {
    inner = (
      <BottomTabsWrapperWeb
        currentRoot={currentRoot}
        currentRootKey={currentRootKey}
      >
        {children}
      </BottomTabsWrapperWeb>
    );
  }
  return (
    <OptimizedContextProvider data={undefined} screenKey={currentRootKey}>
      {inner}
    </OptimizedContextProvider>
  );
}
