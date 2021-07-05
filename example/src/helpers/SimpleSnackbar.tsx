import * as React from 'react';

import { Snackbar } from 'react-native-paper';
import { StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SimpleSnackbar({
  testID,
  message,
  fab,
}: {
  testID?: string;
  message: string | undefined;
  fab?: boolean;
}) {
  const colorScheme = useColorScheme();

  const [visible, setVisible] = React.useState(message !== undefined);
  React.useEffect(() => {
    setVisible(message !== undefined);
  }, [message]);

  const onDismissSnackBar = () => setVisible(false);
  const insets = useSafeAreaInsets();

  return (
    <Snackbar
      theme={
        colorScheme === 'dark'
          ? {
              colors: {
                accent: '#000',
              },
            }
          : undefined
      }
      testID={testID}
      style={[
        styles.root,
        {
          bottom: insets.bottom + 12 + (fab ? 56 + 6 : 0),
          left: insets.left + 12,
          right: insets.right + 12,
        },
      ]}
      visible={visible && !!message}
      onDismiss={onDismissSnackBar}
    >
      {message}
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', zIndex: 100 },
});
