import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TextInput, Button, StyleSheet, TouchableOpacity, Modal, Alert, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import jwtDecode from 'jwt-decode';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const ip = process.env.EXPO_PUBLIC_API_URL;

const Chatting = ({route}) => {

  const { sender} = route.params;
  const [inputText, setInputText] = useState('');
  const [chatList, setChatList] = useState([]);
  const [user, setUser] = useState('');
  const [role, setRole] = useState('');
  const [nama, setNama] = useState('');
  const [id, setId] = useState('');
  const [product, setProduct] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showAllData, setShowAllData] = useState(false);
  const [offerValue, setOfferValue] = useState('');
  const db = getFirestore();

  useEffect(() => {
    fetchData();
    if (user && sender) {
      fetchOffer();
    }
    const unsubscribe = onSnapshot(collection(db, 'chat'), (snapshot) => {
      const chats = [];
      snapshot.forEach((doc) => {
        const chatData = doc.data();
        if (chatData.sender === sender && chatData.receiver === user || chatData.sender === user && chatData.receiver === sender) {
          chats.push({ id: doc.id, ...chatData });
        }
      }); 
      chats.sort((a, b) => new Date(a.time) - new Date(b.time));
      
      setChatList(chats);
    });

    return () => {
      unsubscribe();
    };
  }, [user, sender]);

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

  async function fetchOffer() {
    try {
      const response = await axios.get(`${ip}/api/tampilOffer/${user}/${sender}`);
      setProduct(response.data.arr);
    } catch (error) {
      setProduct('')
    }
  }

  async function fetchData() {
    try {
      const res = await AsyncStorage.getItem('token');
      const decodedToken = jwtDecode(res);
      setRole(decodedToken.role);
      setUser(decodedToken.username);
    } catch (error) {
      console.error('Error fetching token:', error);
    }  
  }

  async function handleSend () {
    try {
      if (inputText.trim() !== '') {
        const docRef = await addDoc(collection(db, 'chat'), {
          sender: user,
          receiver: sender,
          message: inputText,
          time: new Date().toString(),
        });
      }
    } catch (e) {
      console.error('Error adding document: ', e);
    }
    setInputText('');
  }

  const MessageItem = ({ item }) => {
    return (
      <View
        style={
          item.sender === 'Me' || item.sender === user
            ? styles.sentMessage
            : styles.receivedMessage
        }
        key={item.id.toString()}
      >
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timeText}>{formatedTime(new Date(item.time))}</Text>
      </View>
    );
  };

  const formatDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[date.getDay()];
    const dayOfMonth = date.getDate().toString().padStart(2, '0'); 
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear();

    const formattedDate = `${day}, ${dayOfMonth}/${month}/${year}`;
    return formattedDate;
  };

  function formatedTime (date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    const formattedHours = hours >= 12 ? hours : (hours === 0 ? 12 : hours);
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  const handleEditPress = (id, nama, harga) => {
    setNama(nama);
    setOfferValue(harga.toString());
    setId(id);
    setIsModalVisible(true); 
  };

  async function handleSaveOffer() {
    setIsModalVisible(false);
    try {
      const response = await axios.put(`${ip}/api/editOffer/${id}`, { harga: offerValue });
      if (response.status === 200) {
        Alert.alert(response.data.message);
        fetchOffer();
      } 
    } catch (error) {
      if (error.response.status === 404) {
        Alert.alert('Barang tidak ditemukan!');
      }
    }
  };

  async function handleAccept(id) {
    try {
      const response = await axios.put(`${ip}/api/editStatus/${id}/1`, { harga: offerValue });
      if (response.status === 200) {
        Alert.alert(response.data.message);
        fetchOffer();
      } 
    } catch (error) {
      if (error.response.status === 404) {
        Alert.alert('Barang tidak ditemukan!');
      }
    }
  };
  
  async function handleDecline(id) {
    try {
      const response = await axios.put(`${ip}/api/editStatus/${id}/-1`, { harga: offerValue });
      if (response.status === 200) {
        Alert.alert(response.data.message);
        fetchOffer();
      } 
    } catch (error) {
      if (error.response.status === 404) {
        Alert.alert('Barang tidak ditemukan!');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.chatContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>@{sender}</Text>
          <TouchableOpacity onPress={() => setShowAllData(!showAllData)}>
            <Icon name={showAllData ? 'chevron-up' : 'chevron-down'} size={20} color="black" />
          </TouchableOpacity>
        </View>
        {product && product.length > 0 ? (
          <View>
            {showAllData ? (
              <ScrollView style={[styles.offerAllContainer, role === 'Penjual' ? { height: '18%' } : { height: '13%' }]}>
              {product.map((item, index) => (
                <View style={styles.productContainer} key={index}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={{ uri: item.gambar }} style={{ width: 70, height: 70 }} />
                    <View style={{ flexDirection: 'column', paddingLeft: 5, flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.nama}</Text>
                      {role === 'Pembeli' && item.status === -1 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
                          <TouchableOpacity onPress={() => handleCheckout(item.id)} style={styles.btnTrash}>
                            <Icon name="trash" size={20} color="white" style={styles.trashIcon} />
                          </TouchableOpacity>
                        </View>
                      )}
                      {role === 'Penjual' && (
                        <>
                        <TouchableOpacity onPress={() => handleEditPress(item.id, item.nama, item.harga)} style={{ marginLeft: 10}}>
                          <Icon name="md-create" size={24} color="black"/>
                        </TouchableOpacity>
                        <Modal
                          animationType="slide"
                          transparent={true}
                          visible={isModalVisible}
                          onRequestClose={() => setIsModalVisible(false)}
                        >
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
                            <Text>Edit Offer {nama}:</Text>
                            <TextInput
                              value={offerValue}
                              onChangeText={setOfferValue}
                              style={{ borderWidth: 1, padding: 8, marginTop: 10 }}
                              keyboardType="numeric"
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                              <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
                              <Button title="Save" onPress={handleSaveOffer} />
                            </View>
                          </View>
                        </View>
                      </Modal>
                      </>
                      )} 
                    </View>
                      <Text>Offer: {formatRupiah(item.harga)}</Text>
                      <Text>Qty: {item.jumlah}</Text>
                      <Text>Status: {item.status === 1 ? 'Diterima' : item.status === -1 ? 'Ditolak' : 'Belum diterima'}</Text>
                    </View>
                  </View>
                  {role === 'Penjual' && item.status === 0 &&(
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                      <Button title="Terima" onPress={() => handleAccept(item.id)}/>
                      <View style={{ width: 10 }}></View>
                      <Button title="Tolak" onPress={() => handleDecline(item.id)}/>
                    </View>
                  )} 
                  {role === 'Pembeli' && item.status === 1 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                      <TouchableOpacity onPress={() => handleCheckout(item.id)} style={styles.btnCheckout}>
                        <Text style={{color: 'white'}}>Checkout</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
            ) : (
              <View style={styles.offerContainer}>
                <View style={{ flexDirection: 'row' }}>
                  <Image source={{ uri: product[0].gambar }} style={{ width: 70, height: 70 }} />
                  <View style={{ flexDirection: 'column', paddingLeft: 5, flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{product[0].nama}</Text>
                      {role === 'Pembeli' && product[0].status === -1 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                          <TouchableOpacity onPress={() => handleCheckout(product[0].id)} style={styles.btnTrash}>
                            <Icon name="trash" size={20} color="white" style={styles.trashIcon} />
                          </TouchableOpacity>
                        </View>
                      )}
                      {role === 'Penjual' && (
                      <>
                      <TouchableOpacity onPress={() => handleEditPress(product[0].id, product[0].nama, product[0].harga)} style={{ marginLeft: 10}}>
                        <Icon name="md-create" size={24} color="black"/>
                      </TouchableOpacity>
                      <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalVisible}
                        onRequestClose={() => setIsModalVisible(false)}
                      >
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
                          <Text>Edit Offer {nama}:</Text>
                          <TextInput
                            value={offerValue}
                            onChangeText={setOfferValue}
                            style={{ borderWidth: 1, padding: 8, marginTop: 10 }}
                            keyboardType="numeric"
                          />
                          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                            <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
                            <Button title="Save" onPress={handleSaveOffer} />
                          </View>
                        </View>
                      </View>
                    </Modal>
                    </>
                    )} 
                    </View>
                    <Text>Offer: {formatRupiah(product[0].harga)}</Text>
                    <Text>Qty: {product[0].jumlah}</Text>
                    <Text>Status: {product[0].status === 1 ? 'Diterima' : product[0].status === -1 ? 'Ditolak' : 'Belum diterima'}</Text>
                  </View>
                </View>
                {role === 'Penjual' && product[0].status === 0 &&(
                  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Button title="Terima" onPress={() => handleAccept(product[0].id)}/>
                    <View style={{ width: 10 }}></View>
                    <Button title="Tolak" onPress={() => handleDecline(product[0].id)}/>
                  </View>
                )}
                {role === 'Pembeli' && product[0].status === 1 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity  onPress={() => handleCheckout(item.id)} style={styles.btnCheckout}>
                      <Text style={{color: 'white'}}>Checkout</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        ) : null}
        <View style={{ position: 'absolute', zIndex: 1 }}></View>
          <FlatList
            data={chatList}
            keyExtractor={(item) => `${item.id}_${item.sender}_${item.message}`}
            renderItem={({ item, index }) => {
            const dateTimePart = item.time;
            const currentDate = new Date(dateTimePart).toDateString();
            const previousItem = chatList[index - 1];
            const previousDate = previousItem ? new Date(previousItem.time).toDateString() : null;

            if (currentDate !== previousDate) {
              return (
                <>
                  <Text style={styles.dateText}>{formatDate(new Date(item.time))}</Text>
                  <MessageItem item={item} />
                </>
              );
            } else {
              return <MessageItem item={item} />;
            }
          }}
          />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={inputText}
          onChangeText={(text) => setInputText(text)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#9dcb3c',
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#9dcb3c',
    padding: 10,
    margin: 5,
    borderRadius: 10,
    maxWidth: '70%',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    padding: 10,
    margin: 5,
    borderRadius: 10,
    maxWidth: '70%',
  },
  messageText: {
    color: 'black',
    fontSize: 16,
  },
  timeText: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
    height: 40,
  },
  sendButton: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginVertical: 10,
  },
  offerContainer: {
    left: 10,
    backgroundColor: 'white',
    padding: 10,
    width: '95%',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'gray',
  },
  offerAllContainer: {
    left: 10,
    backgroundColor: 'white',
    width: '95%',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 5,
  },
  chatContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 5,
    marginBottom: 20,
  },
  productContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: 'gray',
  },
  btnCheckout: {
    backgroundColor: 'red',
    color: 'white',
    marginTop: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  trashIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    color: 'red',
  },
  btnTrash: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 5,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Chatting;