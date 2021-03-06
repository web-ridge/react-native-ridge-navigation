// https://github.com/ReactTraining/react-router/blob/dev/docs/api-reference.md
import * as React from 'react';
import {
  BaseScreen,
  BottomTabType,
  ExtractRouteParams,
  Orientation,
  preloadRoot,
  Root,
  RootValue,
  setTheme,
  ThemeSettings,
} from './navigationUtils';
import { BrowserRouter } from './react-router-dom';
import {
  Routes,
  Route,
  useParams as useParamsImpl,
  generatePath,
  useNavigate,
  useLocation,
} from './react-router';

import { setPreloadResult } from './Preloader';
import { View, useWindowDimensions, StyleSheet } from 'react-native';

import BottomTabs from './BottomTabs';
import SwitchRoot from './SwitchRoot';
import { newRidgeState } from 'react-ridge-state';
import useLatest from './useLatest';

let screenItems: BaseScreen[] = [];
let root: Root = {};

export function useParams<T extends BaseScreen>(
  _: T,
  __: any
): ExtractRouteParams<T['path']> {
  return useParamsImpl() as any;
}

function rootKeyAndPath(rootKey: string, path: string) {
  return '/' + rootKey + path;
}

export const badgesCount = newRidgeState<Record<string, string>>({});
export const bottomTabRenderIndex = newRidgeState<number>(0);

export function updateBadge<T extends BottomTabType>(tab: T, badge: string) {
  badgesCount.set((prev) => ({ ...prev, [tab.path]: badge }));
}

export function refreshBottomTabs() {
  bottomTabRenderIndex.set((prev) => prev + 1);
}

export async function staticPush<T extends BaseScreen>(
  //@ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  screen: T,
  //@ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params: ExtractRouteParams<T['path']>,
  //@ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  preload
) {
  console.debug('staticPush not implemented on the web');
}

export function refreshTheme() {
  // web automatically subscribes since we don't have native components
}

export function useFocus(callback: () => void) {
  const latestCallback = useLatest(callback);
  React.useEffect(() => {
    const lc = latestCallback.current;
    window.addEventListener('focus', lc);
    return () => {
      window.removeEventListener('focus', lc);
    };
  }, [latestCallback]);
}

export function useRootKey() {
  const { pathname } = useLocation();
  return pathname.split('/')?.[1];
}

export function useNavigation() {
  const navigate = useNavigate();
  const oldRootKey = useRootKey();

  return {
    refreshBottomTabs,
    updateBadge,
    pop: async () => {
      // Pass the delta you want to go in the history stack.
      // For example, navigate(-1) is equivalent to hitting the back button.
      navigate(-1);
    },
    switchBottomTabIndex: async (index: number) => {
      const currentRoot = root[oldRootKey];
      if (currentRoot?.type === 'bottomTabs') {
        const child = currentRoot.children?.[index]?.child;
        navigate(generatePath(rootKeyAndPath(oldRootKey, child.path), {}));
      }
    },
    switchRoot: async (rootKey: string, params: any, preload = true) => {
      if (preload) {
        preloadRoot(root, rootKey, params);
      }

      const currentRoot = root[rootKey];

      switch (currentRoot?.type) {
        case 'normal':
          const s = currentRoot.child;
          console.log({ rootKey, path: s.path });
          navigate(generatePath(rootKeyAndPath(rootKey, s.path), params));
          break;
        case 'bottomTabs':
          const child = currentRoot.children?.[0]?.child;
          console.log({ rootKey, path: child.path });
          navigate(generatePath(rootKeyAndPath(rootKey, child.path), params));
          break;
        case 'sideMenu':
      }
    },
    preload: async <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>
    ) => {
      setPreloadResult(screen, screen.preload(params));
    },
    push: async <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      preload = true
    ) => {
      if (preload) {
        setPreloadResult(screen, screen.preload(params));
      }
      navigate(generatePath(rootKeyAndPath(oldRootKey, screen.path), params));
    },
    replace: async <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      preload = true
    ) => {
      if (preload) {
        setPreloadResult(screen, screen.preload(params));
      }
      navigate(generatePath(rootKeyAndPath(oldRootKey, screen.path), params), {
        replace: true,
      });
    },
  };
}

function useAboveBreakingPoint(breakingPoint: number) {
  const { width } = useWindowDimensions();
  return width > breakingPoint;
}

function NavContainer({
  orientation,
  children,
}: {
  orientation: Orientation;
  children: any;
}) {
  return (
    <View style={[navStyles.root, navStyles[orientation]]}>{children}</View>
  );
}

const navStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  horizontal: { flexDirection: 'row' },
  vertical: { flexDirection: 'column-reverse' },
  full: { flex: 1 },
});

function Nav({
  orientation,
  currentRoot,
  rootKey,
}: {
  orientation: Orientation;
  currentRoot: RootValue;
  rootKey: string;
}) {
  return (
    <>
      {currentRoot?.type === 'bottomTabs' ? (
        <BottomTabs
          bottomTabsRoot={currentRoot}
          rootKey={rootKey}
          orientation={orientation}
        />
      ) : null}
    </>
  );
}

const defaultBreakingPoint = 1200;
function getBreakingPointFromRoot(v?: RootValue): number {
  let configuredBreakingPoint: number | null | undefined;
  if (v?.type === 'bottomTabs') {
    configuredBreakingPoint = v.breakingPointWidth;
  }
  if (v?.type === 'sideMenu') {
    // configuredBreakingPoints = v.breakingPointWidth;
  }

  // user explicitly set the breaking point to null, so we never will make sure the breaking point will never happen
  if (configuredBreakingPoint === null) {
    configuredBreakingPoint = Infinity;
  }
  return configuredBreakingPoint || defaultBreakingPoint;
}

function NavigationInnerRoot({
  SuspenseContainer,
}: {
  SuspenseContainer: any;
}) {
  const rootKey = useRootKey();
  const currentRoot = root[rootKey];
  const aboveBreakingPoint = useAboveBreakingPoint(
    getBreakingPointFromRoot(currentRoot)
  );
  const orientation = aboveBreakingPoint ? 'horizontal' : 'vertical';
  return (
    <NavContainer orientation={orientation}>
      <Nav
        orientation={orientation}
        rootKey={rootKey}
        currentRoot={currentRoot}
      />
      <View style={navStyles.full}>
        <SuspenseContainer>
          <Routes>
            <Route
              path={'/'}
              element={
                <SwitchRoot rootKey={Object.keys(root)[0]} params={{}} />
              }
            />
            {screenItems.map((screen, i) => (
              <Route
                key={i}
                path={'/:rootKey' + screen.path}
                preload={(params) => {
                  setPreloadResult(screen, screen.preload(params));
                }}
                element={
                  <SuspenseContainer>
                    <screen.element />
                  </SuspenseContainer>
                }
              />
            ))}
          </Routes>
        </SuspenseContainer>
      </View>
    </NavContainer>
  );
}

export function NavigationRoot({
  SuspenseContainer,
}: {
  SuspenseContainer: any;
}) {
  return (
    <BrowserRouter>
      <NavigationInnerRoot SuspenseContainer={SuspenseContainer} />
    </BrowserRouter>
  );
}

export function createNavigation<ScreenItems extends BaseScreen[]>(
  themeSettings: ThemeSettings,
  screens: ScreenItems,
  r: Root,
  _: any
): any {
  setTheme(themeSettings);
  root = r;
  screenItems = screens;

  return;
}
