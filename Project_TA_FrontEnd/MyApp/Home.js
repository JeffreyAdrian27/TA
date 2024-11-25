import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Keyboard, Button } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

const Home = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [user, setUser] = useState('');
  const [barangKosong, setBarangkosong] = useState('');
  const [selectedJenis, setSelectedjenis] = useState(false);
  const [searchResult, setSearchresult] = useState(false);
  const [currentButton, setCurrentButton] = useState('Semua');
  const [currentDistance, setCurrentDistance] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const itemsPerPage = 4;
  const ip = process.env.EXPO_PUBLIC_API_URL;
  
  const categories = [
    { id: 1, name: 'Botol Bekas', image: require('./assets/category_images/botol.png') },
    { id: 2, name: 'Kertas Bekas', image: require('./assets/category_images/kertas.png') },
  ];
   

  useEffect(() => {
    cekRole();
    if(!selectedJenis && !searchResult){
      if(isFocused){
        fetchData();
      }
    }
    else if(selectedJenis){
      axios.get(`${ip}/api/tampilCategory/${selectedCategory}`)
      .then(response => {
        setData(response.data.arr);
        setBarangkosong('')
      })
      .catch(error => {
        setBarangkosong(error.response.data.message)
      });
    }

  }, [selectedCategory, selectedJenis, navigation, isFocused, searchResult]);

  async function cekRole() {
    try {
      const res = await AsyncStorage.getItem('token');
      const expiresAt = await AsyncStorage.getItem('tokenExpiresAt');
      if (res && expiresAt) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const tokenExpired = currentTimestamp > parseInt(expiresAt, 10)
        if (!tokenExpired) {
          const decodedToken = jwtDecode(res);
          setUser(decodedToken);
        }
      }else{
        setUser('');
      }
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  }

  async function fetchData() {
      axios.get(`${ip}/api/tampil`)
      .then(response => {
        setData(response.data.arr);
        setBarangkosong('');
      })
      .catch(error => {
        setBarangkosong(error.response.data.message)
      });
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

  const renderCategoryItem = ({ item }) => {
    const isSelected = selectedCategory && selectedCategory.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.categoryItem, isSelected && styles.selectedCategory]}
        onPress={() => handleCategorySelect(item)}
      >
        <Image source={item.image} style={styles.categoryImage} />
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const handleCategorySelect = (category) => {
    setSelectedjenis(true)
    setSelectedCategory(category.name);
    handleClearSearch();
    setCurrentPage(1);
  };

  const explore = () => {
    navigation.navigate('Home');
    setCurrentPage(1);
  }

  const me = async () => {
    try {
      const res = await AsyncStorage.getItem('token');
      const expiresAt = await AsyncStorage.getItem('tokenExpiresAt');
      if (res && expiresAt) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const tokenExpired = currentTimestamp > parseInt(expiresAt, 10);
        if (!tokenExpired) {
          navigation.navigate('Me');
        } else {
          navigation.navigate('Login');
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('tokenExpiresAt');
        }
      } else {
        navigation.navigate('Login');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('tokenExpiresAt');
      }
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
    }
  }

  const product = async () => {
    try {
      const res = await AsyncStorage.getItem('token');
      const expiresAt = await AsyncStorage.getItem('tokenExpiresAt');
  
      if (res && expiresAt) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const tokenExpired = currentTimestamp > parseInt(expiresAt, 10);
  
        if (!tokenExpired) {
          navigation.navigate('Product');
        } else {
          navigation.navigate('Login');
        }
      } else {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
    }
  }

  function formatRupiah(angka) {
    const strAngka = angka.toString();
    const splitAngka = strAngka.split('.');
    const angkaDepan = splitAngka[0];
    const angkaBelakang = splitAngka.length > 1 ? `.${splitAngka[1]}` : '';
    const ribuan = angkaDepan.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return `Rp ${ribuan}${angkaBelakang}`;
  }

  const handleClearSearch = () => {
    setSearchText('');
    setSearchresult(false);
  };

  const handleSearch = () => {
    axios
    .get(`${ip}/api/searchBarang/${searchText}`)
    .then(response => {
      setData(response.data.arr);
      setBarangkosong('');
    })
    .catch(error => {
      if (error.response) {
        Alert.alert(error.response.data.message);
        setBarangkosong(error.response.data.message);
      } else {
        console.error('Error fetching data:', error);
      }
    });
    setSearchresult(true);
    setSelectedjenis(false);
    Keyboard.dismiss();
    setCurrentPage(1);
  };

  const renderProductItem = ({ item }) => {
    const handleProductPress = () => {
      navigation.navigate('ProductDetail', { productId: item.id });
    };
    return (
      <View style={styles.productItem}>
        <TouchableOpacity onPress={handleProductPress}>
        <Card style={styles.productCard}>
          <Image source={{ uri: item.gambar }} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productTitle}>{item.nama}</Text>
            <Text style={styles.productDescription}>{formatRupiah(item.harga)}</Text>
            <Text style={styles.productDescription}>{item.penjual}</Text>
          </View>
        </Card>
      </TouchableOpacity>
      </View>
    );
  };

  const changeButton = (button) => {
    setCurrentButton(button);
    setSearchresult(false);
    setSelectedjenis(false);
    setSearchText('');
    setCurrentPage(1);

    if (!selectedJenis && !searchResult) {
      fetchData();
    }else if(selectedJenis){
      axios.get(`${ip}/api/tampilCategory/${selectedCategory}`)
        .then(response => {
          setData(response.data.arr);
          setBarangkosong('')
        })
        .catch(error => {
            setBarangkosong(error.response.data.message)
        });
    }
  };

  const changeDistance = (distance) => {
    setCurrentDistance(distance);
  };

  const renderButton = (buttonText) => {
    const isSelected = currentButton === buttonText;
    return (
      <TouchableOpacity
        key={buttonText}
        onPress={() => changeButton(buttonText)}
        style={{ borderBottomWidth: isSelected ? 2 : 0, borderBottomColor: isSelected ? 'white' : 'transparent' }}
      >
        <Text style={{ color: 'white', padding: 10 }}>{buttonText}</Text>
      </TouchableOpacity>
    );
  };

  const renderDistanceOption = (distanceText) => {
    const isSelected = currentDistance === distanceText;
    return (
      <TouchableOpacity
        key={distanceText}
        onPress={() => changeDistance(distanceText)}
        style={{ backgroundColor: isSelected ? '#9dcb3c' : 'transparent', padding: 5, borderRadius: 50, borderColor: "black", borderWidth: isSelected ? 2 : 2, marginLeft: 5}}
      >
        <Text style={{ color: isSelected ? 'white' : 'black'}}>{distanceText}</Text>
      </TouchableOpacity>
    );
  };

  const handleLikepage  = async () => {
    try {
      const res = await AsyncStorage.getItem('token');
      const expiresAt = await AsyncStorage.getItem('tokenExpiresAt');
      if (res && expiresAt) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const tokenExpired = currentTimestamp > parseInt(expiresAt, 10);
  
        if (!tokenExpired) {
          navigation.navigate('Liked');
        } else {
          navigation.navigate('Login');
        }
      } else {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari Barang..."
          value={searchText}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          onChangeText={(text) => setSearchText(text)}
        />
        {searchText ? (
          <TouchableOpacity onPress={handleClearSearch}>
            <Icon name="close-outline" size={20} color="white" />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="search" style={[styles.icon, { marginLeft: 5 }]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton} onPress={handleLikepage}>
          <Icon name="heart-outline" style={[styles.icon, { marginLeft: 10 }]} />
        </TouchableOpacity>
      </View>
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#9dcb3c' }}>
        {renderButton('Semua')}
        {renderButton('Terdekat')}
      </View>
      {searchResult ? (
        <View style={styles.productsContainer}>
           {barangKosong ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>{barangKosong}</Text>
              </View>
            ) : (
            <>
              <FlatList
                data={getCurrentPageData()}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
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
      ) : (
        <View style={styles.productsContainer}>
          {currentButton === 'Semua' && (
            <>
            {barangKosong ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>{barangKosong}</Text>
              </View>
            ) : (
              <>
              <FlatList
                data={getCurrentPageData()}
                keyExtractor={(item) => item.id}
                renderItem={renderProductItem}
                numColumns={2}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
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
            </>
          )}
          {currentButton === 'Terdekat' && (
            <View style={{ flex: 1}}>
              <View style={{ flexDirection: 'row', backgroundColor: 'white', padding: 10}}>
                <Icon name='location-outline' style={[styles.icon, { color: 'black' }]} />
                {renderDistanceOption('1 km')}
                {renderDistanceOption('5 km')}
              </View>
              <View style={styles.productsContainer}>
                {/* Tambahkan elemen-elemen produk atau tampilkan pesan 'barangKosong' di sini */}
                <>
                <FlatList
                  data={getCurrentPageData()}
                  keyExtractor={(item) => item.id}
                  renderItem={renderProductItem}
                  numColumns={2}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
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
              </View>
            </View>
          )}
        </View>
      )}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={explore}>
          <Icon name='search' style={styles.icon} />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>
        {user.role === 'Penjual' && (
          <> 
          <TouchableOpacity style={styles.navItem} onPress={product}>
            <Image source={require('./assets/icon-products.png')} style={{width: 25, height: 25}}/>
            <Text style={styles.navText}>Products</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Icon name='add-circle-outline' style={styles.icon} onPress={()=>navigation.navigate('InputBarang')}/>
            <Text style={styles.navText}>Sell</Text>
          </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.navItem} onPress={()=>navigation.navigate('Inbox')}>
          <Icon name='chatbubble-outline' style={styles.icon} />
          <Text style={styles.navText}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={me}>
          <Icon name='person-circle-outline' style={styles.icon} />
          <Text style={styles.navText}>Me</Text>
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
  categoriesContainer: {
    margin: 10,
  },
  categoryItem: {
    marginRight: 10,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: 'lightblue',
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 100,
    backgroundColor: 'lightgray',
  },
  categoryName: {
    marginTop: 5,
  },
  selectedCategoryContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  selectedCategoryImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  selectedCategoryName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
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
    paddingHorizontal: 10, 
    paddingVertical: 8, 
  },
  productCard: {
    width: 180,
    height: 270,
  },
  productImage: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%', 
    height: 170, 
  },
  productDetails: {
    height: 80,
    padding: 10,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 14,
    color: '#555',
  },
  searchContainer: {
    backgroundColor: '#9dcb3c',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 0,
    padding: 5,
  },
  searchInput: {
    flex: 1,
    height: 45,
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
});

export default Home;
