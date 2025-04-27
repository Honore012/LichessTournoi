import { registerUser } from "./auth.js";

document.getElementById("registerForm")?.addEventListener("submit", function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value.trim();

  if (!username || !email || !password) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  registerUser(email, password, username)
    .then((token) => {
      localStorage.setItem('firebase_token', token);
      alert("Inscription réussie ! Un lien de vérification a été envoyé à votre adresse e-mail.");
      window.location.href = "../login.html";
    })
    .catch((error) => {
      console.error("Erreur d'inscription :", error);
      alert("Erreur d'inscription : " + error.message);
    });
});
