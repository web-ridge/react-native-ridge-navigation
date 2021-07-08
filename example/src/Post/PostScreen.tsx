import * as React from 'react';
import { Appbar, Paragraph, Title } from 'react-native-paper';

import { BackLink, useParams } from '../../../src';
import api from '../api';
import { useQuery } from 'react-query';
import routes from '../NavigatorRoutes';
import { ScrollView } from 'react-native';

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
      <Appbar.Header>
        <BackLink>
          {(linkProps) => <Appbar.BackAction {...linkProps} color={'pink'} />}
        </BackLink>
        <Appbar.Content title={data!.title} />
      </Appbar.Header>
      <ScrollView style={{ padding: 24 }}>
        <Title>{data!.title}</Title>
        <Paragraph>{data!.body}</Paragraph>
      </ScrollView>
    </>
  );
}
