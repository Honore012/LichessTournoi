import { registerUser } from "./auth.js";
import { doc, setDoc, getFirestore, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { app } from './firebase-init.js';

const db = getFirestore(app);
const auth = getAuth(app);

document.getElementById("registerForm")?.addEventListener("submit", function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value.trim();

  if (!username || !email || !password) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  registerUser(email, password)
    .then((token) => {
      localStorage.setItem('firebase_token', token);

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            await setDoc(userRef, {
              uid: user.uid, // UID aussi dans le contenu
              username,
              email,
              gamesPlayed: 0,
              wins: 0,
              losses: 0,
              elo: 1500,
              online: true
            });
            console.log("Profil utilisateur Firestore créé !");
          }

          alert("Inscription réussie ! Un lien de vérification a été envoyé à votre adresse e-mail.");
          window.location.href = "../login.html"; // Redirige vers la page de login
        }
      });
    })
    .catch((error) => {
      console.error("Erreur d'inscription :", error);
      alert("Erreur d'inscription : " + error.message);
    });
});
