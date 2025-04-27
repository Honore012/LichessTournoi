import { auth, db } from "./firebase-init.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const ADMIN_EMAIL = "tongalazahonoricque@gmail.com";
const userList = document.getElementById("userList");

onAuthStateChanged(auth, async (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    alert("Accès réservé à l’administrateur.");
    return;
  }

  const q = query(collection(db, "chat_index"), orderBy("timestamp", "desc"));
  onSnapshot(q, (snapshot) => {
    userList.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.innerHTML = `
  <div class="user-entry">
    <strong>${data.username}</strong>
    ${data.newMessages > 0 ? `<span class="badge">${data.newMessages}</span>` : ""}
    <br/>
    <small>${data.lastMessage || "(aucun message)"}</small> <br/>
    <button onclick="window.location.href='chat.html?uid=${data.uid}'">Ouvrir le chat</button>
  </div>
  <hr/>
`;
      userList.appendChild(div);
    });
  });
});
