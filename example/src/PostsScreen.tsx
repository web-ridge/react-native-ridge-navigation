import * as React from 'react';
import {
  FlatList,
  StyleSheet,
  TextInput as NativeTextInput,
  View,
} from 'react-native';
import {
  BarButton,
  RightBar,
  SplitView,
  usePreloadResult,
} from 'react-native-ridge-navigation';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  queryKeyPostsScreen,
  queryKeyPostsScreenPromise,
  type PostType,
} from './queryKeys';

import routes from './Routes';
import { useRenderLog } from './helpers/utils';
import ListItemLink from './ListItemLink';
import Text from './ui/Text';
import { radii, useTheme } from './ui/theme';

function PostsScreen() {
  useRenderLog('PostsScreen');
  const theme = useTheme();
  const queryReference = usePreloadResult(routes.PostsScreen);
  const { left, right } = useSafeAreaInsets();
  const [search, setSearch] = React.useState('');
  const [reversed, setReversed] = React.useState(false);
  const { data } = useSuspenseQuery({
    queryKey: queryKeyPostsScreen,
    queryFn: queryKeyPostsScreenPromise,
  });

  if (queryReference !== 'testQueryReference') {
    console.log({ queryReference });
    return <Text style={styles.preloadError}>No preloaded result</Text>;
  }

  const filtered = search
    ? (data || []).filter((post) =>
        post.title.toLowerCase().includes(search.toLowerCase())
      )
    : data || [];
  const posts = reversed ? [...filtered].reverse() : filtered;

  return (
    <SplitView
      masterTitle="Posts"
      masterLargeTitle
      // Demo D — native master bar actions (SF Symbol + systemItem).
      masterActions={
        <RightBar>
          <BarButton
            testID="masterSort"
            image={{ uri: 'arrow.up.arrow.down' }}
            onPress={() => setReversed((r) => !r)}
          />
          <BarButton
            testID="masterAdd"
            systemItem="add"
            onPress={() => setSearch((s) => (s ? '' : 'qui'))}
          />
        </RightBar>
      }
      detailPlaceholder={
        <View style={styles.placeholder}>
          <Ionicons name="reader-outline" size={40} color={theme.muted} />
          <Text muted style={styles.placeholderText}>
            Select a post to read it here
          </Text>
        </View>
      }
      masterStyle={{ borderRightColor: theme.border }}
    >
      <FlatList
        data={posts}
        renderItem={({ item }) => <Item item={item} />}
        keyExtractor={(item) => `${item.id}`}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={
          <View
            style={[
              styles.searchWrap,
              {
                marginLeft: left + 12,
                marginRight: right + 12,
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons name="search" size={17} color={theme.muted} />
            <NativeTextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search posts"
              placeholderTextColor={theme.muted}
              style={[styles.searchInput, { color: theme.text }]}
            />
          </View>
        }
      />
    </SplitView>
  );
}

const Item = React.memo(({ item }: { item: PostType }) => {
  return (
    <ListItemLink
      to={routes.PostScreen}
      params={{ id: `${item.id}` }}
      title={item.title}
      description={item.body}
      image={require('./img/superman.png')}
      sharedName={`item${item.id}`}
    />
  );
});
export default React.memo(PostsScreen);

const styles = StyleSheet.create({
  preloadError: {
    marginTop: 56,
    color: '#D64545',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.control,
    paddingHorizontal: 12,
    marginBottom: 8,
    minHeight: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  placeholderText: {
    fontSize: 15,
  },
});
