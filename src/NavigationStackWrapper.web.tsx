import * as React from 'react';
import BottomTabsWrapperWeb from './web/BottomTabsWrapperWeb';
import useCurrentRoot from './useCurrentRoot';
import { OptimizedContextProvider } from './contexts/OptimizedContext';
import BottomTabIndexProvider from './contexts/BottomTabIndexProvider';

export default function NavigationStackWrapper({
  children,
}: {
  children: any;
}) {
  const { currentRoot } = useCurrentRoot();
  let inner = children;

  if (currentRoot?.type === 'bottomTabs') {
    inner = (
      <BottomTabIndexProvider>
        <BottomTabsWrapperWeb>{children}</BottomTabsWrapperWeb>
      </BottomTabIndexProvider>
    );
  }
  return (
    <OptimizedContextProvider data={undefined} state={null}>
      {inner}
    </OptimizedContextProvider>
  );
}
