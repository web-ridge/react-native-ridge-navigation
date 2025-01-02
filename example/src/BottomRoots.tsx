import * as routes from './NavigatorScreens';

const BottomRoots = {
  Home: {
    path: '/home',
    title: () => 'Home',
    icon: require('./img/bell-outline/icon-20.png'),
    selectedIcon: require('./img/bell/icon-20.png'),
    child: routes.HomeScreen,
  },
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
export default BottomRoots;
