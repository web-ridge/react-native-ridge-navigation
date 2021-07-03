import * as React from 'react';
import { useNavigation } from './Navigation';

export default function SwitchRoot({
  rootKey,
  params,
}: {
  rootKey: string;
  params: any;
}) {
  const { switchRoot } = useNavigation();

  React.useEffect(() => {
    switchRoot(rootKey, params, true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switchRoot, rootKey]);

  return null;
}
