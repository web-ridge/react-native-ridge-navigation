import * as React from 'react';
import { Button, Paragraph, Text } from 'react-native-paper';
import {
  Link,
  useParams,
  usePreloadResult,
} from 'react-native-ridge-navigation';
import { useQuery } from '@tanstack/react-query';
import { ScrollView } from 'react-native';
import Header from '../Header';
import { queryKeyPostScreen, queryKeyPostScreenPromise } from '../queryKeys';
import routes from '../Routes';

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
        <Link to={routes.PostScreen} params={{ id: '2' }}>
          {(linkProps) => <Button {...linkProps}>Go further</Button>}
        </Link>
        <Paragraph>{data!.body}</Paragraph>
      </ScrollView>
    </>
  );
}
export default React.memo(PostScreen);
