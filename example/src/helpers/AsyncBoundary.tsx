import React from 'react';
import ErrorBoundaryWithRetry from './ErrorBoundaryWithRetry';
import SuspenseWithFallback from './SuspenseWithFallback';

export default function AsyncBoundary({ children }: { children: any }) {
  return (
    <ErrorBoundaryWithRetry>
      <SuspenseWithFallback>{children}</SuspenseWithFallback>
    </ErrorBoundaryWithRetry>
  );
}
