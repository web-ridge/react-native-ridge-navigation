import * as Linking from 'expo-linking';

export let initialUrl: string | null = null;
Linking.getInitialURL().then((url) => {
  initialUrl = url;
});
