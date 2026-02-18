window.HallOfFame = {
  getPlayerName: function() {
    return localStorage.getItem('arcadePlayerName') || 'Guest';
  },
  submit: function(gameId, score) {
    var key = 'hallOfFame_' + gameId;
    var list = JSON.parse(localStorage.getItem(key) || '[]');
    var name = this.getPlayerName();
    list.push({name: name, score: score, date: new Date().toLocaleDateString()});
    var lowerBetter = ['reaction','minesweeper','memory','sudoku'];
    if (lowerBetter.includes(gameId)) {
      list.sort(function(a, b) { return a.score - b.score; });
    } else {
      list.sort(function(a, b) { return b.score - a.score; });
    }
    list = list.slice(0, 10);
    localStorage.setItem(key, JSON.stringify(list));
    // Also push to Firebase global leaderboard if available
    if (window.FirebaseLB) {
      window.FirebaseLB.submit(gameId, score, name);
    } else {
      // Module may not have loaded yet — queue and retry
      var pending = { gameId: gameId, score: score, name: name };
      var attempts = 0;
      var retry = setInterval(function() {
        attempts++;
        if (window.FirebaseLB) {
          window.FirebaseLB.submit(pending.gameId, pending.score, pending.name);
          clearInterval(retry);
        } else if (attempts > 20) {
          clearInterval(retry);
        }
      }, 500);
    }
    return list;
  },
  getScores: function(gameId) {
    return JSON.parse(localStorage.getItem('hallOfFame_' + gameId) || '[]');
  },
  // Per-user high score helpers
  getBest: function(key, fallback) {
    var user = localStorage.getItem('arcade_currentUser') || '';
    var userKey = user ? key + '_u_' + user : key;
    var val = localStorage.getItem(userKey);
    if (val === null) val = localStorage.getItem(key); // fallback to old key
    return val !== null ? val : (fallback !== undefined ? String(fallback) : null);
  },
  setBest: function(key, value) {
    var user = localStorage.getItem('arcade_currentUser') || '';
    var userKey = user ? key + '_u_' + user : key;
    localStorage.setItem(userKey, String(value));
  },
  // ─── STREAK SYSTEM ───
  getStreak: function(gameId) {
    var cur = parseInt(this.getBest('streak_' + gameId, '0')) || 0;
    var best = parseInt(this.getBest('bestStreak_' + gameId, '0')) || 0;
    return { current: cur, best: best };
  },
  winStreak: function(gameId) {
    var s = this.getStreak(gameId);
    s.current++;
    if (s.current > s.best) s.best = s.current;
    this.setBest('streak_' + gameId, s.current);
    this.setBest('bestStreak_' + gameId, s.best);
    return s;
  },
  loseStreak: function(gameId) {
    this.setBest('streak_' + gameId, 0);
    return this.getStreak(gameId);
  }
};
