// tournaments.js
import { db } from "./firebase-init.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const auth = getAuth();
const listContainer = document.getElementById("tournamentList");
const PARTICIPATION_AMOUNT_LTC = 0.0005;
const BACKEND_URL = "https://lichesstournoi-backend.onrender.com";  // Remplacer par l'URL de ton backend de production

async function afficherTournois() {
  try {
    const snapshot = await getDocs(collection(db, "tournaments"));
    listContainer.innerHTML = "";

    if (snapshot.empty) {
      listContainer.innerHTML = "<p>Aucun tournoi trouvé.</p>";
      return;
    }

    snapshot.forEach(async (docSnap) => {
      const tournoi = docSnap.data();
      const docId = docSnap.id;
      const createdAt = tournoi.createdAt?.toDate();
      if (!createdAt) return;

      const startTime = createdAt.getTime() + 60 * 60 * 1000;
      const endTime = startTime + tournoi.minutes * 60 * 1000;
      const deleteTime = endTime + 60 * 60 * 1000;
      const now = Date.now();

      if (now > deleteTime) {
        await deleteDoc(doc(db, "tournaments", docId));
        return;
      }

      const div = document.createElement("div");
      div.className = "tournament-card";

      let statusText = "En attente";
      let statusClass = "status-en-attente";
      if (now >= startTime && now < endTime) {
        statusText = "Tournoi en cours";
        statusClass = "status-en-cours";
      } else if (now >= endTime) {
        statusText = "Tournoi terminé";
        statusClass = "status-termine";
      }

      const countdownElement = document.createElement("p");

      const updateCountdown = () => {
        const timeLeft = startTime - Date.now();
        if (timeLeft <= 0) {
          countdownElement.textContent = "Le tournoi a commencé !";
          clearInterval(intervalId);
          return;
        }
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        countdownElement.textContent = `Démarre dans : ${minutes}m ${seconds}s`;
      };

      const intervalId = setInterval(updateCountdown, 1000);
      updateCountdown();

      div.innerHTML = `
        <h3>${tournoi.name}</h3>
        <p><strong>Durée :</strong> ${tournoi.minutes} min</p>
        <p><strong>Cadence :</strong> ${tournoi.clockTime}+${tournoi.clockIncrement}</p>
        <p><strong>Variante :</strong> ${tournoi.variant}</p>
        <p><strong>Statut :</strong> <span class="status-badge ${statusClass}">${statusText}</span></p>
        <button class="pay-button" data-id="${docId}">Payer ${PARTICIPATION_AMOUNT_LTC} LTC pour rejoindre</button>
        <a href="${tournoi.link}" class="tournament-link" target="_blank" style="display:none;">Rejoindre le tournoi</a>
      `;

      div.appendChild(countdownElement);

      const payButton = div.querySelector(".pay-button");
      const tournamentLink = div.querySelector(".tournament-link");

      payButton.addEventListener("click", async () => {
        payButton.disabled = true;
        payButton.textContent = "Redirection vers paiement...";

        const user = auth.currentUser;
        if (!user) {
          Swal.fire({
            title: "Erreur",
            text: "Vous devez être connecté pour rejoindre un tournoi.",
            icon: "error",
            confirmButtonText: "OK"
          });
          payButton.disabled = false;
          payButton.textContent = `Payer ${PARTICIPATION_AMOUNT_LTC} LTC pour rejoindre`;
          return;
        }

        try {
          const token = await user.getIdToken();
          const res = await fetch(`${BACKEND_URL}/api/payments/join`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ tournamentId: docId }),
          });

          const data = await res.json();
          if (res.ok && data.paymentUrl) {
            window.location.href = data.paymentUrl;
          } else {
            throw new Error(data.error || "Erreur de facturation.");
          }
        } catch (error) {
          console.error("Erreur API paiement :", error);
          Swal.fire({
            title: "Erreur",
            text: "Une erreur s'est produite lors du paiement.",
            icon: "error",
            confirmButtonText: "OK"
          });
          payButton.disabled = false;
          payButton.textContent = `Payer ${PARTICIPATION_AMOUNT_LTC} LTC pour rejoindre`;
        }
      });

      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const participantId = `${docId}_${user.email}`;
          const participantRef = doc(db, "tournamentParticipants", participantId);
          const participantSnap = await getDoc(participantRef);

          if (participantSnap.exists() && participantSnap.data().hasPaid) {
            tournamentLink.style.display = "inline-block";

            const passwordBtn = document.createElement("a");
            passwordBtn.href = `tournament-password.html?id=${docId}`;
            passwordBtn.textContent = "Mot de passe";
            passwordBtn.className = "password-button";
            passwordBtn.style.marginLeft = "10px";

            div.appendChild(passwordBtn);
          }
        }
      });

      listContainer.appendChild(div);
    });
  } catch (error) {
    console.error("Erreur lors de l'affichage des tournois :", error);
    listContainer.innerHTML = "<p>Erreur de chargement des tournois.</p>";
  }
}

afficherTournois();
