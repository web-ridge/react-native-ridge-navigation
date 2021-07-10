import * as React from 'react';
import { Appbar, Button, Text } from 'react-native-paper';
import authState, { reset } from '../Auth/AuthState';

import { createSimpleTheme, setTheme, updateBadge } from '../../../src';
import { ScrollView } from 'react-native';
import { BottomRoots } from '../Navigator';

export default function AccountScreen() {
  const [{ user }] = authState.use();

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Account" />
      </Appbar.Header>
      <ScrollView style={{ padding: 24 }}>
        <Button
          onPress={() => {
            updateBadge(BottomRoots.Posts, '10');
          }}
        >
          +1 post
        </Button>
        <Text>{user?.username}</Text>
        <Button
          onPress={() => {
            setTheme(
              createSimpleTheme({
                light: {
                  primary: '#2003fc',
                  accent: '#2003fc',
                  text: '#000',
                },
                dark: {
                  primary: '#52a6fa',
                  accent: '#52a6fa',
                  text: '#fff',
                },
              })
            );
          }}
        >
          Blue theme
        </Button>
        <Button
          onPress={() => {
            setTheme(
              createSimpleTheme({
                light: {
                  primary: '#fc0303',
                  accent: '#fc0303',
                  text: '#000',
                },
                dark: {
                  primary: '#ff9191',
                  accent: '#ff9191',
                  text: '#fff',
                },
              })
            );
          }}
        >
          Red theme
        </Button>
        <Button
          mode="contained"
          onPress={() => {
            reset();
          }}
        >
          Logout
        </Button>
      </ScrollView>
    </>
  );
}
