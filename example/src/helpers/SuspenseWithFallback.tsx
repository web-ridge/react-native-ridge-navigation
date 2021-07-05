import React, { Suspense } from 'react';
import { ProgressBar } from 'react-native-paper';

function Spinner() {
  return <ProgressBar indeterminate />;
}

export default function SuspenseWithSpinner({ children }: { children: any }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
}
