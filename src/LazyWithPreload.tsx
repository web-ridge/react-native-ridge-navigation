// https://github.com/ianschmitz/react-lazy-with-preload
import * as React from 'react';

export type PreloadableComponent<T extends React.ComponentType<any>> = T & {
  preload: () => Promise<void>;
};

export default function lazyWithPreload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): PreloadableComponent<T> {
  const LazyComponent = React.lazy(factory);
  let factoryPromise: Promise<void> | undefined;
  let LoadedComponent: T | undefined;

  const Component = React.forwardRef(function LazyWithPreload(props, ref) {
    return React.createElement(
      LoadedComponent ?? LazyComponent,
      Object.assign(ref ? { ref } : {}, props) as any
    );
  }) as any as PreloadableComponent<T>;

  Component.preload = () => {
    if (!factoryPromise) {
      factoryPromise = factory().then((module) => {
        LoadedComponent = module.default;
      });
    }

    return factoryPromise;
  };
  return Component;
}
