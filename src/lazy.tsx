import * as React from 'react';

export type PreloadableComponent<T extends React.ComponentType<any>> = T & {
  preload: () => Promise<T>;
};

export function lazyWithPreload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): PreloadableComponent<T> {
  const ReactLazyComponent = React.lazy(factory);
  let PreloadedComponent: T | undefined;
  let factoryPromise: Promise<T> | undefined;

  const Component = React.forwardRef(function LazyWithPreload(props, ref) {
    // Once one of these is chosen, we must ensure that it continues to be
    // used for all subsequent renders, otherwise it can cause the
    // underlying component to be unmounted and remounted.
    const ComponentToRender = React.useRef(
      PreloadedComponent ?? ReactLazyComponent
    );
    return React.createElement(
      ComponentToRender.current,
      Object.assign(ref ? { ref } : {}, props) as any
    );
  });

  const LazyWithPreload = Component as any as PreloadableComponent<T>;

  LazyWithPreload.preload = () => {
    if (!factoryPromise) {
      factoryPromise = factory().then((module) => {
        PreloadedComponent = module.default;
        return PreloadedComponent;
      });
    }

    return factoryPromise;
  };

  return LazyWithPreload;
}

export default lazyWithPreload;
