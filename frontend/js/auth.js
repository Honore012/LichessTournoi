import { auth, provider, db } from './firebase-init.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
  sendEmailVerification // <<< Ajouté ici
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getFirestore
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Connexion d'un utilisateur via email et mot de passe
export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      if (!user.emailVerified) {
        throw new Error("Veuillez vérifier votre adresse email avant de vous connecter.");
      }
      return user.getIdToken(true);
    })
    .catch((error) => {
      console.error("Erreur de connexion :", error.message);
      throw error;
    });
}

// Connexion avec Google (administrateur uniquement)
export function googleSignIn() {
  return signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      if (user.email === "tongalazahonoricque@gmail.com") {
        return user.getIdToken(true);
      } else {
        throw new Error("Accès réservé à l'administrateur uniquement.");
      }
    })
    .catch((error) => {
      console.error("Erreur de connexion avec Google :", error.message);
      throw error;
    });
}

// Inscription d’un nouvel utilisateur + envoi du lien de confirmation
export function registerUser(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      await sendEmailVerification(user); // <<< Envoie l’email de vérification
      alert("Un lien de confirmation a été envoyé à votre adresse email.");
      return user.getIdToken(true);
    })
    .catch((error) => {
      console.error("Erreur d'inscription :", error.message);
      throw error;
    });
}

// Vérifie si l'utilisateur est connecté
export function isUserLoggedIn() {
  return new Promise((resolve, reject) => {
    auth.onAuthStateChanged((user) => {
      user ? resolve(user) : reject('Utilisateur non connecté');
    });
  });
}

// Envoie un lien de réinitialisation de mot de passe
export function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email);
}

// Détection de l’état de connexion et mise à jour du statut en ligne
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        online: true
      });
    } else {
      await updateDoc(userRef, {
        online: true
      });
    }

    window.addEventListener("beforeunload", async () => {
      await updateDoc(doc(db, "users", user.uid), {
        online: false
      });
    });
  }
});
