import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// Résolution du chemin pour __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== IPN route — placée AVANT express.json() pour éviter les erreurs =====
import ipnRoutes from './routes/ipn.js';
app.use('/api/ipn', ipnRoutes);

// Middlewares globaux
app.use(cors());
app.use(express.json()); // Placé après IPN

// Servir les fichiers statiques du frontend
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Corriger le MIME type pour le CSS
app.get('/css/style.css', (req, res) => {
  res.type('text/css');
  res.sendFile(path.join(frontendPath, 'css', 'style.css'));
});

// ===== Autres routes API =====
import authRoutes from './routes/authRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import paymentsRoutes from './routes/payments.js';

app.use('/api', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/payments', paymentsRoutes);

// Route spéciale pour les tournois
app.get('/tournaments', (req, res) => {
  res.sendFile(path.join(frontendPath, 'tournaments.html'));
});

// Accueil
app.get('/', (req, res) => {
  res.send('Bienvenue sur le backend LichessTournoi !');
});

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur backend lancé sur http://localhost:${PORT}`);
});
