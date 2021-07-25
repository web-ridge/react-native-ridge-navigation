import * as React from 'react';
import { List } from 'react-native-paper';

import { Link, usePreloadResult } from '../../../src';
import routes from '../NavigatorRoutes';
import RidgeList from 'react-native-ridge-list';
import { useQuery } from 'react-query';

import Header from '../Header';
import { queryKeyPostsScreen, queryKeyPostsScreenPromise } from '../queryKeys';

const ITEM_HEIGHT = 65;

function getDefaultItemLayout(_: any, index: number) {
  return {
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  };
}

export default function PostsScreen() {
  // optional with react-query  but could be used i.c.w. Relay.dev etc.
  // for now we use this to test if it keeps working
  const queryReference = usePreloadResult(routes.PostsScreen);
  console.log({ queryReference });

  if (!queryReference) {
    throw Error('no preloaded results');
  }

  const { data } = useQuery(queryKeyPostsScreen, queryKeyPostsScreenPromise);

  return (
    <>
      <Header title="Posts" />
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
