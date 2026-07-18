import { Image, Linking, StyleSheet, View } from 'react-native';
import Superman from './img/superman.png';
import Text from './ui/Text';
import { useTheme } from './ui/theme';

function Introduction() {
  const theme = useTheme();
  return (
    <View>
      <View style={styles.titleContainer}>
        <Image source={Superman} style={styles.logo} />
        <View style={styles.titles}>
          <Text variant="caption" color={theme.primary}>
            react-native
          </Text>
          <Text variant="display" style={styles.wordmark}>
            ridge navigation
          </Text>
        </View>
      </View>
      <Text muted>
        Type-safe, cross-platform navigation with 100% native stacks and URLs on
        every platform — by{' '}
        <Text
          muted
          onPress={() => Linking.openURL('https://webridge.nl')}
          style={styles.underline}
        >
          webRidge
        </Text>
        .
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  underline: { textDecorationLine: 'underline' },
  logo: { width: 52, height: 52, marginRight: 16 },
  titles: { flex: 1 },
  wordmark: { fontSize: 28, lineHeight: 32 },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
});

export default Introduction;
