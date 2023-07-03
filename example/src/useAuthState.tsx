import { create } from 'zustand';
import { storage } from './storage';
import api from './api';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

export interface UseAuthState {
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

const useAuthState = create<UseAuthState>(() => initialState || emptyAuthState);

export function setAuthState(state: UseAuthState) {
  useAuthState.setState(state);
  storage.set('auth', JSON.stringify(state));
}

fetchAndSaveProfileForToken({ token: initialState?.token });

export function reset() {
  setAuthState(emptyAuthState);
}

export async function fetchAndSaveProfileForToken({
  token,
}: {
  token: string | null | undefined;
}) {
  if (!token) {
    return;
  }

  const response: any = await api({
    path: 'users/1',
  });

  setAuthState({
    token,
    user: response,
    resolving: false,
  });
}

export default useAuthState;
