import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Login';
import Home from './Home';
import Register from './Register';
import LoadingScreen from './LoadingScreen.js';
import Me from './Me.js';
import Chatting from './Chatting.js';
import ProductDetail from './ProductDetail.js';
import RekeningBank from './RekeningBank.js';
import Inbox from './Inbox.js';
import TambahRekeningBank from './TambahRekeningBank.js';
import InputBarang from './penjual/InputBarang.js';
import Product from './penjual/Product.js';
import ChatScreen from './ChatScreen.js';
import Liked from './LikedPage.js';
import LocationComponent  from './LocationComponent.js';
import PaymentScreen  from './PaymentScreen.js';
import { initializeApp }  from 'firebase/app';


const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeFirebase();
    setTimeout(() => {
      setIsLoading(false);
    }, 3000); 
  }, []);

  const initializeFirebase = () => {
    const firebaseConfig = {
      apiKey: "AIzaSyDgYxAytE7giPvwwvhV1Wda45jw7CxZcFQ",
      authDomain: "db-ta-43cf6.firebaseapp.com",
      projectId: "db-ta-43cf6",
      storageBucket: "db-ta-43cf6.appspot.com",
      messagingSenderId: "521611404153",
      appId: "1:521611404153:web:1137a39b88ceb2747fc5a8",
      measurementId: "G-Q9H1BYMW80"
  }
  const firebaseApp = initializeApp(firebaseConfig);
};

  return (
    <NavigationContainer>
      {isLoading ? (
        <LoadingScreen /> 
      ) : (
      <Stack.Navigator initialRouteName="PaymentScreen">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Me" component={Me} />
        <Stack.Screen name="RekeningBank" component={RekeningBank} />
        <Stack.Screen name="TambahRekeningBank" component={TambahRekeningBank} />
        <Stack.Screen name="InputBarang" component={InputBarang} />
        <Stack.Screen name="Product" component={Product} />
        <Stack.Screen name="ProductDetail" component={ProductDetail} />
        <Stack.Screen name="Chatting" component={Chatting} />
        <Stack.Screen name="Inbox" component={Inbox} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="Liked" component={Liked} />
        <Stack.Screen name="LocationComponent" component={LocationComponent} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default App;