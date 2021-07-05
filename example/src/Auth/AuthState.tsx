import { newRidgeState } from 'react-ridge-state';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

export interface AuthState {
  user: User | null;
  token: string | null | undefined;
  resolving: undefined | false | true;
}
export const emptyAuthState = {
  resolving: undefined,
  user: null,
  token: undefined,
};

const authState = newRidgeState<AuthState>(emptyAuthState, {
  onSet: (newState) => {
    if (newState.user && newState.token && !newState.resolving) {
      // save to local storage
      AsyncStorage.setItem('auth', JSON.stringify(newState));
    }
  },
});

export function reset() {
  authState.reset();
  return AsyncStorage.removeItem('auth');
}

export function isAuthorized(): boolean {
  return !!authState.get().token;
}

export function getToken(): string | null | undefined {
  const { token } = authState.get();
  return token;
}

export default authState;
