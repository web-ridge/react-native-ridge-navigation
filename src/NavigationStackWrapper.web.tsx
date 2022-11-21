import * as React from 'react';
import BottomTabsWrapperWeb from './web/BottomTabsWrapperWeb';
import useCurrentRoot from './useCurrentRoot';
import { OptimizedContextProvider } from './contexts/OptimizedContext';

export default function NavigationStackWrapper({
  children,
}: {
  children: any;
}) {
  console.log('NavigationStackWrapper');
  const { currentRootKey, currentRoot } = useCurrentRoot();
  console.log('NavigationStackWrapper', currentRootKey, { currentRoot });
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
