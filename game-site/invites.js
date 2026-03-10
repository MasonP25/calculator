// ─── GAME INVITES ───
(function() {
  var MULTIPLAYER = ['tictactoe','connect4','imposter','uno','penguin','wavelength','snakeio','holeio'];
  var page = (window.location.pathname.split('/').pop() || '').replace('.html','');
  if (MULTIPLAYER.indexOf(page) === -1) return;

  var GAME_NAMES = {
    tictactoe:'Tic Tac Toe', connect4:'Connect Four', imposter:'Imposter',
    uno:'UNO', penguin:'Penguin Knockout', wavelength:'Wavelength',
    snakeio:'Snake.io', holeio:'Hole.io'
  };

  // Auto-join steps: sequence of DOM actions to join a room
  // { click: 'selector' } — click a button
  // { fill: 'selector' } — set input value to room code
  // { fn: 'globalFnName', args: [...] } — call a global function
  var AUTO_JOIN = {
    tictactoe: [
      { click: '[data-mode="online"]' },
      { click: '#join-game-btn' },
      { fill: '#join-code-input' },
      { click: '#join-submit-btn' }
    ],
    connect4: [
      { click: '#modeOnline' },
      { click: '#join-game-btn' },
      { fill: '#join-code-input' },
      { click: '#join-submit-btn' }
    ],
    uno: [
      { click: '#join-game-btn' },
      { fill: '#join-code-input' },
      { click: '#join-submit-btn' }
    ],
    wavelength: [
      { click: '#join-game-btn' },
      { fill: '#join-code-input' },
      { click: '#join-submit-btn' }
    ],
    snakeio: [
      { click: '#btn-online' },
      { click: '#ol-join-btn' },
      { fill: '#ol-join-input' },
      { click: '#ol-join-submit' }
    ],
    penguin: [
      { fn: 'showSetup', args: ['online'] },
      { fn: 'showJoinArea' },
      { fill: '#joinCode' },
      { fn: 'joinRoom' }
    ],
    imposter: [
      { fn: 'showScreen', args: ['join-screen'] },
      { fill: '#join-code-input' },
      { fn: 'joinRoom' }
    ],
    holeio: [
      { fn: 'showScreen', args: ['lobbyScreen'] },
      { fill: '#joinCodeInput' },
      { fn: 'joinRoom' }
    ]
  };

  function _getUser() {
    return localStorage.getItem('arcade_currentUser') || 'Guest';
  }
  function _isGuest() {
    var u = _getUser();
    return !u || u === 'Guest';
  }

  // Inject CSS
  var css = document.createElement('style');
  css.textContent =
    '.invite-btn{position:fixed;bottom:16px;left:16px;background:#1a1a2e;border:2px solid #00d4ff;border-radius:12px;' +
    'padding:0.5rem 1rem;cursor:pointer;font-family:"Segoe UI",Tahoma,sans-serif;font-size:0.85rem;' +
    'color:#00d4ff;font-weight:600;z-index:999;transition:all 0.2s;display:flex;align-items:center;gap:0.4rem}' +
    '.invite-btn:hover{background:#0f0f1a;transform:scale(1.05)}' +
    '.invite-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:100000;' +
    'display:flex;align-items:center;justify-content:center;font-family:"Segoe UI",Tahoma,sans-serif}' +
    '.invite-modal{background:#1a1a2e;border:2px solid #2a2a4a;border-radius:18px;padding:1.5rem;width:340px;max-width:90vw;max-height:70vh;overflow-y:auto}' +
    '.invite-modal h3{color:#e0e0e0;margin-bottom:1rem;font-size:1.1rem}' +
    '.invite-friend{display:flex;align-items:center;gap:0.7rem;padding:0.6rem 0.8rem;border-radius:10px;transition:background 0.15s}' +
    '.invite-friend:hover{background:#0f0f1a}' +
    '.invite-friend-name{font-size:0.9rem;font-weight:600;color:#e0e0e0;flex:1}' +
    '.invite-send-btn{padding:0.3rem 0.8rem;border-radius:8px;font-size:0.75rem;font-family:inherit;cursor:pointer;' +
    'border:none;background:#00d4ff;color:#0f0f1a;font-weight:700;transition:opacity 0.2s}' +
    '.invite-send-btn:hover{opacity:0.8}' +
    '.invite-send-btn:disabled{background:#2a2a4a;color:#888;cursor:default}' +
    '.invite-empty{color:#555;font-size:0.85rem;padding:1rem;text-align:center}' +
    '.invite-close{padding:0.4rem 1.2rem;border-radius:10px;font-family:inherit;font-size:0.8rem;cursor:pointer;' +
    'border:2px solid #2a2a4a;background:#0f0f1a;color:#aaa;font-weight:600;margin-top:1rem;display:block;width:100%}' +
    '.invite-close:hover{border-color:#7b2ff7;color:#e0e0e0}';
  document.head.appendChild(css);

  var _currentRoomCode = null;

  // Detect active room code from the page
  function detectRoomCode() {
    var els = document.querySelectorAll('.room-code-display');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.trim();
      if (t && t.length === 4 && t !== '----') return t;
    }
    if (window._onlineState && window._onlineState.roomId) return window._onlineState.roomId;
    return null;
  }

  function addButton(roomCode) {
    if (_isGuest()) return;
    var existing = document.querySelector('.invite-btn');
    if (existing) existing.remove();
    var btn = document.createElement('button');
    btn.className = 'invite-btn';
    btn.innerHTML = '\uD83D\uDC4B Invite Friend';
    btn.onclick = function() { showInviteModal(roomCode); };
    document.body.appendChild(btn);
  }

  function removeButton() {
    var btn = document.querySelector('.invite-btn');
    if (btn) btn.remove();
  }

  async function showInviteModal(roomCode) {
    if (!window.ArcadeFriends) return;

    var overlay = document.createElement('div');
    overlay.className = 'invite-overlay';

    var modal = document.createElement('div');
    modal.className = 'invite-modal';
    modal.innerHTML = '<h3>\uD83C\uDFAE Invite a Friend</h3>' +
      '<div id="inviteFriendsList"><div class="invite-empty">Loading friends...</div></div>' +
      '<button class="invite-close" id="inviteClose">Close</button>';
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    modal.querySelector('#inviteClose').onclick = function() { overlay.remove(); };
    modal.onclick = function(e) { e.stopPropagation(); };

    var friends = await window.ArcadeFriends.getFriends();
    var list = modal.querySelector('#inviteFriendsList');

    if (friends.length === 0) {
      list.innerHTML = '<div class="invite-empty">No friends to invite. Add friends from your profile!</div>';
      return;
    }

    list.innerHTML = '';
    var gameName = GAME_NAMES[page] || page;

    friends.forEach(function(friendName) {
      var item = document.createElement('div');
      item.className = 'invite-friend';

      var name = document.createElement('span');
      name.className = 'invite-friend-name';
      name.textContent = friendName;

      var sendBtn = document.createElement('button');
      sendBtn.className = 'invite-send-btn';
      sendBtn.textContent = 'Invite';
      sendBtn.onclick = async function(e) {
        e.stopPropagation();
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';

        if (window.ArcadeNotifications) {
          var notif = window.ArcadeNotifications.create(
            'game_invite',
            'Game Invite',
            _getUser() + ' invited you to play ' + gameName + '!',
            '\uD83C\uDFAE',
            page + '.html?room=' + roomCode,
            { from: _getUser(), gameId: page, roomCode: roomCode }
          );
          await window.ArcadeNotifications.push(friendName, notif);
        }

        sendBtn.textContent = 'Sent \u2714';
      };

      item.appendChild(name);
      item.appendChild(sendBtn);
      list.appendChild(item);
    });
  }

  // ─── POLL FOR ROOM CODE (show/hide invite button) ───
  setInterval(function() {
    if (_isGuest()) { removeButton(); return; }
    var code = detectRoomCode();
    if (code && code !== _currentRoomCode) {
      _currentRoomCode = code;
      addButton(code);
    } else if (!code && _currentRoomCode) {
      _currentRoomCode = null;
      removeButton();
    }
  }, 1000);

  // ─── AUTO-JOIN FROM INVITE LINK ───
  var params = new URLSearchParams(window.location.search);
  var inviteRoom = params.get('room');
  if (inviteRoom) {
    inviteRoom = inviteRoom.toUpperCase().trim();
    // Clean URL so refresh doesn't re-trigger
    window.history.replaceState(null, '', window.location.pathname);

    var steps = AUTO_JOIN[page];
    if (steps) {
      var stepIndex = 0;

      function runStep() {
        if (stepIndex >= steps.length) return;
        var step = steps[stepIndex];
        var retries = 0;

        function attempt() {
          retries++;
          if (retries > 15) { // give up after ~4.5s per step
            stepIndex++;
            setTimeout(runStep, 200);
            return;
          }

          if (step.click) {
            var el = document.querySelector(step.click);
            if (el) {
              el.click();
              stepIndex++;
              setTimeout(runStep, 400);
              return;
            }
          } else if (step.fill) {
            var el = document.querySelector(step.fill);
            if (el) {
              el.value = inviteRoom;
              stepIndex++;
              setTimeout(runStep, 200);
              return;
            }
          } else if (step.fn) {
            var fn = window[step.fn];
            if (fn) {
              fn.apply(null, step.args || []);
              stepIndex++;
              setTimeout(runStep, 400);
              return;
            }
          }

          // Element/function not ready yet, retry
          setTimeout(attempt, 300);
        }

        attempt();
      }

      // Wait for page scripts to initialize before starting
      setTimeout(runStep, 2500);
    }
  }

  // Handle auth changes
  window.addEventListener('arcade-auth-change', function() {
    if (_isGuest()) {
      removeButton();
      _currentRoomCode = null;
    }
  });
})();
