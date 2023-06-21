import * as React from 'react';
import useCurrentRoot from './useCurrentRoot';
import { getBottomTabKeyFromPath, getPathFromUrl } from './navigationUtils';

import RidgeNavigationContext from './contexts/RidgeNavigationContext';

export default function useDeepLinkingBottomTabsIndex() {
  const { goToUrl } = React.useContext(RidgeNavigationContext);
  const { currentRoot } = useCurrentRoot();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const children =
    currentRoot?.type === 'bottomTabs' ? currentRoot.children : [];

  const initialIndex = React.useMemo(() => {
    if (!goToUrl) {
      return undefined;
    }
    const path = getPathFromUrl(goToUrl);
    const currentTabKey = getBottomTabKeyFromPath(path);
    return (
      children.findIndex((child) => child.path === '/' + currentTabKey) || 0
    );
  }, [children, goToUrl]);
  const [bottomTabIndex, setBottomTabIndex] = React.useState(initialIndex || 0);
  React.useEffect(() => {
    if (initialIndex !== undefined) {
      setBottomTabIndex(initialIndex);
    }
  }, [initialIndex]);

  return React.useMemo(
    () => ({ bottomTabIndex, setBottomTabIndex }),
    [bottomTabIndex, setBottomTabIndex]
  );
}
