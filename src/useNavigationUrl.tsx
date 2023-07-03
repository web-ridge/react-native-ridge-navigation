import useUrl from './useUrl';
import * as React from 'react';
import type { Root } from './navigationUtils';
import { BottomTabType, getScreenKey, RootValue } from './navigationUtils';
import { Platform } from 'react-native';

function withoutBasePath(
  url: string | undefined,
  basePath: string | undefined
) {
  if (!url) {
    return undefined;
  }
  return basePath ? url.replace(`/${basePath}`, '') : url;
}
export function useNavigationUrl({
  navigationRoot,
  initialRootKey,
  basePath,
}: {
  navigationRoot: Root;
  initialRootKey: string;
  basePath: string | undefined;
}) {
  const cachedInitialRootKey = React.useRef<string | undefined>(initialRootKey);
  const initialDefaultUrl = React.useMemo(() => {
    const defaultRootKey =
      cachedInitialRootKey.current || Object.keys(navigationRoot)[0]!;
    const defaultRoot = navigationRoot[defaultRootKey]!;
    return '/' + getPathFromRoot(defaultRoot, undefined, defaultRootKey);
  }, [navigationRoot]);
  const initialUrl = useUrl() || initialDefaultUrl;
  const [goToUrl, setGoToUrl] = React.useState<string | undefined>(initialUrl);
  React.useEffect(() => {
    setGoToUrl(initialUrl);
  }, [initialUrl]);
  React.useEffect(() => {
    if (goToUrl) {
      // reset goToUrl after it has been handled, so we can handle new deep links
      // because in the meantime user can navigate away from goToUrl
      const timerId = setTimeout(() => {
        setGoToUrl(undefined);
      }, 1500);
      return () => {
        clearTimeout(timerId);
      };
    }
    return undefined;
  }, [goToUrl, setGoToUrl]);
  return {
    goToUrl: withoutBasePath(goToUrl, basePath),
    setGoToUrl,
    initialDefaultUrl: withoutBasePath(initialDefaultUrl, basePath)!,
  };
}
function getPathFromRoot(
  root: RootValue,
  tab: BottomTabType | undefined,
  rootKey: string
) {
  if (root.type === 'bottomTabs') {
    return getScreenKey(
      rootKey,
      tab || root.children[0],
      Platform.OS === 'web' ? root.children[0]!.path : undefined
    );
  }

  return getScreenKey(rootKey, undefined, root.child!.path);
}
