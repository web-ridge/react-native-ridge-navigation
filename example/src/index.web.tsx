import * as React from 'react';
import ReactDOM from 'react-dom';
import AppHOC from './App';
import './index.css';

import './Navigator';
import { NavigationRoot } from '../../src';
import ErrorBoundaryWithRetry from './helpers/ErrorBoundaryWithRetry';
import AsyncBoundary from './helpers/AsyncBoundary';

//@ts-ignore
const rootEl = document.getElementById('root');

export const Element = AppHOC(NavigationRoot);
//@ts-ignore
ReactDOM.createRoot(rootEl).render(
  <ErrorBoundaryWithRetry>
    <Element SuspenseContainer={AsyncBoundary} />
  </ErrorBoundaryWithRetry>
);
