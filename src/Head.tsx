import * as React from 'react';
import { Helmet } from 'react-helmet-async';

export function Head({ children }: { children: any }) {
  return <Helmet>{children}</Helmet>;
}

export default React.memo(Head);
