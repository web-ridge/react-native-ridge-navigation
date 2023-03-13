import * as React from 'react';
import type { StatusBarProps } from 'navigation-react-native';
function StatusBar({ barTintColor }: StatusBarProps) {
  React.useEffect(() => {
    if (barTintColor && typeof barTintColor === 'string') {
      const themeColor = document.querySelector('meta[name=theme-color]');
      themeColor?.setAttribute('content', barTintColor);
    }
  }, [barTintColor]);
}
export default StatusBar;
