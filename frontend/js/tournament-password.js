import { db } from "./firebase-init.js";
import { getAuth, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const auth = getAuth();
const passwordContainer = document.getElementById("password-container");

// Obtenir les paramètres de l'URL
const urlParams = new URLSearchParams(window.location.search);
const tournamentId = urlParams.get("id");
const token = urlParams.get("token"); // Nouveau : récupérer token s'il existe

if (!tournamentId) {
  passwordContainer.innerHTML = "<p>ID du tournoi manquant.</p>";
}

// Fonction d'affichage du mot de passe
async function afficherMotDePasse(user) {
  const participantId = `${tournamentId}_${user.email}`;
  const participantRef = doc(db, "tournamentParticipants", participantId);
  const participantSnap = await getDoc(participantRef);

  if (!participantSnap.exists() || !participantSnap.data().hasPaid) {
    passwordContainer.innerHTML = "<p>Accès refusé. Paiement requis.</p>";
    return;
  }

  const tournamentRef = doc(db, "tournaments", tournamentId);
  const tournamentSnap = await getDoc(tournamentRef);

  if (!tournamentSnap.exists()) {
    passwordContainer.innerHTML = "<p>Tournoi introuvable.</p>";
    return;
  }

  const password = tournamentSnap.data().password;

  passwordContainer.innerHTML = `
    <p><strong>Mot de passe :</strong> <code>${password}</code></p>
    <p>Utilisez ce mot de passe pour rejoindre le tournoi sur Lichess.</p>
    <a href="${tournamentSnap.data().link}" target="_blank" class="join-link">Rejoindre le tournoi</a>
  `;
}

// Vérifie si l'utilisateur est déjà connecté
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await afficherMotDePasse(user);
  } else if (token) {
    // Si non connecté mais token dans l'URL, on tente la reconnexion
    try {
      const result = await signInWithCustomToken(auth, token);
      await afficherMotDePasse(result.user);
    } catch (error) {
      console.error("Erreur de connexion avec le token :", error.message);
      passwordContainer.innerHTML = "<p>Erreur d’authentification. Veuillez vous reconnecter manuellement.</p>";
    }
  } else {
    passwordContainer.innerHTML = "<p>Vous devez être connecté pour voir le mot de passe.</p>";
  }
});
