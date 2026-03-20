// ─── DAILY SPIN WHEEL ───
(function() {
  var SEGMENTS = [
    { coins: 10,  label: '10',  prob: 0.22 },
    { coins: 25,  label: '25',  prob: 0.20 },
    { coins: 50,  label: '50',  prob: 0.18 },
    { coins: 75,  label: '75',  prob: 0.14 },
    { coins: 100, label: '100', prob: 0.11 },
    { coins: 150, label: '150', prob: 0.08 },
    { coins: 200, label: '200', prob: 0.05 },
    { coins: 500, label: '500', prob: 0.02 }
  ];

  var _db = null, _doc = null, _getDoc = null, _setDoc = null, _serverTimestamp = null;
  var _spinning = false;

  function _getUser() { return localStorage.getItem('arcade_currentUser') || ''; }
  function _isGuest() { var u = _getUser(); return !u || u === 'Guest'; }
  function _today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  async function _initFB() {
    if (_db) return;
    var mods = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js")
    ]);
    var getApp = mods[0].getApp, initializeApp = mods[0].initializeApp;
    var fb = mods[1];
    _doc = fb.doc; _getDoc = fb.getDoc; _setDoc = fb.setDoc; _serverTimestamp = fb.serverTimestamp;
    var config = { apiKey:"AIzaSyCyK7tEcAaqrVNFRggviaEmWH2SMkiwGKk",authDomain:"calculator-81d08.firebaseapp.com",projectId:"calculator-81d08",storageBucket:"calculator-81d08.firebasestorage.app",messagingSenderId:"375406495739",appId:"1:375406495739:web:fd28553263599864426d5e" };
    try { _db = fb.getFirestore(getApp()); } catch(e) {
      try { _db = fb.getFirestore(initializeApp(config, 'spin-app')); } catch(e2) { _db = fb.getFirestore(initializeApp(config, 'spin-app-' + Date.now())); }
    }
  }

  async function _hasSpunToday() {
    if (_isGuest()) return true;
    try {
      await _initFB();
      var ref = _doc(_db, 'users', _getUser().toLowerCase());
      var snap = await _getDoc(ref);
      if (!snap.exists()) return false;
      var ds = snap.data().dailySpin || {};
      return ds.day === _today() && ds.collected;
    } catch(e) { return false; }
  }

  async function _recordSpin(amount) {
    try {
      await _initFB();
      var ref = _doc(_db, 'users', _getUser().toLowerCase());
      await _setDoc(ref, { dailySpin: { day: _today(), collected: true, amount: amount } }, { merge: true });
    } catch(e) {}
  }

  function _pickSegment() {
    var r = Math.random(), cum = 0;
    for (var i = 0; i < SEGMENTS.length; i++) {
      cum += SEGMENTS[i].prob;
      if (r <= cum) return i;
    }
    return 0;
  }

  function _getColors() {
    var s = getComputedStyle(document.documentElement);
    var a1 = s.getPropertyValue('--t-accent').trim() || '#7b2ff7';
    var a2 = s.getPropertyValue('--t-accent2').trim() || '#00d4ff';
    var bg = s.getPropertyValue('--t-bg1').trim() || '#0f0f1a';
    return [a1, a2, _lighten(a1, 30), _lighten(a2, 30), a1, a2, _lighten(a1, 20), '#ffd700'];
  }

  function _lighten(hex, amt) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = Math.min(255, parseInt(hex.substring(0,2), 16) + amt);
    var g = Math.min(255, parseInt(hex.substring(2,4), 16) + amt);
    var b = Math.min(255, parseInt(hex.substring(4,6), 16) + amt);
    return '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }

  function _drawWheel(canvas, rotation) {
    var ctx = canvas.getContext('2d');
    var cx = 250, cy = 250, radius = 240;
    var colors = _getColors();
    ctx.clearRect(0, 0, 500, 500);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.translate(-cx, -cy);

    var segAngle = (2 * Math.PI) / SEGMENTS.length;
    for (var i = 0; i < SEGMENTS.length; i++) {
      var start = i * segAngle, end = start + segAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + segAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px "Segoe UI", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(SEGMENTS[i].label, radius * 0.65, 7);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--t-bg2').trim() || '#1a1a2e';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Pointer triangle at top
    ctx.beginPath();
    ctx.moveTo(cx - 12, 6);
    ctx.lineTo(cx + 12, 6);
    ctx.lineTo(cx, 28);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  function openModal() {
    if (_isGuest()) {
      if (window.ArcadeNotifications) window.ArcadeNotifications.pushSelf(
        window.ArcadeNotifications.create('system', 'Sign In Required', 'Sign in to use the daily spin wheel!', '\uD83D\uDD12')
      );
      return;
    }

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,20,0.88);z-index:100000;display:flex;align-items:center;justify-content:center;font-family:"Segoe UI",Tahoma,sans-serif';

    var modal = document.createElement('div');
    modal.style.cssText = 'background:var(--t-bg2,#1a1a2e);border:2px solid var(--t-accent,#7b2ff7);border-radius:20px;padding:2rem;text-align:center;max-width:380px;width:90%;box-shadow:0 12px 50px rgba(0,0,0,0.6)';

    modal.innerHTML = '<h2 style="color:var(--t-text,#e0e0e0);margin:0 0 0.5rem;font-size:1.3rem">\uD83C\uDFA1 Daily Spin</h2>' +
      '<p style="color:var(--t-dim,#888);font-size:0.85rem;margin:0 0 1rem">Spin once per day for free coins!</p>' +
      '<div style="position:relative;display:inline-block"><canvas id="spin-canvas" width="500" height="500" style="width:260px;height:260px;border-radius:50%"></canvas></div>' +
      '<div id="spin-result" style="color:var(--t-text);font-size:1.1rem;font-weight:600;margin:1rem 0;min-height:1.5rem"></div>' +
      '<button id="spin-btn" style="background:var(--t-accent,#7b2ff7);color:#fff;border:none;border-radius:12px;padding:12px 36px;font-size:1.1rem;font-weight:700;cursor:pointer;transition:transform 0.2s,opacity 0.2s">SPIN!</button>' +
      '<br><button id="spin-close" style="background:none;border:none;color:var(--t-dim,#888);cursor:pointer;font-size:0.85rem;margin-top:0.8rem;padding:6px 12px">Close</button>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    var canvas = document.getElementById('spin-canvas');
    var wheelAngle = 0;
    _drawWheel(canvas, 0);

    _hasSpunToday().then(function(spun) {
      var btn = document.getElementById('spin-btn');
      if (spun) {
        btn.textContent = 'Already Spun Today';
        btn.style.opacity = '0.5';
        btn.disabled = true;
      }
    });

    document.getElementById('spin-close').onclick = function() { overlay.remove(); };
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

    document.getElementById('spin-btn').onclick = function() {
      if (_spinning) return;
      _spinning = true;
      var btn = document.getElementById('spin-btn');
      btn.disabled = true;
      btn.style.opacity = '0.5';

      var segIdx = _pickSegment();
      var segAngle = (2 * Math.PI) / SEGMENTS.length;
      var targetRest = -segIdx * segAngle - segAngle / 2 - Math.PI / 2;
      targetRest = ((targetRest % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      var currentNorm = ((wheelAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      var delta = targetRest - currentNorm;
      if (delta <= 0) delta += 2 * Math.PI;
      var spins = 5 + Math.floor(Math.random() * 4);
      var finalAngle = wheelAngle + delta + spins * 2 * Math.PI;
      var startTime = performance.now();
      var duration = 4000;
      var lastSeg = -1;

      function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

      function animate(now) {
        var elapsed = now - startTime;
        var t = Math.min(elapsed / duration, 1);
        var currentAngle = wheelAngle + (finalAngle - wheelAngle) * easeOut(t);
        _drawWheel(canvas, currentAngle);

        // Tick sound at segment boundaries
        var normA = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        var curSeg = Math.floor(normA / segAngle) % SEGMENTS.length;
        if (curSeg !== lastSeg) {
          lastSeg = curSeg;
          if (window.SFX && t < 0.95) window.SFX.tick();
        }

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          wheelAngle = currentAngle;
          _spinning = false;
          var won = SEGMENTS[segIdx].coins;
          var resultEl = document.getElementById('spin-result');
          resultEl.style.color = won >= 200 ? '#ffd700' : 'var(--t-accent2,#00d4ff)';
          resultEl.textContent = '\uD83C\uDF89 You won ' + won + ' coins!';
          if (window.SFX) window.SFX.coin();
          _arcadeEarnCoins(won, 'Daily Spin');
          if (window.ArcadeLevels) window.ArcadeLevels.addXP(15, 'daily_spin');
          _recordSpin(won);
          btn.textContent = 'Already Spun Today';
          _updateBtnState(true);
        }
      }
      requestAnimationFrame(animate);
    };
  }

  function _updateBtnState(spun) {
    var btn = document.getElementById('daily-spin-btn');
    if (!btn) return;
    if (spun) {
      btn.style.opacity = '0.75';
      btn.style.animation = 'none';
      btn.title = 'Already spun today';
    } else {
      btn.style.opacity = '1';
      btn.style.animation = 'spinPulse 2s ease-in-out infinite';
      btn.title = 'Daily Spin — free coins!';
    }
  }

  // Create the spin button on index page
  function init() {
    var page = (window.location.pathname.split('/').pop() || '').replace('.html', '');
    if (page !== 'index' && page !== '') return;
    if (_isGuest()) return;

    // Add pulse animation
    var css = document.createElement('style');
    css.textContent = '@keyframes spinPulse{0%,100%{box-shadow:0 0 8px var(--t-accent,#7b2ff7)44}50%{box-shadow:0 0 20px var(--t-accent,#7b2ff7)88}}';
    document.head.appendChild(css);

    var btn = document.createElement('button');
    btn.id = 'daily-spin-btn';
    btn.innerHTML = '\uD83C\uDFA1';
    btn.style.cssText = 'position:fixed;top:50px;left:60px;z-index:999;width:42px;height:42px;border-radius:50%;border:2px solid var(--t-border,#2a2a4a);background:var(--t-bg2,#1a1a2e);color:var(--t-dim,#888);font-size:1.2rem;cursor:pointer;transition:transform 0.2s,border-color 0.2s,color 0.2s;display:flex;align-items:center;justify-content:center';
    btn.onclick = openModal;
    btn.addEventListener('mouseenter', function() { btn.style.transform = 'scale(1.1)'; btn.style.borderColor = 'var(--t-accent,#7b2ff7)'; btn.style.color = '#fff'; });
    btn.addEventListener('mouseleave', function() { btn.style.transform = 'scale(1)'; btn.style.borderColor = 'var(--t-border,#2a2a4a)'; btn.style.color = 'var(--t-dim,#888)'; });
    document.body.appendChild(btn);

    _hasSpunToday().then(function(spun) { _updateBtnState(spun); });
  }

  window.addEventListener('arcade-auth-change', function() {
    if (!_isGuest() && !document.getElementById('daily-spin-btn')) init();
  });

  if (document.readyState === 'complete') { setTimeout(init, 5); }
  else { window.addEventListener('load', function() { setTimeout(init, 5); }); }

  window.ArcadeDailySpin = { open: openModal };
})();
