import React, { useEffect, useState } from 'react';
import { View, Text, Image,TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';


const Login = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const ip = process.env.EXPO_PUBLIC_API_URL;

  // useEffect(()=>{
  //   cekLogin();
  // })
  
  // async function cekLogin(){
  //   let userData = await AsyncStorage.getItem("token");
  //   console.log(userData);
  //   if(userData !='' && userData){
  //     navigation.navigate('Home');
  //   }
  // }

  const handleLogin = () => {
    axios
      .post(`${ip}/api/login`, {
        username: username,
        password: password,
      })
      .then((response) => {
        Alert.alert(response.data.message);
        AsyncStorage.setItem('token', response.data.token);
        const decodedToken = jwtDecode(response.data.token)
        AsyncStorage.setItem('tokenExpiresAt', decodedToken.exp.toString());
        navigation.navigate('Home');
      })
      .catch((error) => {
        if (error.response) {
          Alert.alert(error.response.data.message);
        } else {
          console.error('Login Gagal:', error.message);
        }
      });
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/loading.png')} style={{height: 200, width: 200}}/>
      <View style={styles.view}>
        <Icon name='person-circle-outline' style={styles.icon}/>
        <TextInput  
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={text => setUsername(text)}
        />
      </View>
      <View style={styles.view}>
        <Icon name='lock-closed-outline' style={styles.icon}/>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={text => setPassword(text)}
          secureTextEntry
        />
      </View>
      <Button title="Login" onPress={handleLogin} />
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerLink}>Belum punya akun?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text style={styles.backLink}>Kembali ke Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    paddingVertical: 0,
  },
  icon: {
    fontSize: 25,
    marginRight: 5,
    color: '#666',
  },
  view:{
    flexDirection:'row', 
    borderBottomColor:'#ccc', 
    borderBottomWidth: 1, 
    paddingBottom: 8, 
    marginBottom: 30,
  },
  registerLink: {
    marginTop: 20,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  backLink: {
    marginTop: 10,
    color: 'green',
    textDecorationLine: 'underline',
  },
});

export default Login;