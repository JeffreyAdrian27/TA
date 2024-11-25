
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
const ip = process.env.EXPO_PUBLIC_API_URL;

const RekeningBank = ({ navigation }) => {

    const [user, setUser] = useState('');
    const [saldo, setSaldo] = useState('');
    const [cekUser, setCekuser] = useState(false);
    const [data, setData] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);

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
        
        fetchData();
        const unsubscribeFocus = navigation.addListener('focus', () => {
            fetchData();
        });

        return () => {
            unsubscribeFocus();
        };
        
    }, [navigation]);

    useEffect(() => {
        const fetchRekening = async () => {
            try {
                const response = await axios.get(`${ip}/api/tampilRekening/${user.username}`);
                console.log(response.data.arr);
                if (response.data.arr[0].cek === 1) {
                    setData(response.data.arr);
                    setCekuser(true);
                } else {
                    console.log("no data");
                    setData([]);
                    setCekuser(false);
                }
            } catch (error) {
                if (error.response) {
                    
                } else {
                    console.error('Error fetching data:', error);
                }
            }
        };

        fetchRekening();
    }, [user]);

    async function handleTambah() {
        navigation.navigate('TambahRekeningBank');
    }
    
    const handleCardPress = (index) => {
        setSelectedCard(data[index]);
    };

    return (
        <View style={styles.container}>
            <Text style={{fontSize: 20, fontWeight: 'bold', paddingLeft: 5, paddingTop: 5}}>No Rekening</Text>
            <View style={styles.content}>
                {cekUser || user.no_rek !== 0 ? (
                <View>
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {data.map((item, index) => (
                         <TouchableOpacity key={index} onPress={() => handleCardPress(index)}>
                            <View style={styles.card} key={index}>
                                <Text style={styles.cardTextbank}>{item.bank}</Text>
                                <Text style={styles.cardTextrek}>{item.no_rek}</Text>
                            </View>
                         </TouchableOpacity>
                    ))}
                    </ScrollView>
                    {selectedCard && (
                        <View style={styles.selectedCardContainer}>
                            <Text style={styles.selectedCardText}>{selectedCard.no_rek}</Text>
                        </View>
                    )}
                    <View>
                        <View style={styles.groupBox}>
                            <TextInput
                                style={styles.input}
                                placeholder="Masukkan Saldo"
                                keyboardType="numeric"
                                value={saldo}
                                onChangeText={(text) => setSaldo(text)}
                                />
                        </View>
                        <Button title="Tarik Saldo" />
                    </View>
                </View>
                ) : (
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Image source={require('./assets/logo.png')} style={styles.img} />
                        <Text style={styles.text}>Belum ada rekening yang tersimpan</Text>
                    </View>
                )}
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Tambah Rekening" onPress={handleTambah} />
            </View>
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
        maxHeight: 250, 
    },
    scrollContent: {
        justifyContent: 'flex-start',
        padding: 16,
        width: 320,
        backgroundColor: '#9dcb3c'
    },
    text: {
        textAlign: 'center',
        fontWeight:'bold', 
        fontSize: 25,
    },
    img: {
        height: 130, 
        width: 130,
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
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 3,
        marginBottom: 16,
        padding: 16,
    },
    cardTextbank: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardTextrek: {
        fontSize: 12,
    },
    groupBox: {
        padding: 16,
        marginVertical: 8,
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
    selectedCardContainer: {
        padding: 5,
        borderWidth: 1, 
        backgroundColor: '#fff',
        borderColor: "black",
        borderRadius: 8,
    },
    selectedCardText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
});

export default RekeningBank;
