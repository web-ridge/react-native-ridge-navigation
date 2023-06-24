import { lazy, registerScreen } from 'react-native-ridge-navigation';
import { RequireAuthHOC } from './Authorization';

import queryClient from './queryClient';
import {
  queryKeyPostScreen,
  queryKeyPostScreenPromise,
  queryKeyPostsScreen,
  queryKeyPostsScreenPromise,
} from './queryKeys';

export const AuthScreen = registerScreen(
  '/auth',
  lazy(() => import('./AuthScreen')),
  () => {},
  {
    title: 'Login',
    description: 'Login to your account',
  }
);
export const HomeScreen = registerScreen(
  '/home',
  lazy(() => import('./HomeScreen')),
  () => {},
  {
    title: 'Home',
    description: 'Home is where the heart is',
  }
);
export const AccountScreen = registerScreen(
  '/account',
  RequireAuthHOC(lazy(() => import('./AccountScreen'))),
  () => {},
  {
    title: 'Account',
    description: 'Your account',
  }
);

export const PostsScreen = registerScreen(
  '/overview',
  RequireAuthHOC(lazy(() => import('./PostsScreen'))),
  () => {
    queryClient.prefetchQuery(queryKeyPostsScreen, queryKeyPostsScreenPromise, {
      staleTime: 3000,
    });
    return 'testQueryReference';
  },
  {
    title: 'Posts',
    description: 'All posts',
  }
);

export const PostScreen = registerScreen(
  '/post/:id',
  RequireAuthHOC(lazy(() => import('./PostScreen'))),
  (params) => {
    const { id } = params;
    queryClient.prefetchQuery(
      queryKeyPostScreen({ id }),
      queryKeyPostScreenPromise({ id }),
      { staleTime: 3000 }
    );
    return 'testQueryReference';
  },
  {
    title: 'Post',
    description: 'A post',
  }
);
