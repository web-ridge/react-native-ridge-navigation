import {
  Navigation,
  Navigation as NativeNavigation,
  OptionsLayout,
  OptionsStatusBar,
  OptionsTopBar,
  LayoutRoot,
  OptionsBottomTab,
} from 'react-native-navigation';
import {
  NavigationContext,
  useNavigation as useNativeNavigation,
  withNavigationProvider,
} from 'react-native-navigation-hooks';
import {
  BaseScreen,
  BottomTabType,
  ExtractRouteParams,
  getTheme,
  preloadRoot,
  Root,
  setTheme,
  ThemeSettings,
  useTheme,
} from './navigationUtils';
import * as React from 'react';
import { setPreloadResult } from './Preloader';
import {
  Appearance,
  ColorSchemeName,
  EmitterSubscription,
  useColorScheme,
} from 'react-native';
import useLatest from './useLatest';
import OnlyRenderOnce from './OnlyRenderOnce';
import DeepLinking from './DeepLinking';

const stackId = 'AppStack';
let root: Root = {};
let allScreens: BaseScreen[] = [];

let currentRootKey: string | undefined;

export async function setRoot(rootKey?: string) {
  currentRootKey = rootKey;
  const r = getRoot(root, rootKey);

  const preloadKey = getCurrentRootKey(root, rootKey);
  if (preloadKey) {
    preloadRoot(root, preloadKey, {});
  }
  return NativeNavigation.setRoot(r);
}

export function useParams<T extends BaseScreen>(
  _: T,
  props: any
): ExtractRouteParams<T['path']> {
  return props as any;
}

function getBottomLayout(colorScheme: ColorSchemeName): OptionsLayout {
  const { bottomBar } = getTheme()[colorScheme || 'light'];
  const backgroundColor = bottomBar.backgroundColor;
  return {
    backgroundColor,
    componentBackgroundColor: backgroundColor,
  };
}

function getBottomTabLayout(colorScheme: ColorSchemeName): OptionsBottomTab {
  const { bottomBar } = getTheme()[colorScheme || 'light'];

  return {
    textColor: bottomBar.textColor,
    iconColor: bottomBar.iconColor,
    selectedIconColor: bottomBar.selectedIconColor,
    selectedTextColor: bottomBar.selectedTextColor,
    //@ts-ignore
    badgeColor: bottomBar.badgeColor,
    //@ts-ignore
    badgeTextColor: bottomBar.badgeTextColor,
  };
}

function getLayout(colorScheme: ColorSchemeName): OptionsLayout {
  const { layout } = getTheme()[colorScheme || 'light'];
  return {
    backgroundColor: layout.backgroundColor,
    componentBackgroundColor: layout.backgroundColor,
  };
}

let bottomTabEventListener: undefined | EmitterSubscription;
let selectedTabIndex = 0;

function getCurrentRoot(r: Root, rootKey?: string) {
  const k = getCurrentRootKey(r, rootKey);
  return r[k];
}

function getCurrentRootKey(r: Root, rootKey?: string) {
  return rootKey || Object.keys(r)[0];
}

export function getConfiguredRoot() {
  return root[currentRootKey || ''];
}

function getRoot(r: Root, rootKey?: string): LayoutRoot {
  const currentRoot = getCurrentRoot(r, rootKey);
  if (currentRoot?.type === 'bottomTabs') {
    if (!bottomTabEventListener) {
      bottomTabEventListener =
        Navigation.events().registerBottomTabSelectedListener((args) => {
          selectedTabIndex = args.selectedTabIndex;
        });
    }
  } else {
    bottomTabEventListener?.remove();
  }

  switch (currentRoot.type) {
    case 'bottomTabs':
      // Subscribe

      return {
        root: {
          bottomTabs: {
            children: currentRoot.children.map((child) => ({
              stack: {
                id: stackId + '_' + child.path,
                children: [
                  {
                    component: {
                      name: child.child.path,
                    },
                  },
                ],
                options: {
                  bottomTab: {
                    testID: `bottomTab-${child.path}`,
                    id: child.path,
                    text: child.title(),
                    icon: child.icon,
                    selectedIcon: child.selectedIcon,
                  },
                },
              },
            })),
          },
        },
      };
    case 'normal':
      return {
        root: {
          stack: {
            id: stackId,
            children: [
              {
                component: {
                  id: currentRoot.child.path,
                  name: currentRoot.child.path,
                },
              },
            ],
          },
        },
      };
    case 'sideMenu':
      break;
  }
  return {
    root: {
      stack: {
        id: stackId,
        children: [],
      },
    },
  };
}

const topBar: OptionsTopBar = {
  visible: false,
  animate: false,
  drawBehind: true,
};

function getStatusBar(colorScheme: ColorSchemeName): OptionsStatusBar {
  const { statusBar } = getTheme()[colorScheme || 'light'];
  return statusBar;
}

export function getDefaultOptions(colorScheme: ColorSchemeName) {
  return {
    layout: getLayout(colorScheme),
    topBar,
    statusBar: getStatusBar(colorScheme),
    bottomTabs: getBottomLayout(colorScheme),
    bottomTab: getBottomTabLayout(colorScheme),
  };
}

export function updateBadge<T extends BottomTabType>(tab: T, badge: string) {
  Navigation.mergeOptions(stackId + '_' + tab.path, {
    bottomTab: {
      badge,
    },
  });
}
Appearance.addChangeListener(() => {
  refreshTheme();
  // setRoot();
});

export function refreshScreenTheme(componentId: string) {
  const newOptions = getDefaultOptions(Appearance.getColorScheme());
  Navigation.mergeOptions(componentId, newOptions);
}

