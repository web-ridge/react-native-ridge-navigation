import { registerScreen } from '../../src';

import AuthScreenLazy from './Auth/AuthScreenLazy';
import { RequireAuthHOC } from './Auth/Authorization';
import PostsScreenLazy from './Post/PostsScreenLazy';

const AuthScreen = registerScreen('/auth', AuthScreenLazy, () => {});
const PostsScreen = registerScreen(
  '/posts',
  RequireAuthHOC(PostsScreenLazy),
  () => {
    // TODO: load things
    // you can return a reference here and use it in the screen
    // return reference
    //
  }
);

const routes = {
  AuthScreen,
  PostsScreen,
};

export default routes;
