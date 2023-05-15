import * as React from 'react';
import StatusBar from './StatusBar';
import type { StatusBarProps } from 'expo-status-bar';
import useIsFocused from './useIsFocused';

function FocusAwareStatusBar(props: StatusBarProps) {
  const isFocused = useIsFocused();
  if (!isFocused) {
    return null;
  }
  return <StatusBar {...props} />;
}

export default React.memo(FocusAwareStatusBar);
