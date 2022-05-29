import useLatest from './useLatest';
import * as React from 'react';

export default function useFocus(callback: () => void) {
  const latestCallback = useLatest(callback);
  React.useEffect(() => {
    const lc = latestCallback.current;
    window.addEventListener('focus', lc);
    return () => {
      window.removeEventListener('focus', lc);
    };
  }, [latestCallback]);
}
