import * as React from 'react';
import type { BottomTabType } from './navigationUtils';
import BottomTabBadgesContext from './contexts/BottomTabBadgesContext';

export default function useBottomTabBadges() {
  const { setBadge, badges, setMultipleBadges } = React.useContext(
    BottomTabBadgesContext
  );

  const updateBadge = React.useCallback(
    <T extends BottomTabType>(tab: T, badge: string | number) => {
      setBadge(tab.path, badge);
    },
    [setBadge]
  );

  const updateBadges = React.useCallback(
    (
      multipleBadges: {
        tab: BottomTabType;
        badge: string | number;
      }[]
    ) => {
      const newBadges: Record<string, string | number> = {};
      multipleBadges.forEach(({ tab, badge }) => {
        newBadges[tab.path] = badge;
      });
      setMultipleBadges(newBadges);
    },
    [setMultipleBadges]
  );

  return {
    badges,
    updateBadge,
    updateBadges,
  };
}
