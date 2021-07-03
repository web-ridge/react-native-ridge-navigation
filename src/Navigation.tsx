// https://github.com/ReactTraining/react-router/blob/dev/docs/api-reference.md
import * as React from 'react';
import {
  BaseScreen,
  BottomTabType,
  ExtractRouteParams,
  preloadRoot,
  Root,
} from './navigationUtils';

import {
  BrowserRouter,
  Routes,
  Route,
  useParams as useParamsImpl,
  generatePath,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import preloader from './Preloader';
import { View, useWindowDimensions, StyleSheet } from 'react-native';

import BottomTabs from './BottomTabs';
import SwitchRoot from './SwitchRoot';
import { newRidgeState } from 'react-ridge-state';

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

export function useFocus(_: () => void) {
  // TODO implement
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
    switchBottomTabIndex: async (_: number) => {
      // alert('not implemented');
      console.log('not im');
    },
    switchRoot: async (rootKey: string, params: any, preload = true) => {
      if (preload) {
        preloadRoot(root, rootKey, params);
      }

      const currentRoot = root[rootKey];

      switch (currentRoot.type) {
        case 'normal':
          const s = currentRoot.child;
          navigate(generatePath(rootKeyAndPath(rootKey, s.path), params));
          break;
        case 'bottomTabs':
          const child = currentRoot.children?.[0]?.child;
          navigate(generatePath(rootKeyAndPath(rootKey, child.path), params));
          break;
        case 'sideMenu':
      }
    },
    preload: async <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>
    ) => {
      preloader.setPreloadResult(screen, screen.preload(params));
    },
    push: async <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      preload = true
    ) => {
      if (preload) {
        preloader.setPreloadResult(screen, screen.preload(params));
      }
      navigate(generatePath(rootKeyAndPath(oldRootKey, screen.path), params));
    },
    replace: async <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      preload = true
    ) => {
      if (preload) {
        preloader.setPreloadResult(screen, screen.preload(params));
      }
      navigate(generatePath(rootKeyAndPath(oldRootKey, screen.path), params), {
        replace: true,
      });
    },
  };
}

function useIsBigScreen() {
  const { width } = useWindowDimensions();
  return width > 1200;
}

let screenItems: BaseScreen[] = [];
let root: Root = {};

function NavContainer({ children }: { children: any }) {
  const isBigScreen = useIsBigScreen();
  return (
    <View
      style={[
        navStyles.root,
        isBigScreen ? navStyles.rootBig : navStyles.rootSmall,
      ]}
    >
      {children}
    </View>
  );
}

const navStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootBig: { flexDirection: 'row' },
  rootSmall: { flexDirection: 'column-reverse' },
  full: { flex: 1 },
});

function Nav() {
  const rootKey = useRootKey();
  const currentRoot = root[rootKey];
  const isBigScreen = useIsBigScreen();

  return (
    <>
      {currentRoot?.type === 'bottomTabs' ? (
        <BottomTabs
          bottomTabsRoot={currentRoot}
          rootKey={rootKey}
          isBigScreen={isBigScreen}
        />
      ) : null}
    </>
  );
}

function NavigationInnerRoot({
  SuspenseContainer,
}: {
  SuspenseContainer: any;
}) {
  return (
    <NavContainer>
      <Nav />
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
                  preloader.setPreloadResult(screen, screen.preload(params));
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
  screens: ScreenItems,
  r: Root,
  _: any
): any {
  screenItems = screens;
  root = r;
  return;
}
