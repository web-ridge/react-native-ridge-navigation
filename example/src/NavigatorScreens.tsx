import { registerScreen } from '../../src';
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
  '/post',
  RequireAuthHOC(PostsScreenLazy),
  () => {
    queryClient.prefetchQuery(queryKeyPostsScreen, queryKeyPostsScreenPromise);
    return 'test-test-test';
  }
);

export const PostScreen = registerScreen(
  '/post/:id',
  RequireAuthHOC(PostScreenLazy),
  ({ id }) => {
    queryClient.prefetchQuery(
      queryKeyPostScreen({ id }),
      queryKeyPostScreenPromise({ id })
    );
  }
);
