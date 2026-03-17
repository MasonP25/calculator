// ─── ARCADE BAN SYSTEM (device fingerprint + username) ───
(function() {
  var _db = null;
  var _doc = null;
  var _getDoc = null;
  var _setDoc = null;
  var _collection = null;
  var _getDocs = null;
  var _query = null;
  var _where = null;

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
      var config = {
        apiKey: "AIzaSyCyK7tEcAaqrVNFRggviaEmWH2SMkiwGKk",
        authDomain: "calculator-81d08.firebaseapp.com",
        projectId: "calculator-81d08",
        storageBucket: "calculator-81d08.firebasestorage.app",
        messagingSenderId: "375406495739",
        appId: "1:375406495739:web:fd28553263599864426d5e"
      };
      try {
        var app = getApp('ban-app');
        _db = getFirestore(app);
      } catch(e) {
        try {
          var app = initializeApp(config, 'ban-app');
          _db = getFirestore(app);
        } catch(e2) {
          var app = initializeApp(config, 'ban-app-' + Date.now());
          _db = getFirestore(app);
        }
      }
    }).catch(function(e) {
      console.warn('[Ban] Firebase init failed:', e);
    });
  }

  // ─── Device Fingerprint ───
  function _hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return (h >>> 0).toString(36);
  }

  function _generateFingerprint() {
    var parts = [];
    // Screen
    parts.push(screen.width + 'x' + screen.height + 'x' + screen.colorDepth);
    // Navigator
    parts.push(navigator.language || '');
    parts.push(navigator.hardwareConcurrency || 0);
    parts.push(navigator.platform || '');
    // Timezone
    parts.push(new Date().getTimezoneOffset());
    // Canvas fingerprint
    try {
      var c = document.createElement('canvas');
      c.width = 200; c.height = 50;
      var ctx = c.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('ArcadeFP!@#$', 2, 15);
      ctx.fillStyle = 'rgba(102,204,0,0.7)';
      ctx.fillText('ArcadeFP!@#$', 4, 17);
      parts.push(c.toDataURL());
    } catch(e) {
      parts.push('no-canvas');
    }
    // WebGL renderer
    try {
      var gl = document.createElement('canvas').getContext('webgl');
      var ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) parts.push(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
    } catch(e) {
      parts.push('no-webgl');
    }
    var raw = parts.join('|||');
    // Generate longer hash by hashing multiple offsets
    var fp = _hash(raw) + _hash(raw + '1') + _hash(raw + '2') + _hash(raw + '3');
    return fp;
  }

  // ─── Ban Screen ───
  function _showBanScreen(reason) {
    // Remove all page content interaction
    var overlay = document.createElement('div');
    overlay.id = 'ban-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;background:#0a0a12;display:flex;align-items:center;justify-content:center;font-family:"Segoe UI",Tahoma,sans-serif;';
    overlay.innerHTML =
      '<div style="text-align:center;max-width:400px;padding:2rem;">' +
        '<div style="font-size:3rem;margin-bottom:1rem;">&#128683;</div>' +
        '<h1 style="color:#ff4757;font-size:1.8rem;margin-bottom:0.5rem;">Access Denied</h1>' +
        '<p style="color:#888;font-size:1rem;margin-bottom:1.5rem;">You have been banned from this site.</p>' +
        (reason ? '<div style="background:#1a1a2e;border:1px solid #2a2a4a;border-radius:10px;padding:0.8rem 1.2rem;margin-bottom:1rem;"><span style="color:#666;font-size:0.8rem;">Reason:</span><br><span style="color:#e0e0e0;font-size:0.95rem;">' + reason + '</span></div>' : '') +
        '<p style="color:#444;font-size:0.75rem;">If you believe this is a mistake, contact the site administrator.</p>' +
      '</div>';
    // Ensure body exists
    if (document.body) {
      document.body.innerHTML = '';
      document.body.appendChild(overlay);
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        document.body.innerHTML = '';
        document.body.appendChild(overlay);
      });
    }
    // Clear auth
    localStorage.removeItem('arcade_currentUser');
    localStorage.setItem('arcadePlayerName', 'Guest');
    // Block keyboard shortcuts
    document.addEventListener('keydown', function(e) { e.preventDefault(); e.stopPropagation(); }, true);
    // Set flag so other scripts can check
    window._arcadeBanned = true;
  }

  // ─── Main Ban Check ───
  async function _checkBan() {
    try {
      var fp = _generateFingerprint();
      // Store fingerprint locally
      try { localStorage.setItem('_ac_dfp', fp); } catch(e) {}

      await _initFirebase();
      if (!_db) return;

      // Check 1: fingerprint in bans collection
      var q = _query(_collection(_db, 'bans'), _where('fingerprint', '==', fp));
      var snap = await _getDocs(q);
      if (!snap.empty) {
        var banData = null;
        snap.forEach(function(d) { if (!banData) banData = d.data(); });
        _showBanScreen(banData.reason || '');
        return;
      }

      // Check 2: logged-in user has banned flag
      var user = localStorage.getItem('arcade_currentUser');
      if (user && user !== 'Guest') {
        var userDoc = await _getDoc(_doc(_db, 'users', user.toLowerCase()));
        if (userDoc.exists() && userDoc.data().banned) {
          // Also ban this fingerprint for future
          var userData = userDoc.data();
          await _setDoc(_doc(_db, 'bans', fp), {
            fingerprint: fp,
            username: user,
            reason: userData.banReason || '',
            bannedAt: Date.now(),
            bannedBy: 'system'
          });
          _showBanScreen(userData.banReason || '');
          return;
        }
        // Store fingerprint on user doc for future reference
        if (userDoc.exists()) {
          var data = userDoc.data();
          if (data.fingerprint !== fp) {
            await _setDoc(_doc(_db, 'users', user.toLowerCase()), { fingerprint: fp }, { merge: true });
          }
        }
      }

      // Check 3: hidden localStorage ban marker (backup)
      try {
        if (localStorage.getItem('_ac_rs') === '1') {
          // Re-verify with server
          var q2 = _query(_collection(_db, 'bans'), _where('fingerprint', '==', fp));
          var snap2 = await _getDocs(q2);
          if (!snap2.empty) {
            var bd = null;
            snap2.forEach(function(d) { if (!bd) bd = d.data(); });
            _showBanScreen(bd.reason || '');
          }
        }
      } catch(e) {}

    } catch(e) {
      console.warn('[Ban] Check failed:', e);
    }
  }

  // Expose fingerprint generator for admin commands
  window._arcadeGetFingerprint = _generateFingerprint;

  // Run ban check immediately
  _checkBan();
})();
