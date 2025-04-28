import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const BASE_URL = process.env.BASE_URL;

export const createInvoice = async (order_id, user_email) => {
  const [tournamentId] = order_id.split('_'); // On extrait le tournoi depuis l'order_id

  try {
    const response = await axios.post(
      'https://api.nowpayments.io/v1/invoice',
      {
        price_amount: 0.0001,
        price_currency: 'ltc',
        pay_currency: 'ltc',
        order_id,
        order_description: `Paiement tournoi pour ${user_email}`,
        ipn_callback_url: `${BASE_URL}/api/ipn`,
        success_url: `${BASE_URL}/tournament-password.html?id=${tournamentId}`,
        cancel_url: `${BASE_URL}/tournoi/annule`
      },
      {
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.invoice_url;
  } catch (error) {
    console.error('Erreur création invoice :', error.response?.data || error.message);
    throw new Error('Impossible de créer la facture NOWPayments');
  }
};
