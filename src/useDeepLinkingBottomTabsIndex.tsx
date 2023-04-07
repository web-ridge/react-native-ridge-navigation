import * as React from 'react';
import useCurrentRoot from './useCurrentRoot';
import { getBottomTabKeyFromPath, getPathFromUrl } from './navigationUtils';
import useUrl from './useUrl';

export default function useDeepLinkingBottomTabsIndex() {
  const { currentRoot } = useCurrentRoot();
  const initialUrl = useUrl();

  const children =
    currentRoot?.type === 'bottomTabs' ? currentRoot.children : [];

  const initialIndex = React.useMemo(() => {
    if (!initialUrl) {
      return 0;
    }
    const path = getPathFromUrl(initialUrl);
    const currentTabKey = getBottomTabKeyFromPath(path);
    return (
      children.findIndex((child) => child.path === '/' + currentTabKey) || 0
    );
  }, [children, initialUrl]);
  const [bottomTabIndex, setBottomTabIndex] = React.useState(initialIndex);
  React.useEffect(() => {
    if (initialIndex >= 0) {
      setBottomTabIndex(initialIndex);
    }
  }, [initialIndex]);

  return React.useMemo(
    () => ({ bottomTabIndex, setBottomTabIndex }),
    [bottomTabIndex, setBottomTabIndex]
  );
}
