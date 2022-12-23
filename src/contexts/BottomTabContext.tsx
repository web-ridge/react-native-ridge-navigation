import * as React from 'react';

const BottomTabContext = React.createContext<{
  setBottomTabIndex: (index: number) => void;
  setBadge: (key: string, badge: number | string) => void;
}>({} as any);
export default BottomTabContext;
