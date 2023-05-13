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
  () => {}
);
export const HomeScreen = registerScreen(
  '/home',
  lazy(() => import('./HomeScreen')),
  () => {}
);
export const AccountScreen = registerScreen(
  '/account',
  RequireAuthHOC(lazy(() => import('./AccountScreen'))),
  () => {}
);

export const PostsScreen = registerScreen(
  '/overview',
  RequireAuthHOC(lazy(() => import('./PostsScreen'))),
  () => {
    queryClient.prefetchQuery(queryKeyPostsScreen, queryKeyPostsScreenPromise, {
      staleTime: 3000,
    });
    return 'testQueryReference';
  }
);

export const PostScreen = registerScreen(
  '/post-test/:id',
  RequireAuthHOC(lazy(() => import('./PostScreen'))),
  (params) => {
    const { id } = params;
    queryClient.prefetchQuery(
      queryKeyPostScreen({ id }),
      queryKeyPostScreenPromise({ id }),
      { staleTime: 3000 }
    );
    return 'testQueryReference';
  }
);
