import * as React from 'react';
import { Paragraph } from 'react-native-paper';
import { useParams } from 'react-native-ridge-navigation';
import { useQuery } from '@tanstack/react-query';
import { ScrollView } from 'react-native';
import Header from '../Header';
import { queryKeyPostScreen, queryKeyPostScreenPromise } from '../queryKeys';
import routes from '../Routes';

function PostScreen() {
  const { id } = useParams(routes.PostScreen);

  const { data } = useQuery(
    queryKeyPostScreen({ id }),
    queryKeyPostScreenPromise({ id })
  );

  return (
    <>
      <Header title={data!.title} withBack />
      <ScrollView style={{ padding: 12 }}>
        <Paragraph>{data!.body}</Paragraph>
      </ScrollView>
    </>
  );
}
export default React.memo(PostScreen);
