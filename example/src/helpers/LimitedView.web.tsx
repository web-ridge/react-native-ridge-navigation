import { StyleSheet, View } from 'react-native';
import { defaultStyles, useBigScreen } from './utils';
import { useTheme } from '../ui/theme';

export default function LimitedView({ children }: { children: any }) {
  const bigScreen = useBigScreen();
  const theme = useTheme();

  if (!bigScreen) {
    return <View style={defaultStyles.full}>{children}</View>;
  }
  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.content,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    position: 'relative',
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
