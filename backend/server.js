import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// Résolution du chemin pour __dirname dans les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du frontend
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Routes API
import authRoutes from './routes/authRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import paymentsRoutes from './routes/payments.js';
import ipnRoutes from './routes/ipn.js';

app.use('/api', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/nowpayments/ipn', ipnRoutes);

// Route spéciale pour afficher la page des tournois
app.get('/tournaments', (req, res) => {
  res.sendFile(path.join(frontendPath, 'tournaments.html'));
});

// Route de base (accueil)
app.get('/', (req, res) => {
  res.send('Bienvenue sur le backend LichessTournoi !');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur backend lancé sur http://localhost:${PORT}`);
});
