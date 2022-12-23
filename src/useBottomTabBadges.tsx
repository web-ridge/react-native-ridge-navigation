import * as React from 'react';
import type { BottomTabType } from './navigationUtils';
import BottomTabBadgesContext from './contexts/BottomTabBadgesContext';

export default function useBottomTabBadges() {
  const { setBadge, badges } = React.useContext(BottomTabBadgesContext);

  const updateBadge = React.useCallback(
    <T extends BottomTabType>(tab: T, badge: string | number) => {
      setBadge(tab.path, badge);
    },
    [setBadge]
  );

  return {
    badges,
    updateBadge,
  };
}
