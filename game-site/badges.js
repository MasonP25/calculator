// ─── ARCADE BADGE / ACHIEVEMENT SYSTEM ───
(function() {
  var BADGES = [
    // Getting Started
    { id: 'first_steps', name: 'First Steps', desc: 'Play your first game', icon: '\uD83D\uDC76', field: 'gamesPlayed', target: 1 },
    { id: 'warming_up', name: 'Warming Up', desc: 'Play 10 games', icon: '\uD83D\uDD25', field: 'gamesPlayed', target: 10 },
    { id: 'regular', name: 'Regular', desc: 'Play 50 games', icon: '\uD83C\uDFAE', field: 'gamesPlayed', target: 50 },
    { id: 'dedicated', name: 'Dedicated', desc: 'Play 100 games', icon: '\uD83D\uDCAA', field: 'gamesPlayed', target: 100 },
    { id: 'veteran', name: 'Arcade Veteran', desc: 'Play 500 games', icon: '\uD83C\uDFC5', field: 'gamesPlayed', target: 500 },
    // Leaderboard
    { id: 'podium', name: 'Podium Finish', desc: 'Reach top 3 on any leaderboard', icon: '\uD83E\uDD49', field: 'podiumCount', target: 1 },
    { id: 'podium5', name: 'Podium Regular', desc: 'Top 3 on 5 different leaderboards', icon: '\uD83E\uDD48', field: 'podiumCount', target: 5 },
    { id: 'dominant', name: 'Dominant Force', desc: '#1 on 3 different leaderboards', icon: '\uD83E\uDD47', field: 'firstPlaceCount', target: 3 },
    { id: 'unstoppable', name: 'Unstoppable', desc: '#1 on 10 different leaderboards', icon: '\uD83D\uDC51', field: 'firstPlaceCount', target: 10 },
    { id: 'master', name: 'Arcade Master', desc: '#1 on 25 different leaderboards', icon: '\uD83C\uDFC6', field: 'firstPlaceCount', target: 25 },
    // Coins
    { id: 'piggy', name: 'Piggy Bank', desc: 'Earn 100 total coins', icon: '\uD83D\uDC37', field: 'totalCoinsEarned', target: 100 },
    { id: 'collector', name: 'Coin Collector', desc: 'Earn 1,000 total coins', icon: '\uD83D\uDCB0', field: 'totalCoinsEarned', target: 1000 },
    { id: 'moneybags', name: 'Money Bags', desc: 'Earn 10,000 total coins', icon: '\uD83D\uDC8E', field: 'totalCoinsEarned', target: 10000 },
    { id: 'millionaire', name: 'Arcade Millionaire', desc: 'Earn 100,000 total coins', icon: '\uD83E\uDD11', field: 'totalCoinsEarned', target: 100000 },
    // Shopping
    { id: 'shopper', name: 'Window Shopper', desc: 'Buy your first item', icon: '\uD83D\uDECD\uFE0F', field: 'itemsPurchased', target: 1 },
    { id: 'fashionista', name: 'Fashionista', desc: 'Buy 10 items', icon: '\uD83D\uDC57', field: 'itemsPurchased', target: 10 },
    { id: 'hatcollector', name: 'Hat Collector', desc: 'Buy 25 items', icon: '\uD83C\uDFA9', field: 'itemsPurchased', target: 25 },
    // Social
    { id: 'friendly', name: 'Friendly', desc: 'Add your first friend', icon: '\uD83E\uDD1D', field: 'friendCount', target: 1 },
    { id: 'social', name: 'Social Butterfly', desc: 'Have 10 friends', icon: '\uD83E\uDD8B', field: 'friendCount', target: 10 },
    // Streaks
    { id: 'onroll', name: 'On a Roll', desc: 'Win 5 in a row', icon: '\uD83C\uDFB3', field: 'bestStreak', target: 5 },
    { id: 'hotstreak', name: 'Hot Streak', desc: 'Win 10 in a row', icon: '\u2728', field: 'bestStreak', target: 10 },
    // Special
    { id: 'express', name: 'Express Yourself', desc: 'Customize your avatar', icon: '\uD83C\uDFA8', field: 'hasCustomized', target: 1 }
  ];

  var _db = null;
  var _doc = null;
  var _getDoc = null;
  var _setDoc = null;
  var _earnedCache = null;

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
      var config = {
        apiKey: "AIzaSyCyK7tEcAaqrVNFRggviaEmWH2SMkiwGKk",
        authDomain: "calculator-81d08.firebaseapp.com",
        projectId: "calculator-81d08",
        storageBucket: "calculator-81d08.firebasestorage.app",
        messagingSenderId: "375406495739",
        appId: "1:375406495739:web:fd28553263599864426d5e"
      };
      try {
        var app = getApp('badges-app');
        _db = getFirestore(app);
      } catch(e) {
        try {
          var app = initializeApp(config, 'badges-app');
          _db = getFirestore(app);
        } catch(e2) {
          var app = initializeApp(config, 'badges-app-' + Date.now());
          _db = getFirestore(app);
        }
      }
    }).catch(function(e) {
      console.warn('[Badges] Firebase init failed:', e);
    });
  }

  // Show toast notification
  function _showToast(badge) {
    var toast = document.createElement('div');
    toast.className = 'badge-toast';
    toast.innerHTML = '<span class="badge-toast-icon">' + badge.icon + '</span>' +
      '<div class="badge-toast-text">' +
        '<strong>Badge Earned!</strong>' +
        '<span>' + badge.name + '</span>' +
      '</div>';
    document.body.appendChild(toast);
    requestAnimationFrame(function() { toast.classList.add('show'); });
    setTimeout(function() {
      toast.classList.remove('show');
      setTimeout(function() { toast.remove(); }, 400);
    }, 3500);
  }

  // Inject CSS (toast + badge grid)
  var css = document.createElement('style');
  css.textContent =
    '.badge-toast{position:fixed;bottom:24px;left:24px;background:#1a1a2e;border:2px solid #7b2ff7;border-radius:12px;' +
    'padding:0.7rem 1rem;display:flex;align-items:center;gap:0.7rem;z-index:10001;font-family:"Segoe UI",Tahoma,sans-serif;' +
    'transform:translateX(-120%);transition:transform 0.4s cubic-bezier(.4,0,.2,1);box-shadow:0 4px 20px rgba(123,47,247,0.3)}' +
    '.badge-toast.show{transform:translateX(0)}' +
    '.badge-toast-icon{font-size:2rem;line-height:1}' +
    '.badge-toast-text{display:flex;flex-direction:column;gap:0.15rem}' +
    '.badge-toast-text strong{color:#7b2ff7;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em}' +
    '.badge-toast-text span{color:#e0e0e0;font-size:0.88rem;font-weight:600}' +
    '.badge-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:0.6rem}' +
    '.badge-item{display:flex;flex-direction:column;align-items:center;padding:0.6rem 0.4rem;border-radius:10px;' +
    'background:#0f0f1a;border:2px solid #2a2a4a;transition:border-color .2s,transform .2s;cursor:default}' +
    '.badge-item.earned{border-color:#7b2ff7;background:#1a1a2e}' +
    '.badge-item.earned:hover{transform:translateY(-2px);border-color:#9b5ff7}' +
    '.badge-item.locked{opacity:0.35;filter:grayscale(1)}' +
    '.badge-icon{font-size:1.8rem;line-height:1;margin-bottom:0.3rem}' +
    '.badge-name{font-size:0.65rem;color:#aaa;text-align:center;line-height:1.2}' +
    '.badge-item.earned .badge-name{color:#e0e0e0}';
  document.head.appendChild(css);

  window.ArcadeBadges = {
    BADGES: BADGES,

    // Check all badges, award new ones, show toasts
    check: async function() {
      if (_isGuest()) return;
      try {
        await _initFirebase();
        if (!_db) return;
        var key = _getUser().toLowerCase();
        var snap = await _getDoc(_doc(_db, 'users', key));
        if (!snap.exists()) return;
        var data = snap.data();
        var earned = data.badges || [];
        var progress = data.badgeProgress || {};
        var newBadges = [];

        var values = {
          gamesPlayed: progress.gamesPlayed || 0,
          totalCoinsEarned: progress.totalCoinsEarned || 0,
          itemsPurchased: progress.itemsPurchased || 0,
          podiumCount: progress.podiumCount || 0,
          firstPlaceCount: progress.firstPlaceCount || 0,
          friendCount: (data.friends || []).length,
          bestStreak: progress.bestStreak || 0,
          hasCustomized: 0
        };
        var eq = data.equipped || {};
        if (eq.hat || eq.hair || eq.face || eq.shirt || eq.nametagColor || eq.nametagFont) {
          values.hasCustomized = 1;
        }

        for (var i = 0; i < BADGES.length; i++) {
          var b = BADGES[i];
          if (earned.indexOf(b.id) !== -1) continue;
          if ((values[b.field] || 0) >= b.target) {
            earned.push(b.id);
            newBadges.push(b);
          }
        }

        if (newBadges.length > 0) {
          data.badges = earned;
          await _setDoc(_doc(_db, 'users', key), data);
          for (var j = 0; j < newBadges.length; j++) {
            (function(badge, delay) {
              setTimeout(function() { _showToast(badge); }, delay);
            })(newBadges[j], j * 800);
          }
        }
        _earnedCache = earned;
      } catch(e) {
        console.warn('[Badges] Check failed:', e);
      }
    },

    // Increment a badgeProgress field, then check
    increment: async function(field, amount) {
      if (_isGuest()) return;
      try {
        await _initFirebase();
        if (!_db) return;
        var key = _getUser().toLowerCase();
        var ref = _doc(_db, 'users', key);
        var snap = await _getDoc(ref);
        var data = snap.exists() ? snap.data() : {};
        if (!data.badgeProgress) data.badgeProgress = {};
        data.badgeProgress[field] = (data.badgeProgress[field] || 0) + (amount || 1);
        await _setDoc(ref, data);
        await window.ArcadeBadges.check();
      } catch(e) {
        console.warn('[Badges] Increment failed:', e);
      }
    },

    // Record leaderboard placement (called from firebase-lb.js)
    recordPlacement: async function(gameId, position) {
      if (_isGuest()) return;
      try {
        await _initFirebase();
        if (!_db) return;
        var key = _getUser().toLowerCase();
        var ref = _doc(_db, 'users', key);
        var snap = await _getDoc(ref);
        var data = snap.exists() ? snap.data() : {};
        if (!data.badgeProgress) data.badgeProgress = {};
        var changed = false;

        if (!data.badgeProgress.podiumGames) data.badgeProgress.podiumGames = [];
        if (position <= 3 && data.badgeProgress.podiumGames.indexOf(gameId) === -1) {
          data.badgeProgress.podiumGames.push(gameId);
          data.badgeProgress.podiumCount = data.badgeProgress.podiumGames.length;
          changed = true;
        }

        if (!data.badgeProgress.firstPlaceGames) data.badgeProgress.firstPlaceGames = [];
        if (position === 1 && data.badgeProgress.firstPlaceGames.indexOf(gameId) === -1) {
          data.badgeProgress.firstPlaceGames.push(gameId);
          data.badgeProgress.firstPlaceCount = data.badgeProgress.firstPlaceGames.length;
          changed = true;
        }

        if (changed) {
          await _setDoc(ref, data);
          await window.ArcadeBadges.check();
        }
      } catch(e) {
        console.warn('[Badges] recordPlacement failed:', e);
      }
    },

    // Record best streak (called from fame.js winStreak)
    recordStreak: async function(streakVal) {
      if (_isGuest()) return;
      try {
        await _initFirebase();
        if (!_db) return;
        var key = _getUser().toLowerCase();
        var ref = _doc(_db, 'users', key);
        var snap = await _getDoc(ref);
        var data = snap.exists() ? snap.data() : {};
        if (!data.badgeProgress) data.badgeProgress = {};
        if (streakVal > (data.badgeProgress.bestStreak || 0)) {
          data.badgeProgress.bestStreak = streakVal;
          await _setDoc(ref, data);
          await window.ArcadeBadges.check();
        }
      } catch(e) {
        console.warn('[Badges] recordStreak failed:', e);
      }
    },

    // Render badge grid
    render: function(container, earnedIds, options) {
      options = options || {};
      var showAll = options.showAll !== false;
      container.innerHTML = '';
      var grid = document.createElement('div');
      grid.className = 'badge-grid';
      var list = showAll ? BADGES : BADGES.filter(function(b) {
        return earnedIds.indexOf(b.id) !== -1;
      });
      for (var i = 0; i < list.length; i++) {
        var b = list[i];
        var has = earnedIds.indexOf(b.id) !== -1;
        var el = document.createElement('div');
        el.className = 'badge-item' + (has ? ' earned' : ' locked');
        el.title = b.name + ': ' + b.desc;
        el.innerHTML = '<span class="badge-icon">' + b.icon + '</span>' +
          '<span class="badge-name">' + b.name + '</span>';
        grid.appendChild(el);
      }
      container.appendChild(grid);
    },

    // Get badges for any user (profile page)
    getUserBadges: async function(username) {
      if (!username || username === 'Guest') return [];
      try {
        await _initFirebase();
        if (!_db) return [];
        var snap = await _getDoc(_doc(_db, 'users', username.toLowerCase()));
        if (!snap.exists()) return [];
        return snap.data().badges || [];
      } catch(e) { return []; }
    },

    // Get full user data for profile page
    getFullProfile: async function(username) {
      if (!username || username === 'Guest') return null;
      try {
        await _initFirebase();
        if (!_db) return null;
        var snap = await _getDoc(_doc(_db, 'users', username.toLowerCase()));
        if (!snap.exists()) return null;
        return snap.data();
      } catch(e) { return null; }
    },

    getEarned: function() { return _earnedCache || []; }
  };

  // Auto-check after page load
  setTimeout(function() {
    if (!_isGuest()) window.ArcadeBadges.check();
  }, 3000);

  window.addEventListener('arcade-auth-change', function() {
    _earnedCache = null;
    if (!_isGuest()) {
      setTimeout(function() { window.ArcadeBadges.check(); }, 1000);
    }
  });
})();
