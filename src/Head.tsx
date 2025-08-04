import * as React from 'react';

export function Head({ children }: { children: any }) {
  return <>{children}</>;
}

export default React.memo(Head);
