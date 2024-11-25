const express = require("express");
const midtransClient = require('midtrans-client');
const axios = require('axios');
const { v4: uuidV4 } = require('uuid');
const router = express.Router();
const midtransConfig = require('../config/midtransConfig');
const TopUp = require("../models/TopUp");
const SERVER_KEY = midtransConfig.serverKey;
const ENDPOINT =midtransConfig.apiUrl;

const HTTP_FETCHER = axios.create({
    baseURL: ENDPOINT,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(SERVER_KEY + ':').toString('base64')}`,
    },
});

// Fungsi untuk membuat Payment Link
const createTopUpPaymentLink = async (
    transactionId,
    nominalTopUp,
    userFirstName,
    userEmail,
    userPhone,
    userLastName = '',
    userNotes = '',
    duration = 30,
    usageLimit = 1
    ) => {
    const transactionParams = {
        transaction_details: {
            order_id: transactionId,
            gross_amount: nominalTopUp,
        },
        credit_card:{
            secure : true,
            channel: "oneclick",
        },
        customer_required: true,
        usage_limit: usageLimit,
        expiry: {
            duration: duration,
            unit: 'minutes', // Menetapkan durasi dalam menit
        },
        // enabled_payments: ['bca_one_click'], 
        item_details: [
            {
                id: transactionId,
                name: 'Top Up Saldo Recyle',
                price: nominalTopUp,
                quantity: 1,
                brand: 'Recycle',
                category: 'e-wallet',
                merchant_name: 'Recycle',
            },
        ],
        customer_details: {
            first_name: userFirstName,
            ...(userLastName ? { last_name: userLastName } : {}),
            email: userEmail,
            phone: userPhone || '+6289616089857', // Nomor default jika tidak ada
            notes: userNotes || undefined, // Catatan opsional
        },
    };

    try {
        const response = await HTTP_FETCHER.post('/v1/payment-links', transactionParams);
        
        return {
            success: {
                code: response.status,
                orderId: response.data.order_id,
                paymentUrl: response.data.payment_url,
            },
        };
        
    } catch (error) {
        return {
            error: {
                code: error.response?.status,
                message: error.response?.data?.error_messages,
            },
        };
    }
};

// Fungsi untuk mendapatkan detail payment link berdasarkan orderId
const getTopUpPaymentLink = async (orderId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await HTTP_FETCHER.get(`/v1/payment-links/${orderId}`);
            return resolve(response.data); // Mengembalikan data response jika berhasil
        } catch (error) {
            console.error('Error getting payment link:', error.response);
            return reject({
                error: error.response ? error.response.data : error.message,
            });
        }
    });
}
 
// Fungsi untuk memeriksa status transaksi berdasarkan transactionId
// const checkTopUpTransactionStatus = async (transactionId) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const response = await HTTP_FETCHER.get(`/v2/${transactionId}/status`);
//             console.log(response);
            
//             return resolve({
//                 transaction_status: response.data.transaction_status,
//                 fraud_status: response.data.fraud_status,
//             });
            
//         } catch (error) {
//             console.error('Error checking transaction status:', error.response);
//             return reject({
//                 error: error.response ? error.response.data : error.message,
//             });
//         }
//     });
// }

const checkTopUpTransactionStatus = async (transactionId) => {
    try {
        const response = await HTTP_FETCHER.get(`/v2/${transactionId}/status`);
        // response.data.transaction_id bisa digunakan untuk mengambil orderId terkait
        return {
            transaction_status: response.data.transaction_status,
            order_id: response.data.order_id,  // Ambil orderId dari status transaksi
            fraud_status: response.data.fraud_status,
        };
    } catch (error) {
        console.error('Error checking transaction status:', error.response);
        throw error;
    }
};

const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const uniqueID = Math.floor(1000 + Math.random() * 9000); 
  
    return `INV${year}${month}${day}${uniqueID}`;
};

router.post('/create-payment', async (req, res) => {
    const {
        gross_amount,
        userFirstName,
        userEmail,
        userPhone,  
        userLastName = '',   
        userNotes = '',       
        duration = 30,        
        usageLimit = 1        
    } = req.body;

    const order_id = generateInvoiceNumber();

    try {
        const result = await createTopUpPaymentLink(
            order_id,
            gross_amount,
            userFirstName,
            userEmail,
            userPhone,
            userLastName,
            userNotes,
            duration,
            usageLimit 
        );
        
        if (result.success) {
            // await TopUp.create({
            //     user: userFirstName,
            //     invoice: order_id,
            //     nominal: gross_amount,
            //     mt_payment_link: result.success.paymentUrl
            //   });
            res.json({
                orderId: result.success.orderId,
                paymentUrl: result.success.paymentUrl,
            }); 
            console.log(result.success.orderId);
            
        } else {
            res.status(500).json(result.error);
        }
    } catch (error) {
        res.status(500).json({ error: 'Gagal membuat link pembayaran' });
    }
});


// Endpoint untuk mendapatkan detail payment link
router.get('/get-payment-link/:orderId', async (req, res) => {
    const { orderId } = req.params;
  
    try {
        const result = await getTopUpPaymentLink(orderId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mendapatkan link pembayaran' });
    }
});

// Endpoint untuk memeriksa status transaksi
router.get('/check-transaction-status/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    
    try {
        const result = await checkTopUpTransactionStatus(transactionId);
        res.json(result);
        
    } catch (error) {
        res.status(500).json({ error: 'Gagal memeriksa status transaksi' });
    }
});



module.exports = router;