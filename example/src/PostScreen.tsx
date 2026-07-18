import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  useModal,
  useParams,
  usePreloadResult,
} from 'react-native-ridge-navigation';
import { useSuspenseQuery } from '@tanstack/react-query';
import Header from './Header';
import { queryKeyPostScreen, queryKeyPostScreenPromise } from './queryKeys';
import routes from './Routes';
import ButtonLink from './ButtonLink';
import { useRenderLog } from './helpers/utils';
import Text from './ui/Text';
import RouteChip from './ui/RouteChip';

function PostScreen() {
  useRenderLog('PostScreen');
  const queryReference = usePreloadResult(routes.PostScreen);
  const { inModal } = useModal();
  const { id } = useParams(routes.PostScreen);

  const { data } = useSuspenseQuery({
    queryKey: queryKeyPostScreen({ id }),
    queryFn: queryKeyPostScreenPromise({ id }),
  });
  if (queryReference !== 'testQueryReference') {
    console.log({ queryReference });
    return <Text style={styles.preloadError}>No preloaded result</Text>;
  }

  return (
    <>
      <Header title={data!.title} />
      <ScrollView contentContainerStyle={styles.content}>
        <RouteChip path={`/post/${id}`} accent />
        <Text muted style={styles.body}>
          {data!.body}
        </Text>
        <View style={styles.actions}>
          <ButtonLink
            to={routes.PostScreen}
            params={{ id: `${Number(id) + 1}` }}
            icon="arrow-forward"
          >
            Push the next post
          </ButtonLink>
          <ButtonLink
            to={routes.PostScreen}
            params={{ id: '3' }}
            variant="outline"
            refresh
          >
            Refresh with post 3
          </ButtonLink>
          {inModal && (
            <ButtonLink
              to={routes.AccountScreen}
              params={{}}
              variant="outline"
              replace
            >
              Replace with account screen
            </ButtonLink>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  preloadError: {
    marginTop: 56,
    color: '#D64545',
  },
  content: {
    padding: 20,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    marginTop: 14,
  },
  actions: {
    marginTop: 24,
    gap: 10,
    alignItems: 'stretch',
  },
});

export default React.memo(PostScreen);
