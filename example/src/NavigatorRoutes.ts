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

const AuthScreen = registerScreen('/auth', AuthScreenLazy, () => {});
const HomeScreen = registerScreen('/home', HomeScreenLazy, () => {});

const AccountScreen = registerScreen(
  '/account',
  RequireAuthHOC(AccountScreenLazy),
  () => {}
);

const PostsScreen = registerScreen(
  '/post',
  RequireAuthHOC(PostsScreenLazy),
  () => {
    queryClient.prefetchQuery(queryKeyPostsScreen, queryKeyPostsScreenPromise);
  }
);

const PostScreen = registerScreen(
  '/post/:id',
  RequireAuthHOC(PostScreenLazy),
  ({ id }) => {
    queryClient.prefetchQuery(
      queryKeyPostScreen({ id }),
      queryKeyPostScreenPromise({ id })
    );
  }
);

const routes = {
  AuthScreen,
  PostsScreen,
  AccountScreen,
  PostScreen,
  HomeScreen,
};

export default routes;
