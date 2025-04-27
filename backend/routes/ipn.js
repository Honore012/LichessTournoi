import express from 'express';
import { db } from '../firebase-admin.js';

const router = express.Router();
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

router.post('/', async (req, res) => {
  const receivedIPN = req.headers['x-nowpayments-sig'];

  if (receivedIPN !== IPN_SECRET) {
    return res.status(403).send('IPN signature invalide');
  }

  const paymentData = req.body;

  if (paymentData.payment_status === 'finished') {
    const orderId = paymentData.order_id; // Format : tournoiId_email
    const [tournamentId, email] = orderId.split('_');
    const docId = `${tournamentId}_${email}`;

    try {
      await db.collection('tournamentParticipants').doc(docId).set({
        email,
        tournamentId,
        hasPaid: true,
        paidAt: new Date()
      });

      console.log(`Paiement validé pour ${email} au tournoi ${tournamentId}`);
    } catch (err) {
      console.error('Erreur Firestore IPN :', err.message);
    }
  }

  res.send('IPN OK');
});

export default router;
