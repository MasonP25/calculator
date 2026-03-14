// ─── ARCADE NOTIFICATION SYSTEM ───
(function() {
  var _db = null;
  var _doc = null;
  var _getDoc = null;
  var _setDoc = null;
  var _pollTimer = null;
  var _notifications = [];
  var _unreadCount = 0;
  var _panelVisible = false;
  var _panelEl = null;
  var _lastKnownIds = [];

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
        var app = getApp('notif-app');
        _db = getFirestore(app);
      } catch(e) {
        try {
          var app = initializeApp(config, 'notif-app');
          _db = getFirestore(app);
        } catch(e2) {
          var app = initializeApp(config, 'notif-app-' + Date.now());
          _db = getFirestore(app);
        }
      }
    }).catch(function(e) {
      console.warn('[Notifications] Firebase init failed:', e);
    });
  }

  function _genId() {
    return 'n_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  }

  function _timeAgo(ts) {
    var diff = Date.now() - ts;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    var days = Math.floor(hrs / 24);
    return days + 'd ago';
  }

  // ─── TOAST ───
  function _showToast(notif) {
    if (window.SFX && window.SFX.notification) window.SFX.notification();
    var toast = document.createElement('div');
    toast.className = 'notif-toast';
    toast.innerHTML = '<span class="notif-toast-icon">' + (notif.icon || '🔔') + '</span>' +
      '<div class="notif-toast-text">' +
        '<strong class="notif-toast-title">' + (notif.title || 'Notification') + '</strong>' +
        '<span class="notif-toast-body">' + (notif.body || '') + '</span>' +
      '</div>';
    if (notif.link) {
      toast.style.cursor = 'pointer';
      toast.onclick = function() {
        window.location.href = notif.link;
      };
    }
    document.body.appendChild(toast);
    requestAnimationFrame(function() { toast.classList.add('show'); });
    setTimeout(function() {
      toast.classList.remove('show');
      setTimeout(function() { toast.remove(); }, 400);
    }, 4000);
  }

  // ─── INJECT CSS ───
  var css = document.createElement('style');
  css.textContent =
    '.notif-toast{position:fixed;bottom:24px;left:24px;background:#1a1a2e;border:2px solid #00d4ff;border-radius:12px;' +
    'padding:0.7rem 1rem;display:flex;align-items:center;gap:0.7rem;z-index:10001;font-family:"Segoe UI",Tahoma,sans-serif;' +
    'transform:translateX(-120%);transition:transform 0.4s cubic-bezier(.4,0,.2,1);box-shadow:0 4px 20px rgba(0,212,255,0.3);max-width:340px}' +
    '.notif-toast.show{transform:translateX(0)}' +
    '.notif-toast-icon{font-size:1.6rem;line-height:1}' +
    '.notif-toast-text{display:flex;flex-direction:column;gap:0.1rem}' +
    '.notif-toast-title{color:#00d4ff;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em}' +
    '.notif-toast-body{color:#e0e0e0;font-size:0.82rem}' +
    // Bell icon
    '.ab-bell{position:relative;cursor:pointer;font-size:1rem;margin-left:0.3rem;user-select:none}' +
    '.ab-bell:hover{opacity:0.8}' +
    '.ab-bell-count{position:absolute;top:-7px;right:-9px;background:#ff4757;color:#fff;font-size:0.55rem;font-weight:700;' +
    'min-width:14px;height:14px;line-height:14px;text-align:center;border-radius:7px;padding:0 3px}' +
    // Notification panel
    '.notif-panel{position:fixed;top:48px;right:16px;width:320px;max-height:420px;overflow-y:auto;' +
    'background:#1a1a2e;border:2px solid #2a2a4a;border-radius:14px;z-index:10000;display:none;' +
    'box-shadow:0 8px 30px rgba(0,0,0,0.5);font-family:"Segoe UI",Tahoma,sans-serif}' +
    '.notif-panel.show{display:block}' +
    '.notif-panel-header{padding:0.7rem 1rem;border-bottom:1px solid #2a2a4a;display:flex;justify-content:space-between;align-items:center}' +
    '.notif-panel-title{font-size:0.85rem;font-weight:700;color:#e0e0e0}' +
    '.notif-panel-actions{display:flex;gap:0.6rem}' +
    '.notif-panel-btn{font-size:0.68rem;color:#888;cursor:pointer;background:none;border:none;font-family:inherit}' +
    '.notif-panel-btn:hover{color:#00d4ff}' +
    '.notif-item{padding:0.65rem 1rem;border-bottom:1px solid #2a2a4a10;display:flex;gap:0.65rem;cursor:pointer;transition:background 0.15s}' +
    '.notif-item:hover{background:#0f0f1a}' +
    '.notif-item.unread{background:#7b2ff708;border-left:3px solid #7b2ff7}' +
    '.notif-item-icon{font-size:1.3rem;flex-shrink:0;margin-top:0.1rem}' +
    '.notif-item-content{flex:1;min-width:0}' +
    '.notif-item-title{font-size:0.78rem;font-weight:600;color:#e0e0e0}' +
    '.notif-item-body{font-size:0.7rem;color:#888;margin-top:0.1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.notif-item-time{font-size:0.6rem;color:#555;margin-top:0.15rem}' +
    '.notif-empty{padding:2rem;text-align:center;color:#555;font-size:0.82rem}';
  document.head.appendChild(css);

  // ─── PANEL ───
  function _createPanel() {
    if (_panelEl) return;
    _panelEl = document.createElement('div');
    _panelEl.className = 'notif-panel';
    _panelEl.onclick = function(e) { e.stopPropagation(); };
    document.body.appendChild(_panelEl);
    // Close panel when clicking outside
    document.addEventListener('click', function() {
      if (_panelVisible) {
        _panelVisible = false;
        _panelEl.classList.remove('show');
      }
    });
  }

  function _renderPanel() {
    if (!_panelEl) _createPanel();
    var html = '<div class="notif-panel-header">' +
      '<span class="notif-panel-title">Notifications</span>' +
      '<div class="notif-panel-actions">' +
        '<button class="notif-panel-btn" id="notifMarkAll">Mark all read</button>' +
        '<button class="notif-panel-btn" id="notifClearAll">Clear all</button>' +
      '</div></div>';

    if (_notifications.length === 0) {
      html += '<div class="notif-empty">No notifications yet</div>';
    } else {
      for (var i = 0; i < _notifications.length; i++) {
        var n = _notifications[i];
        html += '<div class="notif-item' + (n.read ? '' : ' unread') + '" data-notif-id="' + n.id + '"' +
          (n.link ? ' data-notif-link="' + n.link + '"' : '') + '>' +
          '<span class="notif-item-icon">' + (n.icon || '🔔') + '</span>' +
          '<div class="notif-item-content">' +
            '<div class="notif-item-title">' + (n.title || '') + '</div>' +
            '<div class="notif-item-body">' + (n.body || '') + '</div>' +
            '<div class="notif-item-time">' + _timeAgo(n.time) + '</div>' +
          '</div></div>';
      }
    }
    _panelEl.innerHTML = html;

    // Bind actions
    var markAllBtn = document.getElementById('notifMarkAll');
    if (markAllBtn) markAllBtn.onclick = function(e) {
      e.stopPropagation();
      window.ArcadeNotifications.markAllRead();
    };
    var clearAllBtn = document.getElementById('notifClearAll');
    if (clearAllBtn) clearAllBtn.onclick = function(e) {
      e.stopPropagation();
      window.ArcadeNotifications.clearAll();
    };

    // Bind item clicks
    var items = _panelEl.querySelectorAll('.notif-item');
    for (var j = 0; j < items.length; j++) {
      (function(item) {
        item.onclick = function(e) {
          e.stopPropagation();
          var id = item.getAttribute('data-notif-id');
          var link = item.getAttribute('data-notif-link');
          window.ArcadeNotifications.markRead(id);
          if (link) window.location.href = link;
        };
      })(items[j]);
    }
  }

  function _updateCount() {
    _unreadCount = 0;
    for (var i = 0; i < _notifications.length; i++) {
      if (!_notifications[i].read) _unreadCount++;
    }
    window.dispatchEvent(new CustomEvent('notifications-updated', {
      detail: { unreadCount: _unreadCount }
    }));
  }

  // ─── POLLING ───
  var _firstPollDone = false;

  async function _poll() {
    if (_isGuest()) return;
    try {
      await _initFirebase();
      if (!_db) return;
      var key = _getUser().toLowerCase();
      var snap = await _getDoc(_doc(_db, 'users', key));
      if (!snap.exists()) return;
      var data = snap.data();
      var notifs = data.notifications || [];

      // One-time migration: deduplicate level_up notifications
      if (!localStorage.getItem('_notif_dedup_v1')) {
        var seen = {};
        var cleaned = [];
        var changed = false;
        for (var k = 0; k < notifs.length; k++) {
          var n = notifs[k];
          if (n.type === 'level_up' && n.data && n.data.level) {
            var dedupKey = 'level_up_' + n.data.level;
            if (seen[dedupKey]) { changed = true; continue; }
            seen[dedupKey] = true;
          }
          cleaned.push(n);
        }
        if (changed) {
          notifs = cleaned;
          _setDoc(_doc(_db, 'users', key), { notifications: notifs }, { merge: true }).catch(function(){});
        }
        localStorage.setItem('_notif_dedup_v1', '1');
      }

      // Save previous known IDs before updating
      var prevIds = _lastKnownIds.slice();

      _notifications = notifs;
      _lastKnownIds = notifs.map(function(n) { return n.id; });
      _updateCount();

      // Show toasts only after the first poll (not on page load)
      if (_firstPollDone && prevIds.length > 0) {
        var newOnes = [];
        for (var i = 0; i < notifs.length; i++) {
          if (prevIds.indexOf(notifs[i].id) === -1) {
            newOnes.push(notifs[i]);
          }
        }
        if (newOnes.length > 0 && newOnes.length < 5) {
          for (var j = 0; j < newOnes.length; j++) {
            (function(n, delay) {
              setTimeout(function() { _showToast(n); }, delay);
            })(newOnes[j], j * 800);
          }
        }
      }
      _firstPollDone = true;
    } catch(e) {
      console.warn('[Notifications] Poll failed:', e);
    }
  }

  function _startPolling() {
    if (_pollTimer) clearInterval(_pollTimer);
    _firstPollDone = false;
    setTimeout(function() {
      _poll();
      _pollTimer = setInterval(_poll, 30000);
    }, 500);
  }

  window.ArcadeNotifications = {
    // Push notification to any user
    push: async function(targetUsername, notif) {
      try {
        await _initFirebase();
        if (!_db) return;
        var key = targetUsername.toLowerCase();
        var ref = _doc(_db, 'users', key);
        var snap = await _getDoc(ref);
        if (!snap.exists()) return;
        var data = snap.data();
        var notifs = data.notifications || [];
        // Ensure notif has an id and time
        if (!notif.id) notif.id = _genId();
        if (!notif.time) notif.time = Date.now();
        if (notif.read === undefined) notif.read = false;
        notifs.unshift(notif);
        if (notifs.length > 20) notifs = notifs.slice(0, 20);
        // Only update notifications field — don't overwrite other data
        await _setDoc(ref, { notifications: notifs }, { merge: true });
      } catch(e) {
        console.warn('[Notifications] Push failed:', e);
      }
    },

    // Push to self — also shows toast immediately
    pushSelf: async function(notif) {
      if (_isGuest()) return;
      // Ensure notif has id/time
      if (!notif.id) notif.id = _genId();
      if (!notif.time) notif.time = Date.now();
      if (notif.read === undefined) notif.read = false;
      // Show toast immediately (don't wait for poll)
      _showToast(notif);
      // Add to local state so poll doesn't duplicate
      _notifications.unshift(notif);
      if (_notifications.length > 20) _notifications = _notifications.slice(0, 20);
      _lastKnownIds.push(notif.id);
      _updateCount();
      if (_panelVisible) _renderPanel();
      // Write to Firestore
      await window.ArcadeNotifications.push(_getUser(), notif);
    },

    // Get all notifications
    getAll: function() {
      return _notifications.slice();
    },

    getUnreadCount: function() {
      return _unreadCount;
    },

    // Mark one as read
    markRead: async function(notifId) {
      if (_isGuest()) return;
      var changed = false;
      for (var i = 0; i < _notifications.length; i++) {
        if (_notifications[i].id === notifId && !_notifications[i].read) {
          _notifications[i].read = true;
          changed = true;
          break;
        }
      }
      if (!changed) return;
      _updateCount();
      _renderPanel();
      try {
        await _initFirebase();
        if (!_db) return;
        var key = _getUser().toLowerCase();
        var ref = _doc(_db, 'users', key);
        await _setDoc(ref, { notifications: _notifications }, { merge: true });
      } catch(e) {}
    },

    // Mark all read
    markAllRead: async function() {
      if (_isGuest()) return;
      var changed = false;
      for (var i = 0; i < _notifications.length; i++) {
        if (!_notifications[i].read) {
          _notifications[i].read = true;
          changed = true;
        }
      }
      if (!changed) return;
      _updateCount();
      _renderPanel();
      try {
        await _initFirebase();
        if (!_db) return;
        var key = _getUser().toLowerCase();
        var ref = _doc(_db, 'users', key);
        await _setDoc(ref, { notifications: _notifications }, { merge: true });
      } catch(e) {}
    },

    // Clear all
    clearAll: async function() {
      if (_isGuest()) return;
      _notifications = [];
      _lastKnownIds = [];
      _updateCount();
      _renderPanel();
      try {
        await _initFirebase();
        if (!_db) return;
        var key = _getUser().toLowerCase();
        var ref = _doc(_db, 'users', key);
        await _setDoc(ref, { notifications: [] }, { merge: true });
      } catch(e) {}
    },

    // Toggle panel visibility
    togglePanel: function() {
      _createPanel();
      _panelVisible = !_panelVisible;
      if (_panelVisible) {
        _renderPanel();
        _panelEl.classList.add('show');
      } else {
        _panelEl.classList.remove('show');
      }
    },

    // Create notification helper
    create: function(type, title, body, icon, link, data) {
      return {
        id: _genId(),
        type: type || 'general',
        title: title || '',
        body: body || '',
        icon: icon || '🔔',
        read: false,
        time: Date.now(),
        link: link || null,
        data: data || null
      };
    },

    // Refresh (force poll)
    refresh: function() {
      return _poll();
    }
  };

  // Start polling if logged in
  if (!_isGuest()) _startPolling();

  window.addEventListener('arcade-auth-change', function() {
    _notifications = [];
    _lastKnownIds = [];
    _unreadCount = 0;
    if (_pollTimer) clearInterval(_pollTimer);
    if (!_isGuest()) _startPolling();
  });
})();
