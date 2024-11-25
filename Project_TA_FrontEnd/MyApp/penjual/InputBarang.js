import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, FlatList, TouchableOpacity, StyleSheet, ScrollView, TextInput, Animated , Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import jwtDecode from 'jwt-decode';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker'; 
import axios from 'axios';

const InputBarang = ({ navigation }) => {
    const [token, setToken] = useState('');
    const [user, setUser] = useState('');
    const [nama, setNama] = useState('');
    const [penjual, setPenjual] = useState('');
    const [harga, setHarga] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [jumlah, setJumlah] = useState('');
    const [photo, setPhoto] = useState(null);
    const [data, setData] = useState([]);
    const [jenis, setJenis] = useState('');
    const [showButton, setShowButton] = useState(true);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const fadeAnim = new Animated.Value(0);
    const ip = process.env.EXPO_PUBLIC_API_URL;

    useEffect(() => {
      async function fetchJenis() {
        axios.get(`${ip}/api/jenis`)
        .then(response => {
          setData(response.data.arr);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
      }

      if(Platform.OS != 'web'){
        const requestPermission = async () => {
          const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if(status!=='granted'){
            Alert.alert("Permission denied!");
            return;
          }
        };
        requestPermission();
      }

      async function fetchData() {
        try {
          const res = await AsyncStorage.getItem('token');
          if (res !== null) {
            setToken(res);
            const decodedToken = jwtDecode(res);
            setUser(decodedToken);
            setPenjual(decodedToken.username)
            console.log(res);
            
          } else {
            navigation.navigate('Login');
          }
        } catch (error) {
          console.error('Error fetching token:', error);
        }
      }
      Promise.all([fetchJenis(),fetchData()]);
    }, [navigation]);

    const handleTambah = async () => {
      const formData = new FormData();
      formData.append('nama', nama);
      formData.append('penjual', penjual);
      formData.append('harga', harga);
      formData.append('deskripsi', deskripsi);
      formData.append('jumlah', jumlah);
      formData.append('jenis', jenis);
      if (photo) {
        if (photo.uri) {
          formData.append('gambar', {
            name: photo.fileName,
            type: photo.type,
            uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
          });
        } else {
          console.error('Error: Photo uri is undefined');
        }
      }
      console.log(formData);
      axios
      .post(`${ip}/api/tambahItem`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        Alert.alert(response.data.message);
        navigation.navigate('Home');
      })
      .catch((error) => {
        if (error.response) {
          Alert.alert(error.response.data.message);
        } else {
          console.error('Tambah Barang Gagal:', error.message);
        }
      });
    };

    const handleChoosePhoto = async () => {
      try{
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1.
        });
        if (!result.cancelled) {
          setShowButton(false);
          setPhoto(result.assets[0]);
        }else{
          setShowButton(true);
        }
      } catch(error){
        setShowButton(true);
      }
    };

    const handleCancel = () => {
      setPhoto(null);
      setShowButton(true);
    };

    const toggleMenu = () => {
      setMenuOpen(!isMenuOpen);
      Animated.timing(
        fadeAnim,
        {
          toValue: isMenuOpen ? 0 : 1,
          duration: 500,
          useNativeDriver: true,
        }
      ).start();
    };

    const handleUpdate = () => {
      console.log('Update clicked');
    };
  
    const handleDelete = () => {
      console.log('Delete clicked');
    };

    return (
            <View style={styles.container}>
                {token ? (
                    <>
                    <View style={{backgroundColor: '#9dcb3c', height: 50 ,flexDirection: 'row', marginBottom: 10, alignItems: 'center'}}>
                      <Text style={styles.title}>{`Hi, ${user.username}`}</Text>
                    </View>
                    {photo && 
                      <View style={{ flexDirection: 'row', justifyContent: 'center', paddingBottom: 10}}>
                        <Image
                          source={{ uri: photo.uri }}
                          style={{ width: 150, height: 150 }}
                        />
                        <TouchableOpacity onPress={handleCancel}>
                          <View style={styles.cancelButton}>
                            <Icon name="close" style={styles.iconCancel} />
                          </View>
                        </TouchableOpacity>
                      </View>
                    }
                    {showButton && 
                    <View style={{alignItems:'center'}}>
                      <TouchableOpacity style={styles.buttonContainer} onPress={handleChoosePhoto}>
                        <View style={styles.button}>
                          <Icon name="add-circle-outline" style={styles.icon} />
                        </View>
                      </TouchableOpacity>
                    </View>
                    }
                    <View style={styles.view}>
                      <Icon name='basket' style={styles.icon} />
                      <TextInput style={styles.input} placeholder='Nama Barang' value={nama} onChangeText={setNama} />
                    </View>
                    <View style={styles.view}>
                      <Image source={require('../assets/price-tag.png')} style={{width: 25, height: 25}} />
                      <TextInput 
                        style={styles.input} 
                        placeholder='Harga' 
                        value={harga} 
                        onChangeText={(text) => setHarga(text.replace(/[^0-9]/g, ''))}
                        keyboardType='numeric' 
                        returnKeyType='done'
                      />
                    </View>
                    <View style={styles.view}>
                      <Image source={require('../assets/ready-stock.png')} style={{width: 25, height: 25}} />
                      <TextInput 
                        style={styles.input} 
                        placeholder='Stok' 
                        value={jumlah} 
                        onChangeText={(text) => setJumlah(text.replace(/[^0-9]/g, ''))}
                        keyboardType='numeric' 
                        returnKeyType='done'
                       />
                    </View>
                    <View style={styles.view}>
                    <Image source={require('../assets/product-description.png')} style={{width: 25, height: 25}} />
                      <TextInput style={styles.input} placeholder='Deskripsi' value={deskripsi} onChangeText={setDeskripsi} />
                    </View>
                    <View style={styles.viewRole}>
                      <Image source={require('../assets/category.png')} style={{width: 20, height: 20}} />
                      <Picker selectedValue={jenis} onValueChange={(itemValue) => setJenis(itemValue)} style={{width : '80%', height : 50,}} enabled={true} mode='dropdown'>
                        {data.map((jenis, index) => (
                          <Picker.Item key={index} label={jenis.nama} value={jenis.nama}/>
                        ))}
                      </Picker>
                    </View>
                    <Button title="Tambah" onPress={handleTambah} />
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
      backgroundColor: '#9dcb3c',
      height: 50,
      paddingTop: 10,
      color: 'white',
      paddingLeft: 10,
    },
    imagePickerButton: {
      backgroundColor: '#3498db',
      padding: 10,
      borderRadius: 5,
      margin: 10,
    },
    imagePickerButtonText: {
      color: 'white',
      textAlign: 'center',
    },
    selectedImageContainer: {
      marginTop: 20,
      alignItems: 'center',
    },
    selectedImage: {
      width: 200,
      height: 200,
      borderRadius: 5,
    },
    buttonContainer: {
      width:150,
      alignItems: 'center',
    },
    button: {
      width: 150,
      height: 150,
      backgroundColor: 'white',
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },
    icon: {
      fontSize: 30,
      color: 'black',
    },
    iconCancel: {
      fontSize: 20,
      color: 'black',
    },
    cancelButton: {
      backgroundColor: 'white',
      borderRadius: 5,
      borderWidth: 1,
    },
    input: {
      width: '80%',
      paddingVertical: 0,
      paddingLeft: 15,
      fontSize: 15,
    },
    view: {
      flexDirection: 'row',
      borderBottomColor: '#ccc',
      borderBottomWidth: 1,
      paddingBottom: 8,
      marginBottom: 15,
      alignItems: 'center',
      height: 40,
      paddingLeft: 10,
    },
    viewRole: {
      flexDirection: 'row',
      borderBottomColor: '#ccc',
      borderBottomWidth: 1,
      flex: 0.56,
      backgroundColor: 'white',
      paddingLeft: 10,
    },
    menuContainer: {
      position: 'absolute',
      top: 50, 
      right: 0,
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 5,
      elevation: 5, 
      borderWidth: 1,
      zIndex: 1
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    iconText: {
      marginLeft: 8,
      fontSize: 16,
    },
});
export default InputBarang;