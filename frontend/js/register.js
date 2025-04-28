import { registerUser } from "./auth.js";

document.getElementById("registerForm")?.addEventListener("submit", function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value.trim();

  if (!username || !email || !password) {
    Swal.fire({
      icon: 'warning',
      title: 'Champs manquants',
      text: 'Veuillez remplir tous les champs.',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  registerUser(email, password, username)
    .then((token) => {
      localStorage.setItem('firebase_token', token);
      // Suppression de l'alerte d'inscription réussie
      window.location.href = "../login.html";
    })
    .catch((error) => {
      console.error("Erreur d'inscription :", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur d\'inscription',
        text: error.message,
        confirmButtonColor: '#d33'
      });
    });
});
