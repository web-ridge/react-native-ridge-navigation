import * as React from 'react';

const BottomTabBadgesContext = React.createContext<{
  badges: Record<string, string | number>;
  setBadge: (key: string, badge: number | string) => void;
}>({} as any);

export default BottomTabBadgesContext;
