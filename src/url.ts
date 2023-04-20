import * as Linking from 'expo-linking';

export let initialUrl: string | null = null;
Linking.getInitialURL().then((url) => {
  if (isExpoUrl(url)) {
    initialUrl = null;
  } else {
    initialUrl = url;
  }
});

export function isExpoUrl(url: string | null): boolean {
  if (!url) {
    return false;
  }
  return url.includes('/expo-development-client/');
}
