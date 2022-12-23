import * as React from 'react';
import useCurrentRoot from './useCurrentRoot';
import {
  getFirstPartAndOthers,
  getPathFromUrl,
  RootChildBottomTabs,
  splitPath,
} from './navigationUtils';
import { Linking } from 'react-native';

export default function useDeepLinkingBottomTabsIndex() {
  const [bottomTabIndex, setBottomTabIndex] = React.useState(0);
  const { currentRoot } = useCurrentRoot();

  const setIndexFromUrl = React.useCallback(
    (url: string | null) => {
      if (url) {
        const path = getPathFromUrl(url);
        const { pathSplit } = getFirstPartAndOthers(splitPath(path));
        const newIndex = (
          currentRoot as RootChildBottomTabs
        ).children.findIndex((tab) => tab.path === '/' + pathSplit[0]);
        if (newIndex >= 0) {
          setBottomTabIndex(newIndex);
        }
      }
    },
    [currentRoot]
  );
  React.useEffect(() => {
    Linking.getInitialURL().then(setIndexFromUrl);
    const handler = Linking.addEventListener('url', ({ url }) =>
      setIndexFromUrl(url)
    );
    return () => {
      return handler.remove();
    };
  }, [setIndexFromUrl]);
  return React.useMemo(
    () => ({ bottomTabIndex, setBottomTabIndex }),
    [bottomTabIndex, setBottomTabIndex]
  );
}
