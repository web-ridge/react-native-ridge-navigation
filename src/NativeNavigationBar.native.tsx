import * as React from 'react';
import {
  NavigationBar,
  RightBar,
  SearchBar,
  type NavigationBarProps,
  type SearchBarProps,
} from 'navigation-react-native';

export type NativeNavigationSearch = Pick<
  SearchBarProps,
  | 'autoCapitalize'
  | 'barTintColor'
  | 'hideNavigationBar'
  | 'hideWhenScrolling'
  | 'obscureBackground'
  | 'onChangeText'
  | 'placeholder'
  | 'text'
>;

type Props = Pick<
  NavigationBarProps,
  | 'backImage'
  | 'backTitle'
  | 'barTintColor'
  | 'largeTitle'
  | 'shadowColor'
  | 'tintColor'
  | 'title'
  | 'titleColor'
> & {
  actions?: React.ReactNode;
  children: React.ReactNode;
  search?: NativeNavigationSearch;
};

/**
 * A visible platform navigation bar for a Ridge scene. It intentionally
 * complements the package's hidden swipe-back bar: mount this inside a scene
 * when the screen wants UIKit/Material chrome, native back affordances and a
 * real navigation search controller.
 */
export default function NativeNavigationBar({
  actions,
  children,
  search,
  ...navigationBarProps
}: Props) {
  const searchScene = search ? (
    <SearchBar {...search}>{children}</SearchBar>
  ) : null;

  return (
    <>
      <NavigationBar {...navigationBarProps} hidden={false}>
        {actions ? <RightBar>{actions}</RightBar> : null}
        {searchScene}
      </NavigationBar>
      {search ? null : children}
    </>
  );
}
