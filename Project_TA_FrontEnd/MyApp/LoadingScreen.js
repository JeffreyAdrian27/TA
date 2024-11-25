import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={require('./assets/loading.png')} style={styles.loadingImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
});

export default LoadingScreen;