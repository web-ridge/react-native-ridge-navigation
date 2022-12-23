import { newRidgeState } from 'react-ridge-state';
import { storage } from '../storage';
import api from '../api';

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

let initialState = emptyAuthState;
try {
  const item = storage.getString('auth');
  if (item) {
    initialState = JSON.parse(item);
  }
} catch (error) {
  console.error('storage (auth)', { error });
}

const authState = newRidgeState<AuthState>(initialState || emptyAuthState, {
  onSet: (newState) => {
    if (newState.user && newState.token && !newState.resolving) {
      storage.set('auth', JSON.stringify(newState));
    }
  },
});
fetchAndSaveProfileForToken({ token: initialState.token });
export function reset() {
  authState.set(emptyAuthState);
}

export async function fetchAndSaveProfileForToken({
  token,
}: {
  token: string | null | undefined;
}) {
  if (!token) {
    return;
  }
  authState.set((prev) => ({
    ...prev,
    token,
    resolving: true,
  }));

  const response: any = await api({
    path: 'users/1',
  });

  authState.set({
    token,
    user: response,
    resolving: false,
  });
}

export default authState;
