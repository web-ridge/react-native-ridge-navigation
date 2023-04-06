import * as React from 'react';
import { Button, Paragraph, Text, useTheme } from 'react-native-paper';
import authState, { reset } from '../Auth/AuthState';

import {
  useBottomTabIndex,
  useBottomTabBadges,
  NavigationNestedProvider,
  ModalBackHandler,
} from 'react-native-ridge-navigation';
import { View, ScrollView, Modal } from 'react-native';
import { BottomRoot } from '../Navigator';
import Header from '../Header';
import { useRenderLog } from '../helpers/utils';
import routes from '../Routes';
import ButtonLink from '../ButtonLink';

function AccountScreen() {
  useRenderLog('AccountScreen');
  const theme = useTheme();
  const { switchToTab } = useBottomTabIndex();
  const { updateBadge } = useBottomTabBadges();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [{ user }] = authState.use();

  const onClose = React.useCallback(() => {
    setModalVisible(false);
  }, [setModalVisible]);
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
          <Button
            style={{ marginTop: 12 }}
            mode="outlined"
            onPress={() => {
              console.log(new Date().getTime(), 'setModalVisible(true)');
              setModalVisible(true);
            }}
          >
            Open modal stack
          </Button>
        </View>
      </ScrollView>
      <ModalBackHandler>
        {(handleBack) => (
          <Modal
            visible={modalVisible}
            style={{ backgroundColor: theme.colors.background }}
            statusBarTranslucent={true}
            presentationStyle="pageSheet"
            animationType="slide"
            onRequestClose={() => {
              if (!handleBack()) setModalVisible(false);
            }}
          >
            <NavigationNestedProvider>
              <SimpleComponent onClose={onClose} />
            </NavigationNestedProvider>
          </Modal>
        )}
      </ModalBackHandler>
    </>
  );
}

const SimpleComponent = React.memo(({ onClose }: { onClose: () => void }) => {
  // console.log(new Date().getTime(), 'SimpleComponent');
  return (
    <View style={{ height: 250 }}>
      <Header title="Modal stack" />
      <Button onPress={onClose}>Close modal</Button>
      <ButtonLink to={routes.PostScreen} params={{ id: '2' }}>
        Go to post detail
      </ButtonLink>
    </View>
  );
});
export default React.memo(AccountScreen);
