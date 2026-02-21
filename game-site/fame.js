// One-time migration: clear corrupted streak data from 2P bug (pong/tron/racer)
(function() {
  if (localStorage.getItem('_lb_streak_fix_v1')) return;
  ['pong','tron','racer'].forEach(function(g) {
    localStorage.removeItem('hallOfFame_' + g);
    // Clear all user-specific and generic streak keys
    var keys = Object.keys(localStorage);
    keys.forEach(function(k) {
      if (k.indexOf('streak_' + g) !== -1 || k.indexOf('bestStreak_' + g) !== -1) {
        localStorage.removeItem(k);
      }
    });
  });
  localStorage.setItem('_lb_streak_fix_v1', '1');
})();

window.HallOfFame = {
  getPlayerName: function() {
    return localStorage.getItem('arcadePlayerName') || 'Guest';
  },
  submit: function(gameId, score) {
    var key = 'hallOfFame_' + gameId;
    var list = JSON.parse(localStorage.getItem(key) || '[]');
    var name = this.getPlayerName();
    var lowerBetter = ['reaction','minesweeper','memory','sudoku','nonogram','maze','20q','huesort','lightsout','pipes','ballsort','wordsearch','sliding','aim_classic','golf','crossword'];
    var lower = lowerBetter.includes(gameId);
    // Deduplicate: only keep best score per player
    var existing = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === name) { existing = list[i]; break; }
    }
    if (existing) {
      var isBetter = lower ? score < existing.score : score > existing.score;
      if (!isBetter) return list; // already have a better score
      list = list.filter(function(e) { return e.name !== name; });
    }
    list.push({name: name, score: score, date: new Date().toLocaleDateString()});
    if (lower) {
      list.sort(function(a, b) { return a.score - b.score; });
    } else {
      list.sort(function(a, b) { return b.score - a.score; });
    }
    list = list.slice(0, 10);
    localStorage.setItem(key, JSON.stringify(list));
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
