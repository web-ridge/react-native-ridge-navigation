// history https://github.com/grahammendick/navigation/pull/677
import NavigationBar from './navigation/NavigationBar';

const NON_EMPTY_STRING = 'fix-swipe-back';
function HiddenNavbarWithSwipeBack() {
  return <NavigationBar hidden backTitle={NON_EMPTY_STRING} />;
}
export default HiddenNavbarWithSwipeBack;
