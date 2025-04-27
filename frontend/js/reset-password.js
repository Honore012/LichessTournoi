import { sendPasswordReset } from "./auth.js";

document.getElementById("resetForm")?.addEventListener("submit", function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;

  sendPasswordReset(email)
    .then(() => {
      alert("Lien de réinitialisation envoyé à votre adresse email.");
      window.location.href = "/login.html";
    })
    .catch((error) => {
      alert("Erreur : " + error.message);
    });
});
