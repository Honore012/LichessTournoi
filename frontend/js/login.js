import { loginUser, googleSignIn } from "./auth.js";

document.getElementById("loginForm")?.addEventListener("submit", function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  loginUser(email, password)
    .then((token) => {
      localStorage.setItem('firebase_token', token);
      Swal.fire({
        icon: 'success',
        title: 'Connexion réussie !',
        confirmButtonColor: '#3085d6'
      }).then(() => {
        window.location.href = "../dashboard.html"; // Redirection vers le tableau de bord
      });
    })
    .catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Erreur de connexion',
        text: error.message,
        confirmButtonColor: '#d33'
      });
    });
});

document.getElementById("googleLoginBtn")?.addEventListener("click", function() {
  googleSignIn()
    .then((token) => {
      localStorage.setItem('firebase_token', token);
      Swal.fire({
        icon: 'success',
        title: 'Connexion Google réussie !',
        confirmButtonColor: '#3085d6'
      }).then(() => {
        window.location.href = "../dashboard.html";
      });
    })
    .catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Connexion Google refusée',
        text: error.message,
        confirmButtonColor: '#d33'
      });
    });
});
