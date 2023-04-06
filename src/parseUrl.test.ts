import { findMatchedRoute, MatchedRoute } from './parseUrl';
import type { BaseScreen } from './navigationUtils';

const getRoute = (path: string) => ({
  path,
  element: () => null,
  preload: () => null,
});

const routes: BaseScreen[] = [
  getRoute('post/:id'),
  getRoute('account'),
  getRoute('post-author/:id'),
  getRoute('post-comments/:id/:author-id'),
  getRoute('category/:category'),
  getRoute('search/:query'),
  getRoute('admin'),
  getRoute('single-route-multiple-segments/:id/deep-url/:commentId'),
  getRoute('users/:userId/favorites/:postId'),
  getRoute('tags/:tag/posts'),
];

const getExpectedMatchedRoute = (
  url: string,
  params: { [key: string]: string }
) => ({
  route: routes.find((r) => r.path === url)!,
  params,
});

describe('findMatchedRoute', () => {
  // Test cases
  test('single route match', () => {
    const inputUrl = 'post/10';
    const expectedOutput: MatchedRoute[] = [
      getExpectedMatchedRoute('post/:id', { id: '10' }),
    ];

    let result = findMatchedRoute(inputUrl.split('/'), routes);
    console.log({ result });
    expect(result).toEqual(expectedOutput);
  });

  test('single route match with multiple segments', () => {
    const inputUrl = 'single-route-multiple-segments/5/deep-url/25';
    const expectedOutput: MatchedRoute[] = [
      getExpectedMatchedRoute(
        'single-route-multiple-segments/:id/deep-url/:commentId',
        {
          id: '5',
          commentId: '25',
        }
      ),
    ];

    expect(findMatchedRoute(inputUrl.split('/'), routes)).toEqual(
      expectedOutput
    );
  });

  test('multiple route matches', () => {
    const inputUrl = 'post/10/post-author/20';
    const expectedOutput: MatchedRoute[] = [
      getExpectedMatchedRoute('post/:id', {
        id: '10',
      }),
      getExpectedMatchedRoute('post-author/:id', {
        id: '20',
      }),
    ];

    expect(findMatchedRoute(inputUrl.split('/'), routes)).toEqual(
      expectedOutput
    );
  });

  test('multiple route matches with multiple segments', () => {
    const inputUrl = 'post/1/comments/10/users/3/favorites/15';
    const expectedOutput: MatchedRoute[] = [
      getExpectedMatchedRoute('post/:id', { id: '1' }),
      getExpectedMatchedRoute('users/:userId/favorites/:postId', {
        userId: '3',
        postId: '15',
      }),
    ];

    expect(findMatchedRoute(inputUrl.split('/'), routes)).toEqual(
      expectedOutput
    );
  });

  test('route match with unparameterized route', () => {
    const inputUrl = 'admin';
    const expectedOutput: MatchedRoute[] = [
      getExpectedMatchedRoute('admin', {}),
    ];

    expect(findMatchedRoute(inputUrl.split('/'), routes)).toEqual(
      expectedOutput
    );
  });

  test('no route match', () => {
    const inputUrl = 'nonexistent';
    const expectedOutput: MatchedRoute[] = [];

    expect(findMatchedRoute(inputUrl.split('/'), routes)).toEqual(
      expectedOutput
    );
  });

  test('partial route match', () => {
    const inputUrl = 'post/1/comments/nonexistent';
    const expectedOutput: MatchedRoute[] = [
      getExpectedMatchedRoute('post/:id', { id: '1' }),
    ];

    expect(findMatchedRoute(inputUrl.split('/'), routes)).toEqual(
      expectedOutput
    );
  });

  test('mixed route matches and non-matches', () => {
    const inputUrl = 'post/5/nonexistent/post-author/10/search/query';
    const expectedOutput: MatchedRoute[] = [
      getExpectedMatchedRoute('post/:id', { id: '5' }),
      getExpectedMatchedRoute('post-author/:id', { id: '10' }),
      getExpectedMatchedRoute('search/:query', { query: 'query' }),
    ];
    expect(findMatchedRoute(inputUrl.split('/'), routes)).toEqual(
      expectedOutput
    );
  });

  test('nested routes', () => {
    const inputUrl = 'category/tech/tags/javascript/posts';
    const expectedOutput: MatchedRoute[] = [
      getExpectedMatchedRoute('category/:category', { category: 'tech' }),
      getExpectedMatchedRoute('tags/:tag/posts', { tag: 'javascript' }),
    ];
    expect(findMatchedRoute(inputUrl.split('/'), routes)).toEqual(
      expectedOutput
    );
  });

  test('route match with multiple parameters', () => {
    const inputUrl = 'post-comments/10/5';
    const expectedOutput: MatchedRoute[] = [
      getExpectedMatchedRoute('post-comments/:id/:author-id', {
        'id': '10',
        'author-id': '5',
      }),
    ];
    expect(findMatchedRoute(inputUrl.split('/'), routes)).toEqual(
      expectedOutput
    );
  });

  test('empty input URL', () => {
    const inputUrl = '';
    const expectedOutput: MatchedRoute[] = [];
    expect(findMatchedRoute(inputUrl.split('/'), routes)).toEqual(
      expectedOutput
    );
  });

  test('only non-matching segments', () => {
    const inputUrl = 'nonexistent/another-nonexistent';
    const expectedOutput: MatchedRoute[] = [];
    expect(findMatchedRoute(inputUrl.split('/'), routes)).toEqual(
      expectedOutput
    );
  });

  test('empty routes', () => {
    routes.length = 0;
    const inputUrl = 'post/10';
    const expectedOutput: MatchedRoute[] = [];
    expect(findMatchedRoute(inputUrl.split('/'), routes)).toEqual(
      expectedOutput
    );
  });
});
