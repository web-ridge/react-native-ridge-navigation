import type * as React from 'react';

export default function lazyWithPreload<T extends React.ComponentType<any>>(
  _: () => any
): T {
  throw Error('currently not supported on native');
}
