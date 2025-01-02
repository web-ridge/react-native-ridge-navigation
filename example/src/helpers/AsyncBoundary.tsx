import ErrorBoundaryWithRetry from './ErrorBoundaryWithRetry';
import SuspenseWithFallback from './SuspenseWithSpinner';

export default function AsyncBoundary({ children }: { children: any }) {
  return (
    <ErrorBoundaryWithRetry>
      <SuspenseWithFallback>{children}</SuspenseWithFallback>
    </ErrorBoundaryWithRetry>
  );
}
