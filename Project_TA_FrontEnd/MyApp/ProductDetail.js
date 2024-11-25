import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Button, StyleSheet, TouchableOpacity, Alert, ScrollView} from 'react-native';
import { Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import jwtDecode from 'jwt-decode';
import { Picker } from '@react-native-picker/picker'; 
import axios from 'axios';
const ip = process.env.EXPO_PUBLIC_API_URL;

const ProductDetail = ({ route, navigation  }) => {
    const {productId} = route.params;
    const [product, setProduct] = useState([]);
    const [offerAmount, setOfferAmount] = useState('0');
    const [subtotal, setSubtotal] = useState('0');
    const [jumlah, setJumlah] = useState('0');
    const [user, setUser] = useState('');
    const [liked, setLiked] = useState(false);


    useEffect(() => {
        fetchData();
        handleOfferChange(offerAmount);
        cekJumlah(jumlah);
    }, [productId, offerAmount, jumlah, user]);

    const fetchData = async () => {
        try {
            const res = await AsyncStorage.getItem('token');
            const response = await axios.get(`${ip}/api/product/${productId}`);
            setProduct(response.data.arr[0]);
            console.log(res);
            if (res !== null) {
                const decodedToken = jwtDecode(res);
                setUser(decodedToken.username);
                if (decodedToken.username) {
                    fetchLike();
                }
            } 
        } catch (error) {
            console.error('Error fetching product data:', error);
        }
    };

    const fetchLike = async () => {
        if (!user) {
            return; 
        }
        try {
            const response = await axios.get(`${ip}/api/cekLike/${user}/${productId}`);
            setLiked(response.data.likes);
        } catch (error) {
            setLiked(false);
        }
    };

    const formatRupiah = (angka) => {
        if (angka === undefined || angka === null) {
            return 'Rp 0';
        }
        const strAngka = angka.toString();
        const splitAngka = strAngka.split('.');
        const angkaDepan = splitAngka[0];
        const angkaBelakang = splitAngka.length > 1 ? `.${splitAngka[1]}` : '';
        const ribuan = angkaDepan.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        return `Rp ${ribuan}${angkaBelakang}`;
    };

    const handleRemoveOffer = () => {
        if(offerAmount > 0) {
            const currentOffer = parseInt(offerAmount, 10);
            const newOfferAmount = currentOffer - 1000;
            setOfferAmount(newOfferAmount.toString());
        }
    };

    const handleAddOffer = () => {
        const currentOffer = parseInt(offerAmount, 10);
        const newOfferAmount = currentOffer + 1000;
        setOfferAmount(newOfferAmount.toString());
    };

    const handleOfferChange = (angka) => {
        setOfferAmount(angka);
        setSubtotal(angka * parseInt(jumlah, 10));
    };

    const cekJumlah = () => {
        if (parseInt(jumlah, 10) > parseInt(product.jumlah, 10)) {
            Alert.alert(
                'Invalid Quantity',
                'Jumlah yang dimasukkan melebihi batas stok.',
                [{ text: 'OK' }]
            );
        }
    };

    const offer = async () => {
        navigation.navigate('Chatting', {
            sender: product.penjual
        });
        const response = await axios.post(`${ip}/api/offer/${user}`, {
            id_barang: productId, 
            harga : (subtotal === 0 ? "1000" : subtotal.toString()),
            jumlah: jumlah,
            penjual: product.penjual,
        });
       
    }

    const chat = (sender) => {
        navigation.navigate('Chatting', { sender });
    }
    
    const btnLike = async () => {
        try {
            if (!liked) {
                const response = await axios.post(`${ip}/api/like/${user}`, {
                    id_barang: productId
                });
                setLiked(true); 
                setProduct(prevProduct => ({
                    ...prevProduct,
                    likes: prevProduct.likes + 1 
                }));
            } else {
                const response = await axios.delete(`${ip}/api/dislike/${user}/${productId}`);
                setLiked(false); 
                setProduct(prevProduct => ({
                    ...prevProduct,
                    likes: prevProduct.likes - 1 
                }));
            }
        } catch (error) {
            console.error('Error handling like/dislike:', error);
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1}}>
                <Card style={styles.productCard}>
                    <Image source={{ uri: product.gambar }} style={styles.productImage} />
                </Card>
                <View style={{flexDirection: 'column', flex: 1}}>
                    <Text style={styles.productTitle}>{product.nama}</Text>
                    <View style={{flexDirection: 'row'}}>
                    <View style={styles.productDetails}>
                        <Text style={styles.productPrice}>{formatRupiah(product.harga)}</Text>
                        <View style={{flexDirection: 'column'}}>
                            <Text style={{fontWeight: 600, fontSize: 16}}>Deskripsi : </Text>
                            <Text style={styles.productDescription}>{product.deskripsi}</Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <Icon name="heart" style={styles.icon} />
                            <Text style={styles.productLikes}>{product.likes}</Text>
                        </View>
                        <View style={{flexDirection: 'column'}}>
                            <Text style={{fontWeight: 600, fontSize: 16}}>Stok : </Text>
                            <Text style={styles.productDescription}>{product.jumlah}</Text>
                        </View>
                        <Text style={styles.productDescription}>{`@${product.penjual}`}</Text>
                    </View>
                    <View style={{marginTop: 45}}>
                        <View style={{flexDirection: 'column', marginBottom: 10}}>
                            <Text>Jumlah : </Text>
                            <TextInput
                                keyboardType="numeric"
                                value={jumlah}
                                onChangeText={(text) => setJumlah(text)}
                                onFocus={() => setJumlah('')}
                                onBlur={() => {
                                    if (jumlah === '' || jumlah === null) {
                                        setJumlah('0');
                                    }
                                }}
                                returnKeyType="done"
                                style={styles.inputJumlah}
                            />
                        </View>
                        <View style={{flexDirection: 'row', marginBottom: 10}}>
                            <TouchableOpacity style={styles.boxContainerRemove} onPress={handleRemoveOffer}>
                                <Icon name="remove" style={{fontSize: 25, color: 'white'}} />
                            </TouchableOpacity>
                            <TextInput
                                keyboardType="numeric"
                                value={offerAmount}
                                onChangeText={(text) => setOfferAmount(text)}
                                onFocus={() => setOfferAmount('')}
                                onBlur={() => {
                                    if (offerAmount === '' || offerAmount === null) {
                                        setOfferAmount('0');
                                    }
                                }}
                                returnKeyType="done"
                                style={styles.inputOffer}
                            />
                            <TouchableOpacity style={styles.boxContainerAdd} onPress={handleAddOffer}>
                                <Icon name="add" style={{fontSize: 25, color: 'white'}} />
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'column'}}>
                            <Text>Subtotal Offer:</Text>
                            <Text>{formatRupiah(subtotal)}</Text>
                        </View>
                    </View>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.bottomButtonsContainer}>
                <TouchableOpacity style={styles.likeButton} onPress={btnLike}>
                    {liked ? (
                        <Icon name="heart" style={{ fontSize: 35, color: 'red' }} />
                    ) : (
                        <Icon name="heart-outline" style={{ fontSize: 35, color: 'red' }} />
                        )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.offerButton} onPress={offer}>
                    <Text style={styles.offerButtonText}>Offer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chatButton} onPress={() => chat(product.penjual)}>
                    <Icon name="chatbubbles-outline" style={{ fontSize: 35, color: 'black' }} />
                </TouchableOpacity>
            </View>
        </View>
    );
};
    
    
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',  
        flexDirection: 'column',
    },
    productCard: {
        margin: 20,
    },
    productImage: {
        width: '100%',
        height: 300,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    productDetails: {
        padding: 10,
        marginBottom: 10,
        flexDirection: 'column'
    },
    productTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        height: 40,
        paddingLeft: 10,
    },
    productDescription: {
        fontSize: 16,
        width: 180,
        marginBottom: 10,
    },
    productLikes: {
        fontSize: 20,
        marginBottom: 10,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e44d26', 
        marginBottom: 10,
    },
    icon: {
        fontSize: 25,
        color: 'red',
    },
    inputOffer: {
        height: 40,
        width: 90,
        borderColor: 'gray',
        borderWidth: 1,
        textAlign: 'center',
    },
    inputJumlah: {
        height: 40,
        width: 50,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        textAlign: 'center',
    },
    boxContainerAdd: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#9dcb3c',
        justifyContent: 'center',
        height: 40,
        width: 30,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
    },
    boxContainerRemove: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'red',
        justifyContent: 'center',
        height: 40,
        width: 30,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
    },
    likeButton: {
        marginTop: 10,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    offerButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: 150,
        marginTop: 10,
    },
    chatButton: {
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    offerButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    bottomButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
});

export default ProductDetail;