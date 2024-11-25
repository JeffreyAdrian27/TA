import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Modal, StyleSheet, Animated, ScrollView, TextInput, Alert, Keyboard, Button } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Products = ({navigation}) => {
  const [data, setData] = useState([]);
  const [token, setToken] = useState('');
  const [user, setUser] = useState('');
  const [id, setId] = useState('');
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [penjual, setPenjual] = useState('');
  const [barangKosong, setBarangkosong] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isMenuOpen, setMenuOpen] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const [isModalVisibleHarga, setModalVisibleHarga] = useState(false);
  const [isModalVisibleJumlah, setModalVisibleJumlah] = useState(false);
  const ip = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchData();
  }, [penjual,harga,jumlah]); 

  async function fetchData() {
    try {
      const res = await AsyncStorage.getItem('token');
      if (res !== null) {
        setToken(res);
        const decodedToken = jwtDecode(res);
        setUser(decodedToken);
        setPenjual(decodedToken.username);
        axios.get(`${ip}/api/products/${penjual}`)
        .then(response => {
            setData(response.data.arr);
            setBarangkosong('');
        })
        .catch(error => {
            setBarangkosong(error.response.data.message)
        });
      } else {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  }

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = [...data.slice(startIndex, endIndex)];
    return currentPageData;
  };
  const goToNextPage = () => {
      setCurrentPage(currentPage + 1);
  };
      
  const goToPreviousPage = () => {
      setCurrentPage(currentPage - 1);
  };
  const onPressChangePrice = (id,nama,harga) => {
    setModalVisibleHarga(true);
    setId(id);
    setNama(nama);
    setHarga(harga.toString());
  };
  const closeHarga = () => {
    setModalVisibleHarga(false);
  };
  const handleConfirmHarga = () => {
    axios.put(`${ip}/api/products/harga/${id}`, {
      harga: harga,
    })
    .then(response => {
      Alert.alert('Berhasil', response.data.message);
      closeHarga();
      fetchData();
    })
    .catch(error => {
      console.error('Gagal memperbarui data:', error);
    });
  };
  
  const onPressChangeStock = (id,nama,stok) => {
    setModalVisibleJumlah(true);
    setId(id);
    setNama(nama);
    setJumlah(stok.toString());
  };
  const closeStok = () => {
    setModalVisibleJumlah(false);
  };
  const handleConfirmStok = () => {
    axios.put(`${ip}/api/products/stok/${id}`, {
      jumlah: jumlah,
    })
    .then(response => {
      Alert.alert('Berhasil', response.data.message);
      closeStok();
      fetchData();
    })
    .catch(error => {
      console.error('Gagal memperbarui data:', error);
    });
  };

  const onPressMoreOptions = (id, nama) => {
    setId(id);
    setNama(nama);
    Animated.timing(translateY, {
      toValue: 1, 
      duration: 400,
      useNativeDriver: false, 
    }).start(() => {
      setMenuOpen(true);
    });
  };
  
  const onPressCloseOptions = () => {
    setId('');
    Animated.timing(translateY, {
      toValue: 0, 
      duration: 300,
      useNativeDriver: false, 
    }).start(() => {
      setMenuOpen(false);
    });
  };

  const deleteItem = () => {
    axios.delete(`${ip}/api/products/${id}`)
    .then(response => {
      Alert.alert('Berhasil', response.data.message);
      onPressCloseOptions();
      fetchData();
    })
    .catch(error => {
      console.error('Error deleting item:', error);
    });
  }
      
  const renderProductItem = ({ item }) => {
      return (
          <View style={styles.productItem}>
              <Card style={styles.productCard}>
                  <View style={{flexDirection: 'row'}}>
                      <Image source={{ uri: item.gambar }} style={styles.productImage} />
                      <View style={styles.productDetails}>
                          <Text style={styles.productTitle}>{item.nama}</Text>
                          <Text style={styles.productDescription}>{formatRupiah(item.harga)}</Text>
                          <Text style={styles.productDescription}>{item.jumlah === 0 ? 'Stok : Habis' : `Stok : ${item.jumlah}`}</Text>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 50 }}>
                              <TouchableOpacity onPress={() => onPressChangePrice(item.id, item.nama, item.harga)}>
                                  <Text style={{ borderWidth: 1, padding: 5,borderRadius: 5 }}>Ubah Harga</Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => onPressChangeStock(item.id, item.nama, item.jumlah)}>
                                  <Text style={{ borderWidth: 1, padding: 5,borderRadius: 5 }}>Ubah Stok</Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => onPressMoreOptions(item.id, item.nama)}>
                                  <Icon name='ellipsis-vertical-outline' style={{fontSize: 25, color: 'black',}} />
                              </TouchableOpacity>
                          </View>
                      </View>
                  </View>
              </Card>
          </View>
      );
  };

  function formatRupiah(angka) {
      const strAngka = angka.toString();
      const splitAngka = strAngka.split('.');
      const angkaDepan = splitAngka[0];
      const angkaBelakang = splitAngka.length > 1 ? `.${splitAngka[1]}` : '';
      const ribuan = angkaDepan.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
      return `Rp ${ribuan}${angkaBelakang}`;
  }

  return (
  <View style={styles.container}>
    {token ? (
      <>
        <View style={{ backgroundColor: '#9dcb3c', height: 50, flexDirection: 'row', marginBottom: 10, alignItems: 'center' }}>
          <Text style={styles.title}>{`Hi, ${user.username}`}</Text>
        </View>
        <View style={styles.productsContainer}>
          {barangKosong ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>{barangKosong}</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={getCurrentPageData()}
                keyExtractor={(item) => item.id.toString()} 
                renderItem={renderProductItem}
                numColumns={1}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 5 }}>
                <TouchableOpacity
                  onPress={goToPreviousPage}
                  disabled={currentPage === 1}
                  style={{ backgroundColor: '#9dcb3c', padding: 10, borderRadius: 5, opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  <Text style={{ color: 'white' }}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={goToNextPage}
                  disabled={currentPage * itemsPerPage >= data.length}
                  style={{ backgroundColor: '#9dcb3c', padding: 10, borderRadius: 5, marginLeft: 5, opacity: currentPage * itemsPerPage >= data.length ? 0.5 : 1 }}
                >
                  <Text style={{ color: 'white' }}>Next</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </>
    ) : (
      <Text></Text>
    )}
    {isMenuOpen && (
      <Animated.View 
      style={[styles.menuContainer,
        {
          transform: [
            {
              translateY: translateY.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0], 
              }),
            },
          ],
        }
      ]}>
        <TouchableOpacity onPress={onPressCloseOptions} style={{flexDirection: 'flex-end', alignItems:'flex-end'}}>
            <Icon name="chevron-down-circle-outline" size={30} />
        </TouchableOpacity>
        <Text style={{textAlign: 'left',fontSize: 16}}> Apakah anda yakin ingin menghapus {nama}?</Text>
        <TouchableOpacity onPress={deleteItem} style={styles.iconContainer}>
            <Icon name="trash" size={24} color="red" />
            <Text style={styles.iconText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    )}
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisibleHarga}
      onRequestClose={closeHarga}
    >
        <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text>Apakah Anda yakin ingin mengubah harga {nama}?</Text>
          <TextInput 
            style={{borderWidth: 1,  width: 350, height: 40, marginTop: 10, padding: 5}} 
            placeholder='Harga' 
            value={harga} 
            onChangeText={(text) => setHarga(text.replace(/[^0-9]/g, ''))}
            keyboardType='numeric' 
            returnKeyType='done'
          />
          <View style={{flexDirection: 'row', marginTop: 5}}>
            <TouchableOpacity style={{backgroundColor: '#32CD32', borderRadius: 5}}>
              <Button title="Ubah" onPress={handleConfirmHarga} color="white"/>
            </TouchableOpacity>
            <TouchableOpacity  style={{backgroundColor: 'red', borderRadius: 5, marginLeft: 10}}>
              <Button title="Tidak" onPress={closeHarga} color="white"/>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisibleJumlah}
      onRequestClose={closeStok}
    >
        <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text>Apakah Anda yakin ingin mengubah stok {nama}?</Text>
          <TextInput 
            style={{borderWidth: 1,  width: 350, height: 40, marginTop: 10, padding: 5}} 
            placeholder='Stok' 
            value={jumlah} 
            onChangeText={(text) => setJumlah(text.replace(/[^0-9]/g, ''))}
            keyboardType='numeric' 
            returnKeyType='done'
          />
          <View style={{flexDirection: 'row', marginTop: 5}}>
            <TouchableOpacity style={{backgroundColor: '#32CD32', borderRadius: 5}}>
              <Button title="Ubah" onPress={handleConfirmStok} color="white"/>
            </TouchableOpacity>
            <TouchableOpacity  style={{backgroundColor: 'red', borderRadius: 5, marginLeft: 10}}>
              <Button title="Tidak" onPress={closeStok} color="white"/>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.navItem}>
        <Icon name='home-outline' style={styles.icon} onPress={()=>navigation.navigate('Home')}/>
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={()=>navigation.navigate('Product')}>
        <Image source={require('../assets/icon-products.png')} style={{width: 25, height: 25}}/>
        <Text style={styles.navText}>Products</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={()=>navigation.navigate('Inbox')}>
        <Icon name='chatbubble-outline' style={styles.icon} />
        <Text style={styles.navText}>Inbox</Text>
      </TouchableOpacity>
    </View>
  </View>
  );
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      margin: 0,
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
    navbar: {
      alignItems: 'center',
      flexDirection: 'row',
      backgroundColor: '#9dcb3c',
      padding: 10,
    },
    navItem: {
      flex: 1,
      alignItems: 'center',
      paddingBottom: 10,
    },
    navText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 12,
    },
    icon: {
      fontSize: 25,
      color: '#fff',
    },
    productsContainer: {
      flex: 1,
      width: "100%",
      justifyContent: 'center',
      alignItems: 'center',
    },
    productItem: {
      padding: 5,     
    },
    productCard: {
      width: 400,
      flex: 1,
      flexDirection: 'column',
      height: "auto", 
    },
    productImage: {
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      width: '40%', 
      height: 170, 
    },
    productDetails: {
      flex: 1,
      padding: 10,
    },
    productTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    productDescription: {
      fontSize: 14,
      color: '#555',
    },
    menuContainer: {
      position: 'absolute',
      bottom: 60, 
      right: 0,
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 5,
      elevation: 5, 
      borderWidth: 1,
      width: '100%',
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
      alignItems: 'center',
    },
});

export default Products;