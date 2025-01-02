import { SwitchRoot } from 'react-native-ridge-navigation';
import useAuthState from './useAuthState';
import NavigationRoots from './NavigationRoots';

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
