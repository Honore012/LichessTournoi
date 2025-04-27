import express from "express";
import fetch from "node-fetch";
import admin from "firebase-admin";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";

const router = express.Router();
const db = admin.firestore();
const ADMIN_EMAIL = "tongalazahonoricque@gmail.com";

router.post("/create", verifyFirebaseToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    if (userEmail !== ADMIN_EMAIL) {
      return res.status(403).json({ error: "Non autorisé." });
    }

    const { name, clockTime, clockIncrement, minutes, variant, password } = req.body;
    const response = await fetch("https://lichess.org/api/tournament", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LICHESS_API_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        clockTime,
        clockIncrement,
        minutes,
        variant,
        name,
        waitMinutes: "60",
        password
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: errorText });
    }

    const tournament = await response.json();

    await db.collection("tournaments").add({
      id: tournament.id,
      name: tournament.fullName,
      lichessUrl: `https://lichess.org/tournament/${tournament.id}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      minutes,
      clockTime,
      clockIncrement,
      variant,
      password, // enregistré pour vérification future
      createdBy: userEmail,
      status: "en attente"
    });

    res.json({ tournament });

  } catch (err) {
    console.error("Erreur création tournoi :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
