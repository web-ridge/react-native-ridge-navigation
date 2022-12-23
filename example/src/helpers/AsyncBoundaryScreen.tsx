import React from 'react';
import ErrorBoundaryWithRetry from './ErrorBoundaryWithRetry';
import { ActivityIndicator, Appbar } from 'react-native-paper';
import { useNavigation } from 'react-native-ridge-navigation';
import { View } from 'react-native';

export default function AsyncBoundaryScreen({ children }: { children: any }) {
  const { canNavigateBack } = useNavigation();
  return (
    <ErrorBoundaryWithRetry>
      <React.Suspense
        fallback={
          <>
            <Appbar.Header>
              {canNavigateBack() && <Appbar.BackAction />}
            </Appbar.Header>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator />
            </View>
          </>
        }
      >
        {children}
      </React.Suspense>
    </ErrorBoundaryWithRetry>
  );
}
