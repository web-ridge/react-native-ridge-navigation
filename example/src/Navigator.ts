import routes from './NavigatorRoutes';
import AppHOC from './App';
import {
  createNormalRoot,
  createNavigation,
} from 'react-native-ridge-navigation';

export const NavigationRoots = {
  RootHome: 'home',
  RootAuth: 'auth',
};

// svg to png
// https://webkul.github.io/myscale/
//
//     tab icon
// http://nsimage.brosteins.com/Home

const Navigator = createNavigation(
  Object.keys(routes).map((key) => {
    // console.log({ routes });
    return routes[key as keyof typeof routes]!;
  }),
  {
    [NavigationRoots.RootHome]: createNormalRoot(routes.PostsScreen),
    [NavigationRoots.RootAuth]: createNormalRoot(routes.AuthScreen),
  },
  AppHOC
);

export default Navigator;
