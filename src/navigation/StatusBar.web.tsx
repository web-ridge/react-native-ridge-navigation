import * as React from 'react';
import type { StatusBarProps } from 'expo-status-bar';

function StatusBar({ backgroundColor }: StatusBarProps) {
  React.useEffect(() => {
    if (backgroundColor && typeof backgroundColor === 'string') {
      const themeColor = document.querySelector('meta[name=theme-color]');
      themeColor?.setAttribute('content', backgroundColor);
    }
  }, [backgroundColor]);
}
export default StatusBar;
