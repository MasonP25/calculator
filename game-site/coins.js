// ─── ARCADE COIN SYSTEM ───
(function() {
  var _balance = 0;
  var _inventory = [];
  var _equipped = { hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '', chatBubble: '', nameEffect: '', cursor: '' };
  var _loaded = false;
  var _profileCache = {};
  var _adminAuthed = false;

  // Token key (obfuscated)
  var _tk = [65,114,99,83,51,99,82,51,116].map(function(c){return String.fromCharCode(c)}).join('');

  // Simple hash for token validation
  function _hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return h.toString(36);
  }

  function _makeToken(amount, reason) {
    var t = Math.floor(Date.now() / 30000);
    return _hash(amount + ':' + (reason || '') + ':' + t + ':' + _tk);
  }

  // Firebase refs (set after firebase-lb.js loads)
  var _db = null;
  var _doc = null;
  var _getDoc = null;
  var _setDoc = null;
  var _updateDoc = null;

  function _getUser() {
    return localStorage.getItem('arcade_currentUser') || localStorage.getItem('arcadePlayerName') || 'Guest';
  }

  function _isGuest() {
    var u = _getUser();
    return !u || u === 'Guest';
  }

  // Initialize Firebase connection
  function _initFirebase() {
    if (_db) return Promise.resolve();
    return new Promise(function(resolve) {
      // Import Firebase modules
      Promise.all([
        import("https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js")
      ]).then(function(modules) {
        var initializeApp = modules[0].initializeApp;
        var getFirestore = modules[1].getFirestore;
        _doc = modules[1].doc;
        _getDoc = modules[1].getDoc;
        _setDoc = modules[1].setDoc;

        var config = {
          apiKey: "AIzaSyCyK7tEcAaqrVNFRggviaEmWH2SMkiwGKk",
          authDomain: "calculator-81d08.firebaseapp.com",
          projectId: "calculator-81d08",
          storageBucket: "calculator-81d08.firebasestorage.app",
          messagingSenderId: "375406495739",
          appId: "1:375406495739:web:fd28553263599864426d5e"
        };

        // Reuse existing app if available
        try {
          var app = initializeApp(config, 'coins-app');
          _db = getFirestore(app);
        } catch(e) {
          // App might already exist
          var getApp = modules[0].getApp;
          try {
            var app = getApp('coins-app');
            _db = getFirestore(app);
          } catch(e2) {
            var app = initializeApp(config, 'coins-app-' + Date.now());
            _db = getFirestore(app);
          }
        }
        resolve();
      }).catch(function(e) {
        console.warn('[Coins] Firebase init failed:', e);
        resolve();
      });
    });
  }

  // Load user data from Firebase (with session cache to reduce reads)
  var _coinsSessKey = '_fb_coins';
  function _load() {
    if (_isGuest()) {
      _loaded = true;
      return Promise.resolve();
    }
    // Session cache: skip Firebase read if already loaded this session
    var cached = sessionStorage.getItem(_coinsSessKey);
    if (cached) {
      try {
        var c = JSON.parse(cached);
        _balance = c.coins || 0;
        _inventory = c.inventory || [];
        _equipped = c.equipped || { hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '', chatBubble: '', nameEffect: '', cursor: '' };
        _loaded = true;
        _dispatch();
        return Promise.resolve();
      } catch(e) {}
    }
    return _initFirebase().then(function() {
      if (!_db) return;
      var key = _getUser().toLowerCase();
      var docRef = _doc(_db, 'users', key);
      return _getDoc(docRef).then(function(snap) {
        if (snap.exists()) {
          var data = snap.data();
          _balance = data.coins || 0;
          _inventory = data.inventory || [];
          _equipped = data.equipped || { hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '', chatBubble: '', nameEffect: '', cursor: '' };
        }
        _loaded = true;
        _dispatch();
        _updateCoinsCache();
      });
    }).catch(function(e) {
      console.warn('[Coins] Load failed:', e);
      _loaded = true;
    });
  }
  function _updateCoinsCache() {
    try { sessionStorage.setItem(_coinsSessKey, JSON.stringify({ coins: _balance, inventory: _inventory, equipped: _equipped })); } catch(e) {}
  }

  // Save to Firebase (merge: only update coins/inventory/equipped)
  function _save() {
    if (_isGuest() || !_db || !_loaded) return Promise.resolve();
    var key = _getUser().toLowerCase();
    var docRef = _doc(_db, 'users', key);
    return _setDoc(docRef, {
      coins: _balance,
      inventory: _inventory,
      equipped: _equipped
    }, { merge: true }).then(function() {
      _updateCoinsCache();
    }).catch(function(e) {
      console.warn('[Coins] Save failed:', e);
    });
  }

  function _dispatch() {
    window.dispatchEvent(new CustomEvent('coins-updated', {
      detail: { balance: _balance }
    }));
  }

  // Internal earn (no validation needed)
  function _earnInternal(amount, reason) {
    if (_isGuest() || amount <= 0) return;
    _balance += amount;
    _save();
    _dispatch();
    console.log('[Coins] +' + amount + (reason ? ' (' + reason + ')' : '') + ' → ' + _balance);
    if (window.ArcadeBadges) window.ArcadeBadges.increment('totalCoinsEarned', amount);
    if (window.ArcadeChallenges) {
      window.ArcadeChallenges.incrementQuest('coins_earned', amount);
      window.ArcadeChallenges.checkDailyCoinChallenge(amount);
    }
  }

  // ─── Public API ───
  window.ArcadeCoins = {
    init: function() {
      return _load();
    },

    isLoaded: function() { return _loaded; },

    getBalance: function() { return _balance; },

    // Token-protected earn — requires valid token from game code
    earn: function(amount, reason, token) {
      if (_adminAuthed) { _earnInternal(amount, reason); return; }
      if (!token || token !== _makeToken(amount, reason)) {
        console.warn('[Coins] Invalid token');
        return;
      }
      _earnInternal(amount, reason);
    },

    spend: function(amount) {
      if (amount <= 0 || amount > _balance) return false;
      _balance -= amount;
      _save();
      _dispatch();
      return true;
    },

    getInventory: function() { return _inventory.slice(); },

    ownsItem: function(itemId) {
      return _inventory.indexOf(itemId) !== -1;
    },

    getEquipped: function() {
      return Object.assign({}, _equipped);
    },

    buyItem: function(itemId, cost) {
      if (_isGuest()) return { ok: false, msg: 'Sign in to buy items' };
      if (_inventory.indexOf(itemId) !== -1) return { ok: false, msg: 'Already owned' };
      if (_balance < cost) return { ok: false, msg: 'Not enough coins' };
      _balance -= cost;
      _inventory.push(itemId);
      _save();
      _dispatch();
      if (window.ArcadeBadges) window.ArcadeBadges.increment('itemsPurchased', 1);
      return { ok: true };
    },

    // Equip triggers avatar customization badge check
    equipItem: function(category, itemId) {
      // Allow free skin colors without needing them in inventory
      var isFree = category === 'skin' && itemId && itemId.indexOf('skin_') === 0 &&
        window.ArcadeAvatar && window.ArcadeAvatar.SKIN_COLORS && window.ArcadeAvatar.SKIN_COLORS[itemId] &&
        window.ArcadeAvatar.SKIN_COLORS[itemId].price === 0;
      // Allow custom hex colors for skin and nametag (admin feature)
      var isCustomHex = (category === 'skin' || category === 'nametagColor') && itemId && itemId.charAt(0) === '#';
      if (itemId && !isFree && !isCustomHex && _inventory.indexOf(itemId) === -1) return false;
      _equipped[category] = itemId || '';
      _save();
      _dispatch();
      if (itemId && window.ArcadeBadges) window.ArcadeBadges.check();
      return true;
    },

    // Fetch another player's profile (equipped items) for display
    getProfile: function(username) {
      if (!username || username === 'Guest') {
        return Promise.resolve({ hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '', chatBubble: '', nameEffect: '', cursor: '' });
      }
      // Check cache
      var cacheKey = username.toLowerCase();
      if (_profileCache[cacheKey] && (Date.now() - _profileCache[cacheKey]._ts < 60000)) {
        return Promise.resolve(_profileCache[cacheKey]);
      }
      return _initFirebase().then(function() {
        if (!_db) return { hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '', chatBubble: '', nameEffect: '', cursor: '' };
        var docRef = _doc(_db, 'users', cacheKey);
        return _getDoc(docRef).then(function(snap) {
          var profile = { hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '', chatBubble: '', nameEffect: '', cursor: '' };
          if (snap.exists()) {
            var data = snap.data();
            if (data.equipped) profile = data.equipped;
          }
          profile._ts = Date.now();
          _profileCache[cacheKey] = profile;
          return profile;
        });
      }).catch(function() {
        return { hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '', chatBubble: '', nameEffect: '', cursor: '' };
      });
    },

    // Re-load when user signs in/out
    reload: function() {
      _balance = 0;
      _inventory = [];
      _equipped = { hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '', chatBubble: '', nameEffect: '', cursor: '' };
      _loaded = false;
      _profileCache = {};
      return _load();
    },

    // Admin auth
    adminLogin: function(pw) {
      if (pw === '123') {
        _adminAuthed = true;
        console.log('[Coins] Admin authenticated');
        return true;
      }
      console.warn('[Coins] Wrong password');
      return false;
    },

    isAdmin: function() { return _adminAuthed; }
  };

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { _load(); });
  } else {
    _load();
  }

  // Reload when auth changes
  window.addEventListener('arcade-auth-change', function() {
    window.ArcadeCoins.reload();
  });
})();

