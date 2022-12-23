import * as React from 'react';
import BottomTabBadgesContext from './BottomTabBadgesContext';

export default function BottomTabBadgeProvider({
  children,
}: {
  children: any;
}) {
  const [badges, setBadges] = React.useState<Record<string, string | number>>(
    {}
  );
  const setBadge = React.useCallback((key: string, badge: string | number) => {
    setBadges((prev) => ({ ...prev, [key]: badge }));
  }, []);

  const value = React.useMemo(
    () => ({
      badges,
      setBadge,
    }),
    [setBadge, badges]
  );

  return (
    <BottomTabBadgesContext.Provider value={value}>
      {children}
    </BottomTabBadgesContext.Provider>
  );
}
