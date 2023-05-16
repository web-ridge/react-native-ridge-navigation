import * as React from 'react';

const BottomTabRefreshContext = React.createContext<{
  renderIndex: number;
  refresh: () => void;
}>({
  renderIndex: 0,
  refresh: () => {},
});

export default BottomTabRefreshContext;
