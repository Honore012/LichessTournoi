import { auth, db } from "./firebase-init.js";
import {
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const messagesDiv = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const ADMIN_EMAIL = "tongalazahonoricque@gmail.com";
let currentUserUID = null;
let userIsAdmin = false;
let chatID = null;
const userCache = {};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Veuillez vous connecter pour accéder au chat.");
    return;
  }
  currentUserUID = user.uid;
  userIsAdmin = user.email === ADMIN_EMAIL;

  const params = new URLSearchParams(window.location.search);
  chatID = userIsAdmin ? params.get("uid") : currentUserUID;

  console.log("Utilisateur connecté :", user.email);
  console.log("UID actuel :", currentUserUID);
  console.log("Admin ? :", userIsAdmin);
  console.log("ChatID ciblé :", chatID);

  if (userIsAdmin && !chatID) {
    alert("Aucun UID spécifié dans l'URL.");
    return;
  }

  if (userIsAdmin) {
    const chatIndexRef = doc(db, "chat_index", chatID);
    await updateDoc(chatIndexRef, { newMessages: 0 });
  }

  listenForMessages();
});

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const messageText = messageInput.value.trim();
  if (!messageText || !chatID) return;

  console.log("Envoi du message :", messageText);

  const msg = {
    from: userIsAdmin ? "admin" : "user",
    fromUID: currentUserUID,
    text: messageText,
    timestamp: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "chats", chatID, "messages"), msg);
    console.log("Message ajouté dans Firestore");
  } catch (err) {
    console.error("Erreur lors de l'ajout du message :", err);
  }

  messageInput.value = "";

  try {
    const uidIndex = userIsAdmin ? chatID : currentUserUID;
    const username = await getUsername(uidIndex);
    console.log("Ajout dans chat_index :", uidIndex, username, messageText);
    await setDoc(doc(db, "chat_index", uidIndex), {
      uid: uidIndex,
      username: username,
      lastMessage: messageText,
      timestamp: serverTimestamp(),
      ...(userIsAdmin ? {} : { newMessages: increment(1) })
    }, { merge: true });
    console.log("Index mis à jour !");
  } catch (error) {
    console.error("Erreur lors de l'ajout à chat_index :", error);
  }
});

async function getUsername(uid) {
  if (userCache[uid]) return userCache[uid];
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const username = userDoc.data().username || "Utilisateur";
      userCache[uid] = username;
      return username;
    }
  } catch (err) {
    console.error("Erreur récupération nom :", err);
  }
  return "Admin";
}

function listenForMessages() {
  const q = query(collection(db, "chats", chatID, "messages"), orderBy("timestamp", "asc"));
  onSnapshot(q, async (snapshot) => {
    messagesDiv.innerHTML = "";
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const div = document.createElement("div");
      div.classList.add("message");

      const isCurrentUser = data.fromUID === currentUserUID;
      div.classList.add(isCurrentUser ? "sent" : "received");

      const username = await getUsername(data.fromUID);
      const nameDiv = document.createElement("div");
      nameDiv.classList.add("username");
      nameDiv.textContent = username;
      div.appendChild(nameDiv);

      const textDiv = document.createElement("div");
      textDiv.classList.add("text");
      textDiv.textContent = data.text;
      div.appendChild(textDiv);

      const timeContainer = document.createElement("div");
      timeContainer.classList.add("time-badge-container");

      if (data.timestamp?.toDate) {
        const timestamp = document.createElement("span");
        timestamp.classList.add("timestamp");
        const date = data.timestamp.toDate();
        timestamp.textContent = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        timeContainer.appendChild(timestamp);
      }

      if (isCurrentUser && !userIsAdmin) {
        const badge = document.createElement("span");
        badge.classList.add("badge-moi");
        badge.textContent = "Moi";
        timeContainer.appendChild(badge);
      }

      div.appendChild(timeContainer);
      messagesDiv.appendChild(div);
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}
