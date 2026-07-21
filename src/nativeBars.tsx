// Native header primitives — real navigation-react-native components.
// A `.web.tsx` sibling provides safe stubs so importing these never pulls
// native modules into the web bundle (which crashes with
// "__fbBatchedBridgeConfig is not set"). Screens use one import; the platform
// extension decides whether it's the real UIKit bar or a web no-op.
export {
  NavigationBar,
  SharedElement,
  CoordinatorLayout,
  CollapsingBar,
  LeftBar,
  RightBar,
  BarButton,
  type NavigationBarProps,
  type SharedElementProps,
  type BarButtonProps,
} from 'navigation-react-native';
