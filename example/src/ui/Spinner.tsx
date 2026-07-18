import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from './theme';

export default function Spinner() {
  const theme = useTheme();
  return (
    <View style={styles.root}>
      <ActivityIndicator color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
