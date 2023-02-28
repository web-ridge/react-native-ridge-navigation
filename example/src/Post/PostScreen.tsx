import * as React from 'react';
import { Paragraph, Text } from 'react-native-paper';
import { useParams, usePreloadResult } from 'react-native-ridge-navigation';
import { useQuery } from '@tanstack/react-query';
import { ScrollView } from 'react-native';
import Header from '../Header';
import { queryKeyPostScreen, queryKeyPostScreenPromise } from '../queryKeys';
import routes from '../Routes';
import ButtonLink from '../ButtonLink';
import Spacer from '../helpers/Spacer';

function PostScreen() {
  // optional with react-query  but could be used i.c.w. Relay.dev etc.
  // for now we use this to test if it keeps working
  const queryReference = usePreloadResult(routes.PostScreen);

  const { id } = useParams(routes.PostScreen);

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

  return (
    <>
      <Header title={data!.title} />
      <ScrollView style={{ padding: 12 }}>
        <ButtonLink
          to={routes.PostScreen}
          params={{ id: '2' }}
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
        <Paragraph>{data!.body}</Paragraph>
      </ScrollView>
    </>
  );
}
export default React.memo(PostScreen);
