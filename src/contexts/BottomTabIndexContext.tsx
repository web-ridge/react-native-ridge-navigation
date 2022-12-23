import * as React from 'react';

const BottomTabIndexContext = React.createContext<{
  setBottomTabIndex: (index: number) => void;
  bottomTabIndex: number;
}>(undefined as any);
export default BottomTabIndexContext;
