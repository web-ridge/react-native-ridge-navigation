import { Image, Linking, StyleSheet, View } from 'react-native';
import * as React from 'react';
import { IconButton, Paragraph, Text, Title } from 'react-native-paper';
import Superman from './img/superman.png';
import { useNavigation } from 'react-native-ridge-navigation';

function Introduction() {
  const { canNavigateBack, pop } = useNavigation();
  return (
    <>
      <View style={styles.titleContainer}>
        {canNavigateBack(1) ? (
          <IconButton icon="arrow-left" onPress={() => pop()} />
        ) : (
          <Image source={Superman} style={styles.logo} />
        )}
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
