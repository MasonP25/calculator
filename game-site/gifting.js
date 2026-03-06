// ─── ARCADE GIFTING SYSTEM ───
(function() {
  var _db = null;
  var _doc = null;
  var _getDoc = null;
  var _setDoc = null;
  var _writeBatch = null;
  var _modalEl = null;

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
      _writeBatch = mods[1].writeBatch;
      var config = {
        apiKey: "AIzaSyCyK7tEcAaqrVNFRggviaEmWH2SMkiwGKk",
        authDomain: "calculator-81d08.firebaseapp.com",
        projectId: "calculator-81d08",
        storageBucket: "calculator-81d08.firebasestorage.app",
        messagingSenderId: "375406495739",
        appId: "1:375406495739:web:fd28553263599864426d5e"
      };
      try {
        var app = getApp('gift-app');
        _db = getFirestore(app);
      } catch(e) {
        try {
          var app = initializeApp(config, 'gift-app');
          _db = getFirestore(app);
        } catch(e2) {
          var app = initializeApp(config, 'gift-app-' + Date.now());
          _db = getFirestore(app);
        }
      }
    }).catch(function(e) {
      console.warn('[Gifting] Firebase init failed:', e);
    });
  }

  function _getItemName(itemId) {
    if (window.ArcadeAvatar) {
      var items = window.ArcadeAvatar.ITEMS || {};
      var nametags = window.ArcadeAvatar.NAMETAGS || {};
      if (items[itemId]) return items[itemId].name;
      if (nametags[itemId]) return nametags[itemId].name;
    }
    return itemId;
  }

  function _isExclusive(itemId) {
    if (window.ArcadeAvatar) {
      var items = window.ArcadeAvatar.ITEMS || {};
      var nametags = window.ArcadeAvatar.NAMETAGS || {};
      if (items[itemId] && items[itemId].exclusive) return true;
      if (nametags[itemId] && nametags[itemId].exclusive) return true;
    }
    return false;
  }

  function _isEquipped(equipped, itemId) {
    if (!equipped) return false;
    return equipped.hat === itemId || equipped.hair === itemId ||
           equipped.face === itemId || equipped.shirt === itemId ||
           equipped.nametagColor === itemId || equipped.nametagFont === itemId;
  }

  // ─── CSS ───
  var css = document.createElement('style');
  css.textContent =
    '.gift-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,15,26,0.88);' +
    'z-index:10002;justify-content:center;align-items:center;font-family:"Segoe UI",Tahoma,sans-serif}' +
    '.gift-overlay.show{display:flex}' +
    '.gift-box{background:#1a1a2e;border:2px solid #2a2a4a;border-radius:16px;padding:1.5rem;width:380px;max-width:92vw;max-height:80vh;overflow-y:auto;position:relative}' +
    '.gift-box h3{text-align:center;margin-bottom:1rem;font-size:1.1rem;color:#e0e0e0}' +
    '.gift-close{position:absolute;top:0.5rem;right:0.7rem;background:none;border:none;color:#555;font-size:1.4rem;cursor:pointer}' +
    '.gift-close:hover{color:#e0e0e0}' +
    '.gift-tabs{display:flex;margin-bottom:1rem}' +
    '.gift-tab{flex:1;padding:0.4rem;text-align:center;background:#0f0f1a;border:2px solid #2a2a4a;color:#888;' +
    'cursor:pointer;font-size:0.82rem;font-family:inherit;transition:all .2s}' +
    '.gift-tab:first-child{border-radius:8px 0 0 8px}.gift-tab:last-child{border-radius:0 8px 8px 0;border-left:none}' +
    '.gift-tab.active{background:#7b2ff7;border-color:#7b2ff7;color:#fff;font-weight:600}' +
    '.gift-section{display:none}.gift-section.active{display:block}' +
    // Coin gift section
    '.gift-coin-row{display:flex;align-items:center;gap:0.6rem;margin-bottom:1rem}' +
    '.gift-coin-input{flex:1;background:#0f0f1a;border:2px solid #2a2a4a;color:#ffd700;padding:0.5rem;' +
    'border-radius:8px;font-size:1rem;text-align:center;font-family:inherit;outline:none}' +
    '.gift-coin-input:focus{border-color:#7b2ff7}' +
    // Item gift section
    '.gift-item-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:0.5rem;margin-bottom:1rem;max-height:240px;overflow-y:auto}' +
    '.gift-item{display:flex;flex-direction:column;align-items:center;padding:0.5rem;border-radius:8px;' +
    'background:#0f0f1a;border:2px solid #2a2a4a;cursor:pointer;transition:border-color .2s}' +
    '.gift-item:hover{border-color:#555}' +
    '.gift-item.selected{border-color:#7b2ff7;background:#7b2ff710}' +
    '.gift-item-icon{font-size:1.4rem}' +
    '.gift-item-name{font-size:0.6rem;color:#aaa;text-align:center;margin-top:0.2rem}' +
    // Send button
    '.gift-send{display:block;width:100%;background:linear-gradient(135deg,#7b2ff7,#5b1fd7);color:#fff;' +
    'border:none;padding:0.6rem;border-radius:8px;font-size:0.9rem;cursor:pointer;font-family:inherit}' +
    '.gift-send:hover{opacity:0.9}.gift-send:disabled{opacity:0.4;cursor:not-allowed}' +
    '.gift-msg{text-align:center;font-size:0.78rem;margin-top:0.6rem;min-height:1.1rem}' +
    '.gift-msg.ok{color:#2ed573}.gift-msg.err{color:#ff4757}' +
    '.gift-empty{text-align:center;color:#555;font-size:0.82rem;padding:1.5rem}';
  document.head.appendChild(css);

  window.ArcadeGifting = {
    giftCoins: async function(recipientUsername, amount) {
      if (_isGuest()) return { ok: false, msg: 'Not signed in' };
      amount = parseInt(amount);
      if (!amount || amount <= 0) return { ok: false, msg: 'Invalid amount' };
      try {
        await _initFirebase();
        if (!_db) return { ok: false, msg: 'Connection error' };
        var myKey = _getUser().toLowerCase();
        var theirKey = recipientUsername.toLowerCase();
        if (myKey === theirKey) return { ok: false, msg: 'Cannot gift yourself' };

        var myRef = _doc(_db, 'users', myKey);
        var theirRef = _doc(_db, 'users', theirKey);
        var mySnap = await _getDoc(myRef);
        var theirSnap = await _getDoc(theirRef);
        if (!mySnap.exists() || !theirSnap.exists()) return { ok: false, msg: 'User not found' };

        var myData = mySnap.data();
        var theirData = theirSnap.data();

        // Must be friends
        if ((myData.friends || []).indexOf(theirKey) === -1) return { ok: false, msg: 'Must be friends to gift' };
        // Check balance
        if ((myData.coins || 0) < amount) return { ok: false, msg: 'Not enough coins' };

        myData.coins = (myData.coins || 0) - amount;
        theirData.coins = (theirData.coins || 0) + amount;

        // Push notification to recipient
        if (window.ArcadeNotifications) {
          var notif = window.ArcadeNotifications.create('gift_received', 'Gift Received!',
            _getUser() + ' gifted you ' + amount + ' coins!', '🎁',
            'profile.html?user=' + encodeURIComponent(_getUser()), { from: myKey, coins: amount });
          var notifs = theirData.notifications || [];
          notifs.unshift(notif);
          if (notifs.length > 20) notifs = notifs.slice(0, 20);
          theirData.notifications = notifs;
        }

        var batch = _writeBatch(_db);
        batch.set(myRef, myData);
        batch.set(theirRef, theirData);
        await batch.commit();

        // Reload coins locally
        if (window.ArcadeCoins && window.ArcadeCoins.reload) window.ArcadeCoins.reload();
        // Award XP
        if (window.ArcadeLevels) window.ArcadeLevels.addXP(5, 'gift_coins');

        return { ok: true, msg: 'Gifted ' + amount + ' coins!' };
      } catch(e) {
        console.warn('[Gifting] giftCoins failed:', e);
        return { ok: false, msg: 'Something went wrong' };
      }
    },

    giftItem: async function(recipientUsername, itemId) {
      if (_isGuest()) return { ok: false, msg: 'Not signed in' };
      if (_isExclusive(itemId)) return { ok: false, msg: 'Exclusive items cannot be gifted' };
      try {
        await _initFirebase();
        if (!_db) return { ok: false, msg: 'Connection error' };
        var myKey = _getUser().toLowerCase();
        var theirKey = recipientUsername.toLowerCase();
        if (myKey === theirKey) return { ok: false, msg: 'Cannot gift yourself' };

        var myRef = _doc(_db, 'users', myKey);
        var theirRef = _doc(_db, 'users', theirKey);
        var mySnap = await _getDoc(myRef);
        var theirSnap = await _getDoc(theirRef);
        if (!mySnap.exists() || !theirSnap.exists()) return { ok: false, msg: 'User not found' };

        var myData = mySnap.data();
        var theirData = theirSnap.data();

        if ((myData.friends || []).indexOf(theirKey) === -1) return { ok: false, msg: 'Must be friends to gift' };
        if ((myData.inventory || []).indexOf(itemId) === -1) return { ok: false, msg: 'You don\'t own this item' };
        if (_isEquipped(myData.equipped, itemId)) return { ok: false, msg: 'Unequip this item first' };

        // Remove from sender
        myData.inventory = (myData.inventory || []).filter(function(i) { return i !== itemId; });
        // Add to recipient
        if (!theirData.inventory) theirData.inventory = [];
        if (theirData.inventory.indexOf(itemId) === -1) theirData.inventory.push(itemId);

        // Push notification
        var itemName = _getItemName(itemId);
        if (window.ArcadeNotifications) {
          var notif = window.ArcadeNotifications.create('gift_received', 'Gift Received!',
            _getUser() + ' gifted you ' + itemName + '!', '🎁',
            'profile.html?user=' + encodeURIComponent(_getUser()), { from: myKey, itemId: itemId });
          var notifs = theirData.notifications || [];
          notifs.unshift(notif);
          if (notifs.length > 20) notifs = notifs.slice(0, 20);
          theirData.notifications = notifs;
        }

        var batch = _writeBatch(_db);
        batch.set(myRef, myData);
        batch.set(theirRef, theirData);
        await batch.commit();

        if (window.ArcadeCoins && window.ArcadeCoins.reload) window.ArcadeCoins.reload();
        if (window.ArcadeLevels) window.ArcadeLevels.addXP(5, 'gift_item');

        return { ok: true, msg: 'Gifted ' + itemName + '!' };
      } catch(e) {
        console.warn('[Gifting] giftItem failed:', e);
        return { ok: false, msg: 'Something went wrong' };
      }
    },

    canGiftItem: function(itemId) {
      if (_isExclusive(itemId)) return { ok: false, msg: 'Exclusive items cannot be gifted' };
      if (window.ArcadeCoins) {
        var equipped = window.ArcadeCoins.getEquipped();
        if (_isEquipped(equipped, itemId)) return { ok: false, msg: 'Item is currently equipped' };
        if (!window.ArcadeCoins.ownsItem(itemId)) return { ok: false, msg: 'You don\'t own this item' };
      }
      return { ok: true };
    },

    openGiftModal: function(username) {
      if (_isGuest()) return;
      if (_modalEl) _modalEl.remove();

      _modalEl = document.createElement('div');
      _modalEl.className = 'gift-overlay show';

      var box = document.createElement('div');
      box.className = 'gift-box';

      box.innerHTML =
        '<button class="gift-close" id="giftClose">&times;</button>' +
        '<h3>Gift to ' + username + '</h3>' +
        '<div class="gift-tabs">' +
          '<button class="gift-tab active" data-gt="coins">Coins</button>' +
          '<button class="gift-tab" data-gt="items">Items</button>' +
        '</div>' +
        '<div class="gift-section active" id="giftCoins">' +
          '<div class="gift-coin-row">' +
            '<input type="number" class="gift-coin-input" id="giftCoinAmt" min="1" placeholder="Amount">' +
          '</div>' +
          '<button class="gift-send" id="giftCoinSend">Send Coins</button>' +
        '</div>' +
        '<div class="gift-section" id="giftItems">' +
          '<div class="gift-item-grid" id="giftItemGrid"></div>' +
          '<button class="gift-send" id="giftItemSend" disabled>Send Item</button>' +
        '</div>' +
        '<div class="gift-msg" id="giftMsg"></div>';

      _modalEl.appendChild(box);
      _modalEl.addEventListener('click', function(e) { if (e.target === _modalEl) _closeModal(); });
      document.body.appendChild(_modalEl);

      // Close
      document.getElementById('giftClose').onclick = _closeModal;

      // Tabs
      var tabs = box.querySelectorAll('.gift-tab');
      var sections = box.querySelectorAll('.gift-section');
      tabs.forEach(function(t) {
        t.onclick = function() {
          tabs.forEach(function(b) { b.classList.toggle('active', b === t); });
          sections.forEach(function(s) { s.classList.toggle('active', s.id === 'gift' + (t.dataset.gt === 'coins' ? 'Coins' : 'Items')); });
          document.getElementById('giftMsg').textContent = '';
        };
      });

      // Populate items
      _renderGiftItems(username);

      // Coin send
      document.getElementById('giftCoinSend').onclick = async function() {
        var btn = this;
        var amt = parseInt(document.getElementById('giftCoinAmt').value);
        var msg = document.getElementById('giftMsg');
        btn.disabled = true;
        btn.textContent = 'Sending...';
        var r = await window.ArcadeGifting.giftCoins(username, amt);
        msg.textContent = r.msg;
        msg.className = 'gift-msg ' + (r.ok ? 'ok' : 'err');
        btn.disabled = false;
        btn.textContent = 'Send Coins';
        if (r.ok) setTimeout(_closeModal, 1500);
      };
    },

    closeGiftModal: function() { _closeModal(); }
  };

  function _closeModal() {
    if (_modalEl) { _modalEl.remove(); _modalEl = null; }
  }

  var _selectedGiftItem = null;

  function _renderGiftItems(username) {
    var grid = document.getElementById('giftItemGrid');
    if (!grid) return;
    grid.innerHTML = '';
    _selectedGiftItem = null;

    if (!window.ArcadeCoins || !window.ArcadeAvatar) {
      grid.innerHTML = '<div class="gift-empty">Loading...</div>';
      return;
    }

    var inventory = window.ArcadeCoins.getInventory();
    var equipped = window.ArcadeCoins.getEquipped();
    var items = window.ArcadeAvatar.ITEMS || {};
    var nametags = window.ArcadeAvatar.NAMETAGS || {};
    var giftable = [];

    inventory.forEach(function(id) {
      if (_isExclusive(id)) return;
      if (_isEquipped(equipped, id)) return;
      var info = items[id] || nametags[id];
      if (!info) return;
      giftable.push({ id: id, name: info.name, category: info.category || info.type || '?' });
    });

    if (giftable.length === 0) {
      grid.innerHTML = '<div class="gift-empty">No giftable items</div>';
      return;
    }

    var sendBtn = document.getElementById('giftItemSend');

    giftable.forEach(function(item) {
      var el = document.createElement('div');
      el.className = 'gift-item';
      el.innerHTML = '<span class="gift-item-name">' + item.name + '</span>';
      el.onclick = function() {
        grid.querySelectorAll('.gift-item').forEach(function(g) { g.classList.remove('selected'); });
        el.classList.add('selected');
        _selectedGiftItem = item.id;
        sendBtn.disabled = false;
      };
      grid.appendChild(el);
    });

    sendBtn.onclick = async function() {
      if (!_selectedGiftItem) return;
      var btn = this;
      var msg = document.getElementById('giftMsg');
      btn.disabled = true;
      btn.textContent = 'Sending...';
      var r = await window.ArcadeGifting.giftItem(username, _selectedGiftItem);
      msg.textContent = r.msg;
      msg.className = 'gift-msg ' + (r.ok ? 'ok' : 'err');
      btn.disabled = false;
      btn.textContent = 'Send Item';
      if (r.ok) setTimeout(_closeModal, 1500);
    };
  }
})();
