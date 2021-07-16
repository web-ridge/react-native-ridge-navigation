import { registerScreen } from '../../src';
import { RequireAuthHOC } from './Auth/Authorization';
import AuthScreenLazy from './Auth/AuthScreenLazy';
import PostsScreenLazy from './Post/PostsScreenLazy';
import AccountScreenLazy from './Account/AccountScreenLazy';
import PostScreenLazy from './Post/PostScreenLazy';
import queryClient from './queryClient';
import {
  queryKeyPostsScreenPromise,
  queryKeyPostsScreen,
} from './Post/PostsScreen';
import {
  queryKeyPostScreenPromise,
  queryKeyPostScreen,
} from './Post/PostScreen';

const AuthScreen = registerScreen('/auth', AuthScreenLazy, () => {});
const AccountScreen = registerScreen(
  '/account',
  RequireAuthHOC(AccountScreenLazy),
  () => {}
);

const PostsScreen = registerScreen(
  '/posts',
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
};

export default routes;
