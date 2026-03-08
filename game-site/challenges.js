// ─── ARCADE CHALLENGES: Daily Challenge, Game of the Day, Weekly Quests ───
(function() {
  var _db = null;
  var _doc = null;
  var _getDoc = null;
  var _setDoc = null;
  var _loaded = false;
  var _dailyChallenge = null;
  var _weeklyQuests = null;

  // All game IDs for GOTD rotation
  var GAME_IDS = [
    'snake','tetris','flappy','2048','breakout','pacman','crossy','asteroids',
    'doodle','invaders','geodash','whack','bubbles','duckhunt','dino','galaga',
    'solitaire','wordle','sudoku','typing','hangman','simon','connections',
    'memory','tiles','colorswitch','fruit','flood','wordsearch','maze',
    'nonogram','huesort','lightsout','pipes','ballsort','blockblast',
    'stickmanhook','paperio','fruitmerge','helicopter','wordscramble',
    'match3','wordscapes','stack','crossword','td','bulletdodge','rhythm',
    'golf','idleminer','biztycoon','parkingjam','snake','pong','tron',
    'tanks','racer','connect4','reaction','chess','checkers','battleship',
    'pool','dotsboxes','poker','rps','tictactoe','uno','wavelength',
    'holeio','snakeio','penguin','imposter','gravity'
  ];
  // De-dupe
  GAME_IDS = GAME_IDS.filter(function(v, i, a) { return a.indexOf(v) === i; });

  // Game name map for display
  var GAME_NAMES = {
    snake:'Snake',tetris:'Tetris',flappy:'Flappy Bird','2048':'2048',breakout:'Breakout',
    pacman:'Pac-Man',crossy:'Crossy Road',asteroids:'Asteroids',doodle:'Doodle Jump',
    invaders:'Space Invaders',geodash:'Geometry Dash',whack:'Whack-a-Mole',bubbles:'Bubble Shooter',
    duckhunt:'Duck Hunt',dino:'Dino Runner',galaga:'Galaga',solitaire:'Solitaire',wordle:'Wordle',
    sudoku:'Sudoku',typing:'Typing Test',hangman:'Hangman',simon:'Simon Says',
    connections:'Connections',memory:'Memory Match',tiles:'Piano Tiles',colorswitch:'Color Switch',
    fruit:'Fruit Slicer',flood:'Color Flood',wordsearch:'Word Search',maze:'Maze Runner',
    nonogram:'Nonogram',huesort:'Hue Sort',lightsout:'Lights Out',pipes:'Pipe Puzzle',
    ballsort:'Ball Sort',blockblast:'Block Blast',stickmanhook:'Stickman Hook',paperio:'Paper.io',
    fruitmerge:'Fruit Merge',helicopter:'Helicopter',wordscramble:'Word Scramble',match3:'Match 3',
    wordscapes:'Wordscapes',stack:'Stack Tower',crossword:'Crossword',td:'Tower Defense',
    bulletdodge:'Bullet Dodge',rhythm:'Rhythm',golf:'Mini Golf',idleminer:'Idle Miner',
    biztycoon:'Biz Tycoon',parkingjam:'Parking Jam',pong:'Pong',tron:'Tron',tanks:'Tank Battle',
    racer:'Space Race',connect4:'Connect Four',reaction:'Reaction Time',chess:'Chess',
    checkers:'Checkers',battleship:'Battleship',pool:'Pool',dotsboxes:'Dots & Boxes',
    poker:'Poker',rps:'Rock Paper Scissors',tictactoe:'Tic Tac Toe',uno:'UNO',
    wavelength:'Wavelength',holeio:'Hole.io',snakeio:'Snake.io',penguin:'Penguin Knockout',
    imposter:'Imposter',gravity:'Gravity Run'
  };

  // ─── Daily Challenge Pool ───
  var DAILY_CHALLENGES = [
    { id: 'snake50', desc: 'Score 50+ in Snake', gameId: 'snake', target: 50, type: 'score' },
    { id: 'flappy10', desc: 'Score 10+ in Flappy Bird', gameId: 'flappy', target: 10, type: 'score' },
    { id: 'tetris500', desc: 'Score 500+ in Tetris', gameId: 'tetris', target: 500, type: 'score' },
    { id: '2048_1024', desc: 'Score 1024+ in 2048', gameId: '2048', target: 1024, type: 'score' },
    { id: 'pacman200', desc: 'Score 200+ in Pac-Man', gameId: 'pacman', target: 200, type: 'score' },
    { id: 'dino100', desc: 'Score 100+ in Dino Runner', gameId: 'dino', target: 100, type: 'score' },
    { id: 'whack50', desc: 'Score 50+ in Whack-a-Mole', gameId: 'whack', target: 50, type: 'score' },
    { id: 'stack20', desc: 'Stack 20+ in Stack Tower', gameId: 'stack', target: 20, type: 'score' },
    { id: 'crossy20', desc: 'Score 20+ in Crossy Road', gameId: 'crossy', target: 20, type: 'score' },
    { id: 'breakout100', desc: 'Score 100+ in Breakout', gameId: 'breakout', target: 100, type: 'score' },
    { id: 'bubbles200', desc: 'Score 200+ in Bubble Shooter', gameId: 'bubbles', target: 200, type: 'score' },
    { id: 'geodash3', desc: 'Reach level 3+ in Geometry Dash', gameId: 'geodash', target: 3, type: 'score' },
    { id: 'invaders100', desc: 'Score 100+ in Space Invaders', gameId: 'invaders', target: 100, type: 'score' },
    { id: 'duckhunt100', desc: 'Score 100+ in Duck Hunt', gameId: 'duckhunt', target: 100, type: 'score' },
    { id: 'fruit50', desc: 'Score 50+ in Fruit Slicer', gameId: 'fruit', target: 50, type: 'score' },
    { id: 'galaga200', desc: 'Score 200+ in Galaga', gameId: 'galaga', target: 200, type: 'score' },
    { id: 'typing30', desc: 'Score 30+ in Typing Test', gameId: 'typing', target: 30, type: 'score' },
    { id: 'match3_500', desc: 'Score 500+ in Match 3', gameId: 'match3', target: 500, type: 'score' },
    { id: 'helicopter50', desc: 'Fly 50+ meters in Helicopter', gameId: 'helicopter', target: 50, type: 'score' },
    { id: 'doodle200', desc: 'Reach 200+ in Doodle Jump', gameId: 'doodle', target: 200, type: 'score' },
    { id: 'play3', desc: 'Play 3 different games today', gameId: null, target: 3, type: 'play_count' },
    { id: 'play5', desc: 'Play 5 different games today', gameId: null, target: 5, type: 'play_count' },
    { id: 'play7', desc: 'Play 7 different games today', gameId: null, target: 7, type: 'play_count' },
    { id: 'earn100', desc: 'Earn 100 coins today', gameId: null, target: 100, type: 'coins_earned' },
    { id: 'earn200', desc: 'Earn 200 coins today', gameId: null, target: 200, type: 'coins_earned' },
    { id: 'win3', desc: 'Get on 3 leaderboards today', gameId: null, target: 3, type: 'scores_posted' },
    { id: 'wordle1', desc: 'Solve a Wordle puzzle', gameId: 'wordle', target: 1, type: 'score' },
    { id: 'simon10', desc: 'Reach round 10 in Simon Says', gameId: 'simon', target: 10, type: 'score' },
    { id: 'colorswitch10', desc: 'Score 10+ in Color Switch', gameId: 'colorswitch', target: 10, type: 'score' },
    { id: 'rhythm100', desc: 'Score 100+ in Rhythm', gameId: 'rhythm', target: 100, type: 'score' }
  ];

  // ─── Weekly Quest Pool ───
  var WEEKLY_QUESTS = [
    { id: 'wk_play10', desc: 'Play 10 games this week', type: 'games_played', target: 10, icon: '\uD83C\uDFAE' },
    { id: 'wk_play25', desc: 'Play 25 games this week', type: 'games_played', target: 25, icon: '\uD83C\uDFAE' },
    { id: 'wk_play50', desc: 'Play 50 games this week', type: 'games_played', target: 50, icon: '\uD83D\uDD25' },
    { id: 'wk_coins200', desc: 'Earn 200 coins this week', type: 'coins_earned', target: 200, icon: '\uD83D\uDCB0' },
    { id: 'wk_coins500', desc: 'Earn 500 coins this week', type: 'coins_earned', target: 500, icon: '\uD83D\uDCB0' },
    { id: 'wk_coins1000', desc: 'Earn 1000 coins this week', type: 'coins_earned', target: 1000, icon: '\uD83D\uDCB0' },
    { id: 'wk_scores5', desc: 'Post 5 scores this week', type: 'scores_posted', target: 5, icon: '\uD83C\uDFC6' },
    { id: 'wk_scores15', desc: 'Post 15 scores this week', type: 'scores_posted', target: 15, icon: '\uD83C\uDFC6' },
    { id: 'wk_place3', desc: 'Reach top 3 on 2 leaderboards', type: 'placements', target: 2, icon: '\uD83E\uDD47' },
    { id: 'wk_place5', desc: 'Reach top 3 on 5 leaderboards', type: 'placements', target: 5, icon: '\uD83E\uDD47' },
    { id: 'wk_friend1', desc: 'Add a friend this week', type: 'friends_added', target: 1, icon: '\uD83E\uDD1D' },
    { id: 'wk_friend3', desc: 'Add 3 friends this week', type: 'friends_added', target: 3, icon: '\uD83E\uDD1D' },
    { id: 'wk_gotd3', desc: 'Play the Game of the Day 3 times', type: 'gotd_played', target: 3, icon: '\u2B50' },
    { id: 'wk_gotd5', desc: 'Play the Game of the Day 5 times', type: 'gotd_played', target: 5, icon: '\u2B50' },
    { id: 'wk_challenge3', desc: 'Complete 3 daily challenges', type: 'challenges_done', target: 3, icon: '\uD83C\uDFAF' },
    { id: 'wk_challenge5', desc: 'Complete 5 daily challenges', type: 'challenges_done', target: 5, icon: '\uD83C\uDFAF' },
    { id: 'wk_rate3', desc: 'Rate 3 games this week', type: 'games_rated', target: 3, icon: '\u2B50' },
    { id: 'wk_rate5', desc: 'Rate 5 games this week', type: 'games_rated', target: 5, icon: '\u2B50' }
  ];

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
        var app = getApp('challenges-app');
        _db = getFirestore(app);
      } catch(e) {
        try {
          var app = initializeApp(config, 'challenges-app');
          _db = getFirestore(app);
        } catch(e2) {
          var app = initializeApp(config, 'challenges-app-' + Date.now());
          _db = getFirestore(app);
        }
      }
    }).catch(function(e) {
      console.warn('[Challenges] Firebase init failed:', e);
    });
  }

  // ─── Date helpers ───
  function _today() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }

  function _dayOfYear() {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000);
  }

  function _weekId() {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 1);
    var weekNum = Math.floor(((now - start) / 86400000 + start.getDay()) / 7);
    return now.getFullYear() + '-W' + String(weekNum).padStart(2, '0');
  }

  // Simple seeded shuffle for deterministic daily/weekly picks
  function _seededShuffle(arr, seed) {
    var a = arr.slice();
    var s = seed;
    for (var i = a.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      var j = Math.floor((s / 233280) * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // ─── GAME OF THE DAY ───
  function _getGOTD() {
    var day = _dayOfYear();
    var year = new Date().getFullYear();
    var seed = year * 1000 + day;
    var shuffled = _seededShuffle(GAME_IDS, seed);
    return shuffled[0];
  }

  // ─── DAILY CHALLENGE ───
  function _getTodaysChallenge() {
    var day = _dayOfYear();
    var year = new Date().getFullYear();
    var seed = year * 1000 + day + 7777;
    var shuffled = _seededShuffle(DAILY_CHALLENGES, seed);
    return shuffled[0];
  }

  // ─── WEEKLY QUESTS ───
  function _getWeekQuests() {
    var wk = _weekId();
    var seed = 0;
    for (var i = 0; i < wk.length; i++) seed = seed * 31 + wk.charCodeAt(i);
    var shuffled = _seededShuffle(WEEKLY_QUESTS, Math.abs(seed));
    return shuffled.slice(0, 3);
  }

  // ─── Load user state ───
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
      var today = _today();
      var wk = _weekId();

      // Daily challenge state
      var dc = data.dailyChallenge || {};
      var todaysChallenge = _getTodaysChallenge();
      if (dc.day !== today) {
        // New day — reset
        _dailyChallenge = { day: today, challengeId: todaysChallenge.id, completed: false, progress: 0, gamesPlayedToday: [] };
        await _setDoc(ref, { dailyChallenge: _dailyChallenge }, { merge: true });
      } else {
        _dailyChallenge = dc;
        if (!_dailyChallenge.progress) _dailyChallenge.progress = 0;
        if (!_dailyChallenge.gamesPlayedToday) _dailyChallenge.gamesPlayedToday = [];
      }

      // Weekly quests state
      var wq = data.weeklyQuests || {};
      var weekQuests = _getWeekQuests();
      if (wq.week !== wk) {
        // New week — reset
        _weeklyQuests = {
          week: wk,
          quests: weekQuests.map(function(q) { return { id: q.id, progress: 0, target: q.target, completed: false }; })
        };
        await _setDoc(ref, { weeklyQuests: _weeklyQuests }, { merge: true });
      } else {
        _weeklyQuests = wq;
      }

      _loaded = true;
    } catch(e) {
      console.warn('[Challenges] Load failed:', e);
    }
  }

  // ─── Save daily challenge state ───
  async function _saveDailyChallenge() {
    if (_isGuest() || !_db) return;
    var key = _getUser().toLowerCase();
    var ref = _doc(_db, 'users', key);
    await _setDoc(ref, { dailyChallenge: _dailyChallenge }, { merge: true });
  }

  // ─── Save weekly quests state ───
  async function _saveWeeklyQuests() {
    if (_isGuest() || !_db) return;
    var key = _getUser().toLowerCase();
    var ref = _doc(_db, 'users', key);
    await _setDoc(ref, { weeklyQuests: _weeklyQuests }, { merge: true });
  }

  // ─── Inject CSS ───
  var css = document.createElement('style');
  css.textContent =
    '.challenge-widget{max-width:400px;margin:0.5rem auto 1rem;background:#1a1a2e;border:2px solid #ffd70044;border-radius:14px;padding:0.8rem 1.2rem;text-align:center;font-family:"Segoe UI",Tahoma,sans-serif}' +
    '.challenge-widget .cw-title{font-size:0.7rem;text-transform:uppercase;letter-spacing:2px;color:#ffd700;margin-bottom:0.3rem}' +
    '.challenge-widget .cw-desc{font-size:0.95rem;color:#e0e0e0;margin-bottom:0.5rem}' +
    '.challenge-widget .cw-bar{background:#0f0f1a;border-radius:6px;height:8px;overflow:hidden;margin-bottom:0.2rem}' +
    '.challenge-widget .cw-bar-fill{height:100%;background:linear-gradient(90deg,#ffd700,#ffaa00);border-radius:6px;transition:width 0.6s}' +
    '.challenge-widget .cw-status{font-size:0.7rem;color:#888}' +
    '.challenge-widget.completed{border-color:#2ed573}' +
    '.challenge-widget.completed .cw-title{color:#2ed573}' +
    '.gotd-banner{position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:linear-gradient(90deg,#ffd700,#ffaa00);color:#0f0f1a;font-size:0.55rem;font-weight:700;padding:2px 10px;border-radius:0 0 8px 8px;text-transform:uppercase;letter-spacing:1px;white-space:nowrap;z-index:2}' +
    '.card.gotd{border-color:#ffd70088!important;box-shadow:0 0 20px rgba(255,215,0,0.15)!important;position:relative}' +
    '.card.gotd:hover{border-color:#ffd700!important;box-shadow:0 4px 25px rgba(255,215,0,0.3)!important}' +
    '.quest-card{background:#1a1a2e;border:1px solid #2a2a4a;border-radius:12px;padding:0.7rem 1rem;margin-bottom:0.5rem}' +
    '.quest-card .qc-row{display:flex;align-items:center;gap:0.5rem}' +
    '.quest-card .qc-icon{font-size:1.2rem}' +
    '.quest-card .qc-desc{flex:1;font-size:0.85rem;color:#e0e0e0}' +
    '.quest-card .qc-prog{font-size:0.7rem;color:#888;white-space:nowrap}' +
    '.quest-card .qc-bar{background:#0f0f1a;border-radius:5px;height:6px;overflow:hidden;margin-top:0.3rem}' +
    '.quest-card .qc-bar-fill{height:100%;background:linear-gradient(90deg,#7b2ff7,#00d4ff);border-radius:5px;transition:width 0.6s}' +
    '.quest-card.completed{border-color:#2ed573}' +
    '.quest-card.completed .qc-desc{color:#2ed573}';
  document.head.appendChild(css);

  // Init on auth
  window.addEventListener('auth-ready', function() { _load(); });
  setTimeout(function() { _load(); }, 2000);

  window.ArcadeChallenges = {
    // ─── GAME OF THE DAY ───
    getGOTD: function() {
      return _getGOTD();
    },
    isGOTD: function(gameId) {
      return gameId === _getGOTD();
    },
    getGOTDName: function() {
      var id = _getGOTD();
      return GAME_NAMES[id] || id;
    },

    // ─── DAILY CHALLENGE ───
    getDailyChallenge: function() {
      var ch = _getTodaysChallenge();
      var state = _dailyChallenge || {};
      return {
        id: ch.id,
        desc: ch.desc,
        gameId: ch.gameId,
        target: ch.target,
        type: ch.type,
        completed: state.completed || false,
        progress: state.progress || 0,
        gameName: ch.gameId ? (GAME_NAMES[ch.gameId] || ch.gameId) : null
      };
    },

    checkChallenge: async function(gameId, score) {
      if (_isGuest()) return;
      // Ensure challenge state is loaded
      if (!_loaded) await _load();
      if (!_dailyChallenge || _dailyChallenge.completed) return;
      var ch = _getTodaysChallenge();
      var changed = false;

      if (ch.type === 'score' && ch.gameId === gameId) {
        if (score >= ch.target) {
          _dailyChallenge.progress = ch.target;
          _dailyChallenge.completed = true;
          changed = true;
        } else if (score > (_dailyChallenge.progress || 0)) {
          _dailyChallenge.progress = score;
          changed = true;
        }
      } else if (ch.type === 'play_count') {
        var played = _dailyChallenge.gamesPlayedToday || [];
        if (played.indexOf(gameId) === -1) {
          played.push(gameId);
          _dailyChallenge.gamesPlayedToday = played;
          _dailyChallenge.progress = played.length;
          if (played.length >= ch.target) {
            _dailyChallenge.completed = true;
          }
          changed = true;
        }
      } else if (ch.type === 'scores_posted') {
        _dailyChallenge.progress = (_dailyChallenge.progress || 0) + 1;
        if (_dailyChallenge.progress >= ch.target) {
          _dailyChallenge.completed = true;
        }
        changed = true;
      }

      if (changed) {
        await _saveDailyChallenge();
        if (_dailyChallenge.completed) {
          // Award rewards
          if (window.ArcadeCoins) window.ArcadeCoins.earn(75, 'Daily Challenge');
          if (window.ArcadeLevels) window.ArcadeLevels.addXP(25, 'daily_challenge');
          if (window.ArcadeNotifications) {
            window.ArcadeNotifications.pushSelf(
              window.ArcadeNotifications.create('challenge_complete', 'Challenge Complete!',
                'You completed today\'s challenge: ' + ch.desc, '\uD83C\uDFAF', null, {})
            );
          }
          // Increment weekly quest
          window.ArcadeChallenges.incrementQuest('challenges_done', 1);
        }
      }
    },

    checkDailyCoinChallenge: async function(amount) {
      if (_isGuest()) return;
      if (!_loaded) await _load();
      if (!_dailyChallenge || _dailyChallenge.completed) return;
      var ch = _getTodaysChallenge();
      if (ch.type === 'coins_earned') {
        _dailyChallenge.progress = (_dailyChallenge.progress || 0) + amount;
        if (_dailyChallenge.progress >= ch.target) {
          _dailyChallenge.completed = true;
          if (window.ArcadeCoins) window.ArcadeCoins.earn(75, 'Daily Challenge');
          if (window.ArcadeLevels) window.ArcadeLevels.addXP(25, 'daily_challenge');
          if (window.ArcadeNotifications) {
            window.ArcadeNotifications.pushSelf(
              window.ArcadeNotifications.create('challenge_complete', 'Challenge Complete!',
                'You completed today\'s challenge: ' + ch.desc, '\uD83C\uDFAF', null, {})
            );
          }
          window.ArcadeChallenges.incrementQuest('challenges_done', 1);
        }
        _saveDailyChallenge();
      }
    },

    // ─── WEEKLY QUESTS ───
    getWeeklyQuests: function() {
      var questDefs = _getWeekQuests();
      var state = _weeklyQuests || {};
      var quests = state.quests || [];
      return questDefs.map(function(def, i) {
        var q = quests[i] || {};
        return {
          id: def.id,
          desc: def.desc,
          icon: def.icon,
          type: def.type,
          target: q.target || def.target,
          progress: q.progress || 0,
          completed: q.completed || false
        };
      });
    },

    incrementQuest: async function(type, amount) {
      if (_isGuest()) return;
      if (!_loaded) await _load();
      if (!_weeklyQuests) return;
      var quests = _weeklyQuests.quests || [];
      var changed = false;
      var allDone = true;
      var questDefs = _getWeekQuests();
      for (var i = 0; i < quests.length; i++) {
        if (questDefs[i] && questDefs[i].type === type && !quests[i].completed) {
          quests[i].progress = (quests[i].progress || 0) + amount;
          if (quests[i].progress >= quests[i].target) {
            quests[i].completed = true;
            // Award per-quest reward
            if (window.ArcadeCoins) window.ArcadeCoins.earn(100, 'Weekly Quest');
            if (window.ArcadeLevels) window.ArcadeLevels.addXP(50, 'weekly_quest');
            if (window.ArcadeNotifications) {
              window.ArcadeNotifications.pushSelf(
                window.ArcadeNotifications.create('quest_complete', 'Quest Complete!',
                  questDefs[i].desc, '\uD83C\uDF1F', null, {})
              );
            }
          }
          changed = true;
        }
        if (!quests[i].completed) allDone = false;
      }
      if (changed) {
        _weeklyQuests.quests = quests;
        await _saveWeeklyQuests();
        // Bonus for completing all 3
        if (allDone && quests.length === 3) {
          if (window.ArcadeCoins) window.ArcadeCoins.earn(200, 'All Quests Bonus');
          if (window.ArcadeLevels) window.ArcadeLevels.addXP(100, 'all_quests_bonus');
          if (window.ArcadeNotifications) {
            window.ArcadeNotifications.pushSelf(
              window.ArcadeNotifications.create('quest_complete', 'All Quests Done!',
                'You completed all weekly quests! Bonus: 200 coins + 100 XP', '\uD83C\uDFC6', null, {})
            );
          }
        }
      }
    },

    // ─── Render helpers ───
    renderChallengeWidget: async function(container) {
      // Ensure challenge state is loaded before rendering
      if (!_loaded && !_isGuest()) await _load();
      var ch = window.ArcadeChallenges.getDailyChallenge();
      var pct = ch.target > 0 ? Math.min(100, Math.round((ch.progress / ch.target) * 100)) : 0;
      var div = document.createElement('div');
      div.className = 'challenge-widget' + (ch.completed ? ' completed' : '');
      div.innerHTML =
        '<div class="cw-title">\uD83C\uDFAF Daily Challenge</div>' +
        '<div class="cw-desc">' + ch.desc + '</div>' +
        '<div class="cw-bar"><div class="cw-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="cw-status">' + (ch.completed ? '\u2705 Completed! +75 coins +25 XP' : ch.progress + ' / ' + ch.target) + '</div>';
      container.appendChild(div);
    },

    renderQuestCards: async function(container) {
      if (!_loaded && !_isGuest()) await _load();
      var quests = window.ArcadeChallenges.getWeeklyQuests();
      quests.forEach(function(q) {
        var pct = q.target > 0 ? Math.min(100, Math.round((q.progress / q.target) * 100)) : 0;
        var div = document.createElement('div');
        div.className = 'quest-card' + (q.completed ? ' completed' : '');
        div.innerHTML =
          '<div class="qc-row">' +
            '<span class="qc-icon">' + q.icon + '</span>' +
            '<span class="qc-desc">' + q.desc + '</span>' +
            '<span class="qc-prog">' + (q.completed ? '\u2705' : q.progress + '/' + q.target) + '</span>' +
          '</div>' +
          '<div class="qc-bar"><div class="qc-bar-fill" style="width:' + pct + '%"></div></div>';
        container.appendChild(div);
      });
    },

    getGameName: function(gameId) {
      return GAME_NAMES[gameId] || gameId;
    },

    GAME_IDS: GAME_IDS,
    GAME_NAMES: GAME_NAMES
  };
})();
