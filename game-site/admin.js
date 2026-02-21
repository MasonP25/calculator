// ─── ARCADE ADMIN CONSOLE COMMANDS ───
// Usage: Open browser DevTools (F12 / Inspect → Console) and type commands like:
//   ArcadeAdmin.setCoins('mason', 9999)
//   ArcadeAdmin.giveAllItems('mason')
//   ArcadeAdmin.setScore('snake', 'mason', 500)
//   ArcadeAdmin.setEquipped('mason', { hat: 'hat_crown', nametagColor: 'nt_rainbow' })
//   ArcadeAdmin.listItems()  — shows all item IDs
//   ArcadeAdmin.listUsers()  — lists users in Firebase

(function () {
  'use strict';

  var _db = null;
  var _doc = null;
  var _getDoc = null;
  var _setDoc = null;
  var _collection = null;
  var _getDocs = null;
  var _query = null;
  var _limit = null;

  function _initFirebase() {
    if (_db) return Promise.resolve();
    return Promise.all([
      import("https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js")
    ]).then(function (modules) {
      var initializeApp = modules[0].initializeApp;
      var getApp = modules[0].getApp;
      var getFirestore = modules[1].getFirestore;
      _doc = modules[1].doc;
      _getDoc = modules[1].getDoc;
      _setDoc = modules[1].setDoc;
      _collection = modules[1].collection;
      _getDocs = modules[1].getDocs;
      _query = modules[1].query;
      _limit = modules[1].limit;

      var config = {
        apiKey: "AIzaSyCyK7tEcAaqrVNFRggviaEmWH2SMkiwGKk",
        authDomain: "calculator-81d08.firebaseapp.com",
        projectId: "calculator-81d08",
        storageBucket: "calculator-81d08.firebasestorage.app",
        messagingSenderId: "375406495739",
        appId: "1:375406495739:web:fd28553263599864426d5e"
      };

      try {
        var app = getApp('admin-app');
        _db = getFirestore(app);
      } catch (e) {
        try {
          var app = initializeApp(config, 'admin-app');
          _db = getFirestore(app);
        } catch (e2) {
          var app = initializeApp(config, 'admin-app-' + Date.now());
          _db = getFirestore(app);
        }
      }
    });
  }

  window.ArcadeAdmin = {
    // ── Set a user's coin balance ──
    setCoins: function (username, amount) {
      if (!username) return console.error('[Admin] Username required');
      amount = parseInt(amount) || 0;
      return _initFirebase().then(function () {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function (snap) {
          var data = snap.exists() ? snap.data() : { username: username };
          data.coins = amount;
          return _setDoc(docRef, data).then(function () {
            console.log('[Admin] Set ' + username + ' coins to ' + amount);
            // Update local state if it's the current user
            if (window.ArcadeCoins) window.ArcadeCoins.reload();
          });
        });
      });
    },

    // ── Add coins to a user ──
    addCoins: function (username, amount) {
      if (!username) return console.error('[Admin] Username required');
      amount = parseInt(amount) || 0;
      return _initFirebase().then(function () {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function (snap) {
          var data = snap.exists() ? snap.data() : { username: username };
          data.coins = (data.coins || 0) + amount;
          return _setDoc(docRef, data).then(function () {
            console.log('[Admin] Added ' + amount + ' coins to ' + username + ' → ' + data.coins);
            if (window.ArcadeCoins) window.ArcadeCoins.reload();
          });
        });
      });
    },

    // ── Give a specific item to a user ──
    giveItem: function (username, itemId) {
      if (!username || !itemId) return console.error('[Admin] Username and itemId required');
      return _initFirebase().then(function () {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function (snap) {
          var data = snap.exists() ? snap.data() : { username: username };
          if (!data.inventory) data.inventory = [];
          if (data.inventory.indexOf(itemId) === -1) {
            data.inventory.push(itemId);
          }
          return _setDoc(docRef, data).then(function () {
            console.log('[Admin] Gave ' + itemId + ' to ' + username);
            if (window.ArcadeCoins) window.ArcadeCoins.reload();
          });
        });
      });
    },

    // ── Give ALL items to a user ──
    giveAllItems: function (username) {
      if (!username) return console.error('[Admin] Username required');
      var allItems = [];
      if (window.ArcadeAvatar) {
        var ITEMS = window.ArcadeAvatar.ITEMS;
        var NAMETAGS = window.ArcadeAvatar.NAMETAGS;
        var SKINS = window.ArcadeAvatar.SKIN_COLORS;
        Object.keys(ITEMS).forEach(function (id) { allItems.push(id); });
        Object.keys(NAMETAGS).forEach(function (id) { allItems.push(id); });
        if (SKINS) {
          Object.keys(SKINS).forEach(function (id) {
            if (SKINS[id].price > 0) allItems.push(id);
          });
        }
      }
      return _initFirebase().then(function () {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function (snap) {
          var data = snap.exists() ? snap.data() : { username: username };
          data.inventory = allItems;
          return _setDoc(docRef, data).then(function () {
            console.log('[Admin] Gave ALL ' + allItems.length + ' items to ' + username);
            if (window.ArcadeCoins) window.ArcadeCoins.reload();
          });
        });
      });
    },

    // ── Set equipped items for a user ──
    // Usage: ArcadeAdmin.setEquipped('mason', { hat: 'hat_crown', nametagColor: 'nt_rainbow', skin: 'skin_red' })
    setEquipped: function (username, equippedObj) {
      if (!username || !equippedObj) return console.error('[Admin] Username and equipped object required');
      return _initFirebase().then(function () {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function (snap) {
          var data = snap.exists() ? snap.data() : { username: username };
          if (!data.equipped) data.equipped = {};
          Object.keys(equippedObj).forEach(function (k) {
            data.equipped[k] = equippedObj[k];
          });
          return _setDoc(docRef, data).then(function () {
            console.log('[Admin] Updated equipped for ' + username + ':', data.equipped);
            if (window.ArcadeCoins) window.ArcadeCoins.reload();
          });
        });
      });
    },

    // ── Set a leaderboard score ──
    // Usage: ArcadeAdmin.setScore('snake', 'mason', 9999)
    setScore: function (gameId, name, score) {
      if (!gameId || !name) return console.error('[Admin] gameId and name required');
      score = parseInt(score) || 0;
      return _initFirebase().then(function () {
        var docRef = _doc(_db, 'scores', gameId + '_' + name.toLowerCase());
        return _setDoc(docRef, {
          gameId: gameId,
          name: name,
          score: score,
          date: new Date().toLocaleDateString()
        }).then(function () {
          console.log('[Admin] Set ' + name + ' score on ' + gameId + ' to ' + score);
        });
      });
    },

    // ── Delete a leaderboard entry ──
    deleteScore: function (gameId, name) {
      if (!gameId || !name) return console.error('[Admin] gameId and name required');
      return _initFirebase().then(function () {
        return import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js").then(function (mod) {
          var deleteDoc = mod.deleteDoc;
          var docRef = _doc(_db, 'scores', gameId + '_' + name.toLowerCase());
          return deleteDoc(docRef).then(function () {
            console.log('[Admin] Deleted score for ' + name + ' on ' + gameId);
          });
        });
      });
    },

    // ── View a user's full profile ──
    viewUser: function (username) {
      if (!username) return console.error('[Admin] Username required');
      return _initFirebase().then(function () {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function (snap) {
          if (snap.exists()) {
            console.log('[Admin] Profile for ' + username + ':', JSON.stringify(snap.data(), null, 2));
            return snap.data();
          } else {
            console.log('[Admin] User ' + username + ' not found');
            return null;
          }
        });
      });
    },

    // ── List all available item IDs ──
    listItems: function () {
      if (!window.ArcadeAvatar) return console.error('[Admin] ArcadeAvatar not loaded');
      console.log('── Avatar Items ──');
      Object.keys(window.ArcadeAvatar.ITEMS).forEach(function (id) {
        var item = window.ArcadeAvatar.ITEMS[id];
        console.log('  ' + id + ' — ' + item.name + ' (' + item.category + ', ' + item.price + ' coins)');
      });
      console.log('── Nametag Styles ──');
      Object.keys(window.ArcadeAvatar.NAMETAGS).forEach(function (id) {
        var nt = window.ArcadeAvatar.NAMETAGS[id];
        console.log('  ' + id + ' — ' + nt.name + ' (' + nt.type + ', ' + nt.price + ' coins)');
      });
      if (window.ArcadeAvatar.SKIN_COLORS) {
        console.log('── Skin Colors ──');
        Object.keys(window.ArcadeAvatar.SKIN_COLORS).forEach(function (id) {
          var s = window.ArcadeAvatar.SKIN_COLORS[id];
          console.log('  ' + id + ' — ' + s.name + ' (' + (s.price === 0 ? 'Free' : s.price + ' coins') + ')');
        });
      }
    },

    // ── Unlock all exclusive items for a user ──
    unlockExclusives: function (username) {
      if (!username) return console.error('[Admin] Username required');
      var exclusiveItems = [];
      if (window.ArcadeAvatar) {
        var ITEMS = window.ArcadeAvatar.ITEMS || {};
        var NAMETAGS = window.ArcadeAvatar.NAMETAGS || {};
        Object.keys(ITEMS).forEach(function (id) {
          if (ITEMS[id].exclusive) exclusiveItems.push(id);
        });
        Object.keys(NAMETAGS).forEach(function (id) {
          if (NAMETAGS[id].exclusive) exclusiveItems.push(id);
        });
      }
      if (exclusiveItems.length === 0) return console.error('[Admin] No exclusive items found');
      return _initFirebase().then(function () {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function (snap) {
          var data = snap.exists() ? snap.data() : { username: username };
          if (!data.inventory) data.inventory = [];
          exclusiveItems.forEach(function (id) {
            if (data.inventory.indexOf(id) === -1) data.inventory.push(id);
          });
          return _setDoc(docRef, data).then(function () {
            console.log('[Admin] Unlocked ' + exclusiveItems.length + ' exclusive items for ' + username + ':');
            exclusiveItems.forEach(function (id) { console.log('  → ' + id); });
            if (window.ArcadeCoins) window.ArcadeCoins.reload();
          });
        });
      });
    },

    // ── Quick help ──
    help: function () {
      console.log(
        '── ArcadeAdmin Commands ──\n' +
        '  ArcadeAdmin.setCoins("user", 9999)         — Set coin balance\n' +
        '  ArcadeAdmin.addCoins("user", 500)           — Add coins\n' +
        '  ArcadeAdmin.giveItem("user", "hat_crown")   — Give one item\n' +
        '  ArcadeAdmin.giveAllItems("user")            — Give ALL items\n' +
        '  ArcadeAdmin.unlockExclusives("user")        — Give all EXCLUSIVE items\n' +
        '  ArcadeAdmin.setEquipped("user", {hat:"hat_crown"}) — Set equipped\n' +
        '  ArcadeAdmin.setScore("snake", "user", 9999) — Set leaderboard score\n' +
        '  ArcadeAdmin.deleteScore("snake", "user")    — Delete a score\n' +
        '  ArcadeAdmin.viewUser("user")                — View full profile\n' +
        '  ArcadeAdmin.listItems()                     — List all item IDs\n' +
        '  ArcadeAdmin.help()                          — Show this help'
      );
    }
  };
})();
