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
    // Home renders its own CollapsingHeader (native UINavigationBar on iOS).
    nativeHeader: true,
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
    queryClient.prefetchQuery({
      queryKey: queryKeyPostsScreen,
      queryFn: queryKeyPostsScreenPromise,
      staleTime: 3000,
    });
    return 'testQueryReference';
  },
  {
    title: 'Posts',
    description: 'All posts',
  }
);

// Demo F — Health-style translucent sidebar over immersive content
// (TripleSplitView floatingSidebar). Renders its own native header.
export const HealthScreen = registerScreen(
  '/health',
  lazy(() => import('./HealthScreen')),
  () => {},
  {
    title: 'Health',
    description: 'Translucent sidebar over immersive content',
  }
);

// Demo H — three-column workspace with URL-reflected section + detail
// selections (TripleSplitView sectionParam/detailParam) and a detail sub-form.
export const TripleWorkspaceScreen = registerScreen(
  '/settings',
  lazy(() => import('./TripleWorkspaceScreen')),
  () => {},
  {
    title: 'Settings workspace',
    description: 'Three-column, URL-reflected selection at every level',
  }
);
export const TripleSectionScreen = registerScreen(
  '/section/:key',
  lazy(() => import('./TripleSectionScreen')),
  () => {},
  {
    title: 'Section',
    description: 'Middle column list',
  }
);
export const TripleItemScreen = registerScreen(
  '/entry/:id',
  lazy(() => import('./TripleItemScreen')),
  () => {},
  {
    title: 'Item',
    description: 'Detail column',
  }
);
export const TripleSubformScreen = registerScreen(
  '/entry/:id/edit',
  lazy(() => import('./TripleSubformScreen')),
  () => {},
  {
    title: 'Edit item',
    description: 'Sub-form pushed inside the detail column',
  }
);

// Demo G — a full-screen edit that a split-detail push escapes into.
export const PostEditScreen = registerScreen(
  '/post/:id/edit',
  RequireAuthHOC(lazy(() => import('./PostEditScreen'))),
  (params) => {
    const { id } = params;
    queryClient.prefetchQuery({
      queryKey: queryKeyPostScreen({ id }),
      queryFn: queryKeyPostScreenPromise({ id }),
      staleTime: 3000,
    });
    return 'testQueryReference';
  },
  {
    title: 'Edit post',
    description: 'Edit a post full-screen',
    nativeHeader: true,
  }
);

export const PostScreen = registerScreen(
  '/post/:id',
  RequireAuthHOC(lazy(() => import('./PostScreen'))),
  (params) => {
    const { id } = params;
    queryClient.prefetchQuery({
      queryKey: queryKeyPostScreen({ id }),
      queryFn: queryKeyPostScreenPromise({ id }),
      staleTime: 3000,
    });
    return 'testQueryReference';
  },
  {
    title: 'Post',
    description: 'A post',
    // Demo B: let the screen own a native (colored, collapsing) UINavigationBar
    // instead of the hidden swipe-back bar.
    nativeHeader: true,
    // Demo C: fly the tapped row's thumbnail into this screen's hero on push.
    // The name must match the source row's <SharedElement name={`item${id}`}>.
    sharedElements: (_state: any, data: any) => `item${data?.id}`,
  }
);
