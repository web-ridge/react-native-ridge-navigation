import { Image, Linking, StyleSheet, View } from 'react-native';
import * as React from 'react';
import { Paragraph, Text, Title } from 'react-native-paper';

function Introduction() {
  return (
    <>
      <View style={styles.titleContainer}>
        <Image
          source={require('./img/superman.png').default}
          style={styles.logo}
        />
        <Title>react-native-ridge-navigation</Title>
      </View>
      <Paragraph>
        Simple, performant & type-safe cross platform navigation in React Native
        / React Native Web brought to you by{' '}
        <Text
          onPress={() => Linking.openURL('https://webridge.nl')}
          style={styles.underline}
        >
          webRidge
        </Text>
      </Paragraph>
    </>
  );
}

const styles = StyleSheet.create({
  underline: { textDecorationLine: 'underline' },
  logo: { width: 56, height: 56, marginRight: 24 },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
});

export default Introduction;
