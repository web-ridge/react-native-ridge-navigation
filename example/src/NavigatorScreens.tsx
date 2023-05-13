import { lazyWithPreload, registerScreen } from 'react-native-ridge-navigation';
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
  lazyWithPreload(() => import('./AuthScreen')),
  () => {}
);
export const HomeScreen = registerScreen(
  '/home',
  lazyWithPreload(() => import('./HomeScreen')),
  () => {}
);
export const AccountScreen = registerScreen(
  '/account',
  RequireAuthHOC(lazyWithPreload(() => import('./AccountScreen'))),
  () => {}
);

export const PostsScreen = registerScreen(
  '/overview',
  RequireAuthHOC(lazyWithPreload(() => import('./PostsScreen'))),
  () => {
    queryClient.prefetchQuery(queryKeyPostsScreen, queryKeyPostsScreenPromise, {
      staleTime: 3000,
    });
    return 'testQueryReference';
  }
);

export const PostScreen = registerScreen(
  '/post-test/:id',
  RequireAuthHOC(lazyWithPreload(() => import('./PostScreen'))),
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
