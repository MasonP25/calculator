// ─── EASTER EGG HUNT (active March 14 – April 5, 2026) ───
(function() {
  var now = new Date();
  var end = new Date(2026, 3, 6); // April 6
  var start = new Date(2026, 2, 14); // March 14
  if (now >= end || now < start) {
    localStorage.removeItem('arcade_easter_found');
    return;
  }

  var TOTAL = 20;
  var REWARD = 5;
  var found = JSON.parse(localStorage.getItem('arcade_easter_found') || '[]');

  // ─── Firebase sync ───
  var _edb = null, _edoc = null, _egetDoc = null, _esetDoc = null;
  function _eInitFirebase() {
    if (_edb) return Promise.resolve();
    return Promise.all([
      import("https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js")
    ]).then(function(mods) {
      var initializeApp = mods[0].initializeApp;
      var getApp = mods[0].getApp;
      var getFirestore = mods[1].getFirestore;
      _edoc = mods[1].doc;
      _egetDoc = mods[1].getDoc;
      _esetDoc = mods[1].setDoc;
      var config = {
        apiKey: "AIzaSyCyK7tEcAaqrVNFRggviaEmWH2SMkiwGKk",
        authDomain: "calculator-81d08.firebaseapp.com",
        projectId: "calculator-81d08",
        storageBucket: "calculator-81d08.firebasestorage.app",
        messagingSenderId: "375406495739",
        appId: "1:375406495739:web:fd28553263599864426d5e"
      };
      try { _edb = getFirestore(getApp('easter-app')); } catch(e) {
        try { _edb = getFirestore(initializeApp(config, 'easter-app')); } catch(e2) {
          _edb = getFirestore(initializeApp(config, 'easter-app-' + Date.now()));
        }
      }
    }).catch(function() {});
  }

  function _eGetUser() {
    var u = localStorage.getItem('arcade_currentUser');
    return (u && u !== 'Guest') ? u : null;
  }

  function _eSaveToCloud() {
    var user = _eGetUser();
    if (!user) return;
    _eInitFirebase().then(function() {
      if (!_edb) return;
      _esetDoc(_edoc(_edb, 'users', user.toLowerCase()), { easterEggs: found }, { merge: true });
    }).catch(function() {});
  }

  function _eLoadFromCloud() {
    var user = _eGetUser();
    if (!user) return Promise.resolve();
    return _eInitFirebase().then(function() {
      if (!_edb) return;
      return _egetDoc(_edoc(_edb, 'users', user.toLowerCase())).then(function(snap) {
        if (snap.exists() && snap.data().easterEggs) {
          var cloudEggs = snap.data().easterEggs;
          var merged = found.slice();
          for (var i = 0; i < cloudEggs.length; i++) {
            if (merged.indexOf(cloudEggs[i]) === -1) merged.push(cloudEggs[i]);
          }
          if (merged.length > found.length) {
            found = merged;
            localStorage.setItem('arcade_easter_found', JSON.stringify(found));
          }
        }
      });
    }).catch(function() {});
  }

  // Sync from cloud on load
  _eLoadFromCloud().then(function() {
    // Update counter after cloud sync
    var el = document.getElementById('ec-text');
    if (el) {
      el.textContent = found.length + '/' + TOTAL;
      if (found.length >= TOTAL) {
        var c = document.getElementById('easter-counter');
        if (c) { c.classList.add('complete'); c.innerHTML = '<span class="ec-emoji">\uD83D\uDC30</span><span>All found! \uD83C\uDF89</span>'; }
      }
    }
  });
  var EMOJIS = [
    '\uD83E\uDD5A', '\uD83D\uDC23', '\uD83D\uDC30', '\uD83C\uDF37',
    '\uD83E\uDD5A', '\uD83D\uDC23', '\uD83D\uDC07', '\uD83C\uDF38',
    '\uD83E\uDD5A', '\uD83D\uDC30', '\uD83C\uDF3C', '\uD83D\uDC25',
    '\uD83E\uDD5A', '\uD83D\uDC23', '\uD83D\uDC30', '\uD83C\uDF37',
    '\uD83D\uDC07', '\uD83C\uDF38', '\uD83E\uDD5A', '\uD83D\uDC23'
  ];

  // Determine which page we're on
  var page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
  if (page === '' || page === 'index') page = 'index';
  if (page === 'minecraft' || page === 'eaglercraft') return;

  // Each page has specific egg IDs assigned to it
  // index: 0-9 (on game cards), game pages: 10-14, fame: 15-16, shop: 17-18, profile: 19
  var PAGE_EGGS = {
    index:   [0,1,2,3,4,5,6,7,8,9],
    fame:    [15,16],
    shop:    [17,18],
    profile: [19]
  };
  // Game pages share eggs 10-14 spread across specific games
  var GAME_EGGS = {
    snake: 10, tetris: 11, pacman: 12, flappy: 13, minesweeper: 14
  };

  var myEggs = PAGE_EGGS[page] || [];
  if (GAME_EGGS[page] !== undefined) myEggs = [GAME_EGGS[page]];
  // Pages with no eggs still show the counter
  var hasEggs = myEggs.length > 0;

  // CSS
  var style = document.createElement('style');
  style.textContent =
    '.easter-egg{position:absolute;font-size:1.2rem;cursor:pointer;opacity:0.2;transition:opacity 0.3s,transform 0.3s;z-index:2;user-select:none;-webkit-user-select:none;filter:grayscale(0.5)}' +
    '.easter-egg:hover{opacity:0.55;filter:grayscale(0)}' +
    '.easter-egg.found{opacity:0;pointer-events:none;transform:scale(2);transition:all 0.5s}' +
    '.easter-egg-fixed{position:fixed;font-size:1.3rem;cursor:pointer;opacity:0.15;transition:opacity 0.3s,transform 0.3s;z-index:9;user-select:none;-webkit-user-select:none;filter:grayscale(0.5)}' +
    '.easter-egg-fixed:hover{opacity:0.5;filter:grayscale(0)}' +
    '.easter-egg-fixed.found{opacity:0;pointer-events:none;transform:scale(2);transition:all 0.5s}' +
    '#easter-counter{position:fixed;top:72px;right:16px;z-index:9996;background:var(--t-bg2,#1a1a2e);border:1px solid var(--t-border,#2a2a4a);padding:5px 12px;border-radius:8px;font-size:0.8rem;color:var(--t-dim,#aaa);font-family:"Segoe UI",Tahoma,sans-serif;display:flex;align-items:center;gap:6px;transition:border-color 0.3s,color 0.3s}' +
    '#easter-counter .ec-emoji{font-size:1rem}' +
    '#easter-counter.complete{border-color:#ffd700;color:#ffd700}' +
    '@keyframes eggPop{0%{transform:scale(1)}50%{transform:scale(1.8) rotate(15deg)}100%{transform:scale(0) rotate(30deg)}}' +
    '.egg-pop{animation:eggPop 0.5s ease forwards}' +
    '.egg-reward{position:fixed;z-index:100000;font-size:1rem;font-weight:700;color:#ffd700;pointer-events:none;font-family:"Segoe UI",Tahoma,sans-serif;text-shadow:0 2px 8px rgba(0,0,0,0.5)}' +
    '@keyframes floatUp{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-60px)}}';
  document.head.appendChild(style);

  // Counter (shown on every page)
  var counter = document.createElement('div');
  counter.id = 'easter-counter';
  if (found.length >= TOTAL) {
    counter.classList.add('complete');
    counter.innerHTML = '<span class="ec-emoji">\uD83D\uDC30</span><span>All found! \uD83C\uDF89</span>';
  } else {
    counter.innerHTML = '<span class="ec-emoji">\uD83E\uDD5A</span><span id="ec-text">' + found.length + '/' + TOTAL + '</span>';
  }
  document.body.appendChild(counter);

  function updateCounter() {
    var el = document.getElementById('ec-text');
    if (!el) return;
    el.textContent = found.length + '/' + TOTAL;
    if (found.length >= TOTAL) {
      counter.classList.add('complete');
      counter.innerHTML = '<span class="ec-emoji">\uD83D\uDC30</span><span>All found! \uD83C\uDF89</span>';
    }
  }

  // Click handler (works for both absolute and fixed eggs)
  document.addEventListener('click', function(e) {
    var egg = e.target.closest('.easter-egg, .easter-egg-fixed');
    if (!egg) return;
    e.preventDefault();
    e.stopPropagation();
    var id = egg.getAttribute('data-egg-id');
    if (found.indexOf(id) !== -1) return;

    egg.classList.add('egg-pop');

    var rect = egg.getBoundingClientRect();
    var reward = document.createElement('div');
    reward.className = 'egg-reward';
    reward.textContent = '+' + REWARD + ' coins!';
    reward.style.left = rect.left + 'px';
    reward.style.top = rect.top + 'px';
    reward.style.animation = 'floatUp 1s ease forwards';
    document.body.appendChild(reward);
    setTimeout(function() { reward.remove(); }, 1000);

    found.push(id);
    localStorage.setItem('arcade_easter_found', JSON.stringify(found));
    _eSaveToCloud();
    updateCounter();

    if (window.ArcadeCoins) {
      _arcadeEarnCoins(REWARD, 'Easter egg #' + (parseInt(id) + 1));
    }

    setTimeout(function() { egg.style.display = 'none'; }, 500);

    if (found.length >= TOTAL) {
      setTimeout(function() {
        var bonus = 50;
        _arcadeEarnCoins(bonus, 'Easter egg hunt complete!');
        var msg = document.createElement('div');
        msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:100001;background:var(--t-bg2,#1a1a2e);border:2px solid #ffd700;border-radius:16px;padding:2rem;text-align:center;font-family:"Segoe UI",Tahoma,sans-serif;box-shadow:0 12px 50px rgba(0,0,0,0.7);color:#e0e0e0;max-width:320px';
        msg.innerHTML = '<div style="font-size:2.5rem;margin-bottom:0.5rem">\uD83C\uDF89\uD83D\uDC30\uD83C\uDF89</div>'
          + '<div style="font-size:1.2rem;font-weight:700;color:#ffd700;margin-bottom:0.5rem">All Eggs Found!</div>'
          + '<div style="color:#aaa;font-size:0.85rem;margin-bottom:1rem">You found all ' + TOTAL + ' hidden eggs across the site!<br>Bonus: +' + bonus + ' coins!</div>'
          + '<button onclick="this.parentElement.remove()" style="background:#ffd700;color:#0f0f1a;border:none;padding:8px 24px;border-radius:10px;font-weight:700;cursor:pointer;font-size:0.9rem">Nice!</button>';
        document.body.appendChild(msg);
      }, 800);
    }
  }, true);

  if (!hasEggs) return;

  // ── INDEX PAGE: eggs hidden on game cards ──
  if (page === 'index') {
    function placeIndexEggs() {
      var cards = document.querySelectorAll('.games:not(#favGames):not(#recentGames) .card');
      if (cards.length < 10) return;

      var seed = cards.length;
      var positions = [];
      for (var i = 0; i < cards.length; i++) positions.push(i);
      for (var i = positions.length - 1; i > 0; i--) {
        seed = (seed * 16807 + 7) % 2147483647;
        var j = seed % (i + 1);
        var tmp = positions[i]; positions[i] = positions[j]; positions[j] = tmp;
      }
      var chosen = positions.slice(0, 10);

      for (var i = 0; i < 10; i++) {
        var eggId = String(myEggs[i]);
        var card = cards[chosen[i]];
        if (!card || card.querySelector('.easter-egg')) continue;
        if (found.indexOf(eggId) !== -1) continue;
        var egg = document.createElement('span');
        egg.className = 'easter-egg';
        egg.setAttribute('data-egg-id', eggId);
        egg.textContent = EMOJIS[myEggs[i]];
        seed = (seed * 16807 + 7) % 2147483647;
        egg.style.left = (5 + seed % 70) + '%';
        seed = (seed * 16807 + 7) % 2147483647;
        egg.style.top = (10 + seed % 60) + '%';
        card.style.position = 'relative';
        card.appendChild(egg);
      }
    }
    var _ready = function() { setTimeout(placeIndexEggs, 1000); };
    if (document.readyState === 'complete') _ready();
    else window.addEventListener('load', _ready);
    var obs = new MutationObserver(function() { setTimeout(placeIndexEggs, 200); });
    var gamesEl = document.querySelector('.games');
    if (gamesEl) obs.observe(gamesEl, { childList: true });
    return;
  }

  // ── GAME PAGES: egg hidden near the game area ──
  if (GAME_EGGS[page] !== undefined) {
    var eggId = String(GAME_EGGS[page]);
    if (found.indexOf(eggId) !== -1) return;
    function placeGameEgg() {
      if (document.querySelector('.easter-egg-fixed')) return;
      var egg = document.createElement('span');
      egg.className = 'easter-egg-fixed';
      egg.setAttribute('data-egg-id', eggId);
      egg.textContent = EMOJIS[GAME_EGGS[page]];
      // Pseudorandom position based on page name
      var h = 0;
      for (var i = 0; i < page.length; i++) h = ((h << 5) - h + page.charCodeAt(i)) | 0;
      h = Math.abs(h);
      var positions = [
        { bottom: '100px', right: '30px' },
        { bottom: '80px', left: '20px' },
        { top: '70px', right: '50px' },
        { bottom: '120px', left: '40px' },
        { top: '90px', left: '30px' }
      ];
      var pos = positions[h % positions.length];
      for (var k in pos) egg.style[k] = pos[k];
      document.body.appendChild(egg);
    }
    var _ready2 = function() { setTimeout(placeGameEgg, 1500); };
    if (document.readyState === 'complete') _ready2();
    else window.addEventListener('load', _ready2);
    return;
  }

  // ── FAME, SHOP, PROFILE: eggs in fixed positions on the page ──
  function placePageEggs() {
    var spots;
    if (page === 'fame') {
      spots = [
        { bottom: '80px', right: '30px' },
        { top: '80px', left: '25px' }
      ];
    } else if (page === 'shop') {
      spots = [
        { bottom: '90px', left: '20px' },
        { top: '70px', right: '40px' }
      ];
    } else if (page === 'profile') {
      spots = [
        { bottom: '100px', right: '25px' }
      ];
    }
    if (!spots) return;

    for (var i = 0; i < myEggs.length; i++) {
      var eggId = String(myEggs[i]);
      if (found.indexOf(eggId) !== -1) continue;
      if (document.querySelector('[data-egg-id="' + eggId + '"]')) continue;
      var egg = document.createElement('span');
      egg.className = 'easter-egg-fixed';
      egg.setAttribute('data-egg-id', eggId);
      egg.textContent = EMOJIS[myEggs[i]];
      var s = spots[i] || spots[0];
      for (var k in s) egg.style[k] = s[k];
      document.body.appendChild(egg);
    }
  }
  var _ready3 = function() { setTimeout(placePageEggs, 1500); };
  if (document.readyState === 'complete') _ready3();
  else window.addEventListener('load', _ready3);
})();
