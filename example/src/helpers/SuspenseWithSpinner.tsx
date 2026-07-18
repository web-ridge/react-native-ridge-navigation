import { Suspense } from 'react';
import Spinner from '../ui/Spinner';

export default function SuspenseWithSpinner({ children }: { children: any }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
}
