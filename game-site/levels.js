// ─── ARCADE LEVELS / XP SYSTEM ───
(function() {
  var _db = null;
  var _doc = null;
  var _getDoc = null;
  var _setDoc = null;
  var _xp = 0;
  var _level = 0;
  var _loaded = false;

  var MILESTONES = {
    1: 50, 5: 100, 10: 250, 15: 500, 20: 1000, 25: 1500, 30: 2000, 40: 3000, 50: 5000
  };

  function _getUser() {
    return localStorage.getItem('arcade_currentUser') || 'Guest';
  }
  function _isGuest() {
    var u = _getUser();
    return !u || u === 'Guest';
  }

  function _levelFromXP(xp) {
    return Math.floor(Math.sqrt(xp / 25));
  }
  function _xpForLevel(level) {
    return level * level * 25;
  }
  function _progressInfo(xp) {
    var level = _levelFromXP(xp);
    var cur = _xpForLevel(level);
    var next = _xpForLevel(level + 1);
    return {
      level: level,
      xp: xp,
      currentLevelXP: cur,
      nextLevelXP: next,
      progressXP: xp - cur,
      neededXP: next - cur,
      percent: next > cur ? ((xp - cur) / (next - cur)) * 100 : 0
    };
  }

  function _initFirebase() {
    if (_db) return Promise.resolve();
    return Promise.all([
      import("https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js")
    ]).then(function(mods) {
      var initializeApp = mods[0].initializeApp;
      var getApp = mods[0].getApp;
      var getFirestore = mods[1].getFirestore;
      _doc = mods[1].doc;
      _getDoc = mods[1].getDoc;
      _setDoc = mods[1].setDoc;
      var config = {
        apiKey: "AIzaSyCyK7tEcAaqrVNFRggviaEmWH2SMkiwGKk",
        authDomain: "calculator-81d08.firebaseapp.com",
        projectId: "calculator-81d08",
        storageBucket: "calculator-81d08.firebasestorage.app",
        messagingSenderId: "375406495739",
        appId: "1:375406495739:web:fd28553263599864426d5e"
      };
      try {
        var app = getApp('levels-app');
        _db = getFirestore(app);
      } catch(e) {
        try {
          var app = initializeApp(config, 'levels-app');
          _db = getFirestore(app);
        } catch(e2) {
          var app = initializeApp(config, 'levels-app-' + Date.now());
          _db = getFirestore(app);
        }
      }
    }).catch(function(e) {
      console.warn('[Levels] Firebase init failed:', e);
    });
  }

  // Inject CSS
  var css = document.createElement('style');
  css.textContent =
    '.ab-level{font-size:0.62rem;font-weight:700;color:#ffd700;background:#ffd70020;padding:1px 5px;border-radius:6px;margin-left:0.15rem}' +
    '.xp-bar-wrap{position:fixed;top:44px;right:16px;width:170px;z-index:9997;font-family:"Segoe UI",Tahoma,sans-serif;pointer-events:none}' +
    '.xp-bar-outer{background:#0f0f1a;border:1px solid #2a2a4a;border-radius:5px;height:8px;overflow:hidden}' +
    '.xp-bar-inner{height:100%;background:linear-gradient(90deg,#7b2ff7,#00d4ff);border-radius:5px;transition:width 0.6s ease;min-width:0}' +
    '.xp-bar-label{font-size:0.58rem;color:#888;text-align:center;margin-top:1px}' +
    '.level-badge{display:inline-block;font-size:0.75rem;font-weight:700;color:#ffd700;margin-left:0.3rem}' +
    '.hero-level{margin-top:0.3rem}' +
    '.hero-xp-bar{width:200px;margin-top:0.3rem}' +
    '.hero-xp-bar .xp-bar-outer{height:10px}' +
    '.hero-xp-bar .xp-bar-label{font-size:0.65rem}';
  document.head.appendChild(css);

  async function _load() {
    if (_isGuest() || _loaded) return;
    try {
      await _initFirebase();
      if (!_db) return;
      var key = _getUser().toLowerCase();
      var ref = _doc(_db, 'users', key);
      var snap = await _getDoc(ref);
      if (!snap.exists()) return;
      var data = snap.data();
      _xp = data.xp || 0;
      _level = _levelFromXP(_xp);
      _loaded = true;

      // Daily login XP bonus (5 XP)
      var today = new Date().toDateString();
      if (data.lastLoginDay !== today) {
        data.lastLoginDay = today;
        var oldLevel = _level;
        _xp += 5;
        data.xp = _xp;
        _level = _levelFromXP(_xp);
        data.level = _level;
        // Check milestones
        if (_level > oldLevel) {
          if (!data.levelMilestonesClaimed) data.levelMilestonesClaimed = [];
          for (var lv = oldLevel + 1; lv <= _level; lv++) {
            if (MILESTONES[lv] && data.levelMilestonesClaimed.indexOf(lv) === -1) {
              data.levelMilestonesClaimed.push(lv);
              data.coins = (data.coins || 0) + MILESTONES[lv];
            }
          }
        }
        await _setDoc(ref, data);
      }

      _dispatch();
    } catch(e) {
      console.warn('[Levels] Load failed:', e);
    }
  }

  function _dispatch() {
    var info = _progressInfo(_xp);
    window.dispatchEvent(new CustomEvent('level-updated', { detail: info }));
  }

  window.ArcadeLevels = {
    addXP: async function(amount, reason) {
      if (_isGuest() || !amount || amount <= 0) return;
      try {
        await _initFirebase();
        if (!_db) return;
        var key = _getUser().toLowerCase();
        var ref = _doc(_db, 'users', key);
        var snap = await _getDoc(ref);
        if (!snap.exists()) return;
        var data = snap.data();
        var oldXP = data.xp || 0;
        var oldLevel = _levelFromXP(oldXP);
        var newXP = oldXP + amount;
        var newLevel = _levelFromXP(newXP);

        data.xp = newXP;
        data.level = newLevel;

        // Check milestones for coin rewards
        if (newLevel > oldLevel) {
          if (!data.levelMilestonesClaimed) data.levelMilestonesClaimed = [];
          for (var lv = oldLevel + 1; lv <= newLevel; lv++) {
            if (MILESTONES[lv] && data.levelMilestonesClaimed.indexOf(lv) === -1) {
              data.levelMilestonesClaimed.push(lv);
              // Award coins
              data.coins = (data.coins || 0) + MILESTONES[lv];
            }
          }
          // Push level-up notification
          if (window.ArcadeNotifications) {
            var coinReward = MILESTONES[newLevel] || 0;
            var body = 'You reached Level ' + newLevel + '!';
            if (coinReward) body += ' +' + coinReward + ' coins!';
            window.ArcadeNotifications.pushSelf(
              window.ArcadeNotifications.create('level_up', 'Level Up!', body, '⬆️', null, { level: newLevel })
            );
          }
        }

        await _setDoc(ref, data);
        _xp = newXP;
        _level = newLevel;

        // Reload coins if milestone awarded
        if (newLevel > oldLevel && window.ArcadeCoins && window.ArcadeCoins.reload) {
          window.ArcadeCoins.reload();
        }

        _dispatch();
      } catch(e) {
        console.warn('[Levels] addXP failed:', e);
      }
    },

    getProgress: function() {
      return _progressInfo(_xp);
    },

    getUserLevel: async function(username) {
      if (!username || username === 'Guest') return { level: 0, xp: 0, percent: 0 };
      try {
        await _initFirebase();
        if (!_db) return { level: 0, xp: 0, percent: 0 };
        var snap = await _getDoc(_doc(_db, 'users', username.toLowerCase()));
        if (!snap.exists()) return { level: 0, xp: 0, percent: 0 };
        var data = snap.data();
        return _progressInfo(data.xp || 0);
      } catch(e) {
        return { level: 0, xp: 0, percent: 0 };
      }
    },

    levelFromXP: function(xp) { return _levelFromXP(xp); },
    xpForLevel: function(level) { return _xpForLevel(level); },

    renderProgressBar: function(container, progress, compact) {
      if (!container) return;
      var wrap = document.createElement('div');
      if (compact) {
        wrap.className = 'xp-bar-wrap';
        wrap.style.position = 'relative';
        wrap.style.top = 'auto';
        wrap.style.right = 'auto';
        wrap.style.width = '100%';
        wrap.style.pointerEvents = 'auto';
      } else {
        wrap.className = 'hero-xp-bar';
      }
      wrap.innerHTML =
        '<div class="xp-bar-outer"><div class="xp-bar-inner" style="width:' + Math.min(progress.percent, 100) + '%"></div></div>' +
        '<div class="xp-bar-label">' + progress.progressXP + ' / ' + progress.neededXP + ' XP</div>';
      container.appendChild(wrap);
    },

    reload: function() {
      _loaded = false;
      _xp = 0;
      _level = 0;
      return _load();
    }
  };

  // Auto-load
  if (!_isGuest()) {
    setTimeout(_load, 2500);
  }

  window.addEventListener('arcade-auth-change', function() {
    _loaded = false;
    _xp = 0;
    _level = 0;
    if (!_isGuest()) {
      setTimeout(_load, 1000);
    }
  });
})();
