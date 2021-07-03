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
  preloadRoot,
  Root,
} from './navigationUtils';
import * as React from 'react';
import preloader from './Preloader';
import {
  Platform,
  Appearance,
  ColorSchemeName,
  EmitterSubscription,
} from 'react-native';
import useLatest from './useLatest';

const stackId = 'AppStack';
let root: Root = {};

let currentRootKey: string | undefined;
export async function setRoot(rootKey?: string) {
  currentRootKey = rootKey;
  return NativeNavigation.setRoot(getRoot(root, rootKey));
}

export function useParams<T extends BaseScreen>(
  _: T,
  props: any
): ExtractRouteParams<T['path']> {
  return props as any;
}

function getBottomLayout(colorScheme: ColorSchemeName): OptionsLayout {
  const backgroundColor = colorScheme === 'dark' ? '#121212' : '#fff';
  return {
    backgroundColor,
    componentBackgroundColor: backgroundColor,
  };
}
function getBottomTabLayout(colorScheme: ColorSchemeName): OptionsBottomTab {
  const isDark = colorScheme === 'dark';
  return {
    textColor: isDark ? '#fff' : '#000',
    iconColor: isDark ? '#fff' : '#000',
    selectedIconColor: isDark ? '#FDDFAF' : '#F59E00',
    selectedTextColor: isDark ? '#FDDFAF' : '#F59E00',
    badgeColor: isDark ? 'red' : '#F59E00',
  };
}
function getLayout(colorScheme: ColorSchemeName): OptionsLayout {
  const backgroundColor = colorScheme === 'dark' ? '#000' : '#fff';
  return {
    backgroundColor,
    componentBackgroundColor: backgroundColor,
  };
}

let bottomTabEventListener: undefined | EmitterSubscription;
let selectedTabIndex = 0;

function getCurrentRoot(r: Root, rootKey?: string) {
  return rootKey ? r[rootKey] : r[Object.keys(r)[0]];
}

export function getConfiguredRoot() {
  return root[currentRootKey || ''];
}

function getRoot(r: Root, rootKey?: string): LayoutRoot {
  const currentRoot = getCurrentRoot(r, rootKey);
  if (currentRoot.type === 'bottomTabs') {
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
                      id: child.child.path,
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
  return Platform.select({
    android: {
      translucent: false,
      drawBehind: true,
      style: colorScheme === 'dark' ? 'light' : 'dark',
      backgroundColor: 'transparent',
    },
    default: {
      translucent: false,
      drawBehind: true,
    },
  });
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
  Navigation.mergeOptions(tab.path, {
    bottomTab: {
      badge,
    },
  });
}
Appearance.addChangeListener(() => {
  refreshTheme();
  // setRoot();
});
export function refreshTheme() {
  const currentRoot = getCurrentRoot(root, currentRootKey);
  const newOptions = getDefaultOptions(Appearance.getColorScheme());
  NativeNavigation.setDefaultOptions(newOptions);
  if (currentRoot.type === 'bottomTabs') {
    currentRoot.children.forEach((b) => {
      Navigation.mergeOptions(b.path, newOptions);
    });
  }
}
export function refreshBottomTabs() {
  const currentRoot = getCurrentRoot(root, currentRootKey);
  if (currentRoot.type === 'bottomTabs') {
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
    preloader.setPreloadResult(screen, screen.preload(params));
  }
  const currentStackId = getCurrentStackId();
  console.log({ currentStackId });
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
        preloader.setPreloadResult(screen, screen.preload(params));
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

function registerScreens<ScreenItems extends BaseScreen[]>(
  screens: ScreenItems,
  appHoc: (WrappedComponent: React.ComponentType<any>) => React.FC<any>
) {
  screens.forEach((screen) => {
    NativeNavigation.registerComponent(
      screen.path,
      () => withNavigationProvider(appHoc(screen.element)),
      () => screen.element
    );
  });
}

export function createNavigation<ScreenItems extends BaseScreen[]>(
  screens: ScreenItems,
  r: Root,
  appHoc: (WrappedComponent: React.ComponentType<any>) => React.FC<any>
) {
  registerScreens(screens, appHoc);
  root = r;
  Navigation.setDefaultOptions(getDefaultOptions(Appearance.getColorScheme()));
  NativeNavigation.events().registerAppLaunchedListener(() => {
    setRoot();
  });
}

export function NavigationRoot() {}
