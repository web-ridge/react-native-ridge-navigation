import * as React from 'react';
import useNavigation from './useNavigation';

export default function SwitchRoot({ rootKey }: { rootKey: string }) {
  const { switchRoot } = useNavigation();

  React.useEffect(() => {
    switchRoot(rootKey, true);
  }, [switchRoot, rootKey]);

  return null;
}
