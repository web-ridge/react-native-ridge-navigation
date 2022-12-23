import * as React from 'react';
import type { BottomTabLinkProps, BottomTabType } from './navigationUtils';
import { useBottomTabIndex } from './index';
import Link from './Link';

export default function BottomTabLink<T extends BottomTabType>({
  to,
  params,
  children,
  onPress,
}: BottomTabLinkProps<T>) {
  const { currentTab } = useBottomTabIndex();
  const isSelected = currentTab === to;

  return (
    <Link to={to.child} params={params} onPress={onPress}>
      {(linkProps) =>
        children({
          ...linkProps,
          isSelected,
        })
      }
    </Link>
  );
}
