import * as React from 'react';
import { Helmet } from 'react-helmet';

export function Head({ children }: { children: any }) {
  // @ts-expect-error types are wrong in react-helmet
  return <Helmet>{children}</Helmet>;
}

export default React.memo(Head);
