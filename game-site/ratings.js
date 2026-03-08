// ─── ARCADE GAME RATINGS & REVIEWS ───
(function() {
  var _db = null;
  var _doc = null;
  var _getDoc = null;
  var _setDoc = null;
  var _collection = null;
  var _getDocs = null;
  var _query = null;
  var _where = null;
  var _orderBy = null;
  var _limit = null;
  var _ratingCache = {};   // gameId -> { avg, count, time }
  var _userRatingCache = {}; // gameId -> { rating, review }

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
      _getDocs = mods[1].getDocs;
      _query = mods[1].query;
      _where = mods[1].where;
      _orderBy = mods[1].orderBy;
      _limit = mods[1].limit;
      var config = {
        apiKey: "AIzaSyCyK7tEcAaqrVNFRggviaEmWH2SMkiwGKk",
        authDomain: "calculator-81d08.firebaseapp.com",
        projectId: "calculator-81d08",
        storageBucket: "calculator-81d08.firebasestorage.app",
        messagingSenderId: "375406495739",
        appId: "1:375406495739:web:fd28553263599864426d5e"
      };
      try {
        var app = getApp('ratings-app');
        _db = getFirestore(app);
      } catch(e) {
        try {
          var app = initializeApp(config, 'ratings-app');
          _db = getFirestore(app);
        } catch(e2) {
          var app = initializeApp(config, 'ratings-app-' + Date.now());
          _db = getFirestore(app);
        }
      }
    }).catch(function(e) {
      console.warn('[Ratings] Firebase init failed:', e);
    });
  }

  // Inject CSS
  var css = document.createElement('style');
  css.textContent =
    '.rating-stars{display:inline-flex;gap:1px;cursor:pointer;font-size:1.1rem;user-select:none}' +
    '.rating-stars .star{color:#2a2a4a;transition:color 0.15s}' +
    '.rating-stars .star.filled{color:#ffd700}' +
    '.rating-stars .star.hovered{color:#ffaa00}' +
    '.rating-stars-static{display:inline-flex;gap:0;font-size:0.7rem;user-select:none}' +
    '.rating-stars-static .star{color:#2a2a4a}' +
    '.rating-stars-static .star.filled{color:#ffd700}' +
    '.rating-stars-static .star.half{color:#ffd700}' +
    '.rating-count{font-size:0.6rem;color:#666;margin-left:3px}' +
    '.rate-btn{position:fixed;bottom:80px;right:16px;z-index:9990;background:linear-gradient(135deg,#1a1a2e,#1f1a3e);border:2px solid #ffd70066;border-radius:12px;padding:0.5rem 1rem;color:#ffd700;font-family:"Segoe UI",Tahoma,sans-serif;font-size:0.85rem;font-weight:600;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.4);transition:all 0.2s;display:none}' +
    '.rate-btn:hover{border-color:#ffd700;transform:translateY(-2px)}' +
    '.rating-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:100000;display:flex;align-items:center;justify-content:center;font-family:"Segoe UI",Tahoma,sans-serif}' +
    '.rating-modal{background:#1a1a2e;border:2px solid #2a2a4a;border-radius:18px;padding:2rem;width:340px;max-width:90vw;text-align:center}' +
    '.rating-modal h3{color:#e0e0e0;margin-bottom:0.8rem;font-size:1.2rem}' +
    '.rating-modal .rm-stars{font-size:2.5rem;margin-bottom:1rem;display:flex;justify-content:center;gap:4px;cursor:pointer}' +
    '.rating-modal .rm-stars .star{color:#2a2a4a;transition:color 0.15s}' +
    '.rating-modal .rm-stars .star.filled{color:#ffd700}' +
    '.rating-modal .rm-stars .star.hovered{color:#ffaa00}' +
    '.rating-modal textarea{width:100%;background:#0f0f1a;border:1px solid #2a2a4a;border-radius:10px;color:#e0e0e0;font-family:inherit;font-size:0.85rem;padding:0.6rem;resize:none;height:70px;outline:none}' +
    '.rating-modal textarea:focus{border-color:#7b2ff7}' +
    '.rating-modal textarea::placeholder{color:#555}' +
    '.rating-modal .rm-btns{display:flex;gap:0.5rem;margin-top:1rem;justify-content:center}' +
    '.rating-modal .rm-btn{padding:0.5rem 1.5rem;border-radius:10px;font-family:inherit;font-size:0.85rem;cursor:pointer;border:2px solid transparent;font-weight:600;transition:all 0.2s}' +
    '.rating-modal .rm-btn.primary{background:linear-gradient(135deg,#ffd700,#ffaa00);color:#0f0f1a;border-color:#ffd700}' +
    '.rating-modal .rm-btn.primary:hover{opacity:0.9}' +
    '.rating-modal .rm-btn.secondary{background:#0f0f1a;color:#aaa;border-color:#2a2a4a}' +
    '.rating-modal .rm-btn.secondary:hover{border-color:#7b2ff7;color:#e0e0e0}' +
    '.rating-modal .rm-msg{font-size:0.75rem;color:#888;margin-top:0.5rem}' +
    '.game-reviews{margin-top:0.8rem}' +
    '.game-reviews .review-item{background:#0f0f1a;border-radius:10px;padding:0.6rem 0.8rem;margin-bottom:0.4rem;font-size:0.8rem}' +
    '.game-reviews .review-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.2rem}' +
    '.game-reviews .review-user{color:#00d4ff;font-weight:600}' +
    '.game-reviews .review-text{color:#bbb;font-style:italic}';
  document.head.appendChild(css);

  window.ArcadeRatings = {
    rate: async function(gameId, stars, review) {
      if (_isGuest()) return { ok: false, msg: 'Sign in to rate games' };
      if (stars < 1 || stars > 5) return { ok: false, msg: 'Rating must be 1-5' };
      try {
        await _initFirebase();
        if (!_db) return { ok: false, msg: 'Database unavailable' };
        var username = _getUser();
        var docId = gameId + '_' + username.toLowerCase();
        var isNew = !_userRatingCache[gameId];

        // Check if existing
        if (!_userRatingCache[gameId]) {
          var existing = await _getDoc(_doc(_db, 'ratings', docId));
          if (existing.exists()) isNew = false;
        }

        await _setDoc(_doc(_db, 'ratings', docId), {
          gameId: gameId,
          username: username,
          rating: stars,
          review: (review || '').substring(0, 150),
          date: new Date().toLocaleDateString()
        });

        _userRatingCache[gameId] = { rating: stars, review: review || '' };
        delete _ratingCache[gameId]; // Invalidate avg cache

        // Award XP for first rating
        if (isNew) {
          if (window.ArcadeLevels) window.ArcadeLevels.addXP(5, 'rate_game');
          if (window.ArcadeChallenges) window.ArcadeChallenges.incrementQuest('games_rated', 1);
        }

        return { ok: true };
      } catch(e) {
        console.warn('[Ratings] Rate failed:', e);
        return { ok: false, msg: e.message || 'Failed to submit rating' };
      }
    },

    getGameRating: async function(gameId) {
      // Cache for 5 min
      var cached = _ratingCache[gameId];
      if (cached && Date.now() - cached.time < 300000) return { avg: cached.avg, count: cached.count };
      try {
        await _initFirebase();
        if (!_db) return { avg: 0, count: 0 };
        var q = _query(_collection(_db, 'ratings'), _where('gameId', '==', gameId));
        var snap = await _getDocs(q);
        var total = 0;
        var count = 0;
        snap.forEach(function(d) {
          total += d.data().rating;
          count++;
        });
        var avg = count > 0 ? Math.round((total / count) * 10) / 10 : 0;
        _ratingCache[gameId] = { avg: avg, count: count, time: Date.now() };
        return { avg: avg, count: count };
      } catch(e) {
        console.warn('[Ratings] Fetch rating failed:', e);
        return { avg: 0, count: 0 };
      }
    },

    getUserRating: async function(gameId) {
      if (_isGuest()) return null;
      if (_userRatingCache[gameId]) return _userRatingCache[gameId];
      try {
        await _initFirebase();
        if (!_db) return null;
        var docId = gameId + '_' + _getUser().toLowerCase();
        var snap = await _getDoc(_doc(_db, 'ratings', docId));
        if (!snap.exists()) return null;
        var data = snap.data();
        _userRatingCache[gameId] = { rating: data.rating, review: data.review || '' };
        return _userRatingCache[gameId];
      } catch(e) {
        return null;
      }
    },

    getGameReviews: async function(gameId, max) {
      max = max || 10;
      try {
        await _initFirebase();
        if (!_db) return [];
        var q = _query(_collection(_db, 'ratings'), _where('gameId', '==', gameId));
        var snap = await _getDocs(q);
        var results = [];
        snap.forEach(function(d) {
          var data = d.data();
          if (data.review) {
            results.push({ username: data.username, rating: data.rating, review: data.review, date: data.date });
          }
        });
        results.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });
        return results.slice(0, max);
      } catch(e) {
        return [];
      }
    },

    renderAvgStars: function(container, avg, count) {
      if (!container || count === 0) return;
      var html = '<span class="rating-stars-static">';
      for (var i = 1; i <= 5; i++) {
        if (avg >= i) html += '<span class="star filled">\u2605</span>';
        else if (avg >= i - 0.5) html += '<span class="star half">\u2605</span>';
        else html += '<span class="star">\u2605</span>';
      }
      html += '</span><span class="rating-count">(' + count + ')</span>';
      container.innerHTML = html;
    },

    showRateButton: function(gameId) {
      if (_isGuest()) return;
      var existing = document.getElementById('rate-game-btn');
      if (existing) existing.remove();
      var btn = document.createElement('button');
      btn.id = 'rate-game-btn';
      btn.className = 'rate-btn';
      btn.textContent = '\u2605 Rate this game';
      btn.onclick = function() {
        window.ArcadeRatings.openRatingModal(gameId);
      };
      document.body.appendChild(btn);
      // Show after 15s
      setTimeout(function() {
        btn.style.display = 'block';
      }, 15000);
    },

    openRatingModal: function(gameId) {
      var overlay = document.createElement('div');
      overlay.className = 'rating-modal-overlay';
      var selectedStars = 0;
      var gameName = (window.ArcadeChallenges && window.ArcadeChallenges.GAME_NAMES) ?
        (window.ArcadeChallenges.GAME_NAMES[gameId] || gameId) : gameId;

      var modal = document.createElement('div');
      modal.className = 'rating-modal';
      modal.innerHTML =
        '<h3>Rate ' + gameName + '</h3>' +
        '<div class="rm-stars">' +
          '<span class="star" data-v="1">\u2605</span>' +
          '<span class="star" data-v="2">\u2605</span>' +
          '<span class="star" data-v="3">\u2605</span>' +
          '<span class="star" data-v="4">\u2605</span>' +
          '<span class="star" data-v="5">\u2605</span>' +
        '</div>' +
        '<textarea placeholder="Write a short review (optional, max 150 chars)" maxlength="150"></textarea>' +
        '<div class="rm-btns">' +
          '<button class="rm-btn secondary rm-cancel">Cancel</button>' +
          '<button class="rm-btn primary rm-submit" disabled>Submit</button>' +
        '</div>' +
        '<div class="rm-msg"></div>';

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      var stars = modal.querySelectorAll('.rm-stars .star');
      var submitBtn = modal.querySelector('.rm-submit');
      var textarea = modal.querySelector('textarea');
      var msgEl = modal.querySelector('.rm-msg');

      // Load existing rating
      window.ArcadeRatings.getUserRating(gameId).then(function(existing) {
        if (existing) {
          selectedStars = existing.rating;
          textarea.value = existing.review || '';
          _updateStars();
          submitBtn.disabled = false;
        }
      });

      function _updateStars() {
        stars.forEach(function(s) {
          var v = parseInt(s.getAttribute('data-v'));
          s.classList.toggle('filled', v <= selectedStars);
        });
      }

      modal.querySelector('.rm-stars').addEventListener('click', function(e) {
        var star = e.target.closest('.star');
        if (!star) return;
        selectedStars = parseInt(star.getAttribute('data-v'));
        _updateStars();
        submitBtn.disabled = false;
      });

      modal.querySelector('.rm-stars').addEventListener('mouseover', function(e) {
        var star = e.target.closest('.star');
        if (!star) return;
        var v = parseInt(star.getAttribute('data-v'));
        stars.forEach(function(s) {
          var sv = parseInt(s.getAttribute('data-v'));
          s.classList.toggle('hovered', sv <= v);
        });
      });

      modal.querySelector('.rm-stars').addEventListener('mouseout', function() {
        stars.forEach(function(s) { s.classList.remove('hovered'); });
      });

      modal.querySelector('.rm-cancel').addEventListener('click', function() {
        overlay.remove();
      });

      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) overlay.remove();
      });

      submitBtn.addEventListener('click', async function() {
        if (!selectedStars) return;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        var result = await window.ArcadeRatings.rate(gameId, selectedStars, textarea.value.trim());
        if (result.ok) {
          msgEl.style.color = '#2ed573';
          msgEl.textContent = 'Rating saved!';
          setTimeout(function() { overlay.remove(); }, 800);
        } else {
          msgEl.style.color = '#ff4757';
          msgEl.textContent = result.msg;
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit';
        }
      });
    }
  };
})();
