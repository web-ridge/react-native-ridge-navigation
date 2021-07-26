import * as React from 'react';

let subscribed: Record<string, boolean> = {
  default: false,
};
export default function OnlyRenderOnce({
  children,
  subscribeKey = 'react-native-ridge-navigation-default-subscribe-key',
}: {
  children: any;
  subscribeKey?: string;
}) {
  const [loadChildren, setLoadChildren] = React.useState<boolean>(false);
  React.useLayoutEffect(() => {
    if (!subscribed[subscribeKey]) {
      subscribed[subscribeKey] = true;
      setLoadChildren(true);
      return () => {
        subscribed[subscribeKey] = false;
      };
    }
    return;
  }, [subscribeKey]);
  return loadChildren ? children : null;
}
