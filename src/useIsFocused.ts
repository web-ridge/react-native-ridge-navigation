import * as React from 'react';
import { useNavigated, useUnloaded } from './useFocus';

export default function useIsFocused() {
  const [isFocused, setIsFocused] = React.useState(true);
  useNavigated(() => {
    setIsFocused(true);
  });
  useUnloaded(() => {
    setIsFocused(false);
  });
  return isFocused;
}
