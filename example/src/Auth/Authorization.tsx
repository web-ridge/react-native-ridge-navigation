import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authState, { AuthState } from './AuthState';
import { fetchAndSaveProfileForToken } from './AuthorizationUtils';

import type { ComponentType } from 'react';
import { SwitchRoot } from 'react-native-ridge-navigation';
import { NavigationRoots } from '../Navigator';

// getInitialState fetches data from localStorage
async function setInitialState() {
  let initialState;
  try {
    const item = await AsyncStorage.getItem('auth');
    if (item) {
      initialState = JSON.parse(item);
      // always try to refresh store in background
      fetchAndSaveProfileForToken({ token: initialState.token });
    }
  } catch (error) {}

  return initialState;
}
setInitialState();

// EXTERNAL FUNCTIONS AND COMPONENTS

export function RequireAuthHOC<T>(WrappedComponent: ComponentType<T>) {
  let func = function (props: T) {
    return (
      <RequireAuth>
        <WrappedComponent {...props} />
      </RequireAuth>
    );
  };
  (func as any).preload = (WrappedComponent as any).preload;
  return func;
}

export function RequireAuth({ children }: { children?: any }) {
  const { token, resolving, user } = useAuthState();

  if (resolving) {
    return null;
  }

  if (!resolving && (!token || !user)) {
    return <SwitchRoot rootKey={NavigationRoots.RootAuth} params={{}} />;
  }

  // user is cached locally
  if (token && user) {
    return children;
  }

  return null;
}
export function OptionalAuth({ children }: { children?: any }) {
  return children;
}

// useToken for easy getting your token in your components
export function useToken(): string | null | undefined {
  const state = authState.useValue();
  return state.token;
}

// useAuthState for easy getting your auth data in your components
interface AuthStateHooks extends AuthState {
  isAuthenticated: boolean;
}

export function useAuthState(): AuthStateHooks {
  const state = authState.useValue();
  const isAuthenticated = !!state.user;
  return {
    ...state,
    isAuthenticated,
  };
}
