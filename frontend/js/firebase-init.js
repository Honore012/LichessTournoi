import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Configuration Firebase fixe (pas besoin de fetch si tu la connais déjà)
const firebaseConfig = {
  apiKey: "AIzaSyBT2unSlkc9GpWGlDzu59-e0jia2yRyZiY",
  authDomain: "lichesstournoi-6b660.firebaseapp.com",
  projectId: "lichesstournoi-6b660",
  storageBucket: "lichesstournoi-6b660.firebasestorage.app",
  messagingSenderId: "261176648858",
  appId: "1:261176648858:web:0c1bd6a71216dd28d36b23",
  measurementId: "G-PCJVX80VT6"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export {
  app,
  analytics,
  auth,
  db,
  provider,
  signInWithPopup,
  onAuthStateChanged,
  firebaseConfig
};
