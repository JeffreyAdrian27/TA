import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, TouchableOpacity, Alert, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import jwtDecode from 'jwt-decode';
import { Picker } from '@react-native-picker/picker'; 
import { midtransClientKey, midtransBaseUrl } from './midtrans'; 
import axios from 'axios';
import { WebView } from 'react-native-webview';
import { encode as base64Encode } from 'base-64';

const Me = ({ navigation }) => {
  const [topUpAmount, setTopUpAmount] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState('');
  const [alamat, setAlamat] = useState(''); 
  const [phone, setPhone] = useState(''); 
  const [selectedKota, setSelectedKota] = useState('');
  const [data, setData] = useState([]);
  const [tampilanEditVisible, setTampilanEditVisible] = useState(false);
  const [isAlamatChanged, setIsAlamatChanged] = useState(false); 
  const [isPhoneChanged, setIsPhoneChanged] = useState(false); 
  const [isKotaChanged, setIsKotaChanged] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const ip = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    Promise.all([fetchData(), fetchKota()]);
  }, [navigation]);
  
  async function fetchKota() {
    try {
      const responseKota = await axios.get(`${ip}/api/kota`);
      setData(responseKota.data.arr);
    } catch (error) {
      console.error('Error fetching data kota:', error);
    }
  }
    
  async function fetchData() {
    try {
      const res = await AsyncStorage.getItem('token');
      setToken(res);
      const decodedToken = jwtDecode(res);
      setUser(decodedToken);
      console.log(decodedToken);
      if (!decodedToken.alamat) {
        setAlamat('');  
      }
      if (!decodedToken.no_telp) {
        setPhone('');
      }
      setSelectedKota(decodedToken.kota || '');
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  }

  const editUser = () => {
    axios
    .post(`${ip}/api/editUser/${user.username}`)
    .then((response) => {
      AsyncStorage.setItem('token', response.data.token);
      const decodedToken = jwtDecode(response.data.token)
      AsyncStorage.setItem('tokenExpiresAt', decodedToken.exp.toString());
    })
    .catch((error) => {
      console.error('Edit Gagal:', error.message);
    });
  }

  const handleSave = () => {
    axios
      .put(`${ip}/api/edit/${user.username}`, {
        alamat: isAlamatChanged ? alamat : user.alamat || '',
        kota: isKotaChanged ? selectedKota : user.kota || '',
        no_telp: isPhoneChanged ? phone : user.no_telp || '',
      })
      .then((response) => {
        Alert.alert(response.data.message);
        axios
          .get(`${ip}/api/user/${user.username}`)
          .then(async (response) => {
            editUser();
            setUser(prevUser => ({ ...prevUser, no_telp: response.data.no_telp || prevUser.no_telp || '' }));   
          })
          .catch((error) => {
            if (error.response) {
              Alert.alert(error.response.data.message);
            } else {
              console.error('Ubah Gagal:', error.message);
            }
          });
      });
    };
    
    async function handleLogout() {
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('tokenExpiresAt');
        navigation.navigate('Home');
      } catch (error) {
        console.error('Error removing token:', error);
      }
    }
    
    const toggleTampilanEdit = () => {
      setTampilanEditVisible(!tampilanEditVisible);
    };
    
    const toggleTampilanRek = () => {
      navigation.navigate('RekeningBank');
    };

    const toggleTopUpModal = () => {
      setIsModalVisible(true);
    };

    const handleTopUpSubmit = async () => {
      const usernameAndPassword = `${midtransClientKey}:`;
      const authString = `Basic ${base64Encode(usernameAndPassword)}`;
    
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': authString
      };
    
      try {
        const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            transaction_details: {
              order_id: 'COBA123',
              gross_amount: topUpAmount 
            },
            credit_card: {
              secure: true
            }
          })
        });
    
        const data = await response.json();
        console.log('Response from Midtrans:', data);
    
        if (data.token) {
          const snapToken = data.token;
          <WebView
          source={{ uri: 'https://www.google.com' }} 
          style={{ flex: 1 }}
        />
        }
    
        setIsModalVisible(false);
      } catch (error) {
        console.error('Error while processing payment:', error);
        // Handle error
        // Misalnya, tampilkan pesan kesalahan kepada pengguna
        Alert.alert('Error', 'Failed to process payment. Please try again later.');
      }
    };

  return (
    <View style={styles.container}>
      {token ? (
        <>
          <Text style={styles.title}>{`Hi, ${user.username}`}</Text>
          <View style={{flexDirection:"row", alignItems:'center', paddingLeft: 10}}>
            <Icon name="person-circle" style={styles.iconProfile} />
            <View style={{flexDirection:"column", paddingTop: 0}}>
              <Text style={styles.labelProfile}>
                {user.no_telp ? user.no_telp : 'Belum ada nomor hp'}
              </Text>
              <Text style={styles.labelProfile}>{`${user.email}`}</Text>
              <Text style={styles.labelProfile}>
                { user.verif === 1 && (
                  <View style={styles.verificationContainer}>
                    <Text style={styles.verificationText}>Verified</Text>
                    <Icon name="mail-sharp" style={styles.envelopeIcon} />
                  </View>
                )}
              </Text>
            </View>
            <TouchableOpacity onPress={toggleTampilanEdit}>
              <Icon name="pencil-sharp" style={styles.iconButton} />
            </TouchableOpacity>
          </View>
          {tampilanEditVisible && (
           <View style={styles.formContainer}>
            <View style={{ paddingLeft: 10 }}>
              <Text style={styles.label}>Alamat</Text>
              <View style={styles.inputContainer}>
                <Icon name="location-outline" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Alamat"
                  value={isAlamatChanged ? alamat : user.alamat || ''}
                  onChangeText={(text) => {
                    setAlamat(text);
                    setIsAlamatChanged(true);
                  }} 
                  onFocus={() => setIsAlamatChanged(false)}
                />
                {isAlamatChanged && (
                  <TouchableOpacity
                    onPress={() => {
                      setAlamat('');
                      setIsAlamatChanged(false);
                    }}
                    style={{ position: 'absolute', right: 10 }}
                  >
                    <Icon name="close-outline" style={{ fontSize: 20, color: 'gray' }} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.viewRole}>
              <View style={{flexDirection:"column"}}>
                <Text style={styles.label}>Kota</Text>
                <Icon name='business-outline' style={styles.icon} />
              </View>
                  <Picker
                    selectedValue={isKotaChanged ? selectedKota : user.kota || ''}
                    onValueChange={
                      (itemValue) => {
                        setSelectedKota(itemValue);
                        setIsKotaChanged(true);
                      }
                    }
                    onFocus={() => setIsKotaChanged(false)}
                    style={{ width: '80%', height: 50 }}
                    enabled={true}
                    mode='dropdown'
                    transitionStyle
                  >
                    {data.map((kota, index) => (
                      <Picker.Item key={index} label={kota.nama} value={kota.nama} />
                    ))}
                  </Picker>
                  {isKotaChanged && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedKota('');
                        setIsKotaChanged(false);
                      }}
                      style={{ position: 'absolute', right: 10 }}
                    >
                      <Icon name="close-outline" style={{ fontSize: 20, color: 'gray' }} />
                    </TouchableOpacity>
                  )}
            </View>
            <View style={{ paddingLeft: 10 }}>
              <Text style={styles.label}>No Hp</Text>
              <View style={styles.inputContainer}>
                <Icon name="phone-portrait-outline" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="+62"
                  value={isPhoneChanged ? String(phone) : user.no_telp || ''}
                  onChangeText={(text) => { 
                    let formattedNumber = text;
                      if (text.startsWith('+62')) {
                        formattedNumber = `0${text.substring(3)}`;
                      }
                      setPhone(formattedNumber)
                      setIsPhoneChanged(true);
                    }} 
                  onFocus={() => setIsPhoneChanged(false)}
                  returnKeyType="done"
                  keyboardType="phone-pad"
                />
                {isPhoneChanged && (
                  <TouchableOpacity
                    onPress={() => {
                      setPhone('');
                      setIsPhoneChanged(false);
                    }}
                    style={{ position: 'absolute', right: 10 }}
                  >
                    <Icon name="close-outline" style={{ fontSize: 20, color: 'gray' }} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center'}}>
              <Button title="Save"  onPress={handleSave} />
            </View>
          </View>
          )}
          {!tampilanEditVisible && (
          <>
          <View style={{flexDirection:'column', justifyContent: 'flex-start', alignItems: 'flex-start', paddingLeft: 10}}>
            <Text style={{fontSize: 20}}>Saldo</Text>
            <TouchableOpacity onPress={toggleTopUpModal}>
              <View style={{flexDirection:'row',justifyContent: 'center', alignItems: 'center'}}>
                <Icon name="wallet-outline" style={styles.icon} />
                <Text style={styles.labelProfile}>{`${user.saldo}`}</Text>
              </View>
              <Text style={styles.labelProfile}>Isi Saldo</Text>
            </TouchableOpacity>
            <Modal
              visible={isModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setIsModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                    <Icon name="close-outline" size={30} color="black" />
                  </TouchableOpacity>
                  <Text style={styles.titleModal}>Top Up Saldo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan jumlah saldo"
                    keyboardType="numeric"
                    value={topUpAmount}
                    onChangeText={(text) => setTopUpAmount(text)}
                  />
                  <Button title="Top Up" onPress={handleTopUpSubmit} />
                </View>
              </View>
            </Modal>
          </View>
          <View style={{flexDirection:'row',justifyContent: 'flex-start', alignItems: 'flex-start', paddingLeft: 10, paddingTop: 10}}>
              <Icon name="cash-outline" style={styles.iconButton} />
              <View style={{flexDirection:'column', paddingLeft: 10}}>
                <TouchableOpacity onPress={toggleTampilanRek}>
                    <Text style={{fontSize: 20,fontWeight:'bold'}}>Rekening Bank</Text>
                    <Text style={{fontSize: 15}}>Tarik Saldo Recycle ke rekening tujuan</Text>
                  </TouchableOpacity>
              </View>
          </View>
          </>
          )}
          <View style={{ justifyContent: 'center', alignItems: 'center'}}>
            <Button title="Logout"  onPress={handleLogout} />
          </View>
        </>
      ) : (
        <Text></Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    backgroundColor: '#9dcb3c',
    height: 50,
    paddingTop: 10,
    paddingLeft: 10,
  },
  titleModal: {
    fontSize: 24,
    marginBottom: 16,
    height: 50,
    fontWeight: 'bold',
    paddingTop: 10,
    paddingLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 0.9,
    marginLeft: 8,
    borderBottomWidth: 1,
    padding: 8,
  },
  label: {
    marginRight: 8,
  },
  labelProfile: {
    marginRight: 8,
    width: 220,
    fontSize: 15,
  },
  icon: {
    fontSize: 25,
    marginRight: 5,
    color: '#666',
  },
  viewRole: {
    flexDirection: 'row',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    flex: 0.45,
    backgroundColor: 'white',
    paddingLeft: 10,
  },
  formContainer: {
    paddingLeft: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    flex: 1,
  },
  iconButton: {
    fontSize: 25,
    color: 'black',
    marginBottom: 10,
  },
  iconProfile: {
    fontSize: 60,
    color: '#3498db',
    marginBottom: 10,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  verificationText: {
    marginRight: 5,
    color: 'blue',
  },
  envelopeIcon: {
    fontSize: 20,
    color: 'blue',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default Me;
