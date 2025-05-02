// backend/routes/tournamentRoutes.js

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

    const {
      name,
      clockTime,
      clockIncrement,
      minutes,
      variant,
      password,
      startTime
    } = req.body;

    const startTimeDate = new Date(startTime);
    const now = new Date();
    const waitMinutes = Math.max(Math.ceil((startTimeDate - now) / 60000), 0);

    const response = await fetch("https://lichess.org/api/tournament", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LICHESS_API_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        name,
        clockTime,
        clockIncrement,
        minutes,
        variant,
        password,
        waitMinutes: waitMinutes.toString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: errorText });
    }

    const tournament = await response.json();

    const startDate = startTimeDate.getTime()
      ? admin.firestore.Timestamp.fromDate(startTimeDate)
      : admin.firestore.FieldValue.serverTimestamp();

    await db.collection("tournaments").add({
      id: tournament.id,
      name: tournament.fullName,
      lichessUrl: `https://lichess.org/tournament/${tournament.id}`,
      startDate,
      minutes,
      clockTime,
      clockIncrement,
      variant,
      password,
      createdBy: userEmail,
      status: "en attente"
    });

    res.json({ tournament });

  } catch (err) {
    console.error("Erreur création tournoi :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("tournaments").orderBy("startDate", "desc").get();
    const tournaments = snapshot.docs.map(doc => ({
      ...doc.data(),
      startDate: doc.data().startDate.toDate()
    }));
    res.json(tournaments);
  } catch (err) {
    console.error("Erreur récupération tournois :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
