import { Platform } from 'react-native';

// Tiny key-value store for the demo login. localStorage on web, in-memory on
// native — this example is about navigation, not persistence, and it keeps
// the app free of extra native dependencies.
const memory = new Map<string, string>();

export const storage = {
  getString(key: string): string | undefined {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key) ?? undefined;
    }
    return memory.get(key);
  },
  set(key: string, value: string) {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
    memory.set(key, value);
  },
};
