import express from 'express';
import crypto from 'crypto';
import { db } from '../firebase-admin.js';

const router = express.Router();
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

router.post('/', express.json({ verify: (req, res, buf) => { req.rawBody = buf.toString(); } }), async (req, res) => {
  const receivedSig = req.headers['x-nowpayments-sig'];
  const rawBody = req.rawBody;

  const expectedSig = crypto.createHmac('sha512', IPN_SECRET).update(rawBody).digest('hex');

  if (receivedSig !== expectedSig) {
    console.error('Signature IPN invalide');
    return res.status(403).send('IPN signature invalide');
  }

  const paymentData = req.body;

  if (paymentData.payment_status === 'finished') {
    const orderId = paymentData.order_id; // Format : tournoiId_email
    const [tournamentId, email] = orderId.split('_');
    const docId = `${tournamentId}_${email}`;

    try {
      // Mise à jour Firestore - collection des participants
      await db.collection('tournamentParticipants').doc(docId).set({
  hasPaid: true,
  paidAt: new Date()
}, { merge: true
      });

      // Facultatif : mise à jour du tournoi si tu stockes les participants là aussi
      await db.collection('tournaments').doc(tournamentId).update({
        [`participants.${email}.paid`]: true
      });

      console.log(`Paiement validé pour ${email} au tournoi ${tournamentId}`);
    } catch (err) {
      console.error('Erreur Firestore IPN :', err.message);
    }
  }

  res.status(200).send('IPN OK');
});

export default router;
