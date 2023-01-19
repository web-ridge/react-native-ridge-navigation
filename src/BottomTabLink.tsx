import * as React from 'react';
import type { BottomTabLinkProps, BottomTabType } from './navigationUtils';
import useBottomTabIndex from './useBottomTabIndex';
import Link from './Link';

export default function BottomTabLink<T extends BottomTabType>({
  to,
  params,
  children,
  onPress,
}: BottomTabLinkProps<T>) {
  const { currentTab } = useBottomTabIndex();
  const isSelected = currentTab === to;

  // TODO: testId =  testID={`bottomTab-${child.path}`}
  return (
    <Link to={to.child} params={params} onPress={onPress} mode="sensitive">
      {(linkProps) =>
        children({
          ...linkProps,
          isSelected,
        })
      }
    </Link>
  );
}
