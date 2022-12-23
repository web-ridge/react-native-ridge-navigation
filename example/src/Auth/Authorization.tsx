import * as React from 'react';

import authState, { AuthState } from './AuthState';

import { SwitchRoot } from 'react-native-ridge-navigation';
import { NavigationRoots } from '../Navigator';

export function RequireAuthHOC<T>(WrappedComponent: any) {
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

  if (!resolving && (!token || !user)) {
    return <SwitchRoot rootKey={NavigationRoots.RootAuth} />;
  }

  // user is cached locally
  if (token && user) {
    return children;
  }

  return null;
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
