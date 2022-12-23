import { Image, Linking, StyleSheet, View } from 'react-native';
import * as React from 'react';
import { Paragraph, Text, Title } from 'react-native-paper';
import Superman from './img/superman.png';
// import FastImage from "react-native-fast-image";

function Introduction() {
  return (
    <>
      <View style={styles.titleContainer}>
        {/*// @ts-ignore*/}
        <Image source={Superman} style={styles.logo} />
        {/*<FastImage*/}
        {/*  style={{ width: 200, height: 200 }}*/}
        {/*  source={{*/}
        {/*    uri: "https://unsplash.it/400/400?image=1",*/}
        {/*    headers: { Authorization: "someAuthToken" },*/}
        {/*    priority: FastImage.priority.normal,*/}
        {/*  }}*/}
        {/*  resizeMode={FastImage.resizeMode.contain}*/}
        {/*/>*/}
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
