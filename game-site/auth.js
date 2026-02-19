// auth.js — Arcade authentication (Firebase-backed with localStorage fallback)
(function() {
  // ─── Local Storage helpers ───
  function getCurrentUser() {
    return localStorage.getItem('arcade_currentUser') || null;
  }
  function setCurrentUser(username) {
    if (username) {
      localStorage.setItem('arcade_currentUser', username);
      localStorage.setItem('arcadePlayerName', username);
    } else {
      localStorage.removeItem('arcade_currentUser');
      localStorage.setItem('arcadePlayerName', 'Guest');
    }
  }

  // ─── Auth logic ───
  async function doSignUp(username, password) {
    username = username.trim();
    if (!username || username.length < 2) return { ok: false, msg: 'Username must be at least 2 characters' };
    if (username.length > 15) return { ok: false, msg: 'Username must be 15 characters or less' };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { ok: false, msg: 'Letters, numbers, and underscores only' };
    if (!password || password.length < 3) return { ok: false, msg: 'Password must be at least 3 characters' };

    // Try Firebase first
    if (window.FirebaseAuth) {
      return await window.FirebaseAuth.signUp(username, password);
    }

    // Fallback: local-only
    var users = JSON.parse(localStorage.getItem('arcade_users') || '{}');
    if (users[username.toLowerCase()]) return { ok: false, msg: 'Username already taken' };
    var data = new TextEncoder().encode(password + '_arcade_firebase_salt');
    var buf = await crypto.subtle.digest('SHA-256', data);
    var h = Array.from(new Uint8Array(buf)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    users[username.toLowerCase()] = { display: username, hash: h };
    localStorage.setItem('arcade_users', JSON.stringify(users));
    setCurrentUser(username);
    return { ok: true };
  }

  async function doSignIn(username, password) {
    username = username.trim();
    if (!username) return { ok: false, msg: 'Enter a username' };
    if (!password) return { ok: false, msg: 'Enter your password' };

    // Try Firebase first
    if (window.FirebaseAuth) {
      return await window.FirebaseAuth.signIn(username, password);
    }

    // Fallback: local-only
    var users = JSON.parse(localStorage.getItem('arcade_users') || '{}');
    var u = users[username.toLowerCase()];
    if (!u) return { ok: false, msg: 'Username not found' };
    var data = new TextEncoder().encode(password + '_arcade_firebase_salt');
    var buf = await crypto.subtle.digest('SHA-256', data);
    var h = Array.from(new Uint8Array(buf)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    if (h !== u.hash) return { ok: false, msg: 'Wrong password' };
    setCurrentUser(u.display);
    return { ok: true };
  }

  async function doSignOut() {
    if (window.FirebaseAuth) {
      window.FirebaseAuth.signOut();
    }
    setCurrentUser(null);
    updateBadge();
  }

  // ─── Inject styles ───
  var css = document.createElement('style');
  css.textContent =
    '.auth-badge{position:fixed;top:12px;right:16px;z-index:9998;display:flex;align-items:center;gap:0.4rem;' +
    'background:#1a1a2e;border:2px solid #2a2a4a;border-radius:20px;padding:0.25rem 0.7rem 0.25rem 0.5rem;' +
    'font-family:"Segoe UI",Tahoma,sans-serif;font-size:0.78rem;color:#e0e0e0;cursor:pointer;transition:border-color .2s;user-select:none}' +
    '.auth-badge:hover{border-color:#7b2ff7}' +
    '.auth-badge .ab-icon{font-size:1rem}' +
    '.auth-badge .ab-name{color:#00d4ff;font-weight:600;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.auth-badge .ab-out{color:#ff475799;font-size:0.68rem;margin-left:0.2rem;padding:2px 5px;border-radius:4px;transition:color .2s}' +
    '.auth-badge .ab-out:hover{color:#ff4757}' +
    '.auth-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,15,26,0.88);' +
    'z-index:9999;justify-content:center;align-items:center;font-family:"Segoe UI",Tahoma,sans-serif}' +
    '.auth-overlay.show{display:flex}' +
    '.auth-box{background:#1a1a2e;border:2px solid #2a2a4a;border-radius:16px;padding:2rem;width:330px;max-width:90vw;position:relative}' +
    '.auth-box h2{text-align:center;margin-bottom:1.2rem;font-size:1.5rem;' +
    'background:linear-gradient(135deg,#00d4ff,#7b2ff7);-webkit-background-clip:text;-webkit-text-fill-color:transparent}' +
    '.auth-tabs{display:flex;margin-bottom:1.2rem}' +
    '.auth-tab{flex:1;padding:0.45rem;text-align:center;background:#0f0f1a;border:2px solid #2a2a4a;' +
    'color:#888;cursor:pointer;font-size:0.82rem;font-family:inherit;transition:all .2s}' +
    '.auth-tab:first-child{border-radius:8px 0 0 8px}' +
    '.auth-tab:last-child{border-radius:0 8px 8px 0;border-left:none}' +
    '.auth-tab.active{background:#7b2ff7;border-color:#7b2ff7;color:#fff;font-weight:600}' +
    '.auth-inp{display:block;width:100%;background:#0f0f1a;border:2px solid #2a2a4a;color:#e0e0e0;' +
    'padding:0.55rem 0.8rem;border-radius:8px;font-size:0.88rem;margin-bottom:0.7rem;font-family:inherit;outline:none;transition:border-color .2s}' +
    '.auth-inp:focus{border-color:#7b2ff7}' +
    '.auth-inp::placeholder{color:#555}' +
    '.auth-btn{display:block;width:100%;background:linear-gradient(135deg,#7b2ff7,#5b1fd7);color:#fff;' +
    'border:none;padding:0.65rem;border-radius:8px;font-size:0.92rem;cursor:pointer;font-family:inherit;transition:opacity .2s}' +
    '.auth-btn:hover{opacity:0.9}' +
    '.auth-btn:disabled{opacity:0.5;cursor:not-allowed}' +
    '.auth-err{color:#ff4757;font-size:0.78rem;text-align:center;margin-bottom:0.7rem;min-height:1.1rem}' +
    '.auth-close{position:absolute;top:0.6rem;right:0.8rem;background:none;border:none;color:#555;font-size:1.4rem;cursor:pointer;transition:color .2s}' +
    '.auth-close:hover{color:#e0e0e0}' +
    '.auth-guest{display:block;width:100%;background:none;border:2px solid #2a2a4a;color:#666;' +
    'padding:0.45rem;border-radius:8px;font-size:0.78rem;cursor:pointer;font-family:inherit;margin-top:0.6rem;transition:border-color .2s,color .2s}' +
    '.auth-guest:hover{border-color:#555;color:#e0e0e0}' +
    '.auth-info{color:#555;font-size:0.7rem;text-align:center;margin-top:0.8rem}';
  document.head.appendChild(css);

  // ─── Create badge ───
  var badge = document.createElement('div');
  badge.className = 'auth-badge';
  document.body.appendChild(badge);

  // ─── Create modal overlay ───
  var overlay = document.createElement('div');
  overlay.className = 'auth-overlay';
  overlay.innerHTML =
    '<div class="auth-box">' +
      '<button class="auth-close" id="authX">&times;</button>' +
      '<h2>ARCADE</h2>' +
      '<div class="auth-tabs">' +
        '<button class="auth-tab active" data-t="in">Sign In</button>' +
        '<button class="auth-tab" data-t="up">Sign Up</button>' +
      '</div>' +
      '<div class="auth-err" id="authErr"></div>' +
      '<form id="authForm">' +
        '<input class="auth-inp" id="authU" type="text" placeholder="Username" autocomplete="off" maxlength="15">' +
        '<input class="auth-inp" id="authP" type="password" placeholder="Password">' +
        '<input class="auth-inp" id="authP2" type="password" placeholder="Confirm Password" style="display:none">' +
        '<button class="auth-btn" type="submit" id="authGo">Sign In</button>' +
      '</form>' +
      '<button class="auth-guest" id="authSkip">Continue as Guest</button>' +
      '<p class="auth-info">Synced across all your devices</p>' +
    '</div>';
  document.body.appendChild(overlay);

  var tab = 'in';
  var tabBtns = overlay.querySelectorAll('.auth-tab');
  var errEl = document.getElementById('authErr');
  var uEl = document.getElementById('authU');
  var pEl = document.getElementById('authP');
  var p2El = document.getElementById('authP2');
  var goBtn = document.getElementById('authGo');

  function updateFormFields() {
    p2El.style.display = tab === 'up' ? 'block' : 'none';
    goBtn.textContent = tab === 'in' ? 'Sign In' : 'Sign Up';
    errEl.textContent = '';
  }

  tabBtns.forEach(function(t) {
    t.addEventListener('click', function() {
      tab = t.dataset.t;
      tabBtns.forEach(function(b) { b.classList.toggle('active', b.dataset.t === tab); });
      updateFormFields();
    });
  });

  document.getElementById('authForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    errEl.textContent = '';
    goBtn.disabled = true;
    var origText = goBtn.textContent;
    goBtn.textContent = 'Please wait...';
    var result;
    try {
      if (tab === 'up') {
        if (pEl.value !== p2El.value) {
          errEl.textContent = 'Passwords do not match';
          return;
        }
        result = await doSignUp(uEl.value, pEl.value);
      } else {
        result = await doSignIn(uEl.value, pEl.value);
      }
      if (result.ok) {
        closeModal();
        updateBadge();
        if (window.SFX) window.SFX.correct();
      } else {
        errEl.textContent = result.msg;
      }
    } catch (err) {
      errEl.textContent = 'Something went wrong. Try again.';
    } finally {
      goBtn.disabled = false;
      goBtn.textContent = origText;
    }
  });

  document.getElementById('authX').addEventListener('click', closeModal);
  document.getElementById('authSkip').addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });

  function openModal() {
    uEl.value = ''; pEl.value = ''; p2El.value = '';
    errEl.textContent = '';
    tab = 'in';
    tabBtns.forEach(function(b) { b.classList.toggle('active', b.dataset.t === 'in'); });
    updateFormFields();
    overlay.classList.add('show');
    setTimeout(function() { uEl.focus(); }, 100);
  }

  function closeModal() {
    overlay.classList.remove('show');
  }

  badge.addEventListener('click', function(e) {
    if (e.target.classList && e.target.classList.contains('ab-out')) return;
    if (!getCurrentUser()) openModal();
  });

  function updateBadge() {
    var user = getCurrentUser();
    if (user) {
      badge.innerHTML = '<span class="ab-icon">&#128100;</span><span class="ab-name">' + user + '</span><span class="ab-out" id="abOut">Sign Out</span>';
      var out = document.getElementById('abOut');
      if (out) {
        out.addEventListener('click', function(e) {
          e.stopPropagation();
          doSignOut();
        });
      }
    } else {
      badge.innerHTML = '<span class="ab-icon">&#128100;</span><span style="color:#888">Sign In</span>';
    }
  }

  // ─── Expose API ───
  window.ArcadeAuth = {
    getCurrentUser: getCurrentUser,
    isLoggedIn: function() { return !!getCurrentUser(); },
    openSignIn: openModal
  };

  updateBadge();

  // Listen for Firebase auth state (auto-login if already signed in)
  window.addEventListener('firebase-auth-ready', function() {
    updateBadge();
  });
})();
