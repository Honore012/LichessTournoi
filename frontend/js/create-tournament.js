// Ne surtout pas importer Swal ici !
import { auth } from "./firebase-init.js";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Sélection des éléments du DOM
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
    Swal.fire({
      icon: 'error',
      title: 'Erreur de connexion',
      text: error.message
    });
  } finally {
    loginButton.disabled = false;
  }
});

// Contrôle d’accès
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (user.email === ADMIN_EMAIL) {
      createButton.disabled = false;
      loginButton.textContent = "Connecté : " + user.email;
    } else {
      createButton.disabled = true;
      loginButton.textContent = "Non autorisé";
      Swal.fire({
        icon: 'warning',
        title: 'Accès refusé',
        text: "Seul l'administrateur peut créer des tournois."
      });
    }
  } else {
    createButton.disabled = true;
    loginButton.textContent = "Se connecter";
  }
});

// Création du tournoi
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
    return Swal.fire({
      icon: 'warning',
      title: 'Action réservée à l\'administrateur',
      text: 'Vous devez être administrateur pour créer un tournoi.'
    });
  }

  const formData = new FormData(form);
  const startTimeStr = formData.get("startTime");
  const startTime = new Date(startTimeStr);

  const data = {
    name: formData.get("name"),
    clockTime: formData.get("clockTime"),
    clockIncrement: formData.get("clockIncrement"),
    minutes: formData.get("minutes"),
    variant: formData.get("variant"),
    password: formData.get("password"),
    startTime: startTime.toISOString()
  };

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
      </p>
    `;

    Swal.fire({
      icon: 'success',
      title: 'Tournoi créé avec succès',
      text: `Le tournoi ${tournament.fullName} a été créé avec succès !`
    });

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: error.message
    });
  } finally {
    createButton.disabled = false;
    createButton.textContent = "Créer un tournoi";
  }
});
