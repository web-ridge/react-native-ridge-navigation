import * as React from 'react';
import { StyleSheet, ScrollView, View, Linking } from 'react-native';
import { Button } from 'react-native-paper';
import Introduction from './Introduction';
import { useRenderLog } from './helpers/utils';
import {
  fluentRootBottomTabs,
  fluentRootNormal,
  fluentScreen,
  useNavigation,
} from 'react-native-ridge-navigation';
import Routes from './Routes';
import NavigationRoots from './NavigationRoots';
import BottomRoots from './BottomRoots';

function HomeScreen() {
  useRenderLog('HomeScreen');

  return (
    <ScrollView style={[styles.root]}>
      <View style={styles.content}>
        <Introduction />
        <Button
          uppercase={false}
          mode="contained"
          icon="github"
          style={[styles.twitterButton, { marginTop: 24 }]}
          onPress={() =>
            Linking.openURL(
              'https://github.com/web-ridge/react-native-ridge-navigation'
            )
          }
        >
          GitHub
        </Button>
        <TwitterFollowButton userName={'RichardLindhout'} />
        <TwitterFollowButton userName={'web_ridge'} />
        <FluentButton />
      </View>
    </ScrollView>
  );
}

function FluentButton() {
  const { fluent } = useNavigation();
  return (
    <>
      <Button
        onPress={() => {
          fluent(
            fluentRootNormal(NavigationRoots.RootAuth),
            fluentScreen(Routes.HomeScreen, {}),
            fluentScreen(Routes.PostScreen, { id: '10' }),
            fluentScreen(Routes.PostScreen, { id: '20' }),
            fluentScreen(Routes.PostScreen, { id: '30' })
          );
        }}
      >
        Deep link (normal)
      </Button>
      <Button
        onPress={() => {
          fluent(
            fluentRootBottomTabs(NavigationRoots.RootHome, BottomRoots.Account),
            fluentScreen(Routes.HomeScreen, {}),
            fluentScreen(Routes.PostScreen, { id: '10' }),
            fluentScreen(Routes.PostScreen, { id: '20' }),
            fluentScreen(Routes.PostScreen, { id: '30' })
          );
        }}
      >
        Deep link (bottom tabs)
      </Button>
    </>
  );
}

function TwitterFollowButton({ userName }: { userName: string }) {
  return (
    <Button
      uppercase={false}
      mode="outlined"
      icon="twitter"
      style={styles.twitterButton}
      onPress={() => Linking.openURL(`https://twitter.com/${userName}`)}
    >
      @{userName}
    </Button>
  );
}

const styles = StyleSheet.create({
  twitterButton: { marginBottom: 16 },
  root: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 500,
    marginTop: 24,
    padding: 24,
    alignSelf: 'center',
    flex: 1,
  },
  contentInline: {
    padding: 0,
    height: 600,
  },
  contentShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
});

export default React.memo(HomeScreen);
