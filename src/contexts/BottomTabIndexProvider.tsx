import BottomTabIndexContext from './BottomTabIndexContext';
import { BottomTabActionsContext } from './BottomTabIndexContext';
import useDeepLinkingBottomTabsIndex from '../useDeepLinkingBottomTabsIndex';
import * as React from 'react';

export default function BottomTabIndexProvider({
  children,
}: {
  children: any;
}) {
  const value = useDeepLinkingBottomTabsIndex();
  const bottomTabIndex = React.useRef(value.bottomTabIndex);
  bottomTabIndex.current = value.bottomTabIndex;
  const actions = React.useMemo(
    () => ({
      getBottomTabIndex: () => bottomTabIndex.current,
      setBottomTabIndex: value.setBottomTabIndex,
    }),
    [value.setBottomTabIndex]
  );

  return (
    <BottomTabActionsContext.Provider value={actions}>
      <BottomTabIndexContext.Provider value={value}>
        {children}
      </BottomTabIndexContext.Provider>
    </BottomTabActionsContext.Provider>
  );
}
