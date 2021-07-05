import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { defaultStyles, useBigScreen } from './utils';
import { useTheme } from 'react-native-paper';

export default function LimitedView({ children }: { children: any }) {
  const bigScreen = useBigScreen();
  const isDark = useTheme().dark;

  return (
    <View
      style={
        bigScreen
          ? [styles.root, isDark && styles.rootDark]
          : defaultStyles.full
      }
    >
      <View
        style={
          bigScreen
            ? [styles.content, isDark && styles.contentDark]
            : defaultStyles.full
        }
      >
        {children}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f2efe9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  rootDark: {
    backgroundColor: '#000000',
  },
  content: {
    position: 'relative',
    flex: 1,
    maxWidth: 1200,
    width: '100%',

    boxSizing: 'border-box',
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
    shadowColor: '#8c5e00',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.27,
    shadowRadius: 7.49,

    elevation: 12,
  },
  contentDark: {
    shadowOffset: {
      width: 0,
      height: 0,
    },
    backgroundColor: '#121212',
    shadowColor: '#000',
    shadowOpacity: 0.67,
    shadowRadius: 20.49,
  },
});
