// ─── ARCADE ACTIVITY FEED ───
(function() {
  var _db = null;
  var _doc = null;
  var _getDoc = null;
  var _setDoc = null;
  var _collection = null;
  var _addDoc = null;
  var _getDocs = null;
  var _query = null;
  var _orderBy = null;
  var _limit = null;
  var _where = null;
  var _deleteDoc = null;
  var _cache = null;
  var _cacheTime = 0;
  var _cleanedUp = false;

  function _getUser() {
    return localStorage.getItem('arcade_currentUser') || 'Guest';
  }
  function _isGuest() {
    var u = _getUser();
    return !u || u === 'Guest';
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
      _collection = mods[1].collection;
      _addDoc = mods[1].addDoc;
      _getDocs = mods[1].getDocs;
      _query = mods[1].query;
      _orderBy = mods[1].orderBy;
      _limit = mods[1].limit;
      _where = mods[1].where;
      _deleteDoc = mods[1].deleteDoc;
      var config = {
        apiKey: "AIzaSyCyK7tEcAaqrVNFRggviaEmWH2SMkiwGKk",
        authDomain: "calculator-81d08.firebaseapp.com",
        projectId: "calculator-81d08",
        storageBucket: "calculator-81d08.firebasestorage.app",
        messagingSenderId: "375406495739",
        appId: "1:375406495739:web:fd28553263599864426d5e"
      };
      try {
        var app = getApp('activity-app');
        _db = getFirestore(app);
      } catch(e) {
        try {
          var app = initializeApp(config, 'activity-app');
          _db = getFirestore(app);
        } catch(e2) {
          var app = initializeApp(config, 'activity-app-' + Date.now());
          _db = getFirestore(app);
        }
      }
    }).catch(function(e) {
      console.warn('[Activity] Firebase init failed:', e);
    });
  }

  // Delete activity entries older than 24 hours (runs once per session)
  async function _cleanup() {
    if (_cleanedUp) return;
    _cleanedUp = true;
    try {
      var cutoff = Date.now() - 86400000; // 24 hours ago
      var q = _query(_collection(_db, 'activity'), _where('time', '<', cutoff), _limit(50));
      var snap = await _getDocs(q);
      var deletes = [];
      snap.forEach(function(d) {
        deletes.push(_deleteDoc(d.ref));
      });
      if (deletes.length > 0) {
        await Promise.all(deletes);
      }
    } catch(e) {
      // Ignore cleanup errors
    }
  }

  // Type configs
  var TYPE_CONFIG = {
    high_score: { icon: '\uD83C\uDFC6', fmt: function(d) { return d.username + ' set a new high score in ' + _gameName(d.data.gameId) + ': ' + d.data.score; } },
    badge_earned: { icon: '\uD83C\uDFC5', fmt: function(d) { return d.username + ' earned the "' + d.data.badgeName + '" badge'; } },
    level_up: { icon: '\u2B50', fmt: function(d) { return d.username + ' reached Level ' + d.data.level + '!'; } },
    trade_completed: { icon: '\uD83E\uDD1D', fmt: function(d) { return d.username + ' completed a trade with ' + (d.data.with || 'someone'); } },
    new_user: { icon: '\uD83D\uDC4B', fmt: function(d) { return d.username + ' joined the arcade!'; } },
    gotd_played: { icon: '\uD83C\uDF1F', fmt: function(d) { return d.username + ' played the Game of the Day!'; } },
    challenge_complete: { icon: '\uD83C\uDFAF', fmt: function(d) { return d.username + ' completed a daily challenge!'; } },
    quest_complete: { icon: '\uD83D\uDCDC', fmt: function(d) { return d.username + ' completed a weekly quest!'; } },
    casino_big_win: { icon: '\uD83D\uDCB0', fmt: function(d) { return d.username + ' won ' + d.data.amount + ' coins at the casino!'; } }
  };

  function _gameName(gameId) {
    if (window.ArcadeChallenges && window.ArcadeChallenges.GAME_NAMES) {
      return window.ArcadeChallenges.GAME_NAMES[gameId] || gameId;
    }
    return gameId;
  }

  function _relativeTime(ts) {
    var diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return new Date(ts).toLocaleDateString();
  }

  // Inject CSS
  var css = document.createElement('style');
  css.textContent =
    '.activity-feed{max-width:500px;margin:0 auto 1.5rem;font-family:"Segoe UI",Tahoma,sans-serif}' +
    '.activity-feed .af-title{font-size:0.75rem;text-transform:uppercase;letter-spacing:2px;color:#555;margin-bottom:0.5rem;text-align:center}' +
    '.activity-feed .af-list{max-height:310px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#2a2a4a transparent}' +
    '.activity-feed .af-list::-webkit-scrollbar{width:4px}' +
    '.activity-feed .af-list::-webkit-scrollbar-track{background:transparent}' +
    '.activity-feed .af-list::-webkit-scrollbar-thumb{background:#2a2a4a;border-radius:4px}' +
    '.activity-feed .af-item{display:flex;align-items:center;gap:0.5rem;padding:0.35rem 0.6rem;border-radius:8px;margin-bottom:0.2rem;background:#1a1a2e;font-size:0.8rem;color:#ccc}' +
    '.activity-feed .af-item:hover{background:#1f1f38}' +
    '.activity-feed .af-icon{font-size:1rem;flex-shrink:0}' +
    '.activity-feed .af-text{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.activity-feed .af-time{font-size:0.65rem;color:#666;white-space:nowrap;flex-shrink:0}' +
    '.activity-feed .af-empty{text-align:center;color:#555;font-size:0.85rem;padding:1rem}';
  document.head.appendChild(css);

  // One-time migration: remove false high scores and duplicate level-ups
  async function _fixActivityFeed() {
    if (localStorage.getItem('_activity_fix_v3')) return;
    try {
      await _initFirebase();
      if (!_db || !_collection) return;

      // Loop to delete ALL high_score entries (batches of 100)
      var deleted = 0;
      while (true) {
        var hsQ = _query(_collection(_db, 'activity'), _where('type', '==', 'high_score'), _limit(100));
        var hsSnap = await _getDocs(hsQ);
        if (hsSnap.empty) break;
        var promises = [];
        hsSnap.forEach(function(d) { promises.push(_deleteDoc(d.ref)); });
        await Promise.all(promises);
        deleted += promises.length;
      }

      // Deduplicate level_up: keep only the latest per user+level
      var q = _query(_collection(_db, 'activity'), _where('type', '==', 'level_up'), _limit(500));
      var snap = await _getDocs(q);
      var seenLevelUps = {};
      var toDelete = [];
      snap.forEach(function(d) {
        var data = d.data();
        if (data.data) {
          var key = (data.username || '') + '_lv_' + data.data.level;
          if (seenLevelUps[key]) {
            if (data.time > seenLevelUps[key].time) {
              toDelete.push(seenLevelUps[key].ref);
              seenLevelUps[key] = { ref: d.ref, time: data.time };
            } else {
              toDelete.push(d.ref);
            }
          } else {
            seenLevelUps[key] = { ref: d.ref, time: data.time };
          }
        }
      });
      for (var i = 0; i < toDelete.length; i++) {
        await _deleteDoc(toDelete[i]);
      }

      _cache = null;
      if (deleted > 0) console.log('[Activity] Cleaned up ' + deleted + ' false high_score entries');
      localStorage.setItem('_activity_fix_v3', '1');
    } catch(e) {
      console.warn('[Activity] Fix migration failed:', e);
    }
  }

  window.ArcadeActivity = {
    post: async function(type, data) {
      if (_isGuest()) return;
      try {
        await _initFirebase();
        if (!_db || !_collection) return;
        var entry = {
          type: type,
          username: _getUser(),
          data: data || {},
          time: Date.now()
        };
        await _addDoc(_collection(_db, 'activity'), entry);
        _cache = null; // Invalidate cache
        // Cleanup old entries (once per session)
        _cleanup();
      } catch(e) {
        console.warn('[Activity] Post failed:', e);
      }
    },

    getRecent: async function(max) {
      max = max || 20;
      // Cache for 30s
      if (_cache && Date.now() - _cacheTime < 30000) return _cache;
      try {
        await _initFirebase();
        if (!_db) return [];
        var q = _query(_collection(_db, 'activity'), _orderBy('time', 'desc'), _limit(max));
        var snap = await _getDocs(q);
        var results = [];
        snap.forEach(function(d) {
          results.push(d.data());
        });
        _cache = results;
        _cacheTime = Date.now();
        // Also run cleanup on fetch (once per session)
        _cleanup();
        return results;
      } catch(e) {
        console.warn('[Activity] Fetch failed:', e);
        return [];
      }
    },

    renderFeed: async function(container) {
      if (!container) return;
      await _fixActivityFeed();
      var items = await window.ArcadeActivity.getRecent(20);
      container.innerHTML = '';
      var wrap = document.createElement('div');
      wrap.className = 'activity-feed';
      wrap.innerHTML = '<div class="af-title">\uD83D\uDCE1 Live Activity</div>';
      var list = document.createElement('div');
      list.className = 'af-list';

      if (!items.length) {
        list.innerHTML = '<div class="af-empty">No recent activity</div>';
      } else {
        var seen = {};
        items.forEach(function(item) {
          var cfg = TYPE_CONFIG[item.type] || { icon: '\uD83D\uDD35', fmt: function(d) { return d.username + ' did something'; } };
          var text = cfg.fmt(item);
          // Skip duplicate entries (same type + username + text)
          var key = item.type + '|' + item.username + '|' + text;
          if (seen[key]) return;
          seen[key] = true;
          var div = document.createElement('div');
          div.className = 'af-item';
          div.innerHTML =
            '<span class="af-icon">' + cfg.icon + '</span>' +
            '<span class="af-text">' + text + '</span>' +
            '<span class="af-time">' + _relativeTime(item.time) + '</span>';
          list.appendChild(div);
        });
      }
      wrap.appendChild(list);
      container.appendChild(wrap);
    }
  };
})();
