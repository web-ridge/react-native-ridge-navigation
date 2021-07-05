import authState, { emptyAuthState } from './AuthState';

export function fetchAndSaveProfileForToken({
  token,
  onCompleted,
  onError,
}: {
  token: string;
  onCompleted?: () => any;
  onError?: (error: Error) => any;
}) {
  // first we set the token in memory so we can try to request the profile with this token
  authState.set({
    token,
    user: null,
    resolving: true,
  });

  // TODO DO query

  let isFetched = true;
  if (isFetched) {
    const user = {
      id: 1,
      name: 'Leanne Graham',
      username: 'Bret',
      email: 'Sincere@april.biz',
      phone: '1-770-736-8031 x56442',
      website: 'hildegard.org',
    };

    authState.set({
      token,
      user,
      resolving: false,
    });
    onCompleted && onCompleted();
  } else {
    const error = new Error('not fetched');
    console.log('fetchAndSaveProfileForToken ERROR', { error });
    console.log({ error });
    authState.set(emptyAuthState);
    authState.set({
      token,
      user: null,
      resolving: false,
    });
    onError && onError(error);
  }
}
