// ─── ARCADE TRADING SYSTEM ───
(function() {
  var _db = null;
  var _doc = null;
  var _getDoc = null;
  var _setDoc = null;
  var _writeBatch = null;
  var _collection = null;
  var _getDocs = null;
  var _query = null;
  var _where = null;
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
        var app = getApp('trade-app');
        _db = getFirestore(app);
      } catch(e) {
        try {
          var app = initializeApp(config, 'trade-app');
          _db = getFirestore(app);
        } catch(e2) {
          var app = initializeApp(config, 'trade-app-' + Date.now());
          _db = getFirestore(app);
        }
      }
    }).catch(function(e) {
      console.warn('[Trading] Firebase init failed:', e);
    });
  }

  function _genTradeId() {
    return 'trade_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
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
    '.trade-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,15,26,0.88);' +
    'z-index:10002;justify-content:center;align-items:center;font-family:"Segoe UI",Tahoma,sans-serif}' +
    '.trade-overlay.show{display:flex}' +
    '.trade-box{background:#1a1a2e;border:2px solid #2a2a4a;border-radius:16px;padding:1.5rem;width:600px;max-width:95vw;max-height:85vh;overflow-y:auto;position:relative}' +
    '.trade-box h3{text-align:center;margin-bottom:1rem;font-size:1.1rem;color:#e0e0e0}' +
    '.trade-close{position:absolute;top:0.5rem;right:0.7rem;background:none;border:none;color:#555;font-size:1.4rem;cursor:pointer}' +
    '.trade-close:hover{color:#e0e0e0}' +
    '.trade-columns{display:flex;gap:1rem;margin-bottom:1rem}' +
    '@media(max-width:500px){.trade-columns{flex-direction:column}}' +
    '.trade-col{flex:1;border:2px solid #2a2a4a;border-radius:12px;padding:0.8rem;background:#0f0f1a}' +
    '.trade-col-header{font-size:0.8rem;font-weight:700;color:#aaa;margin-bottom:0.5rem;text-align:center;padding-bottom:0.4rem;border-bottom:1px solid #2a2a4a}' +
    '.trade-item-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:0.4rem;max-height:200px;overflow-y:auto}' +
    '.trade-item{display:flex;flex-direction:column;align-items:center;padding:0.4rem;border-radius:8px;' +
    'background:#1a1a2e;border:2px solid #2a2a4a;cursor:pointer;transition:border-color .2s}' +
    '.trade-item:hover{border-color:#555}' +
    '.trade-item.selected{border-color:#7b2ff7;background:#7b2ff710}' +
    '.trade-item-name{font-size:0.55rem;color:#aaa;text-align:center;margin-top:0.2rem;line-height:1.1}' +
    '.trade-arrow{text-align:center;font-size:1.5rem;color:#7b2ff7;margin:0.5rem 0}' +
    '.trade-send{display:block;width:100%;background:linear-gradient(135deg,#7b2ff7,#5b1fd7);color:#fff;' +
    'border:none;padding:0.6rem;border-radius:8px;font-size:0.9rem;cursor:pointer;font-family:inherit}' +
    '.trade-send:hover{opacity:0.9}.trade-send:disabled{opacity:0.4;cursor:not-allowed}' +
    '.trade-msg{text-align:center;font-size:0.78rem;margin-top:0.6rem;min-height:1.1rem}' +
    '.trade-msg.ok{color:#2ed573}.trade-msg.err{color:#ff4757}' +
    '.trade-empty{text-align:center;color:#555;font-size:0.75rem;padding:1rem}' +
    // Review modal
    '.trade-review-items{display:flex;flex-wrap:wrap;gap:0.3rem;margin:0.5rem 0}' +
    '.trade-review-item{background:#0f0f1a;border:1px solid #2a2a4a;border-radius:6px;padding:0.3rem 0.6rem;font-size:0.75rem;color:#e0e0e0}' +
    '.trade-review-section{margin:0.8rem 0}' +
    '.trade-review-label{font-size:0.72rem;color:#888;font-weight:600;margin-bottom:0.3rem}' +
    '.trade-expire{font-size:0.68rem;color:#888;text-align:center;margin:0.5rem 0}' +
    '.trade-actions{display:flex;gap:0.6rem;margin-top:1rem}' +
    '.trade-btn-accept{flex:1;background:#2ed573;color:#fff;border:none;padding:0.6rem;border-radius:8px;font-size:0.88rem;cursor:pointer;font-family:inherit}' +
    '.trade-btn-decline{flex:1;background:#ff4757;color:#fff;border:none;padding:0.6rem;border-radius:8px;font-size:0.88rem;cursor:pointer;font-family:inherit}' +
    '.trade-btn-cancel{flex:1;background:#555;color:#fff;border:none;padding:0.6rem;border-radius:8px;font-size:0.88rem;cursor:pointer;font-family:inherit}';
  document.head.appendChild(css);

  window.ArcadeTrading = {
    propose: async function(toUsername, offeredItems, requestedItems) {
      if (_isGuest()) return { ok: false, msg: 'Not signed in' };
      if (!offeredItems.length && !requestedItems.length) return { ok: false, msg: 'Select items to trade' };
      try {
        await _initFirebase();
        if (!_db) return { ok: false, msg: 'Connection error' };
        var myKey = _getUser().toLowerCase();
        var theirKey = toUsername.toLowerCase();
        if (myKey === theirKey) return { ok: false, msg: 'Cannot trade with yourself' };

        var myRef = _doc(_db, 'users', myKey);
        var theirRef = _doc(_db, 'users', theirKey);
        var mySnap = await _getDoc(myRef);
        var theirSnap = await _getDoc(theirRef);
        if (!mySnap.exists() || !theirSnap.exists()) return { ok: false, msg: 'User not found' };

        var myData = mySnap.data();
        var theirData = theirSnap.data();

        if ((myData.friends || []).indexOf(theirKey) === -1) return { ok: false, msg: 'Must be friends' };

        // Validate offered items
        for (var i = 0; i < offeredItems.length; i++) {
          if (_isExclusive(offeredItems[i])) return { ok: false, msg: 'Cannot trade exclusive items' };
          if ((myData.inventory || []).indexOf(offeredItems[i]) === -1) return { ok: false, msg: 'You don\'t own ' + _getItemName(offeredItems[i]) };
        }
        // Validate requested items
        for (var j = 0; j < requestedItems.length; j++) {
          if (_isExclusive(requestedItems[j])) return { ok: false, msg: 'Cannot trade exclusive items' };
          if ((theirData.inventory || []).indexOf(requestedItems[j]) === -1) return { ok: false, msg: theirData.username + ' doesn\'t own ' + _getItemName(requestedItems[j]) };
        }

        var tradeId = _genTradeId();
        var tradeDoc = {
          id: tradeId,
          fromUser: myKey,
          fromDisplayName: _getUser(),
          toUser: theirKey,
          toDisplayName: theirData.username || toUsername,
          offeredItems: offeredItems,
          requestedItems: requestedItems,
          status: 'pending',
          createdAt: Date.now(),
          expiresAt: Date.now() + 86400000,
          completedAt: null
        };

        // Add trade ID to both users
        if (!myData.pendingTradeIds) myData.pendingTradeIds = [];
        if (!theirData.pendingTradeIds) theirData.pendingTradeIds = [];
        myData.pendingTradeIds.push(tradeId);
        theirData.pendingTradeIds.push(tradeId);

        // Notification
        if (window.ArcadeNotifications) {
          var offerNames = offeredItems.map(_getItemName).join(', ');
          var wantNames = requestedItems.map(_getItemName).join(', ');
          var body = _getUser() + ' wants to trade';
          if (offerNames) body += ' — offering: ' + offerNames;
          var notif = window.ArcadeNotifications.create('trade_request', 'Trade Request',
            body, '🔄', 'profile.html?user=' + encodeURIComponent(_getUser()),
            { tradeId: tradeId, from: myKey });
          var notifs = theirData.notifications || [];
          notifs.unshift(notif);
          if (notifs.length > 20) notifs = notifs.slice(0, 20);
          theirData.notifications = notifs;
        }

        var batch = _writeBatch(_db);
        batch.set(_doc(_db, 'trades', tradeId), tradeDoc);
        batch.set(myRef, myData);
        batch.set(theirRef, theirData);
        await batch.commit();

        return { ok: true, msg: 'Trade proposed!', tradeId: tradeId };
      } catch(e) {
        console.warn('[Trading] propose failed:', e);
        return { ok: false, msg: 'Something went wrong' };
      }
    },

    accept: async function(tradeId) {
      if (_isGuest()) return { ok: false, msg: 'Not signed in' };
      try {
        await _initFirebase();
        if (!_db) return { ok: false, msg: 'Connection error' };

        var tradeRef = _doc(_db, 'trades', tradeId);
        var tradeSnap = await _getDoc(tradeRef);
        if (!tradeSnap.exists()) return { ok: false, msg: 'Trade not found' };
        var trade = tradeSnap.data();

        if (trade.status !== 'pending') return { ok: false, msg: 'Trade is no longer pending' };
        if (Date.now() > trade.expiresAt) return { ok: false, msg: 'Trade has expired' };

        var myKey = _getUser().toLowerCase();
        if (trade.toUser !== myKey) return { ok: false, msg: 'This trade is not for you' };

        var fromRef = _doc(_db, 'users', trade.fromUser);
        var toRef = _doc(_db, 'users', trade.toUser);
        var fromSnap = await _getDoc(fromRef);
        var toSnap = await _getDoc(toRef);
        if (!fromSnap.exists() || !toSnap.exists()) return { ok: false, msg: 'User not found' };

        var fromData = fromSnap.data();
        var toData = toSnap.data();

        // Verify both still own items
        for (var i = 0; i < trade.offeredItems.length; i++) {
          if ((fromData.inventory || []).indexOf(trade.offeredItems[i]) === -1)
            return { ok: false, msg: 'Proposer no longer owns ' + _getItemName(trade.offeredItems[i]) };
        }
        for (var j = 0; j < trade.requestedItems.length; j++) {
          if ((toData.inventory || []).indexOf(trade.requestedItems[j]) === -1)
            return { ok: false, msg: 'You no longer own ' + _getItemName(trade.requestedItems[j]) };
        }

        // Swap items
        trade.offeredItems.forEach(function(itemId) {
          fromData.inventory = fromData.inventory.filter(function(i) { return i !== itemId; });
          if (!toData.inventory) toData.inventory = [];
          if (toData.inventory.indexOf(itemId) === -1) toData.inventory.push(itemId);
          // Unequip if equipped
          if (fromData.equipped) {
            Object.keys(fromData.equipped).forEach(function(k) {
              if (fromData.equipped[k] === itemId) fromData.equipped[k] = '';
            });
          }
        });

        trade.requestedItems.forEach(function(itemId) {
          toData.inventory = toData.inventory.filter(function(i) { return i !== itemId; });
          if (!fromData.inventory) fromData.inventory = [];
          if (fromData.inventory.indexOf(itemId) === -1) fromData.inventory.push(itemId);
          if (toData.equipped) {
            Object.keys(toData.equipped).forEach(function(k) {
              if (toData.equipped[k] === itemId) toData.equipped[k] = '';
            });
          }
        });

        // Update trade status
        trade.status = 'accepted';
        trade.completedAt = Date.now();

        // Remove trade ID from both users
        fromData.pendingTradeIds = (fromData.pendingTradeIds || []).filter(function(id) { return id !== tradeId; });
        toData.pendingTradeIds = (toData.pendingTradeIds || []).filter(function(id) { return id !== tradeId; });

        // Notify proposer
        if (window.ArcadeNotifications) {
          var notif = window.ArcadeNotifications.create('trade_completed', 'Trade Completed!',
            _getUser() + ' accepted your trade!', '✅',
            'profile.html?user=' + encodeURIComponent(_getUser()), { tradeId: tradeId });
          var notifs = fromData.notifications || [];
          notifs.unshift(notif);
          if (notifs.length > 20) notifs = notifs.slice(0, 20);
          fromData.notifications = notifs;
        }

        var batch = _writeBatch(_db);
        batch.set(tradeRef, trade);
        batch.set(fromRef, fromData);
        batch.set(toRef, toData);
        await batch.commit();

        if (window.ArcadeCoins && window.ArcadeCoins.reload) window.ArcadeCoins.reload();
        if (window.ArcadeLevels) window.ArcadeLevels.addXP(10, 'trade_completed');

        return { ok: true, msg: 'Trade completed!' };
      } catch(e) {
        console.warn('[Trading] accept failed:', e);
        return { ok: false, msg: 'Something went wrong' };
      }
    },

    decline: async function(tradeId) {
      if (_isGuest()) return { ok: false, msg: 'Not signed in' };
      try {
        await _initFirebase();
        if (!_db) return { ok: false, msg: 'Connection error' };
        var tradeRef = _doc(_db, 'trades', tradeId);
        var tradeSnap = await _getDoc(tradeRef);
        if (!tradeSnap.exists()) return { ok: false, msg: 'Trade not found' };
        var trade = tradeSnap.data();
        if (trade.status !== 'pending') return { ok: false, msg: 'Trade is no longer pending' };

        trade.status = 'declined';
        trade.completedAt = Date.now();

        var fromRef = _doc(_db, 'users', trade.fromUser);
        var toRef = _doc(_db, 'users', trade.toUser);
        var fromSnap = await _getDoc(fromRef);
        var toSnap = await _getDoc(toRef);

        var batch = _writeBatch(_db);
        batch.set(tradeRef, trade);

        if (fromSnap.exists()) {
          var fromData = fromSnap.data();
          fromData.pendingTradeIds = (fromData.pendingTradeIds || []).filter(function(id) { return id !== tradeId; });
          if (window.ArcadeNotifications) {
            var notif = window.ArcadeNotifications.create('trade_declined', 'Trade Declined',
              (_getUser()) + ' declined your trade', '❌', null, { tradeId: tradeId });
            var notifs = fromData.notifications || [];
            notifs.unshift(notif);
            if (notifs.length > 20) notifs = notifs.slice(0, 20);
            fromData.notifications = notifs;
          }
          batch.set(fromRef, fromData);
        }
        if (toSnap.exists()) {
          var toData = toSnap.data();
          toData.pendingTradeIds = (toData.pendingTradeIds || []).filter(function(id) { return id !== tradeId; });
          batch.set(toRef, toData);
        }

        await batch.commit();
        return { ok: true, msg: 'Trade declined' };
      } catch(e) {
        console.warn('[Trading] decline failed:', e);
        return { ok: false, msg: 'Something went wrong' };
      }
    },

    cancel: async function(tradeId) {
      if (_isGuest()) return { ok: false, msg: 'Not signed in' };
      try {
        await _initFirebase();
        if (!_db) return { ok: false, msg: 'Connection error' };
        var tradeRef = _doc(_db, 'trades', tradeId);
        var tradeSnap = await _getDoc(tradeRef);
        if (!tradeSnap.exists()) return { ok: false, msg: 'Trade not found' };
        var trade = tradeSnap.data();
        if (trade.status !== 'pending') return { ok: false, msg: 'Trade is no longer pending' };
        if (trade.fromUser !== _getUser().toLowerCase()) return { ok: false, msg: 'Only the proposer can cancel' };

        trade.status = 'cancelled';
        trade.completedAt = Date.now();

        var fromRef = _doc(_db, 'users', trade.fromUser);
        var toRef = _doc(_db, 'users', trade.toUser);
        var fromSnap = await _getDoc(fromRef);
        var toSnap = await _getDoc(toRef);

        var batch = _writeBatch(_db);
        batch.set(tradeRef, trade);

        if (fromSnap.exists()) {
          var fromData = fromSnap.data();
          fromData.pendingTradeIds = (fromData.pendingTradeIds || []).filter(function(id) { return id !== tradeId; });
          batch.set(fromRef, fromData);
        }
        if (toSnap.exists()) {
          var toData = toSnap.data();
          toData.pendingTradeIds = (toData.pendingTradeIds || []).filter(function(id) { return id !== tradeId; });
          batch.set(toRef, toData);
        }

        await batch.commit();
        return { ok: true, msg: 'Trade cancelled' };
      } catch(e) {
        console.warn('[Trading] cancel failed:', e);
        return { ok: false, msg: 'Something went wrong' };
      }
    },

    getPendingTrades: async function() {
      if (_isGuest()) return [];
      try {
        await _initFirebase();
        if (!_db) return [];
        var key = _getUser().toLowerCase();
        var snap = await _getDoc(_doc(_db, 'users', key));
        if (!snap.exists()) return [];
        var data = snap.data();
        var ids = data.pendingTradeIds || [];
        if (ids.length === 0) return [];

        var trades = [];
        for (var i = 0; i < ids.length; i++) {
          try {
            var tSnap = await _getDoc(_doc(_db, 'trades', ids[i]));
            if (tSnap.exists()) {
              var t = tSnap.data();
              if (t.status === 'pending' && Date.now() < t.expiresAt) {
                trades.push(t);
              }
            }
          } catch(e) {}
        }
        return trades;
      } catch(e) {
        return [];
      }
    },

    getTrade: async function(tradeId) {
      try {
        await _initFirebase();
        if (!_db) return null;
        var snap = await _getDoc(_doc(_db, 'trades', tradeId));
        return snap.exists() ? snap.data() : null;
      } catch(e) { return null; }
    },

    openTradeModal: function(friendUsername) {
      if (_isGuest()) return;
      _openProposalModal(friendUsername);
    },

    openReviewModal: function(tradeId) {
      if (_isGuest()) return;
      _openReviewModalFn(tradeId);
    }
  };

  function _closeModal() {
    if (_modalEl) { _modalEl.remove(); _modalEl = null; }
  }

  // ─── PROPOSAL MODAL ───
  async function _openProposalModal(friendUsername) {
    if (_modalEl) _modalEl.remove();
    _modalEl = document.createElement('div');
    _modalEl.className = 'trade-overlay show';

    var box = document.createElement('div');
    box.className = 'trade-box';

    // Get friend's inventory
    var friendInventory = [];
    if (window.ArcadeBadges && window.ArcadeBadges.getFullProfile) {
      var friendProfile = await window.ArcadeBadges.getFullProfile(friendUsername);
      if (friendProfile) friendInventory = friendProfile.inventory || [];
    }

    box.innerHTML =
      '<button class="trade-close" id="tradeClose">&times;</button>' +
      '<h3>Trade with ' + friendUsername + '</h3>' +
      '<div class="trade-columns">' +
        '<div class="trade-col">' +
          '<div class="trade-col-header">Your Items (offering)</div>' +
          '<div class="trade-item-grid" id="tradeMyItems"></div>' +
        '</div>' +
        '<div class="trade-col">' +
          '<div class="trade-col-header">Their Items (requesting)</div>' +
          '<div class="trade-item-grid" id="tradeTheirItems"></div>' +
        '</div>' +
      '</div>' +
      '<button class="trade-send" id="tradeSend" disabled>Propose Trade</button>' +
      '<div class="trade-msg" id="tradeMsg"></div>';

    _modalEl.appendChild(box);
    _modalEl.addEventListener('click', function(e) { if (e.target === _modalEl) _closeModal(); });
    document.body.appendChild(_modalEl);

    document.getElementById('tradeClose').onclick = _closeModal;

    var selectedOffer = [];
    var selectedRequest = [];

    function updateSendBtn() {
      document.getElementById('tradeSend').disabled = selectedOffer.length === 0 && selectedRequest.length === 0;
    }

    // Populate my items
    var myGrid = document.getElementById('tradeMyItems');
    if (window.ArcadeCoins && window.ArcadeAvatar) {
      var myInv = window.ArcadeCoins.getInventory();
      var equipped = window.ArcadeCoins.getEquipped();
      var items = window.ArcadeAvatar.ITEMS || {};
      var nametags = window.ArcadeAvatar.NAMETAGS || {};
      var tradeable = myInv.filter(function(id) {
        return !_isExclusive(id) && !_isEquipped(equipped, id);
      });
      if (tradeable.length === 0) {
        myGrid.innerHTML = '<div class="trade-empty">No tradeable items</div>';
      } else {
        tradeable.forEach(function(id) {
          var info = items[id] || nametags[id];
          var el = document.createElement('div');
          el.className = 'trade-item';
          el.innerHTML = '<span class="trade-item-name">' + (info ? info.name : id) + '</span>';
          el.onclick = function() {
            el.classList.toggle('selected');
            var idx = selectedOffer.indexOf(id);
            if (idx >= 0) selectedOffer.splice(idx, 1);
            else selectedOffer.push(id);
            updateSendBtn();
          };
          myGrid.appendChild(el);
        });
      }
    }

    // Populate their items
    var theirGrid = document.getElementById('tradeTheirItems');
    var theirTradeable = friendInventory.filter(function(id) { return !_isExclusive(id); });
    if (theirTradeable.length === 0) {
      theirGrid.innerHTML = '<div class="trade-empty">No tradeable items</div>';
    } else {
      var items2 = (window.ArcadeAvatar && window.ArcadeAvatar.ITEMS) || {};
      var nametags2 = (window.ArcadeAvatar && window.ArcadeAvatar.NAMETAGS) || {};
      theirTradeable.forEach(function(id) {
        var info = items2[id] || nametags2[id];
        var el = document.createElement('div');
        el.className = 'trade-item';
        el.innerHTML = '<span class="trade-item-name">' + (info ? info.name : id) + '</span>';
        el.onclick = function() {
          el.classList.toggle('selected');
          var idx = selectedRequest.indexOf(id);
          if (idx >= 0) selectedRequest.splice(idx, 1);
          else selectedRequest.push(id);
          updateSendBtn();
        };
        theirGrid.appendChild(el);
      });
    }

    // Send
    document.getElementById('tradeSend').onclick = async function() {
      var btn = this;
      var msg = document.getElementById('tradeMsg');
      btn.disabled = true;
      btn.textContent = 'Proposing...';
      var r = await window.ArcadeTrading.propose(friendUsername, selectedOffer, selectedRequest);
      msg.textContent = r.msg;
      msg.className = 'trade-msg ' + (r.ok ? 'ok' : 'err');
      btn.disabled = false;
      btn.textContent = 'Propose Trade';
      if (r.ok) setTimeout(_closeModal, 1500);
    };
  }

  // ─── REVIEW MODAL ───
  async function _openReviewModalFn(tradeId) {
    if (_modalEl) _modalEl.remove();
    var trade = await window.ArcadeTrading.getTrade(tradeId);
    if (!trade) return;

    _modalEl = document.createElement('div');
    _modalEl.className = 'trade-overlay show';

    var box = document.createElement('div');
    box.className = 'trade-box';

    var isProposer = trade.fromUser === _getUser().toLowerCase();
    var otherName = isProposer ? (trade.toDisplayName || trade.toUser) : (trade.fromDisplayName || trade.fromUser);

    var timeLeft = Math.max(0, trade.expiresAt - Date.now());
    var hoursLeft = Math.floor(timeLeft / 3600000);
    var minsLeft = Math.floor((timeLeft % 3600000) / 60000);

    var offerHtml = trade.offeredItems.map(function(id) {
      return '<span class="trade-review-item">' + _getItemName(id) + '</span>';
    }).join('');
    var requestHtml = trade.requestedItems.map(function(id) {
      return '<span class="trade-review-item">' + _getItemName(id) + '</span>';
    }).join('');

    box.innerHTML =
      '<button class="trade-close" id="tradeClose">&times;</button>' +
      '<h3>Trade with ' + otherName + '</h3>' +
      '<div class="trade-expire">Expires in ' + hoursLeft + 'h ' + minsLeft + 'm</div>' +
      '<div class="trade-review-section">' +
        '<div class="trade-review-label">' + (trade.fromDisplayName || trade.fromUser) + ' offers:</div>' +
        '<div class="trade-review-items">' + (offerHtml || '<span class="trade-review-item" style="color:#888">Nothing</span>') + '</div>' +
      '</div>' +
      '<div class="trade-arrow">⇅</div>' +
      '<div class="trade-review-section">' +
        '<div class="trade-review-label">' + (trade.toDisplayName || trade.toUser) + ' offers:</div>' +
        '<div class="trade-review-items">' + (requestHtml || '<span class="trade-review-item" style="color:#888">Nothing</span>') + '</div>' +
      '</div>' +
      '<div class="trade-actions" id="tradeActions"></div>' +
      '<div class="trade-msg" id="tradeMsg"></div>';

    _modalEl.appendChild(box);
    _modalEl.addEventListener('click', function(e) { if (e.target === _modalEl) _closeModal(); });
    document.body.appendChild(_modalEl);

    document.getElementById('tradeClose').onclick = _closeModal;

    var actionsEl = document.getElementById('tradeActions');
    if (trade.status !== 'pending') {
      actionsEl.innerHTML = '<div class="trade-msg">Trade is ' + trade.status + '</div>';
      return;
    }

    if (isProposer) {
      actionsEl.innerHTML = '<button class="trade-btn-cancel" id="tradeCancel">Cancel Trade</button>';
      document.getElementById('tradeCancel').onclick = async function() {
        this.disabled = true;
        this.textContent = 'Cancelling...';
        var r = await window.ArcadeTrading.cancel(tradeId);
        document.getElementById('tradeMsg').textContent = r.msg;
        document.getElementById('tradeMsg').className = 'trade-msg ' + (r.ok ? 'ok' : 'err');
        if (r.ok) setTimeout(_closeModal, 1000);
      };
    } else {
      actionsEl.innerHTML =
        '<button class="trade-btn-accept" id="tradeAccept">Accept</button>' +
        '<button class="trade-btn-decline" id="tradeDecline">Decline</button>';
      document.getElementById('tradeAccept').onclick = async function() {
        this.disabled = true;
        this.textContent = 'Accepting...';
        var r = await window.ArcadeTrading.accept(tradeId);
        document.getElementById('tradeMsg').textContent = r.msg;
        document.getElementById('tradeMsg').className = 'trade-msg ' + (r.ok ? 'ok' : 'err');
        if (r.ok) setTimeout(_closeModal, 1500);
      };
      document.getElementById('tradeDecline').onclick = async function() {
        this.disabled = true;
        this.textContent = 'Declining...';
        var r = await window.ArcadeTrading.decline(tradeId);
        document.getElementById('tradeMsg').textContent = r.msg;
        document.getElementById('tradeMsg').className = 'trade-msg ' + (r.ok ? 'ok' : 'err');
        if (r.ok) setTimeout(_closeModal, 1000);
      };
    }
  }
})();
