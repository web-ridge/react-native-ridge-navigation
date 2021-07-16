import * as React from 'react';

let subscribed: Record<string, boolean> = {
  default: false,
};
export default function OnlyRenderOnce({
  children,
  key = 'default',
}: {
  children: any;
  key?: string;
}) {
  const [loadChildren, setLoadChildren] = React.useState<boolean>(false);
  React.useLayoutEffect(() => {
    if (!subscribed[key]) {
      subscribed[key] = true;
      setLoadChildren(true);
      return () => {
        subscribed[key] = false;
      };
    }
    return;
  }, [key]);
  return loadChildren ? children : null;
}
