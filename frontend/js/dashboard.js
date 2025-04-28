import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { firebaseConfig } from './firebase-init.js';

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Vérifie l'état de l'utilisateur
onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("userId").textContent = user.uid;
    document.getElementById("userEmail").textContent = user.email;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      document.getElementById("username").textContent = data.username || "Non défini";
      document.getElementById("gamesPlayed").textContent = data.gamesPlayed || 0;
      document.getElementById("wins").textContent = data.wins || 0;
      document.getElementById("losses").textContent = data.losses || 0;
      document.getElementById("elo").textContent = data.elo || 1500;
    } else {
      console.warn("Données utilisateur introuvables dans Firestore");
    }
  } else {
    window.location.href = "login.html";
  }
});

// Menu latéral : Gestion du menu avec son
window.toggleMenu = function () {
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.querySelector(".menu-btn");
  const sound = document.getElementById("menuSound");

  sidebar.classList.toggle("active");
  menuBtn.classList.toggle("active");

  if (sound) {
    sound.currentTime = 0; // Remet le son au début
    sound.play();
  }
};

// Déconnexion
document.getElementById("logout-btn")?.addEventListener("click", async function (e) {
  e.preventDefault();
  try {
    await signOut(auth);
    localStorage.removeItem('firebase_token');
    
    // Affiche l'alerte SweetAlert2
    await Swal.fire({
      icon: 'success',
      title: 'Déconnexion réussie',
      text: 'Vous avez été déconnecté avec succès.',
      timer: 2000, // Temps avant fermeture de l'alerte
      showConfirmButton: true
    });
        
    // Redirection après la fermeture de l'alerte
    window.location.href = "login.html";
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error.message);
  }
});
