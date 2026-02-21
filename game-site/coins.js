// ─── ARCADE COIN SYSTEM ───
(function() {
  var _balance = 0;
  var _inventory = [];
  var _equipped = { hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '' };
  var _loaded = false;
  var _profileCache = {};

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

  // Load user data from Firebase
  function _load() {
    if (_isGuest()) {
      _loaded = true;
      return Promise.resolve();
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
          _equipped = data.equipped || { hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '' };
        }
        _loaded = true;
        _dispatch();
      });
    }).catch(function(e) {
      console.warn('[Coins] Load failed:', e);
      _loaded = true;
    });
  }

  // Save to Firebase
  function _save() {
    if (_isGuest() || !_db) return Promise.resolve();
    var key = _getUser().toLowerCase();
    var docRef = _doc(_db, 'users', key);
    return _getDoc(docRef).then(function(snap) {
      var data = snap.exists() ? snap.data() : {};
      data.coins = _balance;
      data.inventory = _inventory;
      data.equipped = _equipped;
      return _setDoc(docRef, data);
    }).catch(function(e) {
      console.warn('[Coins] Save failed:', e);
    });
  }

  function _dispatch() {
    window.dispatchEvent(new CustomEvent('coins-updated', {
      detail: { balance: _balance }
    }));
  }

  // ─── Public API ───
  window.ArcadeCoins = {
    init: function() {
      return _load();
    },

    isLoaded: function() { return _loaded; },

    getBalance: function() { return _balance; },

    earn: function(amount, reason) {
      if (_isGuest() || amount <= 0) return;
      _balance += amount;
      _save();
      _dispatch();
      console.log('[Coins] +' + amount + (reason ? ' (' + reason + ')' : '') + ' → ' + _balance);
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
      return { ok: true };
    },

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
      return true;
    },

    // Fetch another player's profile (equipped items) for display
    getProfile: function(username) {
      if (!username || username === 'Guest') {
        return Promise.resolve({ hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '' });
      }
      // Check cache
      var cacheKey = username.toLowerCase();
      if (_profileCache[cacheKey] && (Date.now() - _profileCache[cacheKey]._ts < 60000)) {
        return Promise.resolve(_profileCache[cacheKey]);
      }
      return _initFirebase().then(function() {
        if (!_db) return { hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '' };
        var docRef = _doc(_db, 'users', cacheKey);
        return _getDoc(docRef).then(function(snap) {
          var profile = { hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '' };
          if (snap.exists()) {
            var data = snap.data();
            if (data.equipped) profile = data.equipped;
          }
          profile._ts = Date.now();
          _profileCache[cacheKey] = profile;
          return profile;
        });
      }).catch(function() {
        return { hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '' };
      });
    },

    // Re-load when user signs in/out
    reload: function() {
      _balance = 0;
      _inventory = [];
      _equipped = { hat: '', hair: '', face: '', shirt: '', skin: '', nametagColor: '', nametagFont: '' };
      _loaded = false;
      _profileCache = {};
      return _load();
    }
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
