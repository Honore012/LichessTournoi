import https from 'https';
import crypto from 'crypto';

const url = 'https://lichesstournoi.onrender.com/api/ipn';
const IPN_SECRET = 'dhfKZ2GWuAeTmzeOtio4DcmWDBODFNJ6 '; // Remplace par ton vrai secret NOWPayments

const paymentData = {
  payment_status: 'finished',
  order_id: 'OQYWx9epQ9N3tRWJhmf5_comptepopolos@gmail.com', // tournoiId_email
  pay_amount: 0.001,
  price_amount: 0.001,
  price_currency: 'LTC',
  pay_currency: 'LTC',
  email: 'comptepopolos@gmail.com'
};

const rawBody = JSON.stringify(paymentData);
const signature = crypto
  .createHmac('sha512', IPN_SECRET)
  .update(rawBody)
  .digest('hex');

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-nowpayments-sig': signature,
    'Content-Length': Buffer.byteLength(rawBody)
  }
};

const req = https.request(url, options, res => {
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    console.log('Réponse du serveur :');
    console.log(responseData || res.statusCode);
  });
});

req.on('error', error => {
  console.error('Erreur IPN test :', error.message);
});

req.write(rawBody);
req.end();
