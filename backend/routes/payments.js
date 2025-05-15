import express from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { createInvoice } from '../services/nowpayments.js';
import { db } from '../firebase-admin.js';

const router = express.Router();

router.post('/join', verifyFirebaseToken, async (req, res) => {
  const { tournamentId } = req.body;
  const email = req.user.email;

  try {
    await db.collection('tournamentParticipants').doc(`${tournamentId}_${email}`).set({
      email,
      tournamentId,
      hasPaid: false,
      createdAt: new Date()
    });

    // Ajout du token Firebase
    const invoiceUrl = await createInvoice(`${tournamentId}_${email}`, email, req.token);

    res.json({ paymentUrl: invoiceUrl });
  } catch (err) {
    console.error('Erreur createInvoice :', err.message);
    res.status(500).json({ error: 'Erreur lors de la création de la facture' });
  }
});

export default router;
