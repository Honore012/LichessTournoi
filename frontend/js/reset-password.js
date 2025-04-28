import { sendPasswordReset } from "./auth.js";

document.getElementById("resetForm")?.addEventListener("submit", function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;

  sendPasswordReset(email)
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Lien envoyé',
        text: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
      }).then(() => {
        window.location.href = "/login.html";
      });
    })
    .catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message,
      });
    });
});
