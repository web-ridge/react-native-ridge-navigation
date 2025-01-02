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

  return (
    <Link
      to={to.child}
      params={params}
      onPress={onPress}
      linkMode="sensitive"
      toBottomTab={to}
    >
      {(linkProps) =>
        children({
          ...linkProps,
          isSelected,
          testID: `bottomTab-${to.child.path}`,
        })
      }
    </Link>
  );
}
