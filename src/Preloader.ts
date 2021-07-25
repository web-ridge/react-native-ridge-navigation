import * as React from 'react';
import type { BaseScreen } from './navigationUtils';

type SubscriberFunc = (r: any) => any;

let cache: { [key: string]: any } = {};
let subs: { [key: string]: SubscriberFunc | undefined } = {};

export function setPreloadResult<T extends BaseScreen>(
  screen: T,
  result: ReturnType<T['preload']>
) {
  cache[screen.path] = result;
  const sub = subs[screen.path];
  if (sub) {
    sub(result);
  }
}

export function usePreloadResult<T extends BaseScreen>(
  screen: T
): ReturnType<T['preload']> {
  const [result, setResult] = React.useState<ReturnType<T['preload']>>(
    cache[screen.path]
  );
  React.useEffect(() => {
    subs[screen.path] = setResult;
    return () => {
      subs[screen.path] = undefined;
    };
  }, [screen.path, setResult]);
  return result;
}
