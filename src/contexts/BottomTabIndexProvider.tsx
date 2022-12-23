import * as React from 'react';
import BottomTabIndexContext from './BottomTabIndexContext';
import useDeepLinkingBottomTabsIndex from '../useDeepLinkingBottomTabsIndex';

export default function BottomTabIndexProvider({
  children,
}: {
  children: any;
}) {
  const value = useDeepLinkingBottomTabsIndex();

  return (
    <BottomTabIndexContext.Provider value={value}>
      {children}
    </BottomTabIndexContext.Provider>
  );
}
