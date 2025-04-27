import { loginUser, googleSignIn } from "./auth.js";

document.getElementById("loginForm")?.addEventListener("submit", function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  loginUser(email, password)
    .then((token) => {
      localStorage.setItem('firebase_token', token);
      alert("Connexion réussie !");
      window.location.href = "../dashboard.html"; // Redirection vers le tableau de bord
    })
    .catch((error) => {
      alert("Erreur de connexion : " + error.message);
    });
});

document.getElementById("googleLoginBtn")?.addEventListener("click", function() {
  googleSignIn()
    .then((token) => {
      localStorage.setItem('firebase_token', token);
      alert("Connexion Google réussie !");
      window.location.href = "../dashboard.html";
    })
    .catch((error) => {
      alert("Connexion refusée : " + error.message);
    });
});
