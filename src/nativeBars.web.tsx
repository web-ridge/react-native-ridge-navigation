import * as React from 'react';
import type {
  NavigationBarProps as NativeNavigationBarProps,
  SharedElementProps as NativeSharedElementProps,
  BarButtonProps as NativeBarButtonProps,
} from 'navigation-react-native';

// Web stubs for the native header primitives. navigation-react-native's real
// components register native fabric views / invoke native modules at import
// time, which throws on web. On web the app draws its own DOM chrome
// (see AppWebLayout, CollapsingHeader.web.tsx), so these render passively:
// bar controls disappear, content-bearing wrappers pass children through.
export type NavigationBarProps = NativeNavigationBarProps;
export type SharedElementProps = NativeSharedElementProps;
export type BarButtonProps = NativeBarButtonProps;

const passthrough = (props: { children?: React.ReactNode }) => (
  <>{props.children ?? null}</>
);

/** No native bar on web — the app renders its own header chrome. */
export const NavigationBar = (_props: any) => null;
/** No native bar-button on web. */
export const BarButton = (_props: any) => null;
/** Bar containers render nothing on web. */
export const LeftBar = (_props: any) => null;
export const RightBar = (_props: any) => null;
/** Content wrappers pass their children straight through on web. */
export const SharedElement = passthrough;
export const CoordinatorLayout = passthrough;
export const CollapsingBar = passthrough;
