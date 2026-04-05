// ─── ARCADE PET SYSTEM ───
(function() {
  var PET_TYPES = {
    cat:     { name: 'Cat',     emoji: '\uD83D\uDC31' },
    dog:     { name: 'Dog',     emoji: '\uD83D\uDC36' },
    dragon:  { name: 'Dragon',  emoji: '\uD83D\uDC32' },
    bunny:   { name: 'Bunny',   emoji: '\uD83D\uDC30' },
    penguin: { name: 'Penguin', emoji: '\uD83D\uDC27' }
  };

  var STAGES = [
    { name: 'Baby',  minFeeds: 0,  size: '2rem'   },
    { name: 'Teen',  minFeeds: 10, size: '3.5rem' },
    { name: 'Adult', minFeeds: 25, size: '5rem'   }
  ];

  var FEED_COST = 5;
  var HAPPINESS_DECAY_PER_DAY = 20;
  var HAPPINESS_PER_FEED = 30;
  var MAX_HAPPINESS = 100;
  var MS_PER_DAY = 86400000;

  var _pet = null;
  var _loaded = false;

  // ─── Inject CSS ───
  var style = document.createElement('style');
  style.textContent =
    '@keyframes petBounce{0%,100%{transform:translateY(0)}30%{transform:translateY(-18px) scale(1.1)}60%{transform:translateY(-6px) scale(1.03)}}' +
    '@keyframes petSad{0%,100%{transform:rotate(0deg)}20%{transform:rotate(-5deg)}40%{transform:rotate(5deg)}60%{transform:rotate(-3deg)}80%{transform:rotate(3deg)}}' +
    '@keyframes petSparkle{0%,100%{filter:drop-shadow(0 0 4px gold)}50%{filter:drop-shadow(0 0 12px gold)}}' +
    '.pet-card{background:var(--t-bg2,#1a1a2e);border:2px solid var(--t-border,#2a2a4a);border-radius:16px;padding:1.2rem;font-family:"Segoe UI",Tahoma,sans-serif;color:var(--t-text,#e0e0e0);text-align:center;max-width:280px;margin:0 auto}' +
    '.pet-card:hover{border-color:var(--t-accent,#7b2ff7)}' +
    '.pet-emoji{display:inline-block;transition:transform .3s}' +
    '.pet-emoji.bounce{animation:petBounce .6s ease}' +
    '.pet-emoji.sad{animation:petSad 1.5s ease-in-out infinite}' +
    '.pet-emoji.sparkle{animation:petSparkle 2s ease-in-out infinite}' +
    '.pet-name{font-size:1.1rem;font-weight:700;margin:0.5rem 0 0.2rem;color:var(--t-text,#e0e0e0)}' +
    '.pet-stage{font-size:0.72rem;color:var(--t-dim,#888);margin-bottom:0.6rem;text-transform:uppercase;letter-spacing:1px}' +
    '.pet-happiness-outer{width:100%;height:10px;background:var(--t-bg3,#2a2a4a);border-radius:5px;overflow:hidden;margin:0.4rem 0}' +
    '.pet-happiness-inner{height:100%;border-radius:5px;transition:width .5s ease,background .5s ease}' +
    '.pet-happiness-label{font-size:0.7rem;color:var(--t-dim,#888);margin-bottom:0.6rem}' +
    '.pet-feed-btn{background:linear-gradient(135deg,var(--t-accent,#7b2ff7),#5b1fd7);color:#fff;border:none;padding:0.5rem 1.4rem;border-radius:10px;font-size:0.85rem;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .2s,transform .1s;margin-bottom:0.5rem}' +
    '.pet-feed-btn:hover{opacity:0.9;transform:scale(1.04)}' +
    '.pet-feed-btn:active{transform:scale(0.97)}' +
    '.pet-feed-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none}' +
    '.pet-stats{font-size:0.7rem;color:var(--t-dim,#888);line-height:1.6}' +
    '.pet-abandon{background:none;border:1px solid #ff475744;color:#ff475788;font-size:0.68rem;padding:0.25rem 0.8rem;border-radius:8px;cursor:pointer;font-family:inherit;margin-top:0.6rem;transition:border-color .2s,color .2s}' +
    '.pet-abandon:hover{border-color:#ff4757;color:#ff4757}' +

    '.pet-adopt{background:var(--t-bg2,#1a1a2e);border:2px solid var(--t-border,#2a2a4a);border-radius:16px;padding:1.4rem;font-family:"Segoe UI",Tahoma,sans-serif;color:var(--t-text,#e0e0e0);text-align:center;max-width:340px;margin:0 auto}' +
    '.pet-adopt h3{margin:0 0 0.3rem;font-size:1.1rem;background:linear-gradient(135deg,#00d4ff,#7b2ff7);-webkit-background-clip:text;-webkit-text-fill-color:transparent}' +
    '.pet-adopt-sub{font-size:0.75rem;color:var(--t-dim,#888);margin-bottom:1rem}' +
    '.pet-adopt-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:0.6rem;margin-bottom:0.4rem}' +
    '.pet-adopt-opt{background:var(--t-bg3,#2a2a4a);border:2px solid transparent;border-radius:12px;padding:0.6rem 0.8rem;cursor:pointer;transition:border-color .2s,transform .15s;display:flex;flex-direction:column;align-items:center;gap:0.2rem;min-width:60px}' +
    '.pet-adopt-opt:hover{border-color:var(--t-accent,#7b2ff7);transform:scale(1.07)}' +
    '.pet-adopt-opt .ao-emoji{font-size:1.8rem}' +
    '.pet-adopt-opt .ao-name{font-size:0.7rem;color:var(--t-text,#e0e0e0);font-weight:600}';
  document.head.appendChild(style);

  // ─── Helpers ───
  function _getUser() {
    return localStorage.getItem('arcade_currentUser') || null;
  }

  function _isGuest() {
    var u = _getUser();
    return !u || u === 'Guest';
  }

  function _getStage(feeds) {
    for (var i = STAGES.length - 1; i >= 0; i--) {
      if (feeds >= STAGES[i].minFeeds) return STAGES[i];
    }
    return STAGES[0];
  }

  function _computeHappiness(pet) {
    if (!pet) return 0;
    var now = Date.now();
    var lastFed = pet.lastFed || now;
    var elapsed = now - lastFed;
    var daysMissed = Math.floor(elapsed / MS_PER_DAY);
    var h = pet.happiness - (daysMissed * HAPPINESS_DECAY_PER_DAY);
    return Math.max(0, Math.min(MAX_HAPPINESS, h));
  }

  function _happinessColor(h) {
    if (h >= 60) return '#22c55e';
    if (h >= 30) return '#f59e0b';
    return '#ff4757';
  }

  function _timeAgo(ts) {
    if (!ts) return 'Never';
    var diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < MS_PER_DAY) return Math.floor(diff / 3600000) + 'h ago';
    return Math.floor(diff / MS_PER_DAY) + 'd ago';
  }

  function _dispatch() {
    window.dispatchEvent(new CustomEvent('pet-updated', {
      detail: { pet: _pet ? Object.assign({}, _pet) : null }
    }));
  }

  // ─── Firestore I/O ───
  function _waitForDB() {
    return new Promise(function(resolve) {
      if (window._arcadeDB) { resolve(window._arcadeDB); return; }
      var attempts = 0;
      var iv = setInterval(function() {
        attempts++;
        if (window._arcadeDB) { clearInterval(iv); resolve(window._arcadeDB); }
        else if (attempts > 50) { clearInterval(iv); resolve(null); }
      }, 100);
    });
  }

  function _loadFromFirestore() {
    if (_isGuest()) { _loaded = true; _pet = null; return Promise.resolve(); }
    return _waitForDB().then(function(fdb) {
      if (!fdb) { _loaded = true; return; }
      var key = _getUser().toLowerCase();
      var docRef = fdb.doc(fdb.db, 'users', key);
      return fdb.getDoc(docRef).then(function(snap) {
        if (snap.exists()) {
          var data = snap.data();
          if (data.pet && data.pet.type) {
            _pet = {
              type: data.pet.type,
              feeds: data.pet.feeds || 0,
              happiness: data.pet.happiness != null ? data.pet.happiness : MAX_HAPPINESS,
              lastFed: data.pet.lastFed || Date.now(),
              stage: _getStage(data.pet.feeds || 0).name
            };
          } else {
            _pet = null;
          }
        }
        _loaded = true;
      });
    }).catch(function(e) {
      console.warn('[Pets] Load failed:', e);
      _loaded = true;
    });
  }

  function _saveToFirestore() {
    if (_isGuest()) return Promise.resolve();
    return _waitForDB().then(function(fdb) {
      if (!fdb) return;
      var key = _getUser().toLowerCase();
      var docRef = fdb.doc(fdb.db, 'users', key);
      var petData = _pet ? {
        type: _pet.type,
        feeds: _pet.feeds,
        happiness: _pet.happiness,
        lastFed: _pet.lastFed,
        stage: _pet.stage
      } : null;
      return fdb.setDoc(docRef, { pet: petData }, { merge: true });
    }).catch(function(e) {
      console.warn('[Pets] Save failed:', e);
    });
  }

  // ─── Public API ───
  window.ArcadePets = {
    init: function() {
      return _loadFromFirestore().then(function() {
        _dispatch();
      });
    },

    getPet: function() {
      if (!_pet) return null;
      var currentHappiness = _computeHappiness(_pet);
      return {
        type: _pet.type,
        name: PET_TYPES[_pet.type] ? PET_TYPES[_pet.type].name : _pet.type,
        emoji: PET_TYPES[_pet.type] ? PET_TYPES[_pet.type].emoji : '?',
        feeds: _pet.feeds,
        happiness: currentHappiness,
        lastFed: _pet.lastFed,
        stage: _getStage(_pet.feeds).name
      };
    },

    adopt: function(type) {
      if (_isGuest()) return { ok: false, msg: 'Sign in to adopt a pet' };
      if (_pet) return { ok: false, msg: 'You already have a pet! Abandon it first to adopt a new one.' };
      if (!PET_TYPES[type]) return { ok: false, msg: 'Unknown pet type' };
      _pet = {
        type: type,
        feeds: 0,
        happiness: MAX_HAPPINESS,
        lastFed: Date.now(),
        stage: 'Baby'
      };
      _saveToFirestore();
      _dispatch();
      console.log('[Pets] Adopted a ' + PET_TYPES[type].name + '!');
      return { ok: true };
    },

    feed: function() {
      if (_isGuest()) return { ok: false, msg: 'Sign in first' };
      if (!_pet) return { ok: false, msg: 'You don\'t have a pet' };
      if (!window.ArcadeCoins || !window.ArcadeCoins.spend(FEED_COST)) {
        return { ok: false, msg: 'Not enough coins (need ' + FEED_COST + ')' };
      }
      _pet.feeds++;
      // Update happiness: compute current decayed value, then add feed bonus
      var current = _computeHappiness(_pet);
      _pet.happiness = Math.min(MAX_HAPPINESS, current + HAPPINESS_PER_FEED);
      _pet.lastFed = Date.now();
      _pet.stage = _getStage(_pet.feeds).name;
      _saveToFirestore();
      _dispatch();
      console.log('[Pets] Fed ' + PET_TYPES[_pet.type].name + '! (feeds: ' + _pet.feeds + ', happiness: ' + _pet.happiness + ')');
      return { ok: true };
    },

    abandon: function() {
      if (!_pet) return { ok: false, msg: 'No pet to abandon' };
      var name = PET_TYPES[_pet.type] ? PET_TYPES[_pet.type].name : _pet.type;
      _pet = null;
      _saveToFirestore();
      _dispatch();
      console.log('[Pets] Abandoned ' + name);
      return { ok: true };
    },

    renderPetCard: function(container) {
      if (!container) return;
      container.innerHTML = '';

      if (!_pet) {
        window.ArcadePets.renderAdoptUI(container);
        return;
      }

      var pet = window.ArcadePets.getPet();
      var stage = _getStage(_pet.feeds);
      var happiness = pet.happiness;
      var hColor = _happinessColor(happiness);
      var isAdult = stage.name === 'Adult';
      var isSad = happiness < 30;

      var card = document.createElement('div');
      card.className = 'pet-card';

      // Emoji
      var emojiWrap = document.createElement('div');
      var emojiEl = document.createElement('span');
      emojiEl.className = 'pet-emoji' + (isSad ? ' sad' : '') + (isAdult ? ' sparkle' : '');
      emojiEl.style.fontSize = stage.size;
      emojiEl.textContent = pet.emoji + (isAdult ? ' \u2728' : '');
      emojiWrap.appendChild(emojiEl);
      card.appendChild(emojiWrap);

      // Name
      var nameEl = document.createElement('div');
      nameEl.className = 'pet-name';
      nameEl.textContent = pet.name;
      card.appendChild(nameEl);

      // Stage
      var stageEl = document.createElement('div');
      stageEl.className = 'pet-stage';
      stageEl.textContent = stage.name;
      card.appendChild(stageEl);

      // Happiness bar
      var happyLabel = document.createElement('div');
      happyLabel.className = 'pet-happiness-label';
      happyLabel.textContent = (isSad ? '\uD83D\uDE22 ' : '\uD83D\uDC96 ') + 'Happiness: ' + happiness + '%';
      card.appendChild(happyLabel);

      var barOuter = document.createElement('div');
      barOuter.className = 'pet-happiness-outer';
      var barInner = document.createElement('div');
      barInner.className = 'pet-happiness-inner';
      barInner.style.width = happiness + '%';
      barInner.style.background = hColor;
      barOuter.appendChild(barInner);
      card.appendChild(barOuter);

      // Feed button
      var feedBtn = document.createElement('button');
      feedBtn.className = 'pet-feed-btn';
      feedBtn.textContent = '\uD83C\uDF7D\uFE0F Feed (' + FEED_COST + ' coins)';
      feedBtn.disabled = _isGuest();
      feedBtn.addEventListener('click', function() {
        var result = window.ArcadePets.feed();
        if (result.ok) {
          // Bounce animation
          emojiEl.classList.remove('bounce');
          void emojiEl.offsetWidth; // reflow to restart animation
          emojiEl.classList.add('bounce');
          // Re-render after animation
          setTimeout(function() {
            window.ArcadePets.renderPetCard(container);
          }, 650);
        } else {
          feedBtn.textContent = result.msg;
          feedBtn.disabled = true;
          setTimeout(function() {
            feedBtn.textContent = '\uD83C\uDF7D\uFE0F Feed (' + FEED_COST + ' coins)';
            feedBtn.disabled = false;
          }, 1500);
        }
      });
      card.appendChild(feedBtn);

      // Stats
      var stats = document.createElement('div');
      stats.className = 'pet-stats';
      stats.innerHTML = 'Total feeds: <strong>' + pet.feeds + '</strong><br>Last fed: ' + _timeAgo(pet.lastFed);
      card.appendChild(stats);

      // Abandon button
      var abandonBtn = document.createElement('button');
      abandonBtn.className = 'pet-abandon';
      abandonBtn.textContent = 'Abandon Pet';
      abandonBtn.addEventListener('click', function() {
        if (abandonBtn.dataset.confirm) {
          window.ArcadePets.abandon();
          window.ArcadePets.renderPetCard(container);
        } else {
          abandonBtn.dataset.confirm = '1';
          abandonBtn.textContent = 'Are you sure? Click again';
          abandonBtn.style.borderColor = '#ff4757';
          abandonBtn.style.color = '#ff4757';
          setTimeout(function() {
            delete abandonBtn.dataset.confirm;
            abandonBtn.textContent = 'Abandon Pet';
            abandonBtn.style.borderColor = '';
            abandonBtn.style.color = '';
          }, 3000);
        }
      });
      card.appendChild(abandonBtn);

      container.appendChild(card);
    },

    renderAdoptUI: function(container) {
      if (!container) return;
      container.innerHTML = '';

      var wrap = document.createElement('div');
      wrap.className = 'pet-adopt';

      var h3 = document.createElement('h3');
      h3.textContent = 'Adopt a Pet!';
      wrap.appendChild(h3);

      var sub = document.createElement('div');
      sub.className = 'pet-adopt-sub';
      sub.textContent = 'Choose a companion to take care of';
      wrap.appendChild(sub);

      var grid = document.createElement('div');
      grid.className = 'pet-adopt-grid';

      var types = Object.keys(PET_TYPES);
      for (var i = 0; i < types.length; i++) {
        (function(type) {
          var info = PET_TYPES[type];
          var opt = document.createElement('div');
          opt.className = 'pet-adopt-opt';

          var emoji = document.createElement('span');
          emoji.className = 'ao-emoji';
          emoji.textContent = info.emoji;
          opt.appendChild(emoji);

          var name = document.createElement('span');
          name.className = 'ao-name';
          name.textContent = info.name;
          opt.appendChild(name);

          opt.addEventListener('click', function() {
            if (_isGuest()) {
              if (window.ArcadeAuth) window.ArcadeAuth.openSignIn();
              return;
            }
            var result = window.ArcadePets.adopt(type);
            if (result.ok) {
              window.ArcadePets.renderPetCard(container);
            }
          });

          grid.appendChild(opt);
        })(types[i]);
      }

      wrap.appendChild(grid);
      container.appendChild(wrap);
    }
  };

  // ─── Auto-init on load if signed in ───
  function _autoInit() {
    if (!_isGuest()) {
      window.ArcadePets.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _autoInit);
  } else {
    _autoInit();
  }

  // Reload when auth changes
  window.addEventListener('arcade-auth-change', function() {
    _pet = null;
    _loaded = false;
    if (!_isGuest()) {
      window.ArcadePets.init();
    } else {
      _dispatch();
    }
  });
})();
