import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker'; 
import axios from 'axios';
import jwtDecode from 'jwt-decode';
const ip = process.env.EXPO_PUBLIC_API_URL;
const TambahRekeningBank = ({ navigation }) => {

    const [noRek, setNorek] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [data, setData] = useState([]);
    const [user, setUser] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
              const res = await AsyncStorage.getItem('token');
              if (res !== null) {
                const decodedToken = jwtDecode(res);
                setUser(decodedToken);
                
                console.log(res);
                
              } else {
                navigation.navigate('Login');
              }
            } catch (error) {
              console.error('Error fetching token:', error);
            }
        }

        async function fetchBank() {
          try {
            const responseBank = await axios.get(`${ip}/api/bank`);
            setData(responseBank.data.arr);
          } catch (error) {
            console.error('Error fetching data bank:', error);
          }
        }
        Promise.all([fetchData(), fetchBank()]);
    }, [navigation]);
    
    async function handleTambah() {
        axios
        .post(`${ip}/api/tambahRekening/${user.username}`, {
            bank: selectedBank,
            norek: noRek,
        })
        .then((response) => {
            Alert.alert(response.data.message);
            navigation.navigate('RekeningBank');
        })
        .catch((error) => {

            if (error.response) {
            Alert.alert(error.response.data.message);
            } else {
            console.error('Register Gagal:', error.message);
            }
        });
    }
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.groupBox}>
                    <TextInput
                        style={styles.input}
                        placeholder="No Rekening"
                        keyboardType="numeric"
                        value={noRek}
                        onChangeText={(text) => setNorek(text)}
                        returnKeyType='done'
                        />
                </View>
                <Picker
                    selectedValue={selectedBank}
                    onValueChange={
                        (itemValue) => {
                            setSelectedBank(itemValue);
                        }
                    }
                    style={{ width: '100%', height: 50 }}
                    enabled={true}
                    mode='dropdown'
                    transitionStyle
                    >
                    {data.map((bank, index) => (
                        <Picker.Item key={index} label={bank.nama} value={bank.nama} />
                        ))}
                </Picker>
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Tambah Rekening" onPress={handleTambah} />
            </View>
        </View>
    );

}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      position: 'relative',
      backgroundColor: 'white',
  },
  groupBox: {
      backgroundColor: '#9dcb3c',
      padding: 16,
      width: '100%',
      borderRadius: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 4,
      padding: 8,
      fontSize: 16,
      backgroundColor: '#fff',
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      marginBottom: 20, 
      justifyContent: 'center',
      alignItems: 'center',
    },
});
export default TambahRekeningBank;