import React, { Suspense } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import { View } from 'react-native';

const Fallback = React.memo(() => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator />
    </View>
  );
});

export default function SuspenseWithSpinner({ children }: { children: any }) {
  return <Suspense fallback={<Fallback />}>{children}</Suspense>;
}
