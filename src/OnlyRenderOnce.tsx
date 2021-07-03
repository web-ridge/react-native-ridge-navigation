import * as React from 'react';

let subscribed = false;
export default function OnlyRenderOnce({ children }: { children: any }) {
  const [loadChildren, setLoadChildren] = React.useState<boolean>(false);
  React.useLayoutEffect(() => {
    if (!subscribed) {
      subscribed = true;
      setLoadChildren(true);
      return () => {
        subscribed = false;
      };
    }
    return;
  }, []);
  return loadChildren ? children : null;
}
