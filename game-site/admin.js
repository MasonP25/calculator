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

  // Game name → id lookup (so admin can type either)
  var _gameNames = {
    'snake':'snake','pong':'pong','tron':'tron','tank battle':'tanks','space race':'racer',
    'connect four':'connect4','connect 4':'connect4','reaction time':'reaction','tetris':'tetris',
    'breakout':'breakout','2048':'2048','minesweeper':'minesweeper','flappy bird':'flappy',
    'asteroids':'asteroids','memory match':'memory','wordle':'wordle','doodle jump':'doodle',
    'typing test':'typing','sudoku':'sudoku','connections':'connections','hangman':'hangman',
    'simon says':'simon','gravity run':'gravity','chess':'chess','checkers':'checkers',
    'platformer':'platformer','piano tiles':'tiles','crossy road':'crossy','space invaders':'invaders',
    'aim (classic)':'aim_classic','aim classic':'aim_classic','aim (speed)':'aim_speed','aim speed':'aim_speed',
    'aim (precision)':'aim_precision','aim precision':'aim_precision','battleship':'battleship',
    'whack-a-mole':'whack','whack a mole':'whack','sliding puzzle':'sliding','stack tower':'stack',
    'word search':'wordsearch','geometry dash':'geodash','rock paper scissors':'rps',
    'pac-man':'pacman','pacman':'pacman','solitaire':'solitaire','color flood':'flood',
    'bubble shooter':'bubbles','uno':'uno','wavelength':'wavelength','tic tac toe':'tictactoe',
    'wordscapes':'wordscapes','match 3':'match3','nonogram':'nonogram','fruit slicer':'fruit',
    'maze runner':'maze','20 questions':'20q','hue sort':'huesort','lights out':'lightsout',
    'pipe puzzle':'pipes','ball sort':'ballsort','snake.io':'snakeio','hole.io':'holeio',
    'idle miner':'idleminer','color switch':'colorswitch','duck hunt':'duckhunt',
    'tower defense':'td','bullet dodge':'bulletdodge','penguin knockout':'penguin',
    'imposter':'imposter','rhythm':'rhythm','mini golf':'golf','dino runner':'dino',
    'galaga':'galaga','crossword':'crossword','block blast':'blockblast',
    'stickman hook':'stickmanhook','paper.io':'paperio','fruit merge':'fruitmerge',
    'pool':'pool','sand fall':'sandfall','dots & boxes':'dotsboxes','dots and boxes':'dotsboxes',
    'helicopter':'helicopter',
    'run 3':'run3','run3':'run3','drift hunters':'drifthunters','snow rider':'snowrider',
    'snow rider 3d':'snowrider','subway surfers':'subway','slope':'slope',
    'champion island':'championisland',
    'fnaf':'fnaf','five nights at freddys':'fnaf',
    'five nights':'fnaf','minecraft':'minecraft','eaglercraft':'minecraft',
    'hextris':'hextris','spelunky':'spelunky',
    'fnf':'fnf','friday night funkin':'fnf','friday night':'fnf',
    'astray':'astray','maze':'astray',
    'mortal kombat':'mkjs','mk':'mkjs','0hh1':'0hh1','0h h1':'0hh1',
    'slime farmer':'slimefarmer','slime':'slimefarmer','clumsy bird':'clumsybird',
    'biz tycoon':'biztycoon','business tycoon':'biztycoon','tycoon':'biztycoon',
    'worlds hardest game':'worldhardest','world hardest game':'worldhardest',
  };

  function _resolveGameId(input) {
    if (!input) return input;
    var lower = input.toLowerCase().trim();
    // Direct match (already an id)
    if (_gameNames[lower] || lower.match(/^[a-z0-9_]+$/)) return _gameNames[lower] || lower;
    // Fuzzy: check if any name starts with input
    for (var name in _gameNames) {
      if (name.indexOf(lower) === 0) return _gameNames[name];
    }
    return input;
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
    // Also accepts game names: ArcadeAdmin.setScore('Doodle Jump', 'mason', 9999)
    setScore: function (gameId, name, score) {
      if (!gameId || !name) return console.error('[Admin] gameId and name required');
      // Try to resolve game name to game id
      gameId = _resolveGameId(gameId);
      score = parseInt(score) || 0;
      return _initFirebase().then(function () {
        var docRef = _doc(_db, 'scores', gameId + '_' + name.toLowerCase());
        return _setDoc(docRef, {
          gameId: gameId,
          name: name,
          score: score,
          date: new Date().toLocaleDateString()
        }).then(function () {
          // Also update local leaderboard
          try {
            var key = 'hallOfFame_' + gameId;
            var list = JSON.parse(localStorage.getItem(key) || '[]');
            list = list.filter(function(e) { return e.name !== name; });
            list.push({ name: name, score: score, date: new Date().toLocaleDateString() });
            var lowerBetter = ['reaction','minesweeper','memory','sudoku','nonogram','maze','20q','huesort','lightsout','pipes','ballsort','wordsearch','sliding','aim_classic','golf','crossword'];
            var lower = lowerBetter.indexOf(gameId) !== -1;
            list.sort(function(a, b) { return lower ? a.score - b.score : b.score - a.score; });
            list = list.slice(0, 10);
            localStorage.setItem(key, JSON.stringify(list));
          } catch(e) {}
          console.log('[Admin] Set ' + name + ' score on ' + gameId + ' to ' + score);
        });
      });
    },

    // ── Delete a leaderboard entry ──
    deleteScore: function (gameId, name) {
      if (!gameId || !name) return console.error('[Admin] gameId and name required');
      gameId = _resolveGameId(gameId);
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

    // ── Give a badge to a user ──
    giveBadge: function (username, badgeId) {
      if (!username || !badgeId) return console.error('[Admin] Username and badgeId required');
      return _initFirebase().then(function () {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function (snap) {
          var data = snap.exists() ? snap.data() : { username: username };
          if (!data.badges) data.badges = [];
          if (data.badges.indexOf(badgeId) === -1) {
            data.badges.push(badgeId);
          }
          return _setDoc(docRef, data).then(function () {
            console.log('[Admin] Gave badge ' + badgeId + ' to ' + username);
          });
        });
      });
    },

    // ── Reset all badges for a user ──
    resetBadges: function (username) {
      if (!username) return console.error('[Admin] Username required');
      return _initFirebase().then(function () {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function (snap) {
          var data = snap.exists() ? snap.data() : { username: username };
          data.badges = [];
          data.badgeProgress = {};
          return _setDoc(docRef, data).then(function () {
            console.log('[Admin] Reset all badges and progress for ' + username);
          });
        });
      });
    },

    // ── Add a friend for a user (bypass request) ──
    addFriend: function (username, friendName) {
      if (!username || !friendName) return console.error('[Admin] Both usernames required');
      return _initFirebase().then(function () {
        var key1 = username.toLowerCase();
        var key2 = friendName.toLowerCase();
        var ref1 = _doc(_db, 'users', key1);
        var ref2 = _doc(_db, 'users', key2);
        return Promise.all([_getDoc(ref1), _getDoc(ref2)]).then(function (snaps) {
          var data1 = snaps[0].exists() ? snaps[0].data() : null;
          var data2 = snaps[1].exists() ? snaps[1].data() : null;
          if (!data1 || !data2) return console.error('[Admin] One or both users not found');
          if (!data1.friends) data1.friends = [];
          if (!data2.friends) data2.friends = [];
          if (data1.friends.indexOf(key2) === -1) data1.friends.push(key2);
          if (data2.friends.indexOf(key1) === -1) data2.friends.push(key1);
          return Promise.all([_setDoc(ref1, data1), _setDoc(ref2, data2)]).then(function () {
            console.log('[Admin] ' + username + ' and ' + friendName + ' are now friends');
          });
        });
      });
    },

    // ── View friend requests for a user ──
    viewRequests: function (username) {
      if (!username) return console.error('[Admin] Username required');
      return _initFirebase().then(function () {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function (snap) {
          if (!snap.exists()) return console.log('[Admin] User not found');
          var data = snap.data();
          console.log('[Admin] Friend data for ' + username + ':');
          console.log('  Friends:', (data.friends || []).join(', ') || 'none');
          console.log('  Sent requests:', (data.friendRequestsSent || []).join(', ') || 'none');
          console.log('  Received requests:', (data.friendRequestsReceived || []).join(', ') || 'none');
          console.log('  Badges:', (data.badges || []).join(', ') || 'none');
        });
      });
    },

    // ── List all badge IDs ──
    listBadges: function () {
      if (window.ArcadeBadges && window.ArcadeBadges.BADGES) {
        console.log('── All Badges ──');
        window.ArcadeBadges.BADGES.forEach(function (b) {
          console.log('  ' + b.id + ' — ' + b.icon + ' ' + b.name + ': ' + b.desc);
        });
      } else {
        console.error('[Admin] ArcadeBadges not loaded');
      }
    },

    // ── Quick help ──
    // ─── XP / Level Commands ───
    setXP: function(username, amount) {
      if (!username) return console.error('[Admin] Username required');
      amount = parseInt(amount) || 0;
      return _initFirebase().then(function() {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function(snap) {
          var data = snap.exists() ? snap.data() : { username: username };
          data.xp = amount;
          data.level = Math.floor(Math.sqrt(amount / 25));
          return _setDoc(docRef, data).then(function() {
            console.log('[Admin] Set ' + username + ' XP to ' + amount + ' (Level ' + data.level + ')');
          });
        });
      });
    },

    addXP: function(username, amount) {
      if (!username) return console.error('[Admin] Username required');
      amount = parseInt(amount) || 0;
      return _initFirebase().then(function() {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function(snap) {
          var data = snap.exists() ? snap.data() : { username: username };
          data.xp = (data.xp || 0) + amount;
          data.level = Math.floor(Math.sqrt(data.xp / 25));
          return _setDoc(docRef, data).then(function() {
            console.log('[Admin] Added ' + amount + ' XP to ' + username + ' (now ' + data.xp + ', Level ' + data.level + ')');
          });
        });
      });
    },

    setLevel: function(username, level) {
      if (!username) return console.error('[Admin] Username required');
      level = parseInt(level) || 0;
      var xp = level * level * 25;
      return _initFirebase().then(function() {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function(snap) {
          var data = snap.exists() ? snap.data() : { username: username };
          data.xp = xp;
          data.level = level;
          return _setDoc(docRef, data).then(function() {
            console.log('[Admin] Set ' + username + ' to Level ' + level + ' (' + xp + ' XP)');
          });
        });
      });
    },

    // ─── Notification Commands ───
    pushNotif: function(username, title, body) {
      if (!username) return console.error('[Admin] Username required');
      return _initFirebase().then(function() {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function(snap) {
          var data = snap.exists() ? snap.data() : { username: username };
          if (!data.notifications) data.notifications = [];
          data.notifications.unshift({
            id: 'admin_' + Date.now(), type: 'general',
            title: title || 'Admin Notice', body: body || '', icon: '📢',
            read: false, time: Date.now(), link: null, data: null
          });
          if (data.notifications.length > 20) data.notifications = data.notifications.slice(0, 20);
          return _setDoc(docRef, data).then(function() {
            console.log('[Admin] Pushed notification to ' + username);
          });
        });
      });
    },

    clearNotifs: function(username) {
      if (!username) return console.error('[Admin] Username required');
      return _initFirebase().then(function() {
        var key = username.toLowerCase();
        var docRef = _doc(_db, 'users', key);
        return _getDoc(docRef).then(function(snap) {
          var data = snap.exists() ? snap.data() : { username: username };
          data.notifications = [];
          return _setDoc(docRef, data).then(function() {
            console.log('[Admin] Cleared all notifications for ' + username);
          });
        });
      });
    },

    // ─── Trade Commands ───
    viewTrades: function(username) {
      if (!username) return console.error('[Admin] Username required');
      return _initFirebase().then(function() {
        var key = username.toLowerCase();
        return _getDoc(_doc(_db, 'users', key)).then(function(snap) {
          if (!snap.exists()) return console.log('[Admin] User not found');
          var ids = snap.data().pendingTradeIds || [];
          if (ids.length === 0) return console.log('[Admin] No pending trades');
          var promises = ids.map(function(id) {
            return _getDoc(_doc(_db, 'trades', id)).then(function(tSnap) {
              if (tSnap.exists()) {
                var t = tSnap.data();
                console.log('[Trade] ' + t.id + ': ' + t.fromUser + ' → ' + t.toUser +
                  ' | Status: ' + t.status + ' | Offer: ' + t.offeredItems.join(', ') +
                  ' | Want: ' + t.requestedItems.join(', '));
              }
            });
          });
          return Promise.all(promises);
        });
      });
    },

    adminGift: function(fromUser, toUser, itemId) {
      if (!fromUser || !toUser || !itemId) return console.error('[Admin] fromUser, toUser, and itemId required');
      return _initFirebase().then(function() {
        var fRef = _doc(_db, 'users', fromUser.toLowerCase());
        var tRef = _doc(_db, 'users', toUser.toLowerCase());
        return Promise.all([_getDoc(fRef), _getDoc(tRef)]).then(function(snaps) {
          var fData = snaps[0].exists() ? snaps[0].data() : null;
          var tData = snaps[1].exists() ? snaps[1].data() : null;
          if (!fData || !tData) return console.error('[Admin] User not found');
          fData.inventory = (fData.inventory || []).filter(function(i) { return i !== itemId; });
          if (!tData.inventory) tData.inventory = [];
          if (tData.inventory.indexOf(itemId) === -1) tData.inventory.push(itemId);
          return Promise.all([_setDoc(fRef, fData), _setDoc(tRef, tData)]).then(function() {
            console.log('[Admin] Gifted ' + itemId + ' from ' + fromUser + ' to ' + toUser);
          });
        });
      });
    },

    adminGiftCoins: function(fromUser, toUser, amount) {
      if (!fromUser || !toUser) return console.error('[Admin] fromUser and toUser required');
      amount = parseInt(amount) || 0;
      return _initFirebase().then(function() {
        var fRef = _doc(_db, 'users', fromUser.toLowerCase());
        var tRef = _doc(_db, 'users', toUser.toLowerCase());
        return Promise.all([_getDoc(fRef), _getDoc(tRef)]).then(function(snaps) {
          var fData = snaps[0].exists() ? snaps[0].data() : null;
          var tData = snaps[1].exists() ? snaps[1].data() : null;
          if (!fData || !tData) return console.error('[Admin] User not found');
          fData.coins = (fData.coins || 0) - amount;
          tData.coins = (tData.coins || 0) + amount;
          return Promise.all([_setDoc(fRef, fData), _setDoc(tRef, tData)]).then(function() {
            console.log('[Admin] Gifted ' + amount + ' coins from ' + fromUser + ' to ' + toUser);
          });
        });
      });
    },

    // ─── NEW: Challenges/Activity/Ratings/Casino/Profile admin ───
    resetChallenge: function(user) {
      return _initFirebase().then(function() {
        return _setDoc(_doc(_db, 'users', user.toLowerCase()), { dailyChallenge: {} }, { merge: true }).then(function() {
          console.log('[Admin] Reset daily challenge for ' + user);
        });
      });
    },

    resetQuests: function(user) {
      return _initFirebase().then(function() {
        return _setDoc(_doc(_db, 'users', user.toLowerCase()), { weeklyQuests: {} }, { merge: true }).then(function() {
          console.log('[Admin] Reset weekly quests for ' + user);
        });
      });
    },

    viewRatings: function(gameId) {
      return _initFirebase().then(function() {
        var q = _query(_collection(_db, 'ratings'), _limit(50));
        return _getDocs(q).then(function(snap) {
          var results = [];
          snap.forEach(function(d) {
            var data = d.data();
            if (!gameId || data.gameId === gameId) {
              results.push({ gameId: data.gameId, user: data.username, rating: data.rating, review: data.review || '' });
            }
          });
          console.table(results);
        });
      });
    },

    deleteRating: function(gameId, user) {
      return _initFirebase().then(function() {
        var docId = gameId + '_' + user.toLowerCase();
        return _setDoc(_doc(_db, 'ratings', docId), { deleted: true }).then(function() {
          console.log('[Admin] Deleted rating for ' + gameId + ' by ' + user);
        });
      });
    },

    setBio: function(user, text) {
      return _initFirebase().then(function() {
        return _setDoc(_doc(_db, 'users', user.toLowerCase()), { bio: (text || '').substring(0, 150) }, { merge: true }).then(function() {
          console.log('[Admin] Set bio for ' + user);
        });
      });
    },

    setBanner: function(user, banner) {
      return _initFirebase().then(function() {
        return _setDoc(_doc(_db, 'users', user.toLowerCase()), { banner: banner }, { merge: true }).then(function() {
          console.log('[Admin] Set banner for ' + user + ' to ' + banner);
        });
      });
    },

    setCasinoStats: function(user, stats) {
      return _initFirebase().then(function() {
        return _setDoc(_doc(_db, 'users', user.toLowerCase()), { casinoStats: stats }, { merge: true }).then(function() {
          console.log('[Admin] Set casino stats for ' + user);
        });
      });
    },

    postActivity: function(type, user, data) {
      if (window.ArcadeActivity) {
        window.ArcadeActivity.post(type, data || {});
        console.log('[Admin] Posted activity: ' + type);
      }
    },

    // ── Ban a user by username + device fingerprint ──
    ban: function(username, reason) {
      if (!username) return console.error('[Admin] Username required');
      reason = reason || 'No reason given';
      return _initFirebase().then(function() {
        return import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js").then(function(mod) {
          var where = mod.where;
          var key = username.toLowerCase();
          var docRef = _doc(_db, 'users', key);
          return _getDoc(docRef).then(function(snap) {
            if (!snap.exists()) return console.error('[Admin] User "' + username + '" not found');
            var data = snap.data();
            var fp = data.fingerprint || null;
            // Mark user as banned
            return _setDoc(docRef, { banned: true, banReason: reason }, { merge: true }).then(function() {
              console.log('[Admin] Marked ' + username + ' as banned');
              // Add fingerprint to bans collection
              if (fp) {
                return _setDoc(_doc(_db, 'bans', fp), {
                  fingerprint: fp,
                  username: username,
                  reason: reason,
                  bannedAt: Date.now(),
                  bannedBy: 'admin'
                }).then(function() {
                  console.log('[Admin] Banned device fingerprint: ' + fp);
                  console.log('[Admin] ✓ ' + username + ' is now banned. Reason: ' + reason);
                });
              } else {
                console.warn('[Admin] No device fingerprint on record for ' + username + ' — username banned but device not yet fingerprinted. They will be device-banned on next visit.');
                console.log('[Admin] ✓ ' + username + ' is now banned. Reason: ' + reason);
              }
            });
          });
        });
      });
    },

    // ── Unban a user ──
    unban: function(username) {
      if (!username) return console.error('[Admin] Username required');
      return _initFirebase().then(function() {
        return import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js").then(function(mod) {
          var deleteDoc = mod.deleteDoc;
          var where = mod.where;
          var key = username.toLowerCase();
          var docRef = _doc(_db, 'users', key);
          return _getDoc(docRef).then(function(snap) {
            if (!snap.exists()) return console.error('[Admin] User "' + username + '" not found');
            var data = snap.data();
            var fp = data.fingerprint || null;
            // Remove banned flag
            return _setDoc(docRef, { banned: false, banReason: '' }, { merge: true }).then(function() {
              console.log('[Admin] Removed ban flag from ' + username);
              // Remove fingerprint from bans collection
              if (fp) {
                return deleteDoc(_doc(_db, 'bans', fp)).then(function() {
                  console.log('[Admin] Removed device fingerprint ban');
                  console.log('[Admin] ✓ ' + username + ' is now unbanned');
                }).catch(function() {
                  console.log('[Admin] ✓ ' + username + ' is now unbanned (no fingerprint ban found)');
                });
              } else {
                console.log('[Admin] ✓ ' + username + ' is now unbanned');
              }
            });
          });
        });
      });
    },

    // ── List all bans ──
    listBans: function() {
      return _initFirebase().then(function() {
        return _getDocs(_collection(_db, 'bans')).then(function(snap) {
          if (snap.empty) return console.log('[Admin] No bans found');
          var bans = [];
          snap.forEach(function(d) { bans.push(d.data()); });
          console.table(bans.map(function(b) {
            return {
              username: b.username,
              reason: b.reason,
              bannedAt: new Date(b.bannedAt).toLocaleString(),
              bannedBy: b.bannedBy,
              fingerprint: b.fingerprint
            };
          }));
          console.log('[Admin] Total bans: ' + bans.length);
        });
      });
    },

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
        '  ArcadeAdmin.giveBadge("user", "badge_id")   — Give a badge\n' +
        '  ArcadeAdmin.resetBadges("user")             — Reset all badges\n' +
        '  ArcadeAdmin.listBadges()                    — List all badge IDs\n' +
        '  ArcadeAdmin.addFriend("user1", "user2")     — Force add friends\n' +
        '  ArcadeAdmin.viewRequests("user")            — View friend requests\n' +
        '  ArcadeAdmin.setXP("user", 5000)             — Set XP\n' +
        '  ArcadeAdmin.addXP("user", 500)              — Add XP\n' +
        '  ArcadeAdmin.setLevel("user", 10)            — Set level\n' +
        '  ArcadeAdmin.pushNotif("user", "Title", "Body") — Push notification\n' +
        '  ArcadeAdmin.clearNotifs("user")             — Clear notifications\n' +
        '  ArcadeAdmin.viewTrades("user")              — View pending trades\n' +
        '  ArcadeAdmin.adminGift("from", "to", "item") — Force gift item\n' +
        '  ArcadeAdmin.adminGiftCoins("from", "to", 500) — Force gift coins\n' +
        '  ArcadeAdmin.resetChallenge("user")          — Reset daily challenge\n' +
        '  ArcadeAdmin.resetQuests("user")             — Reset weekly quests\n' +
        '  ArcadeAdmin.viewRatings("gameId")           — View game ratings\n' +
        '  ArcadeAdmin.deleteRating("gameId", "user")  — Delete a rating\n' +
        '  ArcadeAdmin.setBio("user", "text")          — Set user bio\n' +
        '  ArcadeAdmin.setBanner("user", "sunset")     — Set profile banner\n' +
        '  ArcadeAdmin.setCasinoStats("user", {...})   — Set casino stats\n' +
        '  ArcadeAdmin.postActivity("type", "user", {})— Post activity\n' +
        '  ArcadeAdmin.ban("user", "reason")           — Ban user + device\n' +
        '  ArcadeAdmin.unban("user")                   — Unban user + device\n' +
        '  ArcadeAdmin.listBans()                      — List all bans\n' +
        '  ArcadeAdmin.help()                          — Show this help'
      );
    }
  };
})();
