import * as React from 'react';
import type { BaseScreen, ExtractRouteParams } from './navigationUtils';
import { useNavigation } from './Navigation';

export default function Redirect<T extends BaseScreen>({
  to,
  params,
}: {
  to: T;
  params: ExtractRouteParams<T['path']>;
}) {
  const navigation = useNavigation();

  React.useEffect(() => {
    navigation.replace(to, params, true);
  }, [navigation, to, params]);

  return null;
}
