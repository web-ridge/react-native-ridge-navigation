import * as React from 'react';

const BottomTabIndexContext = React.createContext<{
  setBottomTabIndex: (index: number) => void;
  bottomTabIndex: number | undefined;
}>({ bottomTabIndex: undefined, setBottomTabIndex: () => {} });
export default BottomTabIndexContext;
