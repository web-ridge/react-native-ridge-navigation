import { registerScreen } from 'react-native-ridge-navigation';
import { RequireAuthHOC } from './Auth/Authorization';
import AuthScreenLazy from './Auth/AuthScreenLazy';
import PostsScreenLazy from './Post/PostsScreenLazy';
import AccountScreenLazy from './Account/AccountScreenLazy';
import PostScreenLazy from './Post/PostScreenLazy';
import HomeScreenLazy from './Home/HomeScreenLazy';

import queryClient from './queryClient';
import {
  queryKeyPostScreen,
  queryKeyPostScreenPromise,
  queryKeyPostsScreen,
  queryKeyPostsScreenPromise,
} from './queryKeys';

export const AuthScreen = registerScreen('/auth', AuthScreenLazy, () => {});
export const HomeScreen = registerScreen('/home', HomeScreenLazy, () => {});
export const AccountScreen = registerScreen(
  '/account',
  RequireAuthHOC(AccountScreenLazy),
  () => {}
);

export const PostsScreen = registerScreen(
  '/overview',
  RequireAuthHOC(PostsScreenLazy),
  () => {
    queryClient.prefetchQuery(queryKeyPostsScreen, queryKeyPostsScreenPromise, {
      staleTime: 3000,
    });
    return 'testQueryReference';
  }
);

export const PostScreen = registerScreen(
  '/post/:id',
  RequireAuthHOC(PostScreenLazy),
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
