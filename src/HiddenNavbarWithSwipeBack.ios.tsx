// history https://github.com/grahammendick/navigation/pull/677
import * as React from 'react';
import NavigationBar from './navigation/NavigationBar';
import { NavigationBackGestureEnabledContext } from './contexts/RidgeNavigationContext';

const NON_EMPTY_STRING = 'fix-swipe-back';
function HiddenNavbarWithSwipeBack({
  nativeHeader = false,
}: { nativeHeader?: boolean } = {}) {
  const backGestureEnabled = React.useContext(
    NavigationBackGestureEnabledContext
  );
  if (nativeHeader) {
    return null;
  }
  return (
    <NavigationBar
      hidden
      backTitle={backGestureEnabled ? NON_EMPTY_STRING : ''}
    />
  );
}
export default HiddenNavbarWithSwipeBack;
