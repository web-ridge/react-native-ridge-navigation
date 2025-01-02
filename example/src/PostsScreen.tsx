import * as React from 'react';
import { Text, Searchbar } from 'react-native-paper';
import { usePreloadResult } from 'react-native-ridge-navigation';
import { LegendList } from '@legendapp/list';
import { useQuery } from '@tanstack/react-query';

import { queryKeyPostsScreen, queryKeyPostsScreenPromise } from './queryKeys';

import routes from './Routes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRenderLog } from './helpers/utils';
import ListItemLink from './ListItemLink';

const ITEM_HEIGHT = 79;

function PostsScreen() {
  useRenderLog('PostsScreen');
  // optional with react-query  but could be used i.c.w. Relay.dev etc.
  // for now we use this to test if it keeps working
  const queryReference = usePreloadResult(routes.PostsScreen);
  const { top, left, right } = useSafeAreaInsets();
  const { data } = useQuery(queryKeyPostsScreen, queryKeyPostsScreenPromise);

  if (queryReference !== 'testQueryReference') {
    console.log({ queryReference });
    return (
      <Text style={{ marginTop: 56, color: 'red' }}>No preloaded result</Text>
    );
  }

  return (
    <>
      <Searchbar
        style={{
          marginTop: top,
          marginLeft: left + 12,
          marginRight: right + 12,
        }}
        value={''}
      />

      <LegendList
        data={data || []}
        renderItem={({ item }) => <Item item={item} />}
        keyExtractor={(item) => `${item.id}`}
        estimatedItemSize={ITEM_HEIGHT}
        recycleItems
      />
    </>
  );
}

const Item = React.memo(({ item }: { item: any }) => {
  return (
    <ListItemLink
      to={routes.PostScreen}
      params={{ id: `${item.id}` }}
      title={item.title}
      description={item.body}
    />
  );
});
export default React.memo(PostsScreen);
