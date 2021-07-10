import * as React from 'react';
import { Appbar, List } from 'react-native-paper';

import { Link } from '../../../src';
import routes from '../NavigatorRoutes';
import RidgeList from 'react-native-ridge-list';
import { useQuery } from 'react-query';
import api from '../api';
import type { PostType } from './PostScreen';

const ITEM_HEIGHT = 65;

function getDefaultItemLayout(_: any, index: number) {
  return {
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  };
}

export const queryKeyPostsScreen = ['QUERY_KEY_POSTS_SCREEN'];
export const queryKeyPostsScreenPromise = () =>
  api({ path: 'posts' }) as Promise<PostType[]>;

export default function PostsScreen() {
  const { data } = useQuery(queryKeyPostsScreen, queryKeyPostsScreenPromise);

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Posts" />
      </Appbar.Header>
      <RidgeList
        style={{ flex: 1 }}
        data={data}
        renderItem={({ item }) => (
          <Link to={routes.PostScreen} params={{ id: `${item.id}` }}>
            {(linkProps) => (
              <List.Item
                {...linkProps}
                title={item.title}
                description={item.body}
              />
            )}
          </Link>
        )}
        keyExtractor={(item) => `${item.id}`}
        getItemLayout={getDefaultItemLayout}
      />
    </>
  );
}
