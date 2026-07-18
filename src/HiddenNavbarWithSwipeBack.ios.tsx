// history https://github.com/grahammendick/navigation/pull/677
import NavigationBar from './navigation/NavigationBar';

const NON_EMPTY_STRING = 'fix-swipe-back';
function HiddenNavbarWithSwipeBack({
  nativeHeader = false,
}: { nativeHeader?: boolean } = {}) {
  if (nativeHeader) {
    return null;
  }
  return <NavigationBar hidden backTitle={NON_EMPTY_STRING} />;
}
export default HiddenNavbarWithSwipeBack;
