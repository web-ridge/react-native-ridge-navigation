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
  resolving: false as const,
  // LAB: seed an authenticated session so the split screen launches without a
  // manual sign-in tap (headless simulator can't tap). Revert for production.
  user: {
    id: 1,
    name: 'Demo User',
    username: 'demo',
    email: 'demo@example.com',
    phone: '',
    website: '',
  },
  token: 'demo_LAB_TOKEN',
};

// LAB: always start authenticated, ignoring any stale persisted null session.
let initialState = emptyAuthState;

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
