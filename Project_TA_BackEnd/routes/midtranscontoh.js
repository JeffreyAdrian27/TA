import axios from 'axios'
import { v4 as uuidV4 } from 'uuid'

// ** Midtrans Configs Constants
const ENDPOINT = process.env.NEXT_PUBLIC_MIDTRANS_ENDPOINT
const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY
const DEFAULT_SETTINGS = {
  productName: 'Top Up E-Money Web Panthreon',
  phoneNumber: '+6289616089857',
  usage_limit: 1,
  customer_required: true,
  credit_card: {
    secure: true,
    bank: 'bca',
    installment: {
      required: false,
      terms: {
        bni: [3, 6, 12],
        mandiri: [3, 6, 12],
        cimb: [3],
        bca: [3, 6, 12],
        offline: [6, 12]
      }
    }
  },
  bca_va: {
    va_number: '11111111111'
  },
  expiry: {
    duration: 30,
    unit: 'minutes' // minutes, hours, days, weeks, months, years, null
  },
  enabled_payments: ['credit_card', 'bca_va', 'indomaret']
}
const HTTP_FETCHER = axios.create({
  baseURL: ENDPOINT,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Basic ${btoa(SERVER_KEY + ':')}`
  }
})

// ** Midtrans Services

/**
 * Create a Top Up Payment Link
 *
 * Adalah fungsi untuk membuat payment link fitur
 * top-up baru menggunakan midtrans.
 *
 * Perhatikan params yang berhubungan denga user!
 * Midtrans menetapkan kalau ingin memasukkan pengguna
 * maka email adalah required karena akan dikirim ke email pengguna
 * tersebut juga (HATI HATI SAAT MENGIRIM EMAIL)
 *
 * @param {string} transactionId Bisa masukkan id transaksinya langsung juga gpp
 * @param {number} nominalTopUp Nominal top-up nya berapa
 * @param {string} userFirstName First name customernya
 * @param {string} userEmail Email customernya
 * @param {string|undefined} userPhone No telepon customernya (default nomor devnya)
 * @param {string|undefined} userLastName Last name customernya (optional)
 * @param {string|undefined} userNotes Notes untuk customernya (optional)
 * @param {number|undefined} duration Durasi expired link nya dalam menit (default 30)
 * @param {number|undefined} usageLimit Limi link berapa kali digunakan (default 1)
 * @returns success: object of code: http code, orderId: midtrans order id, paymentUrl: midtrans payment url
 * @returns error: object of code: http code, message: midtrans error message
 */
export async function createTopUpPaymentLink(
  transactionId,
  nominalTopUp,
  userFirstName,
  userEmail,
  userPhone,
  userLastName = '',
  userNotes,
  duration = 30,
  usageLimit = 1
) {
  return new Promise(async (resolve, reject) => {
    return await HTTP_FETCHER.post('/v1/payment-links', {
      transaction_details: {
        order_id: transactionId,
        gross_amount: +nominalTopUp,
        payment_link_id: `${uuidV4()}-${transactionId}`
      },
      customer_required: DEFAULT_SETTINGS.customer_required,
      // credit_card: DEFAULT_SETTINGS.credit_card,
      // bca_va: DEFAULT_SETTINGS.bca_va,
      usage_limit: usageLimit ?? DEFAULT_SETTINGS.usage_limit,
      expiry: {
        duration: duration ?? DEFAULT_SETTINGS.expiry.duration,
        unit: DEFAULT_SETTINGS.expiry.unit
      },
      enabled_payments: ['bca_va'],
      item_details: [
        {
          id: transactionId,
          name: DEFAULT_SETTINGS.productName,
          price: nominalTopUp,
          quantity: 1,
          brand: 'Panthreon',
          category: 'e-wallet',
          merchant_name: 'Panthreon'
        }
      ],
      customer_details: {
        first_name: userFirstName,
        email: userEmail
        // phone: userPhone ?? DEFAULT_SETTINGS.phoneNumber,
        // notes: userNotes ?? undefined
      }
    })
      .then(res => {
        // console.log(res.data)
        return resolve({
          success: {
            code: res.status,
            orderId: res.data.order_id,
            paymentUrl: res.data.payment_url
          }
        })
      })
      .catch(err => {
        // console.error(err.response)
        return resolve({
          error: {
            code: err.response?.status,
            message: err.response?.data?.error_messages
          }
        })
      })
  })
}

export async function getTopUpPaymentLink(orderId) {
  return new Promise(async (resolve, reject) => {
    return await HTTP_FETCHER.get(`/v1/payment-links//${orderId}`)
      .then(res => {
        return resolve(res.data)
      })
      .catch(err => {
        console.log(err.response)
        return reject({
          error: err.response
        })
      })
  })
}

export async function checkTopUpTransactionStatus(transactionId) {
  return new Promise(async (resolve, reject) => {
    return await HTTP_FETCHER.get(`/v2/${transactionId}/status`)
      .then(res => {
        return resolve({
          transaction_status: res.data.transaction_status,
          fraud_status: res.data.fraud_status
        })
      })
      .catch(err => {
        console.log(err.response)
        return reject({
          error: {
            code: err.response?.status_code,
            message: err.response?.status_message
          }
        })
      })
  })
}
