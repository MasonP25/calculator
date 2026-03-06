// ─── ARCADE FRIENDS SYSTEM ───
(function() {
  var _db = null;
  var _doc = null;
  var _getDoc = null;
  var _setDoc = null;
  var _writeBatch = null;
  var _pollTimer = null;
  var _lastRequestCount = -1;

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
        var app = getApp('friends-app');
        _db = getFirestore(app);
      } catch(e) {
        try {
          var app = initializeApp(config, 'friends-app');
          _db = getFirestore(app);
        } catch(e2) {
          var app = initializeApp(config, 'friends-app-' + Date.now());
          _db = getFirestore(app);
        }
      }
    }).catch(function(e) {
      console.warn('[Friends] Firebase init failed:', e);
    });
  }

  // Helper: read a user doc
  async function _readUser(key) {
    var snap = await _getDoc(_doc(_db, 'users', key));
    return snap.exists() ? snap.data() : null;
  }

  // Start polling for incoming friend requests
  function _startPolling() {
    if (_pollTimer) return;
    _pollTimer = setInterval(async function() {
      if (_isGuest()) return;
      try {
        await _initFirebase();
        if (!_db) return;
        var data = await _readUser(_getUser().toLowerCase());
        if (!data) return;
        var count = (data.friendRequestsReceived || []).length;
        if (count !== _lastRequestCount) {
          _lastRequestCount = count;
          window.dispatchEvent(new CustomEvent('friends-updated', {
            detail: { requestCount: count, friends: data.friends || [] }
          }));
        }
      } catch(e) { /* ignore polling errors */ }
    }, 30000);
  }

  window.ArcadeFriends = {
    // Search for a user by username
    search: async function(username) {
      if (!username) return null;
      try {
        await _initFirebase();
        if (!_db) return null;
        var data = await _readUser(username.toLowerCase());
        if (!data) return null;
        return { username: data.username || username, exists: true };
      } catch(e) { return null; }
    },

    // Send a friend request
    sendRequest: async function(targetUsername) {
      if (_isGuest()) return { ok: false, msg: 'Sign in to add friends' };
      if (!targetUsername) return { ok: false, msg: 'Enter a username' };
      var me = _getUser();
      if (targetUsername.toLowerCase() === me.toLowerCase()) return { ok: false, msg: "You can't add yourself" };
      try {
        await _initFirebase();
        if (!_db) return { ok: false, msg: 'Connection error' };
        var myKey = me.toLowerCase();
        var theirKey = targetUsername.toLowerCase();

        var myData = await _readUser(myKey);
        var theirData = await _readUser(theirKey);
        if (!theirData) return { ok: false, msg: 'User not found' };
        if (!myData) return { ok: false, msg: 'Your account not found' };

        var myFriends = myData.friends || [];
        if (myFriends.indexOf(theirKey) !== -1) return { ok: false, msg: 'Already friends' };

        var mySent = myData.friendRequestsSent || [];
        if (mySent.indexOf(theirKey) !== -1) return { ok: false, msg: 'Request already sent' };

        // Check if they already sent us a request — auto-accept
        var myReceived = myData.friendRequestsReceived || [];
        if (myReceived.indexOf(theirKey) !== -1) {
          return await window.ArcadeFriends.acceptRequest(theirData.username || targetUsername);
        }

        // Add to sent/received arrays
        mySent.push(theirKey);
        myData.friendRequestsSent = mySent;
        var theirReceived = theirData.friendRequestsReceived || [];
        theirReceived.push(myKey);
        theirData.friendRequestsReceived = theirReceived;

        var batch = _writeBatch(_db);
        batch.set(_doc(_db, 'users', myKey), myData);
        batch.set(_doc(_db, 'users', theirKey), theirData);
        await batch.commit();

        return { ok: true, msg: 'Friend request sent!' };
      } catch(e) {
        console.warn('[Friends] sendRequest failed:', e);
        return { ok: false, msg: 'Failed to send request' };
      }
    },

    // Accept a friend request
    acceptRequest: async function(fromUsername) {
      if (_isGuest()) return { ok: false, msg: 'Not signed in' };
      try {
        await _initFirebase();
        if (!_db) return { ok: false, msg: 'Connection error' };
        var myKey = _getUser().toLowerCase();
        var theirKey = fromUsername.toLowerCase();

        var myData = await _readUser(myKey);
        var theirData = await _readUser(theirKey);
        if (!myData || !theirData) return { ok: false, msg: 'User not found' };

        // Remove from request arrays
        myData.friendRequestsReceived = (myData.friendRequestsReceived || []).filter(function(k) { return k !== theirKey; });
        theirData.friendRequestsSent = (theirData.friendRequestsSent || []).filter(function(k) { return k !== myKey; });

        // Add to friends arrays
        if (!myData.friends) myData.friends = [];
        if (!theirData.friends) theirData.friends = [];
        if (myData.friends.indexOf(theirKey) === -1) myData.friends.push(theirKey);
        if (theirData.friends.indexOf(myKey) === -1) theirData.friends.push(myKey);

        var batch = _writeBatch(_db);
        batch.set(_doc(_db, 'users', myKey), myData);
        batch.set(_doc(_db, 'users', theirKey), theirData);
        await batch.commit();

        window.dispatchEvent(new CustomEvent('friends-updated', {
          detail: { requestCount: (myData.friendRequestsReceived || []).length, friends: myData.friends }
        }));

        // Check friend badges
        if (window.ArcadeBadges) window.ArcadeBadges.check();

        // Notify the other user
        if (window.ArcadeNotifications) {
          window.ArcadeNotifications.push(theirKey,
            window.ArcadeNotifications.create('friend_accepted', 'Friend Request Accepted',
              _getUser() + ' accepted your friend request!', '🤝',
              'profile.html?user=' + encodeURIComponent(_getUser()), { from: myKey })
          );
        }

        // Award XP for friendship
        if (window.ArcadeLevels) window.ArcadeLevels.addXP(10, 'friend_added');

        return { ok: true, msg: 'You are now friends!' };
      } catch(e) {
        console.warn('[Friends] acceptRequest failed:', e);
        return { ok: false, msg: 'Failed to accept request' };
      }
    },

    // Decline a friend request
    declineRequest: async function(fromUsername) {
      if (_isGuest()) return { ok: false, msg: 'Not signed in' };
      try {
        await _initFirebase();
        if (!_db) return { ok: false, msg: 'Connection error' };
        var myKey = _getUser().toLowerCase();
        var theirKey = fromUsername.toLowerCase();

        var myData = await _readUser(myKey);
        var theirData = await _readUser(theirKey);
        if (!myData) return { ok: false, msg: 'Error' };

        myData.friendRequestsReceived = (myData.friendRequestsReceived || []).filter(function(k) { return k !== theirKey; });
        if (theirData) {
          theirData.friendRequestsSent = (theirData.friendRequestsSent || []).filter(function(k) { return k !== myKey; });
        }

        var batch = _writeBatch(_db);
        batch.set(_doc(_db, 'users', myKey), myData);
        if (theirData) batch.set(_doc(_db, 'users', theirKey), theirData);
        await batch.commit();

        window.dispatchEvent(new CustomEvent('friends-updated', {
          detail: { requestCount: (myData.friendRequestsReceived || []).length, friends: myData.friends || [] }
        }));

        return { ok: true };
      } catch(e) {
        console.warn('[Friends] declineRequest failed:', e);
        return { ok: false, msg: 'Failed to decline request' };
      }
    },

    // Remove a friend
    removeFriend: async function(username) {
      if (_isGuest()) return { ok: false, msg: 'Not signed in' };
      try {
        await _initFirebase();
        if (!_db) return { ok: false, msg: 'Connection error' };
        var myKey = _getUser().toLowerCase();
        var theirKey = username.toLowerCase();

        var myData = await _readUser(myKey);
        var theirData = await _readUser(theirKey);
        if (!myData) return { ok: false, msg: 'Error' };

        myData.friends = (myData.friends || []).filter(function(k) { return k !== theirKey; });
        if (theirData) {
          theirData.friends = (theirData.friends || []).filter(function(k) { return k !== myKey; });
        }

        var batch = _writeBatch(_db);
        batch.set(_doc(_db, 'users', myKey), myData);
        if (theirData) batch.set(_doc(_db, 'users', theirKey), theirData);
        await batch.commit();

        window.dispatchEvent(new CustomEvent('friends-updated', {
          detail: { requestCount: _lastRequestCount, friends: myData.friends }
        }));

        return { ok: true, msg: 'Friend removed' };
      } catch(e) {
        console.warn('[Friends] removeFriend failed:', e);
        return { ok: false, msg: 'Failed to remove friend' };
      }
    },

    // Get incoming friend requests
    getIncomingRequests: async function() {
      if (_isGuest()) return [];
      try {
        await _initFirebase();
        if (!_db) return [];
        var data = await _readUser(_getUser().toLowerCase());
        if (!data) return [];
        var keys = data.friendRequestsReceived || [];
        // Resolve display names
        var results = [];
        for (var i = 0; i < keys.length; i++) {
          var uData = await _readUser(keys[i]);
          results.push(uData ? (uData.username || keys[i]) : keys[i]);
        }
        return results;
      } catch(e) { return []; }
    },

    // Get friends list (display names)
    getFriends: async function() {
      if (_isGuest()) return [];
      try {
        await _initFirebase();
        if (!_db) return [];
        var data = await _readUser(_getUser().toLowerCase());
        if (!data) return [];
        var keys = data.friends || [];
        var results = [];
        for (var i = 0; i < keys.length; i++) {
          var uData = await _readUser(keys[i]);
          results.push(uData ? (uData.username || keys[i]) : keys[i]);
        }
        return results;
      } catch(e) { return []; }
    },

    // Get relationship status with another user
    getStatus: async function(username) {
      if (_isGuest() || !username) return 'none';
      try {
        await _initFirebase();
        if (!_db) return 'none';
        var myKey = _getUser().toLowerCase();
        var theirKey = username.toLowerCase();
        if (myKey === theirKey) return 'self';
        var data = await _readUser(myKey);
        if (!data) return 'none';
        if ((data.friends || []).indexOf(theirKey) !== -1) return 'friends';
        if ((data.friendRequestsSent || []).indexOf(theirKey) !== -1) return 'pending_sent';
        if ((data.friendRequestsReceived || []).indexOf(theirKey) !== -1) return 'pending_received';
        return 'none';
      } catch(e) { return 'none'; }
    },

    // Force refresh (dispatch event)
    refresh: async function() {
      if (_isGuest()) return;
      try {
        await _initFirebase();
        if (!_db) return;
        var data = await _readUser(_getUser().toLowerCase());
        if (!data) return;
        var count = (data.friendRequestsReceived || []).length;
        _lastRequestCount = count;
        window.dispatchEvent(new CustomEvent('friends-updated', {
          detail: { requestCount: count, friends: data.friends || [] }
        }));
      } catch(e) { /* ignore */ }
    }
  };

  // Start polling when signed in
  if (!_isGuest()) {
    setTimeout(function() {
      _startPolling();
      window.ArcadeFriends.refresh();
    }, 2000);
  }

  window.addEventListener('arcade-auth-change', function() {
    _lastRequestCount = -1;
    if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
    if (!_isGuest()) {
      setTimeout(function() {
        _startPolling();
        window.ArcadeFriends.refresh();
      }, 1500);
    }
  });
})();
