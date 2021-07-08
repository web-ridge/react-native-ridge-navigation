import type * as React from 'react';

export default function lazyWithPreload<T extends React.ComponentType<any>>(
  factory: () => any
): T {
  return factory().default;
}
