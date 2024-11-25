import React, { useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator, Text, Button } from 'react-native';
import axios from 'axios';

const PaymentScreen = () => {
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [webViewVisible, setWebViewVisible] = useState(false);
    const ip = process.env.EXPO_PUBLIC_API_URL;
    
    //order data
    const orderDetails = {
      // order_id: 'order12346',      // Contoh order ID
      gross_amount: 500000,        // Contoh nominal top-up
      userFirstName: 'adrian27',       // Nama depan pengguna
      userEmail: 'john.doe@example.com',  // Email pengguna
      userPhone: '+6289616089857'  // Nomor telepon pengguna
    };

    // const checkTransactionStatus = async () => {
    //     try {
    //         const response = await axios.get(`${ip}/api/check-transaction-status/${transactionId}`);
    //         const status = response.data.transaction_status;
    //         setTransactionStatus(status);
    //         console.log(transactionStatus, transactionId);

    //         // Jika status transaksi adalah "settlement", sembunyikan WebView
    //         if (status === 'settlement') {
    //             setWebViewVisible(false); // Menyembunyikan WebView jika status "settlement"
    //         }
    //     } catch (err) {
    //         console.error("Error checking transaction status:", err);
    //     }
    // };

    // useEffect(() => {
    //     if (transactionId) {
    //         const interval = setInterval(() => {
    //             checkTransactionStatus();
                
    //         }, 5000); // Setiap 5 detik, periksa status transaksi
 
    //         return () => clearInterval(interval); // Bersihkan interval saat komponen unmount
    //     }
    // }, [transactionId]);
  
    const handlePaymentStart = async () => {
        setLoading(true);
        setError(null);
    
        try {
          // Kirim request ke backend untuk membuat payment link
          const response = await axios.post(`${ip}/api/create-payment`, orderDetails);
          setPaymentUrl(response.data.paymentUrl); // Dapatkan payment URL dari response
          setWebViewVisible(true); // Dapatkan transactionId dari response
        } catch (err) {
          setError('Gagal membuat link pembayaran.');
          console.error(err);
        } finally {
          setLoading(false);
        }
    };

    const handleBackPress = () => {
      setWebViewVisible(false);
    };
  
    const handleNavigationStateChange = (navState) => {
      
      const { url } = navState;
      // Check for success URL or keyword indicating payment completion
      // if (url.includes('payment/success') || url.includes('status=settlement')) {
      //     setWebViewVisible(false); // Hide WebView upon successful payment
      //     // Handle post-payment success actions
      //     console.log("Pembayaran berhasil");
      // } else if (url.includes('status=pending')) {
      //     setWebViewVisible(false); // Hide WebView upon pending payment
      //     // Handle post-payment pending actions
      //     console.log("Pembayaran dalam status pending");
      //     // You can add further actions here if needed, like displaying a message to the user
      // }
    };
  
      return (
        <View style={{ flex: 1 }}>
            {webViewVisible ? (
                <>
                    <Button title="Kembali" onPress={handleBackPress} />
                    <WebView
                        source={{ uri: paymentUrl }}
                        onNavigationStateChange={handleNavigationStateChange}
                        startInLoadingState={true}
                        renderLoading={() => <ActivityIndicator size="large" color="#0000ff" />}
                    />
                </>
            ) : (
                <Button title="Pay Now" onPress={handlePaymentStart} disabled={loading} />
            )}
        </View>
      );
    };

export default PaymentScreen;