import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, SafeAreaView, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
// import { openBrowserAsync } from 'react-native-webbrowser';
// import InAppBrowser from 'react-native-inappbrowser-reborn';

const LocationComponent = () => {
  const [address, setAddress] = useState('');
  const [locationData, setLocationData] = useState(null);
  const [showWebView, setShowWebView] = useState(false);
  const clientKey = Constants?.expoConfig?.extra?.EXPO_MIDTRANS_KEY;
  const [snapToken] = useState('7bb30f6c-f8ac-4fe5-98f6-8e65099b0749');
  
  const handleGetLocationFromAddress = async () => {
    try {
      const result = await Location.geocodeAsync(address);
      if (result && result.length > 0) {
        const firstLocation = result[0];
        const { latitude, longitude } = firstLocation;
        setLocationData({ latitude, longitude });
      } else {
        setLocationData(null);
        console.log('Alamat tidak ditemukan');
      }
    } catch (error) {
      console.error('Error saat mencari lokasi:', error);
      setLocationData(null);
    }
  };

  const handleWebViewLoad = () => {
    console.log('WebView loaded successfully');
  };

  // const snapUrl = `https://app.sandbox.midtrans.com/snap/v1/pay?clientKey=${clientKey}&token=${snapToken}`;
  const snapUrl = `https://app.sandbox.midtrans.com/snap/v4/redirection/0b93a2c4-9ed5-4a7f-9231-c8dc2d80b888`;
  
  const openBrowser = async () => {
    if (showWebView) {
      setShowWebView(false);
    }else{
      setShowWebView(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* <TextInput
        style={styles.input}
        placeholder="Masukkan alamat"
        value={address}
        onChangeText={setAddress}
      />
      <Button
        title="Dapatkan Lokasi"
        onPress={handleGetLocationFromAddress}
      />
      {locationData ? (
        <View style={styles.locationContainer}>
          <Text>Latitude: {locationData.latitude}</Text>
          <Text>Longitude: {locationData.longitude}</Text>
        </View>
      ) : (
        <Text>Lokasi tidak ditemukan</Text>
      )} */}
          <SafeAreaView style={{flex: 1}}>
            {showWebView && (
              <WebView
                source={{ uri: snapUrl }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                javaScriptCanOpenWindowsAutomatically={true}
                allowFileAccessFromFileURLs={true}
                allowFileAccess={true}
                cacheMode="LOAD_NO_CACHE"
                cacheEnabled={false}
                onLoad={handleWebViewLoad}
                style={{ flex: 1 }}
              />
             )} 
            <Button title='Pay' onPress={openBrowser}></Button>
          </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  locationContainer: {
    marginTop: 20,
  },
});

export default LocationComponent;
