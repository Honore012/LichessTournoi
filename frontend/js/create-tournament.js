import { auth } from "./firebase-init.js";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const loginButton = document.getElementById("loginButton");
const createButton = document.getElementById("createTournamentButton");
const form = document.getElementById("tournamentForm");
const resultat = document.getElementById("resultat");

const ADMIN_EMAIL = "tongalazahonoricque@gmail.com";
const BACKEND_URL = "https://lichesstournoi-backend.onrender.com";

// Connexion Google
loginButton.addEventListener("click", async (e) => {
  e.preventDefault();
  loginButton.disabled = true;
  const provider = new GoogleAuthProvider();
  try {
    if (!auth.currentUser) {
      await signInWithPopup(auth, provider);
    }
  } catch (error) {
    alert("Erreur de connexion : " + error.message);
  } finally {
    loginButton.disabled = false;
  }
});

// Contrôle d’accès - onAuthStateChanged pour gérer la connexion/déconnexion
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (user.email === ADMIN_EMAIL) {
      createButton.disabled = false;
      loginButton.textContent = "Connecté : " + user.email;
    } else {
      loginButton.textContent = "Non autorisé";
      alert("Seul l'administrateur peut créer des tournois.");
    }
  } else {
    createButton.disabled = true;
    loginButton.textContent = "Se connecter";
  }
});

// Création tournoi via le backend
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
    return alert("Action réservée à l'administrateur.");
  }

  const formData = new FormData(form);
  const data = {
    name: formData.get("name"),
    clockTime: formData.get("clockTime"),
    clockIncrement: formData.get("clockIncrement"),
    minutes: formData.get("minutes"),
    variant: formData.get("variant"),
    password: formData.get("password")
  };

  // Indicateur de chargement
  createButton.disabled = true;
  createButton.textContent = "Création en cours...";

  try {
    const token = await auth.currentUser.getIdToken();
    const response = await fetch(`${BACKEND_URL}/api/tournaments/create`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Erreur backend : " + errorText);
    }

    const { tournament } = await response.json();
    resultat.innerHTML = `
      <p>Tournoi créé :
        <a href="https://lichess.org/tournament/${tournament.id}" target="_blank">
          ${tournament.fullName}
        </a>
      </p>`;
  } catch (error) {
    resultat.textContent = "Erreur : " + error.message;
  } finally {
    createButton.disabled = false;
    createButton.textContent = "Créer un tournoi";
  }
});
