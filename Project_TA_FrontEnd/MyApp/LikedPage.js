import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Keyboard, Button } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

const LikedPage = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState('');
    const [barangKosong, setBarangkosong] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState([]);
    const itemsPerPage = 6;
    const ip = process.env.EXPO_PUBLIC_API_URL;

    useEffect(() => {
    const initializeUser = async () => {
        try {
            const res = await AsyncStorage.getItem('token');
            const expiresAt = await AsyncStorage.getItem('tokenExpiresAt');
            if (res && expiresAt) {
                const currentTimestamp = Math.floor(Date.now() / 1000);
                const tokenExpired = currentTimestamp > parseInt(expiresAt, 10);
                if (!tokenExpired) {
                    const decodedToken = jwtDecode(res);
                    setUser(decodedToken.username);
                }
            } else {
                setUser('');
            }
        } catch (error) {
            console.error('Error fetching token:', error);
        }
    };
    initializeUser();
    }, []);
      
    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);
    
    async function fetchData() {
        axios.get(`${ip}/api/tampilBaranglike/${user}`)
        .then(response => {
            setData(response.data.arr);
            setBarangkosong('');
        })
        .catch(error => {
            setBarangkosong(error.response.data.message)
        });
    }

    function formatRupiah(angka) {
        const strAngka = angka.toString();
        const splitAngka = strAngka.split('.');
        const angkaDepan = splitAngka[0];
        const angkaBelakang = splitAngka.length > 1 ? `.${splitAngka[1]}` : '';
        const ribuan = angkaDepan.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        return `Rp ${ribuan}${angkaBelakang}`;
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

    const shouldAlignLeft = data.length === 1;

    return (
        <View style={[styles.productsContainer, shouldAlignLeft && styles.leftAlignedContainer]}>
            {data.length > 0 ? (
            <>
            <FlatList
                data={getCurrentPageData()}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderProductItem}
                numColumns={2}
            />
            {data.length >= itemsPerPage && (
                <View style={styles.paginationContainer}>
                <TouchableOpacity
                    onPress={goToPreviousPage}
                    disabled={currentPage === 1}
                    style={[styles.paginationButton, { marginRight: 5, opacity: currentPage === 1 ? 0.5 : 1 }]}
                >
                    <Text style={styles.buttonText}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={goToNextPage}
                    disabled={(currentPage * itemsPerPage) >= data.length}
                    style={[styles.paginationButton, { marginLeft: 5, opacity: currentPage * itemsPerPage >= data.length ? 0.5 : 1 }]}
                >
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
                </View>
            )}
            </>
        ) : (
            <View style={styles.noItemsContainer}>
                <Text style={styles.noItemsText}>{barangKosong}</Text>
            </View>
        )}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 0,
        backgroundColor: 'white',
    },
    productsContainer: {
        flex: 1,
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftAlignedContainer: {
        alignItems: 'flex-start',
    },
    productItem: {
        paddingHorizontal: 8, 
        paddingVertical: 8, 
    },
    productCard: {
        width: 190,
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
    noItemsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noItemsText: {
        fontSize: 16,
        color: '#555',
    },
});

export default LikedPage;