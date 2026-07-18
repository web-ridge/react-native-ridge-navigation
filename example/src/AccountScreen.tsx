import * as React from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import useAuthState, { reset } from './useAuthState';
import {
  useBottomTabIndex,
  useBottomTabBadges,
  NavigationNestedProvider,
  ModalBackHandler,
  BottomTabLink,
} from 'react-native-ridge-navigation';
import Header from './Header';
import { useRenderLog } from './helpers/utils';
import routes from './Routes';
import ButtonLink from './ButtonLink';
import BottomRoots from './BottomRoots';
import Button from './ui/Button';
import Text from './ui/Text';
import { useTheme } from './ui/theme';

function AccountScreen() {
  useRenderLog('AccountScreen');
  const theme = useTheme();
  const { switchToTab } = useBottomTabIndex();
  const { updateBadge } = useBottomTabBadges();
  const [modalVisible, setModalVisible] = React.useState(false);
  const { user } = useAuthState();

  const onClose = React.useCallback(() => {
    setModalVisible(false);
  }, [setModalVisible]);
  if (!user) {
    return <Text>No user signed in</Text>;
  }
  return (
    <>
      <Header title={user?.name} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.profile, { borderColor: theme.border }]}>
          <Text muted>{user.email}</Text>
          <Text muted>{user.website}</Text>
          <Text muted>{user.phone}</Text>
        </View>
        <View style={styles.actions}>
          <Button
            variant="outline"
            icon="notifications-outline"
            onPress={() => {
              updateBadge(BottomRoots.Posts, 10000);
            }}
          >
            Badge the Posts tab
          </Button>
          <Button
            variant="outline"
            icon="swap-horizontal-outline"
            onPress={() => {
              switchToTab(BottomRoots.Posts);
            }}
          >
            Switch to Posts tab
          </Button>
          <BottomTabLink to={BottomRoots.Posts} params={{}}>
            {(linkProps) => (
              <Button variant="outline" icon="link-outline" {...linkProps}>
                Posts tab as a link
              </Button>
            )}
          </BottomTabLink>
          <Button
            variant="outline"
            icon="layers-outline"
            onPress={() => {
              setModalVisible(true);
            }}
          >
            Open modal stack
          </Button>
          <Button
            icon="log-out-outline"
            onPress={() => {
              reset();
            }}
          >
            Sign out
          </Button>
        </View>
      </ScrollView>
      <ModalBackHandler>
        {(handleBack) => (
          <Modal
            visible={modalVisible}
            style={{ backgroundColor: theme.background }}
            statusBarTranslucent={true}
            presentationStyle="pageSheet"
            animationType="slide"
            onRequestClose={() => {
              if (!handleBack()) setModalVisible(false);
            }}
          >
            <NavigationNestedProvider>
              <ModalHome onClose={onClose} />
            </NavigationNestedProvider>
          </Modal>
        )}
      </ModalBackHandler>
    </>
  );
}

const ModalHome = React.memo(({ onClose }: { onClose: () => void }) => {
  return (
    <View style={styles.modal}>
      <Header title="Modal stack" />
      <View style={styles.modalContent}>
        <ButtonLink to={routes.PostScreen} params={{ id: '2' }}>
          Push post detail in this modal
        </ButtonLink>
        <Button variant="ghost" onPress={onClose}>
          Close modal
        </Button>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  content: {
    padding: 20,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  profile: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  actions: {
    marginTop: 20,
    gap: 10,
    alignItems: 'stretch',
  },
  modal: {
    height: 320,
  },
  modalContent: {
    padding: 20,
    gap: 10,
  },
});

export default React.memo(AccountScreen);
