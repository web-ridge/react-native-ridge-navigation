import React from 'react';
import ErrorBoundaryWithRetry from './ErrorBoundaryWithRetry';
import Spinner from '../ui/Spinner';

export default function AsyncBoundaryScreen({ children }: { children: any }) {
  return (
    <ErrorBoundaryWithRetry>
      <React.Suspense fallback={<Spinner />}>{children}</React.Suspense>
    </ErrorBoundaryWithRetry>
  );
}
