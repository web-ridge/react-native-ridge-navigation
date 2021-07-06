import * as React from 'react';
import { Appbar, Text } from 'react-native-paper';

export default function PostsScreen() {
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Posts" />
      </Appbar.Header>
      <Text>Hello?</Text>
    </>
  );
}
