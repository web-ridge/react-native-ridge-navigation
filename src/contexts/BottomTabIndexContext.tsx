import * as React from 'react';

const BottomTabIndexContext = React.createContext<{
  setBottomTabIndex: (index: number) => void;
  bottomTabIndex: number | undefined;
}>({ bottomTabIndex: undefined, setBottomTabIndex: () => {} });

export type BottomTabActions = {
  getBottomTabIndex: () => number | undefined;
  setBottomTabIndex: (index: number) => void;
};

export const BottomTabActionsContext = React.createContext<BottomTabActions>({
  getBottomTabIndex: () => undefined,
  setBottomTabIndex: () => {},
});

export default BottomTabIndexContext;
