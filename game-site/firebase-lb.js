// ─── FIREBASE GLOBAL LEADERBOARD ───
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, where, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCyK7tEcAaqrVNFRggviaEmWH2SMkiwGKk",
  authDomain: "calculator-81d08.firebaseapp.com",
  projectId: "calculator-81d08",
  storageBucket: "calculator-81d08.firebasestorage.app",
  messagingSenderId: "375406495739",
  appId: "1:375406495739:web:fd28553263599864426d5e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const LOWER_BETTER = ['reaction','minesweeper','memory','sudoku'];

window.FirebaseLB = {
  submit: async function(gameId, score, name) {
    try {
      name = name || (window.HallOfFame ? window.HallOfFame.getPlayerName() : 'Guest');
      await addDoc(collection(db, 'scores'), {
        gameId: gameId,
        name: name,
        score: score,
        date: new Date().toLocaleDateString(),
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.warn('Firebase submit failed:', e);
    }
  },

  getScores: async function(gameId, max) {
    max = max || 10;
    try {
      const dir = LOWER_BETTER.includes(gameId) ? 'asc' : 'desc';
      const q = query(
        collection(db, 'scores'),
        where('gameId', '==', gameId),
        orderBy('score', dir),
        limit(max)
      );
      const snap = await getDocs(q);
      var results = [];
      snap.forEach(function(doc) {
        var d = doc.data();
        results.push({ name: d.name, score: d.score, date: d.date || '' });
      });
      return results;
    } catch (e) {
      console.warn('Firebase getScores failed:', e);
      return [];
    }
  }
};

// ─── Override HallOfFame to also push to Firebase ───
(function() {
  if (!window.HallOfFame) return;

  var origSubmit = window.HallOfFame.submit.bind(window.HallOfFame);

  window.HallOfFame.submit = function(gameId, score) {
    // Still save locally
    var localResult = origSubmit(gameId, score);
    // Also push to Firebase
    window.FirebaseLB.submit(gameId, score);
    return localResult;
  };

  // Add global fetch method
  window.HallOfFame.getGlobalScores = function(gameId, max) {
    return window.FirebaseLB.getScores(gameId, max);
  };
})();
