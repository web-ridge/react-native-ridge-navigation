import * as React from 'react';

const BottomTabBadgesContext = React.createContext<{
  badges: Record<string, string | number>;
  setBadge: (key: string, badge: number | string) => void;
  setMultipleBadges: (multipleBadges: Record<string, string | number>) => void;
}>({} as any);

export default BottomTabBadgesContext;
