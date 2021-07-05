import * as React from 'react';
import { StyleSheet, View } from 'react-native';

function Spacer({ height }: { height?: number }) {
  return <View style={[styles.space, height !== undefined && { height }]} />;
}
const styles = StyleSheet.create({
  space: { height: 20 },
});
export default React.memo(Spacer);
