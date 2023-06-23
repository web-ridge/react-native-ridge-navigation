import { lazy, registerScreen } from 'react-native-ridge-navigation';
import { RequireAuthHOC } from './Authorization';
import PostScreenDirect from './PostScreen';
import PostsScreenDirect from './PostsScreen';
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
  PostsScreenDirect,
  () => {
    queryClient.prefetchQuery(queryKeyPostsScreen, queryKeyPostsScreenPromise, {
      staleTime: 3000,
    });
    return 'testQueryReference';
  }
);

export const PostScreen = registerScreen(
  '/post-detail/:id',
  PostScreenDirect,
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
