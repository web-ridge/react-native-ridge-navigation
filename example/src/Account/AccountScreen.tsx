import * as React from 'react';
import { Button, Paragraph, Text } from 'react-native-paper';
import authState, { reset } from '../Auth/AuthState';

import { useNavigation } from 'react-native-ridge-navigation';
import { View, ScrollView } from 'react-native';
import { BottomRoot } from '../Navigator';
import Header from '../Header';
import { useRenderLog } from '../helpers/utils';

function AccountScreen() {
  useRenderLog('AccountScreen');
  const { switchToTab, updateBadge } = useNavigation();
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
              updateBadge(BottomRoot.Posts, 10000);
            }}
          >
            +1 bottom-tab post badge
          </Button>
          <Button
            style={{ marginTop: 12 }}
            mode="outlined"
            onPress={() => {
              switchToTab(BottomRoot.Posts);
            }}
          >
            Go to posts tab
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
export default React.memo(AccountScreen);
