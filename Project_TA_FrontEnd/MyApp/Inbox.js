import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getFirestore, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

const Inbox = ({ navigation }) => {
    const [inbox, setInbox] = useState([]);
    const [receiver, setReceiver] = useState('');
    const [messages, setMessages] = useState('');
    const db = getFirestore();

    useEffect(() => {
      fetchData()
    }, [receiver]);
    
    const fetchData = async () => {
      try {
        const res = await AsyncStorage.getItem('token');
        if (res) {
          const decodedToken = jwtDecode(res);
          setReceiver(decodedToken.username);
          fetchInbox();
        }else{
          setMessages('No messages')
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    }

    const fetchInbox = async () => {
      try {
         
          const inboxRef = collection(db, 'chat');
          const unsubscribe = onSnapshot(inboxRef, (snapshot) => {
              const inboxData = [];
              snapshot.forEach((doc) => {
                const data = doc.data();
                let sender = null;
              
                if (data.sender === receiver || data.receiver === receiver) {
                    if (data.sender == receiver) {
                        sender = data.receiver;
                    } else {
                        sender = data.sender 
                    }
                    inboxData.push({ id: doc.id, ...data, sender }); 
                }
            });
              console.log(inboxData);

              inboxData.sort((a, b) => b.time - a.time);
  
              const groupedMessages = inboxData.reduce((acc, curr) => {
                  const existingSender = acc.find((item) => item.sender === curr.sender);
                  if (!existingSender) {
                      acc.push({
                          sender: curr.sender,
                          message: curr.message,
                          time: curr.time,
                      });
                  }
                  return acc;
              }, []);
  
            setInbox(groupedMessages);
          });
          return () => unsubscribe();
        } catch (error) {
            console.error('Error fetching inbox: ', error);
        }
    };

    const formatDateTime = (dateTimeString) => {
      const dateTime = new Date(dateTimeString);
  
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
  
      const day = dayNames[dateTime.getDay()];
      const date = dateTime.getDate();
      const month = monthNames[dateTime.getMonth()];
      const year = dateTime.getFullYear();
      let hours = dateTime.getHours();
      let minutes = dateTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
  
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
  
      const formattedDateTime = `${day}, ${date} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  
      return formattedDateTime;
  };

    const handleChatPress = (sender) => {
        navigation.navigate('Chatting', { sender });
    };

    const InboxItem = ({ sender, message, time }) => {
        return (
            <TouchableOpacity onPress={() => handleChatPress(sender)}>
                <View>
                    <Text style={styles.sender}>{sender}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <Text style={styles.time}>{formatDateTime(time)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
          {inbox.length > 0 ? (
            <FlatList
              data={inbox}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View key={item.id} style={{ flexDirection: 'row', paddingBottom: 5 }}>
                  <Icon
                    name="person-circle-outline"
                    style={styles.icon}
                    onPress={() => navigation.navigate('Chatting')}
                  />
                  <InboxItem sender={item.sender} message={item.message} time={item.time} />
                </View>
              )}
            />
            ) : (
              <View style={styles.noMessagesContainer}>
                <Text style={styles.noMessagesText}>{messages}</Text>
              </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  sender: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  icon: {
    fontSize: 60,
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMessagesText: {
    fontSize: 18,
    color: '#888',
  },
});

export default Inbox;