export function refreshTheme() {
  const currentRoot = getCurrentRoot(root, currentRootKey);
  const newOptions = getDefaultOptions(Appearance.getColorScheme());
  NativeNavigation.setDefaultOptions(newOptions);

  if (currentRoot?.type === 'bottomTabs') {
    currentRoot.children.forEach((b) => {
      Navigation.mergeOptions(b.path, newOptions);
    });
    Navigation.mergeOptions(stackId, newOptions);
    Navigation.mergeOptions(getCurrentStackId(), newOptions);
  } else if (currentRoot.type === 'normal') {
    // TODO: verify if this works
    Navigation.mergeOptions(currentRoot.child.path, newOptions);
  }
}

export function refreshBottomTabs() {
  const currentRoot = getCurrentRoot(root, currentRootKey);
  if (currentRoot?.type === 'bottomTabs') {
    currentRoot.children.forEach((b) => {
      Navigation.mergeOptions(b.path, {
        bottomTab: {
          text: b.title(),
        },
      });
    });
  }
}

export function useFocus(callback: () => void) {
  const navigationContext = React.useContext(NavigationContext);
  const latestCallback = useLatest(callback);
  React.useEffect(() => {
    // Subscribe
    const screenEventListener =
      NativeNavigation.events().registerComponentDidAppearListener(
        ({ componentId }) => {
          console.log(
            'componentId did appear',
            componentId,
            navigationContext.componentId
          );
          if (componentId === navigationContext.componentId) {
            latestCallback.current();
          }
        }
      );

    return () => {
      screenEventListener.remove();
    };
  }, [latestCallback, navigationContext.componentId]);
}

function getCurrentStackId() {
  const r = getCurrentRoot(root, currentRootKey);
  if (r.type === 'bottomTabs') {
    const currentChild = r.children[selectedTabIndex];
    return stackId + '_' + currentChild.path;
  }
  return stackId;
}

export async function staticPush<T extends BaseScreen>(
  screen: T,
  params: ExtractRouteParams<T['path']>,
  preload = true
) {
  if (preload) {
    setPreloadResult(screen, screen.preload(params));
  }
  const currentStackId = getCurrentStackId();

  await NativeNavigation.push(currentStackId, {
    component: {
      name: screen.path,
      passProps: params,
      options: {
        ...getDefaultOptions(Appearance.getColorScheme()),
        animations: {
          push: {
            enabled: false,
          },
        },
      },
    },
  });
}

export function useNavigation() {
  const navigation = useNativeNavigation();

  return {
    refreshBottomTabs,
    pop: async () => {
      return navigation.pop();
    },
    switchRoot: async (rootKey: string, params: any, preload = true) => {
      console.log('switchRoot', { rootKey, preload });
      if (preload) {
        preloadRoot(root, rootKey, params);
      }

      return setRoot(rootKey);
    },
    // switchTabIndex: () => {},
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
      return navigation.push(screen.path, params);
    },
    switchBottomTabIndex: async (currentTabIndex: number) => {
      const currentStackId = getCurrentStackId();

      await NativeNavigation.mergeOptions(currentStackId, {
        bottomTabs: {
          currentTabIndex,
        },
      });
      selectedTabIndex = currentTabIndex;
    },
    replace: async <T extends BaseScreen>(
      screen: T,
      params: ExtractRouteParams<T['path']>,
      preload = true
    ) => {
      if (preload) {
        setPreloadResult(screen, screen.preload(params));
      }

      // pop and push without animation?
      navigation.mergeOptions({
        animations: { pop: { enabled: false } },
      });

      const currentStackId = getCurrentStackId();

      try {
        await NativeNavigation.pop(currentStackId);
        await NativeNavigation.push(currentStackId, {
          component: {
            name: screen.path,
            passProps: params,
            options: {
              ...getDefaultOptions(Appearance.getColorScheme()),
              animations: {
                push: {
                  enabled: false,
                },
              },
            },
          },
        });
      } catch (error) {
        console.log({ error });
      }
    },
  };
}

export default function withRidgeNavigation<T extends { componentId: string }>(
  WrappedComponent: React.ComponentType<T>
): React.FC<T> {
  function Wrapper(wrapperProps: T) {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const isFirstRun = React.useRef(true);
    React.useLayoutEffect(() => {
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }
      refreshScreenTheme(wrapperProps.componentId);
    }, [theme, wrapperProps.componentId, colorScheme]);
    return (
      <>
        <WrappedComponent {...wrapperProps} />
        <OnlyRenderOnce subscribeKey={currentRootKey}>
          <DeepLinking routes={allScreens} />
        </OnlyRenderOnce>
      </>
    );
  }

  return Wrapper;
}

function registerScreens<ScreenItems extends BaseScreen[]>(
  screens: ScreenItems,
  appHoc: (WrappedComponent: React.ComponentType<any>) => React.FC<any>
) {
  screens.forEach((screen) => {
    NativeNavigation.registerComponent(
      screen.path,
      () => withNavigationProvider(withRidgeNavigation(appHoc(screen.element))),
      () => screen.element
    );
  });
}

export function createNavigation<ScreenItems extends BaseScreen[]>(
  themeSettings: ThemeSettings,
  screens: ScreenItems,
  r: Root,
  appHoc: (WrappedComponent: React.ComponentType<any>) => React.FC<any>
) {
  allScreens = screens;
  setTheme(themeSettings);
  root = r;

  registerScreens(screens, appHoc);
  Navigation.setDefaultOptions(getDefaultOptions(Appearance.getColorScheme()));
  NativeNavigation.events().registerAppLaunchedListener(() => {
    setRoot();
  });
}

export function NavigationRoot() {}
