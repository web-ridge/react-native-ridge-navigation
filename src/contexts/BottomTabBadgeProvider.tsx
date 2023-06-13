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

  const setMultipleBadges = React.useCallback(
    (multipleBadges: Record<string, string | number>) => {
      setBadges((prev) => ({ ...prev, ...multipleBadges }));
    },
    []
  );

  const value = React.useMemo(
    () => ({
      badges,
      setBadge,
      setMultipleBadges,
    }),
    [setBadge, badges, setMultipleBadges]
  );

  return (
    <BottomTabBadgesContext.Provider value={value}>
      {children}
    </BottomTabBadgesContext.Provider>
  );
}
