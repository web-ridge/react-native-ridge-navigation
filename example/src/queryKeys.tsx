import api from './api';
export interface PostType {
  userId: number;
  id: number;
  title: string;
  body: string;
}
export const queryKeyPostsScreen = ['QUERY_KEY_POSTS_SCREEN'];
export const queryKeyPostsScreenPromise = () =>
  api({ path: 'posts' }) as Promise<PostType[]>;
export const queryKeyPostScreen = ({ id }: { id: string }) => [
  'QUERY_KEY_POST_SCREEN',
  id,
];
export const queryKeyPostScreenPromise =
  ({ id }: { id: string }) =>
  () =>
    api({ path: `posts/${id}` }) as Promise<PostType>;
