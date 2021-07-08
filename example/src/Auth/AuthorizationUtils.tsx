import authState from './AuthState';
import api from '../api';

export async function fetchAndSaveProfileForToken({
  token,
}: {
  token: string;
}) {
  // first we set the token in memory so we can try to request the profile with this token
  authState.set({
    token,
    user: null,
    resolving: true,
  });

  const response: any = await api({
    path: 'users/1',
  });
  authState.set({
    token,
    user: response,
    resolving: false,
  });
}
