// ─── FIREBASE GLOBAL LEADERBOARD + AUTH ───
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, getDoc }
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

// ─── Password hashing (SHA-256) ───
async function hashPassword(pw) {
  var data = new TextEncoder().encode(pw + '_arcade_firebase_salt');
  var buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(function(b) {
    return b.toString(16).padStart(2, '0');
  }).join('');
}

// ─── Firebase Auth (username + password via Firestore) ───
window.FirebaseAuth = {
  signUp: async function(username, password) {
    try {
      var key = username.toLowerCase();
      var userDoc = await getDoc(doc(db, 'users', key));
      if (userDoc.exists()) return { ok: false, msg: 'Username already taken' };
      var hash = await hashPassword(password);
      await setDoc(doc(db, 'users', key), {
        username: username,
        hash: hash,
        createdAt: new Date().toLocaleDateString()
      });
      localStorage.setItem('arcade_currentUser', username);
      localStorage.setItem('arcadePlayerName', username);
      return { ok: true, username: username };
    } catch (e) {
      console.warn('Firebase signUp failed:', e);
      return { ok: false, msg: 'Sign up failed. Try again.' };
    }
  },

  signIn: async function(username, password) {
    try {
      var key = username.toLowerCase();
      var userDoc = await getDoc(doc(db, 'users', key));
      if (!userDoc.exists()) return { ok: false, msg: 'Username not found' };
      var data = userDoc.data();
      var hash = await hashPassword(password);
      if (hash !== data.hash) return { ok: false, msg: 'Wrong password' };
      var displayName = data.username || username;
      localStorage.setItem('arcade_currentUser', displayName);
      localStorage.setItem('arcadePlayerName', displayName);
      return { ok: true, username: displayName };
    } catch (e) {
      console.warn('Firebase signIn failed:', e);
      return { ok: false, msg: 'Sign in failed. Try again.' };
    }
  },

  signOut: function() {
    localStorage.removeItem('arcade_currentUser');
    localStorage.setItem('arcadePlayerName', 'Guest');
  },

  ready: true
};

// Notify auth.js that Firebase is ready
window.dispatchEvent(new CustomEvent('firebase-auth-ready'));

const LOWER_BETTER = ['reaction','minesweeper','memory','sudoku','nonogram','maze','20q','huesort','lightsout','pipes','ballsort','wordsearch','sliding','aim_classic','golf','crossword'];

window.FirebaseLB = {
  submit: async function(gameId, score, name) {
    name = name || (window.HallOfFame ? window.HallOfFame.getPlayerName() : localStorage.getItem('arcadePlayerName')) || 'Guest';
    // Use deterministic doc ID so each player has one entry per game
    var docId = gameId + '_' + name.toLowerCase();
    var docRef = doc(db, 'scores', docId);
    var existing = await getDoc(docRef);
    if (existing.exists()) {
      var old = existing.data().score;
      var lower = LOWER_BETTER.includes(gameId);
      var isBetter = lower ? score < old : score > old;
      if (!isBetter) return; // already have a better score
    }
    await setDoc(docRef, {
      gameId: gameId,
      name: name,
      score: score,
      date: new Date().toLocaleDateString()
    });
  },

  getScores: async function(gameId, max) {
    max = max || 10;
    try {
      const q = query(
        collection(db, 'scores'),
        where('gameId', '==', gameId)
      );
      const snap = await getDocs(q);
      var results = [];
      snap.forEach(function(d) {
        var data = d.data();
        results.push({ name: data.name, score: data.score, date: data.date || '' });
      });
      // Sort client-side (avoids needing composite Firestore index)
      var lower = LOWER_BETTER.includes(gameId);
      results.sort(function(a, b) {
        return lower ? a.score - b.score : b.score - a.score;
      });
      return results.slice(0, max);
    } catch (e) {
      console.warn('Firebase getScores failed:', e);
      return [];
    }
  }
};

// ─── One-time cleanup: delete corrupted Firebase streak entries (2P bug) ───
(async function() {
  if (localStorage.getItem('_fb_streak_fix_v1')) return;
  try {
    var name = (window.HallOfFame ? window.HallOfFame.getPlayerName() : localStorage.getItem('arcadePlayerName')) || 'Guest';
    var key = name.toLowerCase();
    var games = ['pong', 'tron', 'racer'];
    for (var i = 0; i < games.length; i++) {
      var docId = games[i] + '_' + key;
      var ref = doc(db, 'scores', docId);
      var snap = await getDoc(ref);
      if (snap.exists() && snap.data().score > 20) {
        // Score > 20 streak is almost certainly from the 2P bug
        await setDoc(ref, { gameId: games[i], name: name, score: 0, date: new Date().toLocaleDateString() });
      }
    }
  } catch (e) { console.warn('Firebase streak cleanup failed:', e); }
  localStorage.setItem('_fb_streak_fix_v1', '1');
})();

// ─── Override HallOfFame to also push to Firebase ───
function wrapHallOfFame() {
  if (!window.HallOfFame) return false;
  if (window.HallOfFame._firebaseWrapped) return true;

  var origSubmit = window.HallOfFame.submit.bind(window.HallOfFame);

  window.HallOfFame.submit = function(gameId, score) {
    // Still save locally
    var localResult = origSubmit(gameId, score);
    // Also push to Firebase
    window.FirebaseLB.submit(gameId, score).then(function() {
      console.log('[LB] Firebase submit OK:', gameId, score);
    }).catch(function(e) {
      console.warn('[LB] Firebase submit FAILED:', gameId, score, e);
    });
    return localResult;
  };
  window.HallOfFame._firebaseWrapped = true;

  // Add global fetch method
  window.HallOfFame.getGlobalScores = function(gameId, max) {
    return window.FirebaseLB.getScores(gameId, max);
  };
  console.log('[LB] Firebase wrapper installed');
  return true;
}

// Try immediately, then retry if HallOfFame isn't ready yet
if (!wrapHallOfFame()) {
  var _wrapRetry = setInterval(function() {
    if (wrapHallOfFame()) clearInterval(_wrapRetry);
  }, 200);
  setTimeout(function() { clearInterval(_wrapRetry); }, 5000);
}
