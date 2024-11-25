import React, { useState } from 'react';
import { View, Text, Image, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker'; 
import axios from 'axios';

const Register = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [alamat, setAlamat] = useState('');
  const [norek, setNorek] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(''); 
  const roleOptions = ['Pilih Role', 'Penjual', 'Pembeli'];
  const ip = process.env.EXPO_PUBLIC_API_URL;

  const handleRegister = () => {
    axios
      .post(`${ip}/api/register`, {
        username: username,
        email: email,
        password: password,
        cpassword: cpassword,
        role: selectedRole, 
      })
      .then((response) => {
        Alert.alert(response.data.message);
        navigation.navigate('Home');
      })
      .catch((error) => {

        if (error.response) {
          Alert.alert(error.response.data.message);
        } else {
          console.error('Register Gagal:', error.message);
        }
      });
  };

  return (
    <View style={styles.container}>
      <Image  source={require('./assets/logo.png')} style={{ height: 120, width: 120}} />
      <View style={styles.view}>
        <Icon name='person-circle-outline' style={styles.icon} />
        <TextInput style={styles.input} placeholder='Username' value={username} onChangeText={setUsername} />
      </View>
      <View style={styles.view}>
        <Icon name='at' style={styles.icon} />
        <TextInput style={styles.input} placeholder='Email' value={email} onChangeText={setEmail} />
      </View>
      <View style={styles.view}>
        <Icon name='lock-closed-outline' style={styles.icon} />
        <TextInput style={styles.input} placeholder='Password' value={password} onChangeText={setPassword} secureTextEntry />
      </View>
      <View style={styles.view}>
        <Icon name='lock-closed-outline' style={styles.icon} />
        <TextInput style={styles.input} placeholder='Confirm Password' value={cpassword} onChangeText={setCPassword} secureTextEntry />
      </View>
      <View style={styles.viewRole}>
          <Icon name='cog-outline' style={styles.icon} />
          <Picker selectedValue={selectedRole} onValueChange={(itemValue) => setSelectedRole(itemValue)} style={{width : '80%', height : 50}} enabled={true} mode='dropdown'>
            {roleOptions.map((role, index) => (
              <Picker.Item key={index} label={role} value={role}/>
            ))}
          </Picker>
      </View>
      <Button title="Register" onPress={handleRegister} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>Sudah punya akun?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text style={styles.backLink}>Kembali ke Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    paddingVertical: 0,
    paddingLeft: 15,
    fontSize: 15,
  },
  icon: {
    fontSize: 25,
    marginRight: 10,
    color: '#666',
  },
  view: {
    flexDirection: 'row',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 20,
    alignItems: 'center',
    height: 40
  },
  viewRole: {
    flexDirection: 'row',
    height: 40,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    flex: 0.55,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  loginLink: {
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

export default Register;
