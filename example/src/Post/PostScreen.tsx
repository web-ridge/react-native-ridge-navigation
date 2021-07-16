import * as React from 'react';
import { Paragraph } from 'react-native-paper';

import { useParams } from '../../../src';

import { useQuery } from 'react-query';
import routes from '../NavigatorRoutes';
import { ScrollView } from 'react-native';
import Header from '../Header';
import { queryKeyPostScreen, queryKeyPostScreenPromise } from '../queryKeys';

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
