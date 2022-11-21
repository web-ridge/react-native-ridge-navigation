import * as React from 'react';

const BottomTabContext = React.createContext<{
  bottomTabIndex: number;
  setBottomTabIndex: (index: number) => void;
  badges: Record<string, number | string>;
  setBadge: (key: string, badge: number | string) => void;
}>({} as any);
export default BottomTabContext;