// ─── Coin reward helper (used by game pages) ───
function _arcadeEarnCoins(amount, reason) {
  var _tk = [65,114,99,83,51,99,82,51,116].map(function(c){return String.fromCharCode(c)}).join('');
  var t = Math.floor(Date.now() / 30000);
  var s = amount + ':' + (reason || '') + ':' + t + ':' + _tk;
  var h = 0;
  for (var i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  if (window.ArcadeCoins) window.ArcadeCoins.earn(amount, reason, h.toString(36));
}

// ─── TIME-BASED REWARD FOR EXTERNAL GAMES ───
(function() {
  var EXTERNAL = ['geodashlite','getontop','basketballstars','twoball3d','tagrun','basketrandom','growagarden','obbybike','colorraceobby','stickmanhooks','tinyfishing','goingballs','ludo','colorsand','volleybeans','unoonline','flipbottle','impossiblequiz','watersort','fireboywater','slope','totm','subway','drifthunters','crazykarts','survivalkarts','stackball','fortnite','run3','championisland','volleyrandom','doodlebaseball','gardengnomes','doodlesnake','doodlepacman','fnaf','minecraft','worldhardest','hextris','spelunky','astray','0hh1','gswitch3','motox3m','cuttherope','driftboss','jellytruck','paperio3d','awesometanks2','learntofly3','vex8','sonic','carfootball','darknesssurvivors','catsimulator'];
  var pg = (location.pathname.split('/').pop() || '').replace('.html', '');
  if (EXTERNAL.indexOf(pg) === -1) return;
  var key = '_ext_coin_' + pg;
  if (sessionStorage.getItem(key)) return;
  setTimeout(function() {
    var user = localStorage.getItem('arcade_currentUser');
    if (!user || user === 'Guest') return;
    sessionStorage.setItem(key, '1');
    _arcadeEarnCoins(10, 'Played ' + pg);
  }, 60000);
})();
