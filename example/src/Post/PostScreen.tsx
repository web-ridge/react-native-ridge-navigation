import * as React from 'react';
import { Paragraph } from 'react-native-paper';

import { useParams } from '../../../src';
import api from '../api';
import { useQuery } from 'react-query';
import routes from '../NavigatorRoutes';
import { ScrollView } from 'react-native';
import Header from '../Header';

export interface PostType {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export const queryKeyPostScreen = ({ id }: { id: string }) => [
  'QUERY_KEY_POST_SCREEN',
  id,
];
export const queryKeyPostScreenPromise =
  ({ id }: { id: string }) =>
  () =>
    api({ path: `posts/${id}` }) as Promise<PostType>;

export default function PostScreen(props: any) {
  const { id } = useParams(routes.PostScreen, props);
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
