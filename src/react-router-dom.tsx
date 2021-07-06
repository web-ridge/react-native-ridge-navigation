import * as React from 'react';

import { BrowserHistory, Update, createBrowserHistory } from 'history';

import { Router } from './react-router';

////////////////////////////////////////////////////////////////////////////////
// COMPONENTS
////////////////////////////////////////////////////////////////////////////////

/**
 * A <Router> for use in web browsers. Provides the cleanest URLs.
 */
export function BrowserRouter({
  children,
  timeoutMs = 5000,
  window,
}: BrowserRouterProps) {
  let historyRef = React.useRef<BrowserHistory>();
  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({ window });
  }

  //@ts-ignore
  let [isPending, startTransition] = React.useTransition({
    timeoutMs,
  });

  let history = historyRef.current;
  let [state, dispatch] = React.useReducer(
    (_: Update, action: Update) => action,
    {
      action: history.action,
      location: history.location,
    }
  );

  React.useLayoutEffect(
    () =>
      history.listen((update) => {
        startTransition(() => {
          dispatch(update);
        });
      }),
    [history, startTransition]
  );

  return (
    <Router
      children={children}
      action={state.action}
      location={state.location}
      navigator={history}
      pending={isPending}
    />
  );
}

export interface BrowserRouterProps {
  children?: React.ReactNode;
  timeoutMs?: number;
  window?: Window;
}

BrowserRouter.displayName = 'BrowserRouter';
