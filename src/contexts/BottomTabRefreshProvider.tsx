import * as React from 'react';
import BottomTabRefreshContext from './BottomTabRefreshContext';

export default function BottomTabRefreshProvider({
  children,
}: {
  children: any;
}) {
  const [renderIndex, setRenderIndex] = React.useState(0);
  const refresh = React.useCallback(() => {
    setRenderIndex((prev) => prev + 1);
  }, []);

  const value = React.useMemo(() => {
    return { renderIndex, refresh };
  }, [renderIndex, refresh]);

  return (
    <BottomTabRefreshContext.Provider value={value}>
      {children}
    </BottomTabRefreshContext.Provider>
  );
}
