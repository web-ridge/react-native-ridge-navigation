import * as React from 'react';
import { useBigScreen } from './utils';
import { StyleSheet, View, ViewStyle } from 'react-native';

export default function PaddingView({
  children,
  vertical = true,
  style,
}: {
  children: any;
  vertical?: boolean;
  style?: ViewStyle;
}) {
  const bigScreen = useBigScreen();
  return (
    <View
      style={[
        styles.root,
        vertical && styles.rootVertical,
        bigScreen && styles.rootBig,
        bigScreen && vertical && styles.rootBigVertical,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingLeft: 12,
    paddingRight: 12,
  },
  rootVertical: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  rootBig: {
    paddingLeft: 24,
    paddingRight: 24,
  },
  rootBigVertical: {
    paddingTop: 24,
    paddingBottom: 24,
  },
});
