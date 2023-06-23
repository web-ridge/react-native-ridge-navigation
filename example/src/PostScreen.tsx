import * as React from 'react';
import { Paragraph, Text } from 'react-native-paper';
import {
  useModal,
  useParams,
  usePreloadResult,
} from 'react-native-ridge-navigation';
import { useQuery } from '@tanstack/react-query';
import { ScrollView, View } from 'react-native';
import Header from './Header';
import { queryKeyPostScreen, queryKeyPostScreenPromise } from './queryKeys';
import routes from './Routes';
import ButtonLink from './ButtonLink';
import Spacer from './helpers/Spacer';
import { useRenderLog } from './helpers/utils';

function PostScreen() {
  const { id } = useParams(routes.PostScreen);
  useRenderLog('PostDetail', { id });
  // optional with react-query  but could be used i.c.w. Relay.dev etc.
  // for now we use this to test if it keeps working
  const queryReference = usePreloadResult(routes.PostScreen);
  const { inModal } = useModal();

  const { data } = useQuery(
    queryKeyPostScreen({ id }),
    queryKeyPostScreenPromise({ id })
  );
  if (queryReference !== 'testQueryReference') {
    console.log({ queryReference });
    return (
      <Text style={{ marginTop: 56, color: 'red' }}>No preloaded result</Text>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <Header title={data!.title} />
      <ScrollView style={{ padding: 12 }}>
        <ButtonLink
          to={routes.PostScreen}
          params={{ id: `${Number(id) + 1}` }}
          mode="contained"
        >
          Go further
        </ButtonLink>
        <Spacer />
        <ButtonLink
          to={routes.PostScreen}
          params={{ id: '3' }}
          mode="contained-tonal"
          refresh
        >
          Refresh current screen with new data
        </ButtonLink>
        <Spacer />

        {inModal && (
          <ButtonLink
            to={routes.AccountScreen}
            params={{}}
            mode="contained-tonal"
            replace
          >
            replace current with account screen
          </ButtonLink>
        )}
        <Paragraph>
          Post {id} {data!.body}
        </Paragraph>
      </ScrollView>
    </>
  );
}
export default React.memo(PostScreen);
