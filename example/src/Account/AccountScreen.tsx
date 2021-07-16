import * as React from 'react';
import { Button, Paragraph, Text } from 'react-native-paper';
import authState, { reset } from '../Auth/AuthState';

import { createSimpleTheme, setTheme, updateBadge } from '../../../src';
import { View, ScrollView } from 'react-native';
import { BottomRoots } from '../Navigator';
import Header from '../Header';

export default function AccountScreen() {
  const [{ user }] = authState.use();

  if (!user) {
    return <Text>No user logged in</Text>;
  }
  return (
    <>
      <Header title={user?.name} />
      <ScrollView style={{ padding: 12 }}>
        <View style={{ alignItems: 'flex-start' }}>
          <Paragraph>{user.email}</Paragraph>
          <Paragraph>{user.website}</Paragraph>
          <Paragraph>{user.phone}</Paragraph>
          <Button
            style={{ marginTop: 12 }}
            mode="outlined"
            onPress={() => {
              updateBadge(BottomRoots.Posts, '10');
            }}
          >
            +1 bottom-tab post badge
          </Button>

          <Button
            style={{ marginTop: 12 }}
            mode="outlined"
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
            Blue (only navigation) theme
          </Button>
          <Button
            style={{ marginTop: 12 }}
            mode="outlined"
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
            Red (only navigation) theme
          </Button>
          <Button
            style={{ marginTop: 12 }}
            mode="contained"
            onPress={() => {
              reset();
            }}
          >
            Logout
          </Button>
        </View>
      </ScrollView>
    </>
  );
}
