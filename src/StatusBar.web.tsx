import * as React from 'react';
import type { StatusBarProps } from 'expo-status-bar';
const getElement = () => document.querySelector('meta[name=theme-color]');
function StatusBar({ backgroundColor }: StatusBarProps) {
  const originalColor = React.useRef<string | null>(
    getElement()?.getAttribute('content') || null
  );

  React.useEffect(() => {
    if (backgroundColor && typeof backgroundColor === 'string') {
      const themeColor = getElement();
      themeColor?.setAttribute('content', backgroundColor);

      const orgColor = originalColor.current;
      return () => {
        if (orgColor) {
          themeColor?.setAttribute('content', orgColor);
        } else {
          themeColor?.remove();
        }
      };
    }
    return undefined;
  }, [backgroundColor]);
  return null;
}
export default React.memo(StatusBar);
