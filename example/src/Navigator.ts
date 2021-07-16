import routes from './NavigatorRoutes';
import AppHOC from './App';
import {
  createNormalRoot,
  createNavigation,
  createBottomTabsRoot,
  createScreens,
  defaultTheme,
} from '../../src/index';

export const NavigationRoots = {
  RootHome: 'home',
  RootAuth: 'auth',
};

export const BottomRoots = {
  Posts: {
    path: '/post',
    title: () => 'Posts',
    icon: require('./img/palette-swatch-outline/icon-20.png'),
    selectedIcon: require('./img/palette-swatch/icon-20.png'),
    child: routes.PostsScreen,
  },
  Account: {
    path: '/account',
    title: () => 'Account',
    icon: require('./img/account-circle-outline/icon-20.png'),
    selectedIcon: require('./img/account-circle/icon-20.png'),
    child: routes.AccountScreen,
  },
};

// svg to png
// https://webkul.github.io/myscale/
//
//     tab icon
// http://nsimage.brosteins.com/Home

const Navigator = createNavigation(
  defaultTheme,
  createScreens(routes),
  {
    [NavigationRoots.RootHome]: createBottomTabsRoot(
      [BottomRoots.Posts, BottomRoots.Account],
      {
        breakingPointWidth: 500,
        components: {
          // start:
        },
      }
    ),
    [NavigationRoots.RootAuth]: createNormalRoot(routes.AuthScreen),
  },
  AppHOC
);

export default Navigator;
