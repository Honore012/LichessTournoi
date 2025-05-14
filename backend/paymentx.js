import { db } from './firebase-admin.js';

const tournamentId = 'OQYWx9epQ9N3tRWJhmf5';
const email = 'comptepopolos@gmail.com';
const docId = `${tournamentId}_${email}`;

async function checkPayment() {
  try {
    // Vérification dans tournamentParticipants
    const participantDoc = await db.collection('tournamentParticipants').doc(docId).get();

    if (!participantDoc.exists) {
      console.log('❌ Participant non trouvé dans tournamentParticipants.');
    } else {
      console.log('✅ Participant trouvé dans tournamentParticipants :');
      console.log(participantDoc.data());
    }

    // Vérification dans tournaments
    const tournamentDoc = await db.collection('tournaments').doc(tournamentId).get();

    if (!tournamentDoc.exists) {
      console.log('❌ Tournoi non trouvé.');
    } else {
      const data = tournamentDoc.data();
      const paid = data.participants?.[email]?.paid;
      console.log(`Statut payé dans le tournoi : ${paid ? '✅ OUI' : '❌ NON'}`);
    }

  } catch (err) {
    console.error('Erreur lors de la vérification :', err.message);
  }
}

checkPayment();

