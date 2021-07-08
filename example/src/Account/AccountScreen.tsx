import * as React from 'react';
import { Appbar, Button, Text } from 'react-native-paper';
import authState, { reset } from '../Auth/AuthState';

export default function AccountScreen() {
  const [{ user }] = authState.use();
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Account" />
      </Appbar.Header>
      <Text>{user?.username}</Text>
      <Button
        mode="contained"
        onPress={() => {
          reset();
        }}
      >
        Logout
      </Button>
    </>
  );
}
