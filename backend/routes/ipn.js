import express from 'express';
import crypto from 'crypto';
import getRawBody from 'raw-body';
import { db } from '../firebase-admin.js';

const router = express.Router();
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

router.post('/', async (req, res) => {
  try {
    const rawBody = await getRawBody(req);
    const receivedSig = req.headers['x-nowpayments-sig'];
    
    const expectedSig = crypto
      .createHmac('sha512', IPN_SECRET)
      .update(rawBody)
      .digest('hex');

    if (receivedSig !== expectedSig) {
      console.error('Signature IPN invalide');
      return res.status(403).send('IPN signature invalide');
    }

    const paymentData = JSON.parse(rawBody.toString());

    if (paymentData.payment_status === 'finished') {
      const orderId = paymentData.order_id;
      const lastUnderscore = orderId.lastIndexOf('_');

      if (lastUnderscore === -1) {
        console.error('Format order_id invalide');
        return res.status(400).send('Format order_id invalide');
      }

      const tournamentId = orderId.substring(0, lastUnderscore);
      const email = orderId.substring(lastUnderscore + 1);
      const docId = `${tournamentId}_${email}`;

      await db.collection('tournamentParticipants').doc(docId).set({
        hasPaid: true,
        paidAt: new Date()
      }, { merge: true });

      await db.collection('tournaments').doc(tournamentId).update({
        [`participants.${email}.paid`]: true
      });

      console.log(`✅ Paiement confirmé pour ${email} au tournoi ${tournamentId}`);
    }

    res.status(200).send('IPN OK');
  } catch (err) {
    console.error('Erreur dans le traitement IPN :', err.message);
    res.status(500).send('Erreur IPN');
  }
});

export default router;
