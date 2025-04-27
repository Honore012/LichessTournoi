import express from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { admin } from '../firebase-admin.js'; // le fichier où tu initialises Firebase Admin

const db = admin.firestore();
const router = express.Router();

// Route d'inscription
router.post('/register', verifyFirebaseToken, async (req, res) => {
  const { uid, email, name } = req.user;

  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid,
        email,
        name: name || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        online: true
      });
      return res.json({ message: 'Inscription réussie', user: { uid, email, name } });
    } else {
      return res.json({ message: 'Utilisateur déjà inscrit', user: userDoc.data() });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Route de connexion
router.post('/login', verifyFirebaseToken, async (req, res) => {
  const { uid, email } = req.user;

  try {
    // Met à jour le statut "online"
    await db.collection('users').doc(uid).update({ online: true });
    res.json({ message: 'Connexion réussie', user: { uid, email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Déconnexion (bonus)
router.post('/logout', verifyFirebaseToken, async (req, res) => {
  const { uid } = req.user;
  try {
    await db.collection('users').doc(uid).update({ online: false });
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
});
export default router;
