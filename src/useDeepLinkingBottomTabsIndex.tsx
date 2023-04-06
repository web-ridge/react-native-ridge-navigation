import * as React from 'react';
import useCurrentRoot from './useCurrentRoot';
import {
  getFirstPartAndOthers,
  getPathFromUrl,
  RootChildBottomTabs,
  splitPath,
} from './navigationUtils';
import * as Linking from 'expo-linking';

export default function useDeepLinkingBottomTabsIndex() {
  const [bottomTabIndex, setBottomTabIndex] = React.useState(0);
  const { currentRoot } = useCurrentRoot();
  const initialUrl = Linking.useURL();

  React.useEffect(() => {
    if (initialUrl && currentRoot?.type === 'bottomTabs') {
      const path = getPathFromUrl(initialUrl);
      const { pathSplit } = getFirstPartAndOthers(splitPath(path));
      const newIndex = (currentRoot as RootChildBottomTabs).children.findIndex(
        (tab) => tab.path === '/' + pathSplit[0]
      );
      if (newIndex >= 0) {
        setBottomTabIndex(newIndex);
      }
    }
  }, [currentRoot, initialUrl]);
  return React.useMemo(
    () => ({ bottomTabIndex, setBottomTabIndex }),
    [bottomTabIndex, setBottomTabIndex]
  );
}
