import * as React from 'react';
import { Helmet } from 'react-helmet';

export function Head({ children }: { children: any }) {
  return <Helmet>{children}</Helmet>;
}

export default React.memo(Head);